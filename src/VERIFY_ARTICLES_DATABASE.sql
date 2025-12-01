-- ============================================================================
-- DEWII ARTICLES DATABASE VERIFICATION
-- ============================================================================
-- Run these queries in Supabase SQL Editor to diagnose why articles aren't showing
-- ============================================================================

-- ============================================================================
-- 1. CHECK IF ARTICLES TABLE EXISTS
-- ============================================================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_name = 'articles';

-- Expected: 1 row with table_name = 'articles'
-- If 0 rows: TABLE DOESN'T EXIST! Need to create it.

-- ============================================================================
-- 2. COUNT TOTAL ARTICLES
-- ============================================================================
SELECT COUNT(*) as total_articles FROM articles;

-- Expected: At least 1 article
-- If 0: DATABASE IS EMPTY! This is likely the issue.

-- ============================================================================
-- 3. CHECK ARTICLE COLUMNS (SCHEMA)
-- ============================================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'articles'
ORDER BY ordinal_position;

-- Look for these important columns:
-- - id (uuid)
-- - title (text)
-- - content (text)
-- - category (text)
-- - author_id (uuid)
-- - hidden (boolean) ← NEW COLUMN - check if it exists
-- - organization_id (uuid) ← NEW COLUMN from multi-author system

-- ============================================================================
-- 4. CHECK IF "HIDDEN" COLUMN EXISTS AND VALUES
-- ============================================================================
-- This will error if column doesn't exist (that's okay!)
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE hidden = true) as hidden_count,
  COUNT(*) FILTER (WHERE hidden = false) as visible_count,
  COUNT(*) FILTER (WHERE hidden IS NULL) as null_hidden
FROM articles;

-- Expected: Most articles should be visible (hidden = false)
-- If all are hidden = true: THAT'S THE PROBLEM!

-- ============================================================================
-- 5. VIEW SAMPLE ARTICLES
-- ============================================================================
SELECT 
  id,
  title,
  category,
  author_id,
  created_at,
  hidden,
  organization_id,
  views,
  likes
FROM articles
ORDER BY created_at DESC
LIMIT 10;

-- Expected: See your articles listed
-- If 0 rows: Database is empty!

-- ============================================================================
-- 6. CHECK ROW LEVEL SECURITY (RLS) STATUS
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'articles';

-- Expected: rls_enabled = true
-- Note: This shouldn't matter because server uses SERVICE_ROLE_KEY

-- ============================================================================
-- 7. CHECK RLS POLICIES
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'articles';

-- Expected: "Articles are viewable by everyone" policy with USING (true)

-- ============================================================================
-- 8. CHECK KV STORE ARTICLES
-- ============================================================================
SELECT COUNT(*) as kv_article_count
FROM kv_store_053bcd80
WHERE key LIKE 'article_%';

-- Expected: May have articles from old RSS system
-- If > 0: Articles exist in KV but not SQL!

-- ============================================================================
-- 9. VIEW KV STORE ARTICLE KEYS
-- ============================================================================
SELECT key
FROM kv_store_053bcd80
WHERE key LIKE 'article_%'
LIMIT 10;

-- Shows which article IDs exist in KV store

-- ============================================================================
-- 10. CHECK AUTHOR_ID VALIDITY
-- ============================================================================
-- Verify articles have valid author_ids that exist in auth.users
SELECT 
  a.id,
  a.title,
  a.author_id,
  CASE 
    WHEN u.id IS NULL THEN '❌ INVALID'
    ELSE '✅ VALID'
  END as author_status
FROM articles a
LEFT JOIN auth.users u ON a.author_id = u.id
LIMIT 10;

-- Expected: All should be VALID
-- If INVALID: Foreign key constraint might be blocking

-- ============================================================================
-- 11. CHECK ORGANIZATION_ID COLUMN
-- ============================================================================
-- New column from multi-author system
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE organization_id IS NOT NULL) as with_org,
  COUNT(*) FILTER (WHERE organization_id IS NULL) as without_org
FROM articles;

-- Expected: Most will be NULL (optional column)
-- This column was added for organization publishing feature

-- ============================================================================
-- 12. CHECK FOR ARTICLES WITH ISSUES
-- ============================================================================
-- Find articles that might be problematic
SELECT 
  id,
  title,
  CASE 
    WHEN title IS NULL OR title = '' THEN '❌ Missing Title'
    WHEN content IS NULL OR content = '' THEN '❌ Missing Content'
    WHEN category IS NULL OR category = '' THEN '❌ Missing Category'
    WHEN author_id IS NULL THEN '❌ Missing Author'
    ELSE '✅ OK'
  END as status
