CREATE TABLE public.practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  topic text,
  mode text NOT NULL,
  marks_awarded numeric NOT NULL DEFAULT 0,
  total_marks numeric NOT NULL DEFAULT 0,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_sessions TO authenticated;
GRANT ALL ON public.practice_sessions TO service_role;

ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "practice_sessions_own_select" ON public.practice_sessions
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "practice_sessions_own_insert" ON public.practice_sessions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "practice_sessions_own_update" ON public.practice_sessions
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "practice_sessions_own_delete" ON public.practice_sessions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX practice_sessions_user_created_idx ON public.practice_sessions (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_practice_sessions_updated_at
  BEFORE UPDATE ON public.practice_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();