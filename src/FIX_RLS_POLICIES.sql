-- ============================================
-- FIX RLS POLICIES - Allow Service Role Access
-- ============================================
-- The issue: RLS policies are blocking the backend server (service role)
-- from accessing data it needs to fetch user progress
--
-- This script ensures the service role (your backend) can access all data
-- while still protecting user data from direct frontend access
-- ============================================

-- ============================================
-- FIX 1: article_views policies
-- ============================================

-- Drop the restrictive service role policy
DROP POLICY IF EXISTS "Service role full access to article views" ON public.article_views;

-- Recreate with proper USING clause for SELECT
CREATE POLICY "Service role can read all article views"
  ON public.article_views
  FOR SELECT
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR auth.uid()::text = user_id
  );

-- Service role can insert any record
CREATE POLICY "Service role can insert article views"
  ON public.article_views
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR auth.uid()::text = user_id
  );

-- Service role can update any record
CREATE POLICY "Service role can update article views"
  ON public.article_views
  FOR UPDATE
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR auth.uid()::text = user_id
  );

-- Service role can delete any record
CREATE POLICY "Service role can delete article views"
  ON public.article_views
  FOR DELETE
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR auth.uid()::text = user_id
  );


-- ============================================
-- FIX 2: article_swipe_stats policies
-- ============================================

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Service role can modify swipe stats" ON public.article_swipe_stats;

-- Recreate with proper clauses for each operation
CREATE POLICY "Service role can read swipe stats"
  ON public.article_swipe_stats
  FOR SELECT
  USING (true); -- Anyone can read

CREATE POLICY "Service role can insert swipe stats"
  ON public.article_swipe_stats
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "Service role can update swipe stats"
  ON public.article_swipe_stats
  FOR UPDATE
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "Service role can delete swipe stats"
  ON public.article_swipe_stats
  FOR DELETE
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );


-- ============================================
-- FIX 3: Check if other critical tables have RLS
-- ============================================

-- Check which tables have RLS enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity = false THEN '⚠️ RLS Disabled (might need enabling)'
    ELSE '✅ RLS Enabled'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'user_progress',
    'user_achievements', 
    'read_articles',
    'profiles',
    'wallets',
    'articles'
  )
ORDER BY tablename;

-- If any of these tables have RLS enabled, we need to ensure service role can access them
-- Run the sections below ONLY if the table has RLS enabled

-- ============================================
-- OPTIONAL: user_progress policies (if RLS enabled)
-- ============================================
-- Uncomment and run ONLY if user_progress has RLS enabled

/*
DROP POLICY IF EXISTS "Service role access user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;

CREATE POLICY "Service role full access to user_progress"
  ON public.user_progress
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY "Users can view own progress"
  ON public.user_progress
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress
  FOR UPDATE
  USING (auth.uid()::text = user_id);
*/


-- ============================================
-- OPTIONAL: wallets policies (if RLS enabled)
-- ============================================
-- Uncomment and run ONLY if wallets has RLS enabled

/*
DROP POLICY IF EXISTS "Service role access wallets" ON public.wallets;
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;

CREATE POLICY "Service role full access to wallets"
  ON public.wallets
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY "Users can view own wallet"
  ON public.wallets
  FOR SELECT
  USING (auth.uid()::text = user_id);
*/


-- ============================================
-- OPTIONAL: profiles policies (if RLS enabled)
-- ============================================
-- Uncomment and run ONLY if profiles has RLS enabled

/*
DROP POLICY IF EXISTS "Service role access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Service role full access to profiles"
  ON public.profiles
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid()::text = id);
*/


-- ============================================
-- VERIFICATION
-- ============================================

-- Check all policies on article_views
SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_status,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'article_views'
ORDER BY policyname;

-- Check all policies on article_swipe_stats
SELECT 
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'article_swipe_stats'
ORDER BY policyname;


-- ============================================
-- SUMMARY
-- ============================================

/*
✅ WHAT THIS FIXES:

1. article_views policies now properly allow:
   - Service role: Full access (SELECT, INSERT, UPDATE, DELETE)
   - Users: Can only access their own records

2. article_swipe_stats policies now properly allow:
   - Everyone: Can read (SELECT)
   - Service role only: Can modify (INSERT, UPDATE, DELETE)

3. The error "Failed to fetch user progress" should be resolved

IMPORTANT:
- The backend server uses the service_role key, so it needs service_role access
- Individual users use the anon key, so they get user-level access
- This maintains security while allowing the backend to function
*/
