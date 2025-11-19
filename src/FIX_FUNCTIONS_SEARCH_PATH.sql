-- ============================================
-- FIX FUNCTIONS - Set search_path
-- ============================================
-- This script fixes the 4 functions that didn't get search_path set
-- Run this AFTER the main security fixes script

-- ============================================
-- STEP 1: Check if functions exist
-- ============================================

-- First, let's see what these functions look like
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as full_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN (
  'update_wallet_updated_at',
  'cleanup_old_audit_logs', 
  'update_article_views_timestamp',
  'update_article_swipe_stats_timestamp'
)
AND n.nspname = 'public';

-- ============================================
-- STEP 2: Use ALTER FUNCTION to set search_path
-- ============================================
-- This is the safer approach - it modifies existing functions
-- without needing to know their exact definition

-- Fix update_wallet_updated_at
ALTER FUNCTION public.update_wallet_updated_at() 
SET search_path = public, pg_temp;

-- Fix cleanup_old_audit_logs
ALTER FUNCTION public.cleanup_old_audit_logs() 
SET search_path = public, pg_temp;

-- Fix update_article_views_timestamp
ALTER FUNCTION public.update_article_views_timestamp() 
SET search_path = public, pg_temp;

-- Fix update_article_swipe_stats_timestamp
ALTER FUNCTION public.update_article_swipe_stats_timestamp() 
SET search_path = public, pg_temp;


-- ============================================
-- VERIFICATION: Check if search_path is now set
-- ============================================

SELECT 
  p.proname as function_name,
  CASE 
    WHEN p.proconfig IS NULL THEN '❌ No search_path set'
    WHEN array_to_string(p.proconfig, ', ') LIKE '%search_path%' THEN '✅ search_path configured'
    ELSE '❌ No search_path set'
  END as status,
  COALESCE(array_to_string(p.proconfig, ', '), 'No config') as configuration
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN (
  'update_wallet_updated_at',
  'cleanup_old_audit_logs', 
  'update_article_views_timestamp',
  'update_article_swipe_stats_timestamp'
)
AND n.nspname = 'public'
ORDER BY p.proname;


-- ============================================
-- SUMMARY
-- ============================================

/*
✅ This script uses ALTER FUNCTION instead of CREATE OR REPLACE FUNCTION

Why? Because:
1. ALTER FUNCTION modifies existing functions without needing to know the full definition
2. It only changes the configuration setting (search_path)
3. Much safer and simpler approach

After running this, all 4 functions should show "✅ search_path configured"
*/
