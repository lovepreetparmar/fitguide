-- Sprint 1: idempotent workout sync + server engagement / achievements

ALTER TABLE workout_sessions
  ADD COLUMN IF NOT EXISTS client_session_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_workout_sessions_client_session_id
  ON workout_sessions (client_session_id)
  WHERE client_session_id IS NOT NULL;

ALTER TABLE nutrition_logs
  ADD COLUMN IF NOT EXISTS client_log_id TEXT;

ALTER TABLE progress
  ADD COLUMN IF NOT EXISTS client_entry_id TEXT;

CREATE TABLE IF NOT EXISTS user_engagement (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_workout_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_engagement ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own engagement" ON user_engagement;
CREATE POLICY "Users can read own engagement" ON user_engagement
  FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION recompute_user_engagement(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  d DATE;
  dates DATE[] := ARRAY[]::DATE[];
  cur_streak INT := 0;
  max_streak INT := 0;
  run INT := 0;
  i INT;
  today DATE := (NOW() AT TIME ZONE 'UTC')::DATE;
  yesterday DATE := today - 1;
  last_date DATE;
BEGIN
  FOR d IN
    SELECT DISTINCT (completed_at AT TIME ZONE 'UTC')::DATE
    FROM workout_sessions
    WHERE user_id = p_user_id AND completed_at IS NOT NULL
    ORDER BY 1
  LOOP
    dates := array_append(dates, d);
  END LOOP;

  IF array_length(dates, 1) IS NULL THEN
    INSERT INTO user_engagement (user_id, current_streak, longest_streak, last_workout_date, updated_at)
    VALUES (p_user_id, 0, 0, NULL, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = 0,
      longest_streak = 0,
      last_workout_date = NULL,
      updated_at = NOW();
    RETURN;
  END IF;

  last_date := dates[array_length(dates, 1)];

  run := 1;
  max_streak := 1;
  FOR i IN 2..array_length(dates, 1) LOOP
    IF dates[i] - dates[i - 1] = 1 THEN
      run := run + 1;
      IF run > max_streak THEN max_streak := run; END IF;
    ELSIF dates[i] <> dates[i - 1] THEN
      run := 1;
    END IF;
  END LOOP;

  IF last_date = today OR last_date = yesterday THEN
    cur_streak := 1;
    FOR i IN REVERSE array_length(dates, 1)..2 LOOP
      IF dates[i] - dates[i - 1] = 1 THEN
        cur_streak := cur_streak + 1;
      ELSE
        EXIT;
      END IF;
    END LOOP;
  ELSE
    cur_streak := 0;
  END IF;

  INSERT INTO user_engagement (user_id, current_streak, longest_streak, last_workout_date, updated_at)
  VALUES (p_user_id, cur_streak, max_streak, last_date, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak = EXCLUDED.current_streak,
    longest_streak = GREATEST(user_engagement.longest_streak, EXCLUDED.longest_streak),
    last_workout_date = EXCLUDED.last_workout_date,
    updated_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION recompute_achievements(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  workout_count INT;
  eng user_engagement%ROWTYPE;
BEGIN
  SELECT COUNT(*) INTO workout_count
  FROM workout_sessions
  WHERE user_id = p_user_id AND completed_at IS NOT NULL;

  IF workout_count >= 1 THEN
    INSERT INTO achievements (user_id, achievement_type, title, description, icon)
    VALUES (p_user_id, 'first_workout', 'First Step', 'Completed your first workout', 'trophy')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;

  SELECT * INTO eng FROM user_engagement WHERE user_id = p_user_id;
  IF eng.current_streak >= 10 THEN
    INSERT INTO achievements (user_id, achievement_type, title, description, icon)
    VALUES (p_user_id, 'ten_workouts', 'On a Roll', '10-day workout streak', 'flame')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;

  IF eng.current_streak >= 30 THEN
    INSERT INTO achievements (user_id, achievement_type, title, description, icon)
    VALUES (p_user_id, 'thirty_day_streak', 'Unstoppable', '30-day workout streak', 'medal')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION recompute_user_engagement(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION recompute_achievements(UUID) TO authenticated;
