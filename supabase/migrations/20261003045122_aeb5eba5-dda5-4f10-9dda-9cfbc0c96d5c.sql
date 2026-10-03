CREATE TABLE public.pack_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_key text NOT NULL,
  name text NOT NULL,
  score integer NOT NULL,
  total integer NOT NULL,
  visitor_token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pack_key, visitor_token)
);
GRANT SELECT, INSERT ON public.pack_scores TO anon, authenticated;
GRANT ALL ON public.pack_scores TO service_role;
ALTER TABLE public.pack_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read pack scores" ON public.pack_scores FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can post a valid pack score" ON public.pack_scores FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(pack_key) BETWEEN 1 AND 200
    AND char_length(btrim(name)) BETWEEN 1 AND 40
    AND char_length(visitor_token) BETWEEN 8 AND 100
    AND total BETWEEN 1 AND 50
    AND score BETWEEN 0 AND total
  );
CREATE INDEX pack_scores_key_idx ON public.pack_scores (pack_key, score DESC);