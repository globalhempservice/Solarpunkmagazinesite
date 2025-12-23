-- ========================================
-- CHECK WHAT ACTUALLY EXISTS
-- ========================================

-- 1. Does user_profiles table exist at all?
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles';

-- 2. Check ALL functions that exist (might be from partial migration)
SELECT 
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- 3. Check all tables in public schema
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
