-- ============================================================================
-- PHASE 0: AUTO-CREATE USER PROFILE TRIGGER
-- ============================================================================
-- This trigger automatically creates a user_profiles row when a new user signs up
-- Run this in Supabase SQL Editor

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    display_name,
    trust_score,
    id_verified,
    phone_verified
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    0,
    false,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- BACKFILL: Create profiles for existing users
-- ============================================================================
-- This creates profiles for users who signed up before the trigger was added

INSERT INTO public.user_profiles (id, display_name, trust_score, id_verified, phone_verified)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'display_name', SPLIT_PART(au.email, '@', 1)),
  0,
  false,
  false
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Check that all users now have profiles

-- SELECT COUNT(*) as total_users FROM auth.users;
-- SELECT COUNT(*) as total_profiles FROM user_profiles;
-- (These should match!)

-- ============================================================================
-- ✅ Done! All users now have profiles automatically
-- ============================================================================
