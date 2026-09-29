-- Fix "Database error creating anonymous user" (Auth HTTP 500 on /auth/v1/signup)
-- Run in Supabase → SQL Editor for your project.

-- Option A (fastest): stop auto-profile trigger; the app creates profiles on onboarding.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Option B: keep trigger but fix RLS + function (uncomment if you prefer auto profiles)
/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Athlete'),
    FALSE
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DROP POLICY IF EXISTS "Auth admin can insert profiles on signup" ON public.profiles;
CREATE POLICY "Auth admin can insert profiles on signup"
  ON public.profiles
  FOR INSERT
  TO supabase_auth_admin
  WITH CHECK (true);
*/
