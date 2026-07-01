-- ============================================================
-- Fit Guide — Full Supabase setup
-- Run in: Supabase Dashboard → SQL Editor → New query
-- Project: boajdgtpvhqwfmewanul
-- Safe to re-run (idempotent where possible)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  age INTEGER,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  goal TEXT CHECK (goal IN ('lose_weight', 'build_muscle', 'get_stronger', 'improve_endurance', 'general_fitness', 'athletic_performance')),
  experience TEXT CHECK (experience IN ('beginner', 'intermediate', 'advanced')),
  workout_days INTEGER DEFAULT 3,
  workout_time_minutes INTEGER DEFAULT 60,
  equipment TEXT[] DEFAULT '{}',
  medical_limitations TEXT,
  previous_injuries TEXT,
  avatar_url TEXT,
  units TEXT DEFAULT 'metric' CHECK (units IN ('metric', 'imperial')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  target_value NUMERIC,
  current_value NUMERIC,
  deadline DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Muscle Groups
CREATE TABLE IF NOT EXISTS muscle_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  body_region TEXT
);

-- Exercise Categories
CREATE TABLE IF NOT EXISTS exercise_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT
);

-- Exercises
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES exercise_categories(id),
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  equipment TEXT[] DEFAULT '{}',
  primary_muscle TEXT NOT NULL,
  secondary_muscles TEXT[] DEFAULT '{}',
  instructions TEXT[] DEFAULT '{}',
  common_mistakes TEXT[] DEFAULT '{}',
  safety_tips TEXT[] DEFAULT '{}',
  pro_tips TEXT[] DEFAULT '{}',
  calories_per_minute NUMERIC DEFAULT 5,
  video_url TEXT,
  model_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise Media
CREATE TABLE IF NOT EXISTS exercise_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('video', 'image', '3d_model')),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout Plans
CREATE TABLE IF NOT EXISTS workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  exercises JSONB DEFAULT '[]',
  estimated_duration_minutes INTEGER,
  difficulty TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout Sessions
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES workout_plans(id),
  name TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  notes TEXT
);

-- Workout Sets
CREATE TABLE IF NOT EXISTS workout_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight_kg NUMERIC,
  completed BOOLEAN DEFAULT FALSE,
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),
  notes TEXT
);

-- Progress
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  weight_kg NUMERIC,
  body_fat_percent NUMERIC,
  muscle_mass_kg NUMERIC,
  calories INTEGER,
  workout_volume_kg NUMERIC,
  notes TEXT,
  UNIQUE(user_id, date)
);

-- Measurements
CREATE TABLE IF NOT EXISTS measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  chest_cm NUMERIC,
  waist_cm NUMERIC,
  arms_cm NUMERIC,
  legs_cm NUMERIC,
  shoulders_cm NUMERIC,
  neck_cm NUMERIC,
  body_fat_percent NUMERIC,
  weight_kg NUMERIC
);

-- Nutrition Logs
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  calories INTEGER DEFAULT 0,
  protein_g NUMERIC DEFAULT 0,
  carbs_g NUMERIC DEFAULT 0,
  fat_g NUMERIC DEFAULT 0,
  fiber_g NUMERIC DEFAULT 0,
  water_ml INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Water Logs
CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recovery
CREATE TABLE IF NOT EXISTS recovery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  muscle_group TEXT NOT NULL,
  status TEXT CHECK (status IN ('recovered', 'recovering', 'needs_rest')),
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  last_trained_at TIMESTAMPTZ,
  volume_last_7_days NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, muscle_group)
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  icon TEXT,
  UNIQUE(user_id, achievement_type)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN DEFAULT FALSE,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  workout_reminder BOOLEAN DEFAULT TRUE,
  water_reminder BOOLEAN DEFAULT TRUE,
  creatine_reminder BOOLEAN DEFAULT FALSE,
  sleep_reminder BOOLEAN DEFAULT TRUE,
  weekly_progress BOOLEAN DEFAULT TRUE,
  motivation BOOLEAN DEFAULT TRUE,
  reminder_time TIME DEFAULT '08:00'
);

-- Body Scans
CREATE TABLE IF NOT EXISTS body_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scan_date DATE NOT NULL,
  scan_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_scans ENABLE ROW LEVEL SECURITY;

