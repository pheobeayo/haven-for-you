CREATE TABLE public.scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  input_kind text NOT NULL,
  input_preview text NOT NULL DEFAULT '',
  verdict text NOT NULL,
  risk_score int NOT NULL,
  scam_type text NOT NULL DEFAULT '',
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.scans TO authenticated;
GRANT ALL ON public.scans TO service_role;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.scans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.scans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.scans FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX scans_user_created ON public.scans (user_id, created_at DESC);