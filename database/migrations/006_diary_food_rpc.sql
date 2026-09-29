-- Diary: recent / frequent foods from meal history (last 90 days)

CREATE OR REPLACE FUNCTION get_recent_food_logs(p_user_id UUID, p_limit INT DEFAULT 12)
RETURNS TABLE (
  food_id UUID,
  name TEXT,
  quantity NUMERIC,
  unit TEXT,
  calories NUMERIC,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  fiber_g NUMERIC,
  last_logged_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT food_id, name, quantity, unit, calories, protein_g, carbs_g, fat_g, fiber_g, last_logged_at
  FROM (
    SELECT DISTINCT ON (COALESCE(mli.food_id::text, mli.name))
      mli.food_id,
      mli.name,
      mli.quantity,
      mli.unit,
      mli.calories,
      mli.protein_g,
      mli.carbs_g,
      mli.fat_g,
      mli.fiber_g,
      mli.created_at AS last_logged_at
    FROM meal_log_items mli
    INNER JOIN meal_logs ml ON ml.id = mli.meal_log_id
    WHERE ml.user_id = p_user_id
      AND ml.date >= (CURRENT_DATE - INTERVAL '90 days')
    ORDER BY COALESCE(mli.food_id::text, mli.name), mli.created_at DESC
  ) recent
  ORDER BY last_logged_at DESC
  LIMIT GREATEST(p_limit, 1);
$$;

CREATE OR REPLACE FUNCTION get_frequent_food_logs(p_user_id UUID, p_limit INT DEFAULT 12)
RETURNS TABLE (
  food_id UUID,
  name TEXT,
  quantity NUMERIC,
  unit TEXT,
  calories NUMERIC,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  fiber_g NUMERIC,
  log_count BIGINT,
  last_logged_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (ARRAY_AGG(mli.food_id ORDER BY mli.created_at DESC))[1] AS food_id,
    mli.name,
    (ARRAY_AGG(mli.quantity ORDER BY mli.created_at DESC))[1] AS quantity,
    (ARRAY_AGG(mli.unit ORDER BY mli.created_at DESC))[1] AS unit,
    (ARRAY_AGG(mli.calories ORDER BY mli.created_at DESC))[1] AS calories,
    (ARRAY_AGG(mli.protein_g ORDER BY mli.created_at DESC))[1] AS protein_g,
    (ARRAY_AGG(mli.carbs_g ORDER BY mli.created_at DESC))[1] AS carbs_g,
    (ARRAY_AGG(mli.fat_g ORDER BY mli.created_at DESC))[1] AS fat_g,
    (ARRAY_AGG(mli.fiber_g ORDER BY mli.created_at DESC))[1] AS fiber_g,
    COUNT(*) AS log_count,
    MAX(mli.created_at) AS last_logged_at
  FROM meal_log_items mli
  INNER JOIN meal_logs ml ON ml.id = mli.meal_log_id
  WHERE ml.user_id = p_user_id
    AND ml.date >= (CURRENT_DATE - INTERVAL '90 days')
  GROUP BY COALESCE(mli.food_id::text, mli.name), mli.name
  ORDER BY log_count DESC, last_logged_at DESC
  LIMIT GREATEST(p_limit, 1);
$$;

GRANT EXECUTE ON FUNCTION get_recent_food_logs(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_frequent_food_logs(UUID, INT) TO authenticated;
