-- Sprint 2: Nutrition foundation (foods, meals, items)

CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  serving_amount NUMERIC NOT NULL DEFAULT 1,
  serving_unit TEXT NOT NULL DEFAULT 'serving',
  calories NUMERIC NOT NULL DEFAULT 0,
  protein_g NUMERIC NOT NULL DEFAULT 0,
  carbs_g NUMERIC NOT NULL DEFAULT 0,
  fat_g NUMERIC NOT NULL DEFAULT 0,
  fiber_g NUMERIC NOT NULL DEFAULT 0,
  is_saved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date, meal_type)
);

CREATE TABLE IF NOT EXISTS meal_log_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_log_id UUID REFERENCES meal_logs(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'serving',
  calories NUMERIC NOT NULL DEFAULT 0,
  protein_g NUMERIC NOT NULL DEFAULT 0,
  carbs_g NUMERIC NOT NULL DEFAULT 0,
  fat_g NUMERIC NOT NULL DEFAULT 0,
  fiber_g NUMERIC NOT NULL DEFAULT 0,
  client_item_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_log_items_client_item_id
  ON meal_log_items (client_item_id)
  WHERE client_item_id IS NOT NULL;

ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_log_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read catalog and own foods" ON foods
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Insert own foods" ON foods
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own foods" ON foods
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Delete own foods" ON foods
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users manage own meal logs" ON meal_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own meal items" ON meal_log_items
  FOR ALL USING (
    meal_log_id IN (SELECT id FROM meal_logs WHERE user_id = auth.uid())
  );

-- Seed a few common foods (no user_id = readable by all via policy user_id IS NULL)
INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Dal (cooked)', 1, 'bowl', 180, 9, 28, 3, 8
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Dal (cooked)');
INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Roti (whole wheat)', 1, 'piece', 120, 4, 22, 2, 3
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Roti (whole wheat)');
INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Paneer (100g)', 100, 'g', 265, 18, 4, 20, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Paneer (100g)');
INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Basmati rice (cooked)', 1, 'cup', 210, 4, 45, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Basmati rice (cooked)');
INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Greek yogurt', 1, 'cup', 130, 15, 8, 4, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Greek yogurt');

CREATE OR REPLACE FUNCTION recompute_nutrition_log_for_date(p_user_id UUID, p_date DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  totals RECORD;
BEGIN
  SELECT
    COALESCE(SUM(mli.calories), 0) AS calories,
    COALESCE(SUM(mli.protein_g), 0) AS protein_g,
    COALESCE(SUM(mli.carbs_g), 0) AS carbs_g,
    COALESCE(SUM(mli.fat_g), 0) AS fat_g,
    COALESCE(SUM(mli.fiber_g), 0) AS fiber_g
  INTO totals
  FROM meal_log_items mli
  INNER JOIN meal_logs ml ON ml.id = mli.meal_log_id
  WHERE ml.user_id = p_user_id AND ml.date = p_date;

  INSERT INTO nutrition_logs (user_id, date, calories, protein_g, carbs_g, fat_g, fiber_g)
  VALUES (
    p_user_id,
    p_date,
    ROUND(totals.calories)::INTEGER,
    totals.protein_g,
    totals.carbs_g,
    totals.fat_g,
    totals.fiber_g
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    calories = EXCLUDED.calories,
    protein_g = EXCLUDED.protein_g,
    carbs_g = EXCLUDED.carbs_g,
    fat_g = EXCLUDED.fat_g,
    fiber_g = EXCLUDED.fiber_g;
END;
$$;

GRANT EXECUTE ON FUNCTION recompute_nutrition_log_for_date(UUID, DATE) TO authenticated;
