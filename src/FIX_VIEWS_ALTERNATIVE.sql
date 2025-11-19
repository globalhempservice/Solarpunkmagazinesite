-- ============================================
-- ALTERNATIVE FIX - If views keep coming back with SECURITY DEFINER
-- ============================================
-- Run this if the regular fix doesn't work
-- This checks for triggers or functions that might be recreating the views
-- ============================================

-- STEP 1: Find out who/what is creating these views with SECURITY DEFINER
-- Check for any triggers or event triggers that might recreate these views
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%view%' 
   OR trigger_name LIKE '%suspicious%'
   OR trigger_name LIKE '%user_stat%';

-- STEP 2: Check the ACTUAL current definition
-- This will show us exactly how the view was created
SELECT 
  viewname,
  definition
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN ('suspicious_wallet_activity', 'user_stats');

-- STEP 3: Nuclear option - Drop and recreate with explicit SECURITY INVOKER
-- SECURITY INVOKER is the opposite of SECURITY DEFINER
-- It explicitly states: "use the querying user's permissions"

DROP VIEW IF EXISTS public.suspicious_wallet_activity CASCADE;

CREATE VIEW public.suspicious_wallet_activity 
WITH (security_invoker = true)
AS
SELECT 
  wt.user_id,
  COUNT(*) as transaction_count,
  SUM(wt.amount) as total_amount,
  MIN(wt.created_at) as first_transaction,
  MAX(wt.created_at) as last_transaction,
  EXTRACT(EPOCH FROM (MAX(wt.created_at) - MIN(wt.created_at))) as time_span_seconds
FROM wallet_transactions wt
WHERE wt.created_at > NOW() - INTERVAL '1 hour'
GROUP BY wt.user_id
HAVING COUNT(*) > 10 OR SUM(wt.amount) > 5000;

DROP VIEW IF EXISTS public.user_stats CASCADE;

CREATE VIEW public.user_stats
WITH (security_invoker = true)
AS
SELECT 
  up.user_id,
  u.email,
  up.total_articles_read,
  up.points,
  up.current_streak,
  up.longest_streak,
  up.last_read_date,
  up.created_at as user_since,
  COUNT(DISTINCT ra.article_id) as verified_reads,
  COUNT(DISTINCT a.id) as articles_created
FROM user_progress up
LEFT JOIN auth.users u ON up.user_id = u.id
LEFT JOIN read_articles ra ON up.user_id = ra.user_id
LEFT JOIN articles a ON up.user_id = a.author_id
GROUP BY up.user_id, u.email, up.total_articles_read, up.points, 
         up.current_streak, up.longest_streak, up.last_read_date, up.created_at;

-- VERIFICATION
SELECT 
  schemaname,
  viewname,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN '❌ Still has SECURITY DEFINER'
    WHEN definition LIKE '%security_invoker%' OR definition LIKE '%SECURITY INVOKER%' THEN '✅ Has SECURITY INVOKER (good!)'
    ELSE '✅ Standard view (no SECURITY DEFINER)'
  END as status
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN ('suspicious_wallet_activity', 'user_stats');

-- ============================================
-- SUMMARY
-- ============================================

/*
This alternative approach uses:
- WITH (security_invoker = true)

This is the EXPLICIT way to say "don't use SECURITY DEFINER"
It's available in PostgreSQL 15+ (which Supabase uses)

If the regular CREATE VIEW keeps creating SECURITY DEFINER views,
this WITH clause will override that behavior.
*/
