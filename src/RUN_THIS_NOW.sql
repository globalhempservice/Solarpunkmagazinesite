-- ============================================================================
-- PHASE 0: FIX PROFILE AUTO-CREATE (FINAL VERSION)
-- ============================================================================
-- Run this in Supabase SQL Editor NOW
-- ============================================================================

-- 1. Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    display_name,
    trust_score,
    id_verified,
    phone_verified
  )
  VALUES (
    NEW.id,  -- user_id references auth.users(id)
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    0,
    false,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create trigger for future signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. BACKFILL: Create profiles for ALL existing users
INSERT INTO public.user_profiles (user_id, display_name, trust_score, id_verified, phone_verified)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'display_name', SPLIT_PART(au.email, '@', 1)),
  0,
  false,
  false
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.user_id = au.id
);

-- 5. VERIFICATION
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM user_profiles) as total_profiles,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM user_profiles)
    THEN '✅ SUCCESS! All users have profiles'
    ELSE '⚠️ Mismatch'
  END as status;

-- 6. Check YOUR profile specifically
SELECT 
  id as profile_id,
  user_id,
  display_name,
  trust_score,
  created_at
FROM user_profiles 
WHERE user_id = auth.uid();

-- ============================================================================
-- ✅ DONE! 
-- You should see:
-- - total_users and total_profiles match
-- - Your profile row with your email prefix as display_name
-- ============================================================================
