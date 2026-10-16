ALTER TABLE public.scam_reports
  ADD COLUMN IF NOT EXISTS kind text,
  ADD COLUMN IF NOT EXISTS value_normalized text,
  ADD COLUMN IF NOT EXISTS value_masked text,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS device_id text;

UPDATE public.scam_reports SET
  kind = CASE type WHEN 'phone_number' THEN 'phone' WHEN 'bank_account' THEN 'bank_account' WHEN 'link' THEN 'link' WHEN 'wallet' THEN 'wallet' END,
  value_normalized = CASE type
    WHEN 'phone_number' THEN '234' || substr(value, 2)
    WHEN 'wallet' THEN lower(value)
    ELSE value END,
  value_masked = CASE type
    WHEN 'phone_number' THEN left(value, 4) || ' *** ' || right(value, 4)
    WHEN 'bank_account' THEN left(value, 4) || '****' || right(value, 2)
    WHEN 'wallet' THEN left(lower(value), 6) || '…' || right(lower(value), 4)
    ELSE value END,
  source = CASE WHEN demo THEN 'demo' ELSE 'user' END,
  device_id = device_hash
WHERE value_normalized IS NULL;

ALTER TABLE public.scam_reports ADD CONSTRAINT scam_reports_kind_check CHECK (kind IS NULL OR kind IN ('phone','bank_account','link','wallet'));
ALTER TABLE public.scam_reports ADD CONSTRAINT scam_reports_source_check CHECK (source IN ('user','demo'));
CREATE INDEX IF NOT EXISTS scam_reports_kind_value_idx ON public.scam_reports (kind, value_normalized);
CREATE INDEX IF NOT EXISTS scam_reports_device_idx ON public.scam_reports (device_id, created_at);
COMMENT ON COLUMN public.scam_reports.type IS 'DEPRECATED: replaced by kind';
COMMENT ON COLUMN public.scam_reports.value IS 'DEPRECATED: replaced by value_normalized';
COMMENT ON COLUMN public.scam_reports.device_hash IS 'DEPRECATED: replaced by device_id';
COMMENT ON COLUMN public.scam_reports.demo IS 'DEPRECATED: replaced by source';

ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.scam_reports FROM anon, authenticated;
GRANT ALL ON public.scam_reports TO service_role;
REVOKE EXECUTE ON FUNCTION public.report_scam(text, text, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.lookup_reports(jsonb) FROM anon, authenticated, public;