FROM articles
WHERE 
  title IS NULL OR title = '' OR
  content IS NULL OR content = '' OR
  category IS NULL OR category = '' OR
  author_id IS NULL
LIMIT 20;

-- Expected: 0 rows (no problematic articles)

-- ============================================================================
-- SUMMARY DIAGNOSTIC QUERY
-- ============================================================================
-- One query to rule them all!
SELECT 
  'Articles Table' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status,
  (SELECT COUNT(*) FROM articles) as count
UNION ALL
SELECT 
  'Hidden Column' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'articles' AND column_name = 'hidden'
    )
    THEN '✅ EXISTS'
    ELSE '⚠️ MISSING'
  END as status,
  NULL as count
UNION ALL
SELECT 
  'Organization_ID Column' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'articles' AND column_name = 'organization_id'
    )
    THEN '✅ EXISTS'
    ELSE '⚠️ MISSING'
  END as status,
  NULL as count
UNION ALL
SELECT 
  'KV Store Articles' as check_type,
  '✅ CHECKED' as status,
  (SELECT COUNT(*) FROM kv_store_053bcd80 WHERE key LIKE 'article_%') as count
UNION ALL
SELECT 
  'RLS Enabled' as check_type,
  CASE 
    WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'articles')
    THEN '✅ YES'
    ELSE '⚠️ NO'
  END as status,
  NULL as count;

-- ============================================================================
-- 🎯 INTERPRETATION GUIDE
-- ============================================================================

/*

RESULT 1: Articles Table = ✅ EXISTS, count = 0
→ DIAGNOSIS: Database is empty!
→ SOLUTION: Create test articles (see below)

RESULT 2: Articles Table = ✅ EXISTS, count > 0
→ DIAGNOSIS: Articles exist but not showing
→ Check: hidden column, RLS policies, Edge Function logs

RESULT 3: Hidden Column = ⚠️ MISSING
→ DIAGNOSIS: Code references "hidden" but column doesn't exist
→ SOLUTION: Add column (see below)

RESULT 4: KV Store Articles > 0, Articles Table = 0
→ DIAGNOSIS: Articles are in KV but not SQL
→ SOLUTION: Need to migrate or create new articles

*/

-- ============================================================================
-- QUICK FIXES
-- ============================================================================

-- FIX 1: Add "hidden" column if missing
-- ALTER TABLE articles ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false;

-- FIX 2: Unhide all articles
-- UPDATE articles SET hidden = false;

-- FIX 3: Create a test article
/*
INSERT INTO articles (title, content, excerpt, category, author_id)
VALUES (
  'Hemp Innovation Takes Center Stage',
  'A comprehensive look at how hemp is revolutionizing sustainable materials and eco-friendly products across multiple industries.',
  'Discover the latest breakthroughs in hemp technology',
  'Eco Innovation',
  (SELECT id FROM auth.users LIMIT 1)
);
*/

-- FIX 4: Create 5 test articles
/*
INSERT INTO articles (title, content, excerpt, category, author_id)
SELECT 
  CASE i
    WHEN 1 THEN 'The Future of Sustainable Hemp Agriculture'
    WHEN 2 THEN 'Hemp-Based Building Materials Transform Construction'
    WHEN 3 THEN 'Hemp Fashion: Eco-Friendly Style Revolution'
    WHEN 4 THEN 'Hemp Nutrition: Superfood of the Future'
    ELSE 'Hemp Bioplastics: Replacing Petroleum Products'
  END as title,
  'This is comprehensive content about hemp innovation and sustainability. Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' ||
  'We explore various aspects of hemp industry, from agriculture to manufacturing, and its impact on environmental sustainability.' as content,
  'A deep dive into hemp innovation and its environmental impact.' as excerpt,
  CASE 
    WHEN i % 3 = 0 THEN 'Eco Innovation'
    WHEN i % 3 = 1 THEN 'Business'
    ELSE 'Culture'
  END as category,
  (SELECT id FROM auth.users LIMIT 1) as author_id
FROM generate_series(1, 5) as i;
*/

-- ============================================================================
-- 🏁 NEXT STEPS AFTER RUNNING THESE QUERIES
-- ============================================================================

/*

1. Run all queries in Supabase SQL Editor
2. Note the results, especially:
   - Total articles count
   - Hidden column status
   - KV store article count
3. Share results in your next message
4. We'll provide exact fix based on findings!

*/
