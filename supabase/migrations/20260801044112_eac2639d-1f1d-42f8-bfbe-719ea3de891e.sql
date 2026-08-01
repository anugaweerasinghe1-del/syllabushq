GRANT SELECT ON public.generated_questions TO anon;
GRANT SELECT ON public.generated_questions TO authenticated;
GRANT ALL ON public.generated_questions TO service_role;

CREATE INDEX IF NOT EXISTS generated_questions_lookup_idx
  ON public.generated_questions (subject, mode, difficulty, topic);
