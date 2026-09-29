-- Saved meal templates (Sprint 2)

CREATE TABLE IF NOT EXISTS saved_meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE saved_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved meals" ON saved_meals
  FOR ALL USING (auth.uid() = user_id);