-- Policies (drop + recreate)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage own goals" ON goals;
DROP POLICY IF EXISTS "Users can manage own workout plans" ON workout_plans;
DROP POLICY IF EXISTS "Users can manage own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can manage own sets" ON workout_sets;
DROP POLICY IF EXISTS "Users can manage own progress" ON progress;
DROP POLICY IF EXISTS "Users can manage own measurements" ON measurements;
DROP POLICY IF EXISTS "Users can manage own nutrition" ON nutrition_logs;
DROP POLICY IF EXISTS "Users can manage own water logs" ON water_logs;
DROP POLICY IF EXISTS "Users can manage own recovery" ON recovery;
DROP POLICY IF EXISTS "Users can manage own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can manage own notification prefs" ON notification_preferences;
DROP POLICY IF EXISTS "Users can manage own body scans" ON body_scans;
DROP POLICY IF EXISTS "Anyone can read exercises" ON exercises;
DROP POLICY IF EXISTS "Anyone can read categories" ON exercise_categories;
DROP POLICY IF EXISTS "Anyone can read muscle groups" ON muscle_groups;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own workout plans" ON workout_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sessions" ON workout_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sets" ON workout_sets FOR ALL USING (
  session_id IN (SELECT id FROM workout_sessions WHERE user_id = auth.uid())
);
CREATE POLICY "Users can manage own progress" ON progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own measurements" ON measurements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own nutrition" ON nutrition_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own water logs" ON water_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own recovery" ON recovery FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own achievements" ON achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notification prefs" ON notification_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own body scans" ON body_scans FOR ALL USING (auth.uid() = user_id);

-- Public read for exercises
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE muscle_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read exercises" ON exercises FOR SELECT USING (true);
CREATE POLICY "Anyone can read categories" ON exercise_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can read muscle groups" ON muscle_groups FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_session_id ON workout_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_date ON progress(user_id, date);
CREATE INDEX IF NOT EXISTS idx_recovery_user_id ON recovery(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_primary_muscle ON exercises(primary_muscle);

-- Triggers
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, name, onboarding_completed)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Athlete'), FALSE)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS recovery_updated_at ON recovery;
CREATE TRIGGER recovery_updated_at
  BEFORE UPDATE ON recovery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed: exercise categories
INSERT INTO exercise_categories (id, name, slug, icon) VALUES
  ('c1111111-1111-1111-1111-111111111101', 'Compound', 'compound', 'barbell'),
  ('c1111111-1111-1111-1111-111111111102', 'Isolation', 'isolation', 'fitness'),
  ('c1111111-1111-1111-1111-111111111103', 'Cardio', 'cardio', 'heart'),
  ('c1111111-1111-1111-1111-111111111104', 'Bodyweight', 'bodyweight', 'body'),
  ('c1111111-1111-1111-1111-111111111105', 'Stretching', 'stretching', 'expand')
ON CONFLICT (slug) DO NOTHING;

-- Seed: muscle groups
INSERT INTO muscle_groups (id, name, color, body_region) VALUES
  ('chest', 'Chest', '#FF6B6B', 'upper'),
  ('back', 'Back', '#4ECDC4', 'upper'),
  ('shoulders', 'Shoulders', '#45B7D1', 'upper'),
  ('triceps', 'Triceps', '#96CEB4', 'upper'),
  ('biceps', 'Biceps', '#FFEAA7', 'upper'),
  ('forearms', 'Forearms', '#DDA0DD', 'upper'),
  ('abs', 'Abs', '#98D8C8', 'core'),
  ('obliques', 'Obliques', '#F7DC6F', 'core'),
  ('glutes', 'Glutes', '#BB8FCE', 'lower'),
  ('quadriceps', 'Quadriceps', '#85C1E9', 'lower'),
  ('hamstrings', 'Hamstrings', '#F8B500', 'lower'),
  ('calves', 'Calves', '#82E0AA', 'lower')
ON CONFLICT (id) DO NOTHING;

