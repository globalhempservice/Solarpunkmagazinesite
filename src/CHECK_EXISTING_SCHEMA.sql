-- ========================================
-- SCHEMA DISCOVERY QUERIES
-- ========================================
-- Run these to see what already exists

-- QUERY 1: Check if user_progress and user_app_stats exist and what type they are
oh my bad i didnt read through. ok here is query 1: 


-- QUERY 2: If user_progress is a table, check its columns (YOU ALREADY HAVE THIS)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_progress'
ORDER BY ordinal_position;


-- QUERY 3: Check existing columns in user_profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
  AND column_name IN ('home_layout_config', 'user_level', 'current_xp', 'total_xp', 'achievements')
ORDER BY ordinal_position;


-- QUERY 4: Check if gamification tables already exist
SELECT 
  table_name
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN ('app_usage_logs', 'app_badges', 'xp_rewards', 'xp_history')
ORDER BY table_name;


-- QUERY 5: Check existing functions
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name IN ('award_xp', 'calculate_next_level_xp', 'update_app_badge', 'clear_app_badge', 'handle_level_up')
ORDER BY routine_name;


-- QUERY 6: Check if award_xp has multiple signatures
SELECT 
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS arguments,
  pg_get_function_result(p.oid) AS return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'award_xp';
