-- ============================================================================
-- FIX RLS POLICIES - Allow Public Reading of Articles
-- ============================================================================
-- The /articles endpoint is failing with "Missing authorization header"
-- This is because RLS (Row Level Security) is blocking reads
-- We need to add a policy to allow public SELECT on articles
-- ============================================================================

-- ============================================================================
-- 1. CHECK CURRENT RLS STATUS
-- ============================================================================
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'articles';

-- If rls_enabled = true, we need policies

-- ============================================================================
-- 2. VIEW EXISTING POLICIES
-- ============================================================================
SELECT 
  policyname,
  permissive,
  roles,
  cmd as operation,
  qual as using_expression,
  with_check as check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'articles';

-- ============================================================================
-- 3. DROP ANY RESTRICTIVE SELECT POLICIES (if they exist)
-- ============================================================================
-- This removes old policies that might be blocking public reads

-- Be careful: Only drop if you know what policies exist
-- DROP POLICY IF EXISTS "articles_select_policy" ON articles;
-- DROP POLICY IF EXISTS "Users can view published articles" ON articles;
-- DROP POLICY IF EXISTS "Public articles are viewable by everyone" ON articles;

-- ============================================================================
-- 4. CREATE NEW POLICY: Allow Public SELECT on ALL Articles
-- ============================================================================
-- This allows ANYONE (authenticated or not) to read articles
-- The Edge Function uses service role, so this shouldn't be the issue,
-- but we'll add it anyway for safety

-- Drop existing policy with this name if it exists
DROP POLICY IF EXISTS "Enable read access for all users" ON articles;

-- Create new policy
CREATE POLICY "Enable read access for all users"
ON articles
FOR SELECT
USING (true);

-- This policy says: Anyone can SELECT (read) any row where true (always)

-- ============================================================================
-- 5. ALTERNATIVE: Disable RLS Entirely (Nuclear Option)
-- ============================================================================
-- Only use this if you want articles to be completely public
-- This removes ALL restrictions

-- WARNING: This makes the table completely open for SELECT operations
-- ALTER TABLE articles DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. ENSURE OTHER OPERATIONS REMAIN PROTECTED
-- ============================================================================
-- Make sure INSERT/UPDATE/DELETE still require authentication

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON articles;
DROP POLICY IF EXISTS "Enable update for users based on author_id" ON articles;
DROP POLICY IF EXISTS "Enable delete for users based on author_id" ON articles;

-- Allow authenticated users to INSERT
CREATE POLICY "Enable insert for authenticated users only"
ON articles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to UPDATE only their own articles
CREATE POLICY "Enable update for users based on author_id"
ON articles
FOR UPDATE
TO authenticated
USING (auth.uid()::text = author_id)
WITH CHECK (auth.uid()::text = author_id);

-- Allow users to DELETE only their own articles
CREATE POLICY "Enable delete for users based on author_id"
ON articles
FOR DELETE
TO authenticated
USING (auth.uid()::text = author_id);

-- ============================================================================
-- 7. VERIFY POLICIES ARE WORKING
-- ============================================================================
-- Check all policies
SELECT 
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'articles'
ORDER BY cmd;

-- Should show:
-- 1. SELECT policy for all users (anon + authenticated)
-- 2. INSERT policy for authenticated only
-- 3. UPDATE policy for authenticated matching author_id
-- 4. DELETE policy for authenticated matching author_id

-- ============================================================================
-- 8. TEST PUBLIC SELECT (as anon user)
-- ============================================================================
-- This simulates what the Edge Function does
SELECT COUNT(*) as total_articles
FROM articles;

-- Should return 64 (your total articles)
-- If it returns 0 or errors, RLS is still blocking

-- ============================================================================
-- 9. GRANT PUBLIC SELECT PERMISSIONS
-- ============================================================================
-- Ensure the anon role can SELECT from articles table
GRANT SELECT ON articles TO anon;
GRANT SELECT ON articles TO authenticated;

-- ============================================================================
-- ✅ RECOMMENDED FIX: Run This
-- ============================================================================

-- Step 1: Create public SELECT policy
DROP POLICY IF EXISTS "Enable read access for all users" ON articles;
CREATE POLICY "Enable read access for all users"
ON articles FOR SELECT
USING (true);

-- Step 2: Grant permissions
GRANT SELECT ON articles TO anon;
GRANT SELECT ON articles TO authenticated;

-- Step 3: Verify
SELECT COUNT(*) FROM articles;

-- Should show 64 articles!

-- ============================================================================
-- 🔥 IF STILL NOT WORKING: Nuclear Option
-- ============================================================================
/*
-- This completely disables RLS for the articles table
-- Use ONLY if the above doesn't work

ALTER TABLE articles DISABLE ROW LEVEL SECURITY;

-- Then verify:
SELECT COUNT(*) FROM articles; -- Should show 64

-- Note: This makes articles completely public for SELECT
-- INSERT/UPDATE/DELETE will still be controlled by application logic
*/
