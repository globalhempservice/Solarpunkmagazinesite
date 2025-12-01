-- ============================================================================
-- QUICK FIX: Enable Public Reading of Articles
-- ============================================================================
-- Run this in Supabase SQL Editor to fix the 401 error
-- ============================================================================

-- Allow everyone (including anonymous users) to SELECT articles
DROP POLICY IF EXISTS "Enable read access for all users" ON articles;

CREATE POLICY "Enable read access for all users"
ON articles
FOR SELECT
USING (true);

-- Grant SELECT permission to anonymous and authenticated roles
GRANT SELECT ON articles TO anon;
GRANT SELECT ON articles TO authenticated;

-- Verify it worked
SELECT COUNT(*) as total_articles FROM articles;
-- Should show 64

-- ============================================================================
-- If still getting 401, run this nuclear option:
-- ============================================================================
-- ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