-- Seed: exercises (102 total — 12 core + 90 muscle-group library below)
INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000001-0000-0000-0000-000000000001',
  'Barbell Bench Press',
  'barbell-bench-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','bench'],
  'chest',
  ARRAY['triceps','shoulders'],
  ARRAY['Lie flat on the bench with feet firmly on the ground.','Grip the bar slightly wider than shoulder width.','Lower the bar to mid-chest with control.','Press the bar up until arms are fully extended.','Keep shoulder blades retracted throughout the movement.'],
  ARRAY['Bouncing the bar off the chest','Flaring elbows too wide','Lifting hips off the bench','Uneven bar path'],
  ARRAY['Always use a spotter for heavy sets','Use safety bars or clips on the barbell','Warm up with lighter weight first'],
  ARRAY['Drive through your legs for more power','Squeeze the bar to activate more muscle fibers','Pause briefly at the bottom for increased time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000002-0000-0000-0000-000000000002',
  'Barbell Squat',
  'barbell-squat',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','squat_rack'],
  'quadriceps',
  ARRAY['glutes','hamstrings','abs'],
  ARRAY['Position the bar on your upper traps.','Stand with feet shoulder-width apart, toes slightly out.','Break at the hips and knees simultaneously.','Descend until thighs are parallel to the floor.','Drive through your heels to stand back up.'],
  ARRAY['Knees caving inward','Rounding the lower back','Not reaching proper depth','Rising onto toes'],
  ARRAY['Use safety bars in the squat rack','Keep core braced throughout','Start with bodyweight squats to learn form'],
  ARRAY['Take a deep breath and brace before each rep','Think about spreading the floor with your feet','Keep your chest up throughout the movement'],
  10
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000003-0000-0000-0000-000000000003',
  'Deadlift',
  'deadlift',
  'c1111111-1111-1111-1111-111111111101',
  'advanced',
  ARRAY['barbell'],
  'back',
  ARRAY['glutes','hamstrings','forearms'],
  ARRAY['Stand with feet hip-width apart, bar over mid-foot.','Hinge at hips and grip the bar just outside your legs.','Keep back flat and chest up.','Drive through heels and extend hips and knees simultaneously.','Stand tall at the top, then lower with control.'],
  ARRAY['Rounding the back','Bar drifting away from body','Jerking the weight off the floor','Hyperextending at the top'],
  ARRAY['Use a mixed or hook grip for heavy loads','Never round your lower back under load','Use lifting straps only when grip is the limiting factor'],
  ARRAY['Engage lats by pulling the bar into your shins','Push the floor away rather than pulling the bar up','Reset each rep for heavy sets'],
  11
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000004-0000-0000-0000-000000000004',
  'Pull-Up',
  'pull-up',
  'c1111111-1111-1111-1111-111111111104',
  'intermediate',
  ARRAY['pull_up_bar','bodyweight'],
  'back',
  ARRAY['biceps','forearms'],
  ARRAY['Hang from the bar with an overhand grip, hands shoulder-width apart.','Engage your lats and pull your chest toward the bar.','Pause at the top with chin above the bar.','Lower with control to full arm extension.'],
  ARRAY['Using momentum or kipping','Not achieving full range of motion','Shrugging shoulders at the top','Incomplete lockout at the bottom'],
  ARRAY['Use a resistance band for assistance if needed','Avoid behind-the-neck pull-ups','Warm up shoulders before heavy sets'],
  ARRAY['Initiate the pull by depressing your shoulder blades','Squeeze at the top for maximum contraction','Use a false grip for better lat engagement'],
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000005-0000-0000-0000-000000000005',
  'Overhead Press',
  'overhead-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell'],
  'shoulders',
  ARRAY['triceps','abs'],
  ARRAY['Stand with feet hip-width apart, bar at shoulder height.','Grip the bar just outside shoulder width.','Press the bar overhead until arms are fully locked out.','Lower with control back to shoulder height.'],
  ARRAY['Excessive back arch','Pressing the bar in front of the face','Not locking out at the top','Using leg drive (unless push press)'],
  ARRAY['Keep core tight to protect lower back','Start with lighter weight to learn the movement','Avoid pressing behind the neck'],
  ARRAY['Push your head through once the bar passes your face','Squeeze glutes to maintain a stable base','Breathe and brace at the bottom of each rep'],
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000006-0000-0000-0000-000000000006',
  'Dumbbell Bicep Curl',
  'dumbbell-bicep-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Stand with dumbbells at your sides, palms facing forward.','Keep elbows pinned to your sides.','Curl the weights up toward your shoulders.','Squeeze at the top, then lower with control.'],
  ARRAY['Swinging the weights with momentum','Moving elbows forward','Incomplete range of motion','Using too heavy weight'],
  ARRAY['Control the eccentric portion','Avoid hyperextending elbows at the bottom'],
  ARRAY['Supinate wrists at the top for peak contraction','Try alternating curls for unilateral focus','Use a slight pause at the bottom to eliminate momentum'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000007-0000-0000-0000-000000000007',
  'Romanian Deadlift',
  'romanian-deadlift',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','dumbbells'],
  'hamstrings',
  ARRAY['glutes','back'],
  ARRAY['Hold the bar at hip height with an overhand grip.','Keep a slight bend in the knees.','Hinge at the hips, pushing them back.','Lower until you feel a stretch in your hamstrings.','Drive hips forward to return to standing.'],
  ARRAY['Rounding the back','Bending knees too much (turning into a squat)','Not feeling the hamstring stretch','Going too heavy too soon'],
  ARRAY['Keep the bar close to your legs throughout','Stop if you feel lower back strain','Start with light weight to learn the hip hinge'],
  ARRAY['Think about closing a car door with your hips','Focus on the hamstring stretch, not depth','Pause at the bottom for increased time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000008-0000-0000-0000-000000000008',
  'Plank',
  'plank',
  'c1111111-1111-1111-1111-111111111104',
  'beginner',
  ARRAY['bodyweight'],
  'abs',
  ARRAY['obliques','shoulders'],
  ARRAY['Start in a forearm plank position.','Keep body in a straight line from head to heels.','Engage core and squeeze glutes.','Hold the position for the prescribed time.','Breathe steadily throughout.'],
  ARRAY['Hips sagging toward the floor','Hips piking up too high','Holding breath','Looking up instead of down'],
  ARRAY['Stop if you feel lower back pain','Build up hold time gradually'],
  ARRAY['Push the floor away with your forearms','Imagine pulling your elbows toward your toes','Progress to side planks for oblique work'],
  5
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000009-0000-0000-0000-000000000009',
  'Lat Pulldown',
  'lat-pulldown',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'back',
  ARRAY['biceps'],
  ARRAY['Sit at the lat pulldown machine with thighs secured.','Grip the bar wider than shoulder width.','Pull the bar down to upper chest.','Squeeze shoulder blades together at the bottom.','Return to starting position with control.'],
  ARRAY['Leaning back too far','Pulling behind the neck','Using momentum','Not achieving full stretch at the top'],
  ARRAY['Always pull to the front of your chest','Use a weight you can control'],
  ARRAY['Initiate with your lats, not your arms','Pause at the bottom for peak contraction','Try different grip widths to target different areas'],
  6
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000010-0000-0000-0000-000000000010',
  'Leg Press',
  'leg-press',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['cables'],
  'quadriceps',
  ARRAY['glutes','hamstrings'],
  ARRAY['Sit in the leg press machine with back flat against the pad.','Place feet shoulder-width apart on the platform.','Lower the weight until knees are at 90 degrees.','Press through your heels to extend legs.','Do not lock out knees at the top.'],
  ARRAY['Lowering weight too deep (butt lifting off seat)','Locking knees at the top','Feet placed too high or too low','Using too much weight with poor form'],
  ARRAY['Never lock your knees completely','Keep lower back pressed against the pad','Use safety stops on the machine'],
  ARRAY['Vary foot placement to target different muscles','Use single-leg presses for imbalance correction','Control the eccentric for 3 seconds'],
  8
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000011-0000-0000-0000-000000000011',
  'Tricep Pushdown',
  'tricep-pushdown',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Stand facing the cable machine with rope or bar attachment.','Keep elbows pinned to your sides.','Push the attachment down until arms are fully extended.','Squeeze triceps at the bottom.','Return with control to starting position.'],
  ARRAY['Moving elbows away from body','Using shoulders to push down','Incomplete extension at the bottom','Leaning over the bar'],
  ARRAY['Use a weight you can control through full ROM','Keep wrists neutral'],
  ARRAY['Try rope attachment for better peak contraction','Pause at the bottom for 1 second','Use drop sets for advanced hypertrophy'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000012-0000-0000-0000-000000000012',
  'Hip Thrust',
  'hip-thrust',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','bench'],
  'glutes',
  ARRAY['hamstrings'],
  ARRAY['Sit on the floor with upper back against a bench.','Roll a barbell over your hips (use a pad for comfort).','Drive through your heels to lift hips up.','Squeeze glutes hard at the top.','Lower with control and repeat.'],
  ARRAY['Hyperextending the lower back','Not achieving full hip extension','Pushing through toes instead of heels','Looking up excessively'],
  ARRAY['Use a barbell pad to protect hips','Start with bodyweight to learn the movement'],
  ARRAY['Pause at the top for 2 seconds','Keep chin tucked throughout','Try single-leg variations for unilateral work'],
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;



-- Additional exercises (15 per muscle group: chest, back, shoulders, triceps, biceps, legs)
INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000013-0000-0000-0000-000000000013',
  'Incline Dumbbell Press',
  'incline-dumbbell-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['dumbbells','bench'],
  'chest',
  ARRAY['shoulders','triceps'],
  ARRAY['Set up for Incline Dumbbell Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Incline Dumbbell Press','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000014-0000-0000-0000-000000000014',
  'Dumbbell Bench Press',
  'dumbbell-bench-press',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['dumbbells','bench'],
  'chest',
  ARRAY['triceps','shoulders'],
  ARRAY['Set up for Dumbbell Bench Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Dumbbell Bench Press','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000015-0000-0000-0000-000000000015',
  'Cable Chest Fly',
  'cable-chest-fly',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'chest',
  ARRAY['shoulders'],
  ARRAY['Set up for Cable Chest Fly with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Cable Chest Fly','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000016-0000-0000-0000-000000000016',
  'Push-Up',
  'push-up',
  'c1111111-1111-1111-1111-111111111104',
  'beginner',
  ARRAY['bodyweight'],
  'chest',
  ARRAY['triceps','shoulders','abs'],
  ARRAY['Set up for Push-Up with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Push-Up','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000017-0000-0000-0000-000000000017',
  'Decline Bench Press',
  'decline-bench-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','bench'],
  'chest',
  ARRAY['triceps','shoulders'],
  ARRAY['Set up for Decline Bench Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Decline Bench Press','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000018-0000-0000-0000-000000000018',
  'Incline Barbell Bench Press',
  'incline-barbell-bench-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','bench'],
  'chest',
  ARRAY['shoulders','triceps'],
  ARRAY['Set up for Incline Barbell Bench Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Incline Barbell Bench Press','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000019-0000-0000-0000-000000000019',
  'Machine Chest Press',
  'machine-chest-press',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['cables'],
  'chest',
  ARRAY['triceps','shoulders'],
  ARRAY['Set up for Machine Chest Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Machine Chest Press','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000020-0000-0000-0000-000000000020',
  'Pec Deck Fly',
  'pec-deck-fly',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'chest',
  ARRAY[]::text[],
  ARRAY['Set up for Pec Deck Fly with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Pec Deck Fly','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000021-0000-0000-0000-000000000021',
  'Dumbbell Pullover',
  'dumbbell-pullover',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['dumbbells','bench'],
  'chest',
  ARRAY['back','triceps'],
  ARRAY['Set up for Dumbbell Pullover with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Dumbbell Pullover','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000022-0000-0000-0000-000000000022',
  'Landmine Press',
  'landmine-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell'],
  'chest',
  ARRAY['shoulders','triceps'],
  ARRAY['Set up for Landmine Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Landmine Press','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000023-0000-0000-0000-000000000023',
  'Svend Press',
  'svend-press',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'chest',
  ARRAY['shoulders'],
  ARRAY['Set up for Svend Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Svend Press','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000024-0000-0000-0000-000000000024',
  'Floor Press',
  'floor-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','dumbbells'],
  'chest',
  ARRAY['triceps'],
  ARRAY['Set up for Floor Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Floor Press','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000025-0000-0000-0000-000000000025',
  'Incline Cable Fly',
  'incline-cable-fly',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables','bench'],
  'chest',
  ARRAY['shoulders'],
  ARRAY['Set up for Incline Cable Fly with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Incline Cable Fly','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000026-0000-0000-0000-000000000026',
  'Diamond Push-Up',
  'diamond-push-up',
  'c1111111-1111-1111-1111-111111111104',
  'intermediate',
  ARRAY['bodyweight'],
  'chest',
  ARRAY['triceps'],
  ARRAY['Set up for Diamond Push-Up with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Diamond Push-Up','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000027-0000-0000-0000-000000000027',
  'Resistance Band Chest Press',
  'resistance-band-chest-press',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['bodyweight'],
  'chest',
  ARRAY['triceps','shoulders'],
  ARRAY['Set up for Resistance Band Chest Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Resistance Band Chest Press','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000028-0000-0000-0000-000000000028',
  'Bent-Over Barbell Row',
  'bent-over-barbell-row',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell'],
  'back',
  ARRAY['biceps','forearms'],
  ARRAY['Set up for Bent-Over Barbell Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Bent-Over Barbell Row','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000029-0000-0000-0000-000000000029',
  'Seated Cable Row',
  'seated-cable-row',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['cables'],
  'back',
  ARRAY['biceps','forearms'],
  ARRAY['Set up for Seated Cable Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Seated Cable Row','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000030-0000-0000-0000-000000000030',
  'T-Bar Row',
  't-bar-row',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell'],
  'back',
  ARRAY['biceps','forearms'],
  ARRAY['Set up for T-Bar Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for T-Bar Row','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000031-0000-0000-0000-000000000031',
  'Single-Arm Dumbbell Row',
  'single-arm-dumbbell-row',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['dumbbells','bench'],
  'back',
  ARRAY['biceps','forearms'],
  ARRAY['Set up for Single-Arm Dumbbell Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Single-Arm Dumbbell Row','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000032-0000-0000-0000-000000000032',
  'Face Pull',
  'face-pull',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'back',
  ARRAY['shoulders','biceps'],
  ARRAY['Set up for Face Pull with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Face Pull','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000033-0000-0000-0000-000000000033',
  'Chest-Supported Row',
  'chest-supported-row',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['dumbbells','bench'],
  'back',
  ARRAY['biceps'],
  ARRAY['Set up for Chest-Supported Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Chest-Supported Row','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000034-0000-0000-0000-000000000034',
  'Pendlay Row',
  'pendlay-row',
  'c1111111-1111-1111-1111-111111111101',
  'advanced',
  ARRAY['barbell'],
  'back',
  ARRAY['biceps','forearms'],
  ARRAY['Set up for Pendlay Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Pendlay Row','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000035-0000-0000-0000-000000000035',
  'Straight-Arm Pulldown',
  'straight-arm-pulldown',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'back',
  ARRAY['triceps'],
  ARRAY['Set up for Straight-Arm Pulldown with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Straight-Arm Pulldown','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000036-0000-0000-0000-000000000036',
  'Inverted Row',
  'inverted-row',
  'c1111111-1111-1111-1111-111111111104',
  'beginner',
  ARRAY['bodyweight','pull_up_bar'],
  'back',
  ARRAY['biceps','forearms'],
  ARRAY['Set up for Inverted Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Inverted Row','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000037-0000-0000-0000-000000000037',
  'Meadows Row',
  'meadows-row',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell'],
  'back',
  ARRAY['biceps','forearms'],
  ARRAY['Set up for Meadows Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Meadows Row','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000038-0000-0000-0000-000000000038',
  'Wide-Grip Cable Row',
  'wide-grip-cable-row',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['cables'],
  'back',
  ARRAY['biceps'],
  ARRAY['Set up for Wide-Grip Cable Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Wide-Grip Cable Row','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000039-0000-0000-0000-000000000039',
  'Machine High Row',
  'machine-high-row',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['cables'],
  'back',
  ARRAY['biceps'],
  ARRAY['Set up for Machine High Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Machine High Row','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000040-0000-0000-0000-000000000040',
  'Rack Pull',
  'rack-pull',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','squat_rack'],
  'back',
  ARRAY['glutes','hamstrings','forearms'],
  ARRAY['Set up for Rack Pull with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Rack Pull','Use a slow eccentric for more time under tension'],
  9
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000041-0000-0000-0000-000000000041',
  'Resistance Band Row',
  'resistance-band-row',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['bodyweight'],
  'back',
  ARRAY['biceps'],
  ARRAY['Set up for Resistance Band Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Resistance Band Row','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000042-0000-0000-0000-000000000042',
  'Seal Row',
  'seal-row',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','bench'],
  'back',
  ARRAY['biceps'],
  ARRAY['Set up for Seal Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Seal Row','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000043-0000-0000-0000-000000000043',
  'Dumbbell Shoulder Press',
  'dumbbell-shoulder-press',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['dumbbells','bench'],
  'shoulders',
  ARRAY['triceps','abs'],
  ARRAY['Set up for Dumbbell Shoulder Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Dumbbell Shoulder Press','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000044-0000-0000-0000-000000000044',
  'Lateral Raise',
  'lateral-raise',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'shoulders',
  ARRAY[]::text[],
  ARRAY['Set up for Lateral Raise with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Lateral Raise','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000045-0000-0000-0000-000000000045',
  'Arnold Press',
  'arnold-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['dumbbells','bench'],
  'shoulders',
  ARRAY['triceps'],
  ARRAY['Set up for Arnold Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Arnold Press','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000046-0000-0000-0000-000000000046',
  'Front Raise',
  'front-raise',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'shoulders',
  ARRAY['abs'],
  ARRAY['Set up for Front Raise with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Front Raise','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000047-0000-0000-0000-000000000047',
  'Rear Delt Fly',
  'rear-delt-fly',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'shoulders',
  ARRAY['back'],
  ARRAY['Set up for Rear Delt Fly with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Rear Delt Fly','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000048-0000-0000-0000-000000000048',
  'Cable Lateral Raise',
  'cable-lateral-raise',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'shoulders',
  ARRAY[]::text[],
  ARRAY['Set up for Cable Lateral Raise with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Cable Lateral Raise','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000049-0000-0000-0000-000000000049',
  'Upright Row',
  'upright-row',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','dumbbells'],
  'shoulders',
  ARRAY['triceps','forearms'],
  ARRAY['Set up for Upright Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Upright Row','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000050-0000-0000-0000-000000000050',
  'Push Press',
  'push-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell'],
  'shoulders',
  ARRAY['triceps','quadriceps'],
  ARRAY['Set up for Push Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Push Press','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000051-0000-0000-0000-000000000051',
  'Machine Shoulder Press',
  'machine-shoulder-press',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['cables'],
  'shoulders',
  ARRAY['triceps'],
  ARRAY['Set up for Machine Shoulder Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Machine Shoulder Press','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000052-0000-0000-0000-000000000052',
  'Lu Raise',
  'lu-raise',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['dumbbells'],
  'shoulders',
  ARRAY['back'],
  ARRAY['Set up for Lu Raise with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Lu Raise','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000053-0000-0000-0000-000000000053',
  'Cable Face Pull to Press',
  'cable-face-pull-to-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['cables'],
  'shoulders',
  ARRAY['back','triceps'],
  ARRAY['Set up for Cable Face Pull to Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Cable Face Pull to Press','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000054-0000-0000-0000-000000000054',
  'Plate Front Raise',
  'plate-front-raise',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['barbell'],
  'shoulders',
  ARRAY[]::text[],
  ARRAY['Set up for Plate Front Raise with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Plate Front Raise','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000055-0000-0000-0000-000000000055',
  'Y Raise',
  'y-raise',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'shoulders',
  ARRAY['back'],
  ARRAY['Set up for Y Raise with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Y Raise','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000056-0000-0000-0000-000000000056',
  'Bradford Press',
  'bradford-press',
  'c1111111-1111-1111-1111-111111111101',
  'advanced',
  ARRAY['barbell'],
  'shoulders',
  ARRAY['triceps'],
  ARRAY['Set up for Bradford Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Bradford Press','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000057-0000-0000-0000-000000000057',
  'Landmine Press Shoulder',
  'landmine-shoulder-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell'],
  'shoulders',
  ARRAY['chest','triceps'],
  ARRAY['Set up for Landmine Press Shoulder with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Landmine Press Shoulder','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000058-0000-0000-0000-000000000058',
  'Skull Crusher',
  'skull-crusher',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['barbell','bench'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Skull Crusher with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Skull Crusher','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000059-0000-0000-0000-000000000059',
  'Overhead Tricep Extension',
  'overhead-tricep-extension',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'triceps',
  ARRAY['abs'],
  ARRAY['Set up for Overhead Tricep Extension with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Overhead Tricep Extension','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000060-0000-0000-0000-000000000060',
  'Close-Grip Bench Press',
  'close-grip-bench-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','bench'],
  'triceps',
  ARRAY['chest','shoulders'],
  ARRAY['Set up for Close-Grip Bench Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Close-Grip Bench Press','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000061-0000-0000-0000-000000000061',
  'Tricep Kickback',
  'tricep-kickback',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Tricep Kickback with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Tricep Kickback','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000062-0000-0000-0000-000000000062',
  'Bench Dip',
  'bench-dip',
  'c1111111-1111-1111-1111-111111111104',
  'beginner',
  ARRAY['bench','bodyweight'],
  'triceps',
  ARRAY['chest','shoulders'],
  ARRAY['Set up for Bench Dip with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Bench Dip','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000063-0000-0000-0000-000000000063',
  'Cable Overhead Extension',
  'cable-overhead-extension',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Cable Overhead Extension with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Cable Overhead Extension','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000064-0000-0000-0000-000000000064',
  'JM Press',
  'jm-press',
  'c1111111-1111-1111-1111-111111111101',
  'advanced',
  ARRAY['barbell','bench'],
  'triceps',
  ARRAY['chest'],
  ARRAY['Set up for JM Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for JM Press','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000065-0000-0000-0000-000000000065',
  'Single-Arm Cable Pushdown',
  'single-arm-cable-pushdown',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Single-Arm Cable Pushdown with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Single-Arm Cable Pushdown','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000066-0000-0000-0000-000000000066',
  'Dumbbell Tate Press',
  'dumbbell-tate-press',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['dumbbells','bench'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Dumbbell Tate Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Dumbbell Tate Press','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000067-0000-0000-0000-000000000067',
  'Parallel Bar Dip',
  'parallel-bar-dip',
  'c1111111-1111-1111-1111-111111111104',
  'intermediate',
  ARRAY['bodyweight','pull_up_bar'],
  'triceps',
  ARRAY['chest','shoulders'],
  ARRAY['Set up for Parallel Bar Dip with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Parallel Bar Dip','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000068-0000-0000-0000-000000000068',
  'Reverse-Grip Pushdown',
  'reverse-grip-pushdown',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Reverse-Grip Pushdown with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Reverse-Grip Pushdown','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000069-0000-0000-0000-000000000069',
  'EZ Bar Skull Crusher',
  'ez-bar-skull-crusher',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['barbell','bench'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for EZ Bar Skull Crusher with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for EZ Bar Skull Crusher','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000070-0000-0000-0000-000000000070',
  'Floor Skull Crusher',
  'floor-skull-crusher',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['dumbbells'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Floor Skull Crusher with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Floor Skull Crusher','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000071-0000-0000-0000-000000000071',
  'Resistance Band Pushdown',
  'resistance-band-pushdown',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['bodyweight'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Resistance Band Pushdown with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Resistance Band Pushdown','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000072-0000-0000-0000-000000000072',
  'Machine Tricep Extension',
  'machine-tricep-extension',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Machine Tricep Extension with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Machine Tricep Extension','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000073-0000-0000-0000-000000000073',
  'Hammer Curl',
  'hammer-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Hammer Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Hammer Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000074-0000-0000-0000-000000000074',
  'Barbell Curl',
  'barbell-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['barbell'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Barbell Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Barbell Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000075-0000-0000-0000-000000000075',
  'Preacher Curl',
  'preacher-curl',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['barbell','bench'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Preacher Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Preacher Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000076-0000-0000-0000-000000000076',
  'Concentration Curl',
  'concentration-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Concentration Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Concentration Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000077-0000-0000-0000-000000000077',
  'Cable Curl',
  'cable-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Cable Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Cable Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000078-0000-0000-0000-000000000078',
  'Incline Dumbbell Curl',
  'incline-dumbbell-curl',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['dumbbells','bench'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Incline Dumbbell Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Incline Dumbbell Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000079-0000-0000-0000-000000000079',
  'EZ Bar Curl',
  'ez-bar-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['barbell'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for EZ Bar Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for EZ Bar Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000080-0000-0000-0000-000000000080',
  'Spider Curl',
  'spider-curl',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['barbell','bench'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Spider Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Spider Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000081-0000-0000-0000-000000000081',
  'Cable Hammer Curl',
  'cable-hammer-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Cable Hammer Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Cable Hammer Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000082-0000-0000-0000-000000000082',
  'Reverse Curl',
  'reverse-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['barbell','dumbbells'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Reverse Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Reverse Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000083-0000-0000-0000-000000000083',
  'Drag Curl',
  'drag-curl',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['barbell'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Drag Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Drag Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000084-0000-0000-0000-000000000084',
  'Machine Bicep Curl',
  'machine-bicep-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Machine Bicep Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Machine Bicep Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000085-0000-0000-0000-000000000085',
  'Cross-Body Hammer Curl',
  'cross-body-hammer-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Cross-Body Hammer Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Cross-Body Hammer Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000086-0000-0000-0000-000000000086',
  '21s Curl',
  '21s-curl',
  'c1111111-1111-1111-1111-111111111102',
  'advanced',
  ARRAY['barbell'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for 21s Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for 21s Curl','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000087-0000-0000-0000-000000000087',
  'Resistance Band Curl',
  'resistance-band-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['bodyweight'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Resistance Band Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Resistance Band Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000088-0000-0000-0000-000000000088',
  'Walking Lunge',
  'walking-lunge',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['dumbbells','bodyweight'],
  'quadriceps',
  ARRAY['glutes','hamstrings'],
  ARRAY['Set up for Walking Lunge with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the quadriceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Walking Lunge','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000089-0000-0000-0000-000000000089',
  'Leg Curl',
  'leg-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'hamstrings',
  ARRAY['glutes'],
  ARRAY['Set up for Leg Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the hamstrings throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Leg Curl','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000090-0000-0000-0000-000000000090',
  'Bulgarian Split Squat',
  'bulgarian-split-squat',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['dumbbells','bench'],
  'quadriceps',
  ARRAY['glutes','hamstrings'],
  ARRAY['Set up for Bulgarian Split Squat with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the quadriceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Bulgarian Split Squat','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000091-0000-0000-0000-000000000091',
  'Standing Calf Raise',
  'standing-calf-raise',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['bodyweight','dumbbells'],
  'calves',
  ARRAY[]::text[],
  ARRAY['Set up for Standing Calf Raise with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the calves throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Standing Calf Raise','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000092-0000-0000-0000-000000000092',
  'Goblet Squat',
  'goblet-squat',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['dumbbells'],
  'quadriceps',
  ARRAY['glutes','abs'],
  ARRAY['Set up for Goblet Squat with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the quadriceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Goblet Squat','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000093-0000-0000-0000-000000000093',
  'Leg Extension',
  'leg-extension',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'quadriceps',
  ARRAY[]::text[],
  ARRAY['Set up for Leg Extension with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the quadriceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Leg Extension','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000094-0000-0000-0000-000000000094',
  'Front Squat',
  'front-squat',
  'c1111111-1111-1111-1111-111111111101',
  'advanced',
  ARRAY['barbell','squat_rack'],
  'quadriceps',
  ARRAY['glutes','abs'],
  ARRAY['Set up for Front Squat with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the quadriceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Front Squat','Use a slow eccentric for more time under tension'],
  10
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000095-0000-0000-0000-000000000095',
  'Hack Squat',
  'hack-squat',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['cables','squat_rack'],
  'quadriceps',
  ARRAY['glutes','hamstrings'],
  ARRAY['Set up for Hack Squat with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the quadriceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Hack Squat','Use a slow eccentric for more time under tension'],
  9
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000096-0000-0000-0000-000000000096',
  'Step-Up',
  'step-up',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['dumbbells','bench'],
  'quadriceps',
  ARRAY['glutes','hamstrings'],
  ARRAY['Set up for Step-Up with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the quadriceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Step-Up','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000097-0000-0000-0000-000000000097',
  'Romanian Deadlift Single Leg',
  'single-leg-romanian-deadlift',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['dumbbells'],
  'hamstrings',
  ARRAY['glutes','back'],
  ARRAY['Set up for Romanian Deadlift Single Leg with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the hamstrings throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Romanian Deadlift Single Leg','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000098-0000-0000-0000-000000000098',
  'Seated Calf Raise',
  'seated-calf-raise',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells','bench'],
  'calves',
  ARRAY[]::text[],
  ARRAY['Set up for Seated Calf Raise with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the calves throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Seated Calf Raise','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000099-0000-0000-0000-000000000099',
  'Sumo Deadlift',
  'sumo-deadlift',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell'],
  'glutes',
  ARRAY['hamstrings','quadriceps','back'],
  ARRAY['Set up for Sumo Deadlift with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the glutes throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Sumo Deadlift','Use a slow eccentric for more time under tension'],
  10
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000100-0000-0000-0000-000000000100',
  'Box Squat',
  'box-squat',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','squat_rack','bench'],
  'quadriceps',
  ARRAY['glutes','hamstrings'],
  ARRAY['Set up for Box Squat with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the quadriceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Box Squat','Use a slow eccentric for more time under tension'],
  9
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000101-0000-0000-0000-000000000101',
  'Nordic Hamstring Curl',
  'nordic-hamstring-curl',
  'c1111111-1111-1111-1111-111111111104',
  'advanced',
  ARRAY['bodyweight','bench'],
  'hamstrings',
  ARRAY['glutes'],
  ARRAY['Set up for Nordic Hamstring Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the hamstrings throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Nordic Hamstring Curl','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000102-0000-0000-0000-000000000102',
  'Cable Pull-Through',
  'cable-pull-through',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['cables'],
  'glutes',
  ARRAY['hamstrings','back'],
  ARRAY['Set up for Cable Pull-Through with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the glutes throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Cable Pull-Through','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;
