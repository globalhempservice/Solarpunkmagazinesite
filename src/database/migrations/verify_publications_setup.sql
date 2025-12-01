-- ============================================================================
-- PUBLICATIONS TAB VERIFICATION SCRIPT
-- ============================================================================
-- Run this to check if the publications system is set up correctly
-- ============================================================================

-- Check if organization_publications table exists
SELECT 
  'organization_publications table' AS check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'organization_publications'
    ) 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING - Run organization_publications.sql migration!' 
  END AS status;

-- Check if articles table exists
SELECT 
  'articles table' AS check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'articles'
    ) 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING - Articles table not found!' 
  END AS status;

-- Check if companies table exists
SELECT 
  'companies table' AS check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'companies'
    ) 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING - Companies table not found!' 
  END AS status;

-- Check RLS is enabled on organization_publications
SELECT 
  'RLS on organization_publications' AS check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'organization_publications' 
      AND rowsecurity = true
    ) 
    THEN '✅ ENABLED' 
    ELSE '⚠️  DISABLED or table missing' 
  END AS status;

-- Count indexes on organization_publications
SELECT 
  'Indexes on organization_publications' AS check_name,
  COALESCE(
    (SELECT COUNT(*)::TEXT || ' indexes found' 
     FROM pg_indexes 
     WHERE tablename = 'organization_publications'),
    '0 indexes (table missing)'
  ) AS status;

-- Count policies on organization_publications
SELECT 
  'Policies on organization_publications' AS check_name,
  COALESCE(
    (SELECT COUNT(*)::TEXT || ' policies found' 
     FROM pg_policies 
     WHERE tablename = 'organization_publications'),
    '0 policies (table missing)'
  ) AS status;

-- Show columns in organization_publications
SELECT 
  'organization_publications columns' AS info,
  STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS columns
FROM information_schema.columns
WHERE table_name = 'organization_publications'
GROUP BY 1;

-- Test if we can query the table (should return 0 rows initially)
SELECT 
  'Test query organization_publications' AS check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_publications')
    THEN (SELECT COUNT(*)::TEXT || ' publications found' FROM organization_publications)
    ELSE '❌ Cannot query - table missing'
  END AS status;

-- Show all policies on organization_publications
SELECT 
  'Policy: ' || policyname AS policy_info,
  cmd AS command,
  CASE 
    WHEN cmd = 'SELECT' THEN '👁️  Read'
    WHEN cmd = 'INSERT' THEN '➕ Create'
    WHEN cmd = 'UPDATE' THEN '✏️  Update'
    WHEN cmd = 'DELETE' THEN '🗑️  Delete'
    WHEN cmd = 'ALL' THEN '🔓 All Operations'
  END AS operation
FROM pg_policies 
WHERE tablename = 'organization_publications'
ORDER BY policyname;

-- ============================================================================
-- QUICK FIX COMMANDS (if table is missing)
-- ============================================================================

/*
If the table doesn't exist, run this:

1. Open /database/migrations/organization_publications.sql
2. Copy ALL the contents
3. Paste into Supabase SQL Editor
4. Click "Run"
5. Come back and run this verification script again

Expected result after running migration:
- ✅ organization_publications table EXISTS
- ✅ RLS ENABLED
- ✅ 6+ indexes found
- ✅ 7+ policies found
*/
