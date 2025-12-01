-- ============================================================================
-- CHECK IF ARTICLES ARE ACCIDENTALLY HIDDEN
-- ============================================================================
-- The /articles endpoint doesn't filter by hidden=false
-- But maybe the database has hidden=true accidentally?
-- ============================================================================

-- ============================================================================
-- 1. COUNT VISIBLE VS HIDDEN ARTICLES
-- ============================================================================
SELECT 
  hidden,
  COUNT(*) as count
FROM articles
GROUP BY hidden;

-- Expected:
-- hidden | count
-- false  | 64
-- true   | 0

-- If you see hidden=true with articles, THAT'S THE BUG!

-- ============================================================================
-- 2. LIST ALL HIDDEN ARTICLES (IF ANY)
-- ============================================================================
SELECT 
  id,
  title,
  category,
  hidden,
  created_at
FROM articles
WHERE hidden = true
ORDER BY created_at DESC;

-- If this returns results, these articles won't show in browse!

-- ============================================================================
-- 3. CHECK FOR NULL HIDDEN VALUES
-- ============================================================================
SELECT 
  COUNT(*) as null_hidden_count
FROM articles
WHERE hidden IS NULL;

-- Should be 0 after running FIX_MISSING_COLUMNS.sql

-- ============================================================================
-- 4. FULL BREAKDOWN
-- ============================================================================
SELECT 
  CASE 
    WHEN hidden = true THEN '🔒 HIDDEN (won''t show)'
    WHEN hidden = false THEN '✅ VISIBLE'
    WHEN hidden IS NULL THEN '⚠️  NULL (needs fix)'
  END as status,
  COUNT(*) as count
FROM articles
GROUP BY hidden;

-- ============================================================================
-- FIX: UNHIDE ALL ARTICLES
-- ============================================================================

-- If articles are accidentally hidden, run this:
-- UPDATE articles SET hidden = false WHERE hidden = true OR hidden IS NULL;

-- Then verify:
-- SELECT COUNT(*) FROM articles WHERE hidden = false;
-- Should show 64

-- ============================================================================
-- VERIFY WITH ACTUAL QUERY THE API USES
-- ============================================================================

-- This is what the Edge Function queries (no hidden filter for SQL articles):
SELECT 
  id,
  title,
  category,
  hidden,
  created_at
FROM articles
ORDER BY created_at DESC
LIMIT 50;

-- All 50 should have hidden=false
