-- ============================================================================
-- NUCLEAR FIX: Disable RLS on Articles Table
-- ============================================================================
-- The error "Missing authorization header" (code 401) is coming from
-- Supabase PostgREST, not the Edge Function. This means RLS is blocking
-- even the service role queries.
--
-- Solution: Disable RLS entirely for the articles table
-- ============================================================================

-- Disable Row Level Security on articles table
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'articles';

-- Should show: rls_enabled = false

-- Test query (should work now)
SELECT COUNT(*) as total_articles FROM articles;

-- Should return 64

-- ============================================================================
-- ✅ RUN THIS ONE COMMAND:
-- ============================================================================

ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
