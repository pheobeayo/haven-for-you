CREATE TABLE public.scam_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('phone_number','bank_account','link','wallet','message_pattern')),
  value text NOT NULL CHECK (char_length(value) BETWEEN 1 AND 200),
  scam_type text NOT NULL DEFAULT '' CHECK (char_length(scam_type) <= 200),
  device_hash text,
  demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.scam_reports TO service_role;
ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;
CREATE INDEX scam_reports_lookup ON public.scam_reports (type, value, created_at);
CREATE INDEX scam_reports_device ON public.scam_reports (device_hash, created_at);

CREATE OR REPLACE FUNCTION public.report_scam(_device text, _scam_type text, _items jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE recent int; n int := 0; it jsonb;
BEGIN
  IF _device IS NULL OR char_length(_device) < 16 OR char_length(_device) > 128 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'bad_input');
  END IF;
  SELECT count(DISTINCT date_trunc('second', created_at)) INTO recent FROM scam_reports
    WHERE device_hash = _device AND created_at > now() - interval '1 hour';
  IF recent >= 5 THEN RETURN jsonb_build_object('ok', false, 'code', 'rate_limit'); END IF;
  FOR it IN SELECT * FROM jsonb_array_elements(_items) LIMIT 10 LOOP
    INSERT INTO scam_reports (type, value, scam_type, device_hash)
    VALUES (it->>'type', left(it->>'value', 200), left(coalesce(_scam_type, ''), 200), _device);
    n := n + 1;
  END LOOP;
  RETURN jsonb_build_object('ok', true, 'saved', n);
END $$;

CREATE OR REPLACE FUNCTION public.lookup_reports(_items jsonb)
RETURNS TABLE(type text, value text, reports bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.type, r.value, count(*) FROM scam_reports r
  JOIN (SELECT x->>'type' AS t, x->>'value' AS v FROM jsonb_array_elements(_items) x LIMIT 20) q
    ON q.t = r.type AND q.v = r.value
  WHERE r.created_at > now() - interval '30 days'
  GROUP BY r.type, r.value
$$;

REVOKE ALL ON FUNCTION public.report_scam(text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lookup_reports(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_scam(text, text, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lookup_reports(jsonb) TO anon, authenticated, service_role;

INSERT INTO public.scam_reports (type, value, scam_type, demo, created_at) VALUES
('phone_number','08031234567','Fake credit alert',true, now() - interval '1 day'),
('phone_number','08031234567','Fake credit alert',true, now() - interval '3 days'),
('phone_number','08031234567','Wrong transfer, please reverse',true, now() - interval '6 days'),
('phone_number','08031234567','Fake credit alert',true, now() - interval '12 days'),
('bank_account','0123456789','Job offer fee',true, now() - interval '2 days'),
('bank_account','0123456789','Job offer fee',true, now() - interval '9 days'),
('link','gtbank-verify.com','Bank impersonation',true, now() - interval '4 days'),
('link','bit.ly','Phishing link',true, now() - interval '5 days'),
('wallet','0x1234567890abcdef1234567890abcdef12345678','Fake crypto airdrop',true, now() - interval '7 days'),
('message_pattern','job offer fee','Job offer fee',true, now() - interval '8 days');