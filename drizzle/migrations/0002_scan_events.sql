CREATE TABLE public.scan_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scam_type text NOT NULL DEFAULT '',
  verdict text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.scan_events TO service_role;
ALTER TABLE public.scan_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX scan_events_created ON public.scan_events (created_at);

CREATE OR REPLACE FUNCTION public.record_scan_event(_verdict text, _scam_type text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _verdict NOT IN ('scam','suspicious','safe') THEN RETURN; END IF;
  INSERT INTO scan_events (verdict, scam_type) VALUES (_verdict, left(coalesce(_scam_type,''), 80));
END $$;

CREATE OR REPLACE FUNCTION public.scan_trends()
RETURNS TABLE(scam_type text, verdict text, n bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT scam_type, verdict, count(*) FROM scan_events
  WHERE created_at > now() - interval '7 days'
  GROUP BY scam_type, verdict
$$;