
-- 1. generated_questions cache (public read; only server role writes)
CREATE TABLE public.generated_questions (
  hash text PRIMARY KEY,
  subject text NOT NULL,
  topic text,
  mode text NOT NULL,
  difficulty text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.generated_questions TO anon, authenticated;
GRANT ALL ON public.generated_questions TO service_role;
ALTER TABLE public.generated_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions_readable_by_all" ON public.generated_questions FOR SELECT TO anon, authenticated USING (true);

-- 2. attempts (anonymous visitor scoped)
CREATE TABLE public.attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_token text NOT NULL,
  subject text NOT NULL,
  topic text,
  question_hash text,
  marks_awarded numeric NOT NULL DEFAULT 0,
  total_marks numeric NOT NULL DEFAULT 1,
  mode text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX attempts_visitor_idx ON public.attempts(visitor_token, created_at DESC);
GRANT SELECT, INSERT ON public.attempts TO anon, authenticated;
GRANT ALL ON public.attempts TO service_role;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attempts_insert_any" ON public.attempts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "attempts_read_any" ON public.attempts FOR SELECT TO anon, authenticated USING (true);

-- 3. mastery (per visitor, per subject/topic)
CREATE TABLE public.mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_token text NOT NULL,
  subject text NOT NULL,
  topic text NOT NULL,
  attempts_count integer NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'none',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (visitor_token, subject, topic)
);
CREATE INDEX mastery_visitor_idx ON public.mastery(visitor_token);
GRANT SELECT, INSERT, UPDATE ON public.mastery TO anon, authenticated;
GRANT ALL ON public.mastery TO service_role;
ALTER TABLE public.mastery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mastery_read_any" ON public.mastery FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "mastery_write_any" ON public.mastery FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "mastery_update_any" ON public.mastery FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
