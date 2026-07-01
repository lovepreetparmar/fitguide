-- Minimum setup for Fit Guide onboarding (run once in Supabase SQL Editor)
-- Project: https://boajdgtpvhqwfmewanul.supabase.co

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, name, onboarding_completed)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Athlete'), FALSE)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
