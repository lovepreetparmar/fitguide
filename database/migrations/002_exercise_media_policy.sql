-- Optional: allow authenticated users to read exercise media metadata
ALTER TABLE IF EXISTS exercise_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read exercise media" ON exercise_media;
CREATE POLICY "Anyone can read exercise media" ON exercise_media
  FOR SELECT
  USING (true);
