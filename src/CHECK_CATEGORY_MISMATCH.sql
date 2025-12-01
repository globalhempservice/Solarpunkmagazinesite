-- ============================================================================
-- CHECK CATEGORY MISMATCH - Why articles aren't showing in browse page
-- ============================================================================
-- The browse page expects specific category names
-- Your articles might have different category names
-- ============================================================================

-- ============================================================================
-- 1. SEE WHAT CATEGORIES YOUR ARTICLES ACTUALLY HAVE
-- ============================================================================
SELECT 
  category,
  COUNT(*) as article_count
FROM articles
GROUP BY category
ORDER BY article_count DESC;

-- This will show you the ACTUAL categories in your database

-- ============================================================================
-- 2. EXPECTED CATEGORIES BY BROWSE PAGE
-- ============================================================================
-- The BrowsePage.tsx expects these EXACT category names:
-- 
-- ✅ 'Renewable Energy'
-- ✅ 'Sustainable Tech'
-- ✅ 'Green Cities'
-- ✅ 'Eco Innovation'
-- ✅ 'Climate Action'
-- ✅ 'Community'
-- ✅ 'Future Vision'

-- ============================================================================
-- 3. CHECK IF YOUR CATEGORIES MATCH THE EXPECTED ONES
-- ============================================================================
SELECT 
  id,
  title,
  category,
  CASE 
    WHEN category = 'Renewable Energy' THEN '✅ WILL SHOW'
    WHEN category = 'Sustainable Tech' THEN '✅ WILL SHOW'
    WHEN category = 'Green Cities' THEN '✅ WILL SHOW'
    WHEN category = 'Eco Innovation' THEN '✅ WILL SHOW'
    WHEN category = 'Climate Action' THEN '✅ WILL SHOW'
    WHEN category = 'Community' THEN '✅ WILL SHOW'
    WHEN category = 'Future Vision' THEN '✅ WILL SHOW'
    ELSE '❌ WON''T SHOW (Wrong category name)'
  END as status
FROM articles
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 4. FIND ARTICLES WITH NON-STANDARD CATEGORIES
-- ============================================================================
SELECT 
  category,
  COUNT(*) as count,
  '❌ NOT IN BROWSE PAGE' as issue
FROM articles
WHERE category NOT IN (
  'Renewable Energy',
  'Sustainable Tech', 
  'Green Cities',
  'Eco Innovation',
  'Climate Action',
  'Community',
  'Future Vision'
)
GROUP BY category;

-- If this returns results, these articles won't show in browse page!

-- ============================================================================
-- 🎯 DIAGNOSIS
-- ============================================================================

/*

LIKELY PROBLEM:
Your articles have categories like:
- "general" (default from schema)
- "technology"
- "business"
- "culture"
- Or other names

But BrowsePage expects:
- "Eco Innovation"
- "Community"
- etc.

THE FIX: Update article categories to match expected names

*/

-- ============================================================================
-- FIX 1: MAP OLD CATEGORIES TO NEW ONES
-- ============================================================================

-- Example: If you have "general" → change to "Eco Innovation"
-- UPDATE articles SET category = 'Eco Innovation' WHERE category = 'general';

-- Example: If you have "technology" → change to "Sustainable Tech"
-- UPDATE articles SET category = 'Sustainable Tech' WHERE category = 'technology';

-- Example: If you have "business" → change to "Renewable Energy"
-- UPDATE articles SET category = 'Renewable Energy' WHERE category = 'business';

-- Example: If you have "culture" → change to "Community"
-- UPDATE articles SET category = 'Community' WHERE category = 'culture';

-- ============================================================================
-- FIX 2: SET ALL ARTICLES TO "ECO INNOVATION" (Quick test)
-- ============================================================================

-- Uncomment this to set ALL articles to "Eco Innovation" category
-- This will make them ALL appear in the browse page under "Eco Innovation"
-- 
-- UPDATE articles SET category = 'Eco Innovation';

-- Then refresh your site and check the "Eco Innovation" category!

-- ============================================================================
-- FIX 3: SMART MAPPING BASED ON KEYWORDS IN TITLE
-- ============================================================================

-- Map based on article title content (smart guess)
/*
UPDATE articles 
SET category = CASE
  WHEN LOWER(title) LIKE '%solar%' OR LOWER(title) LIKE '%wind%' OR LOWER(title) LIKE '%energy%' 
    THEN 'Renewable Energy'
  WHEN LOWER(title) LIKE '%tech%' OR LOWER(title) LIKE '%innovation%' OR LOWER(title) LIKE '%ai%'
    THEN 'Sustainable Tech'
  WHEN LOWER(title) LIKE '%city%' OR LOWER(title) LIKE '%urban%' OR LOWER(title) LIKE '%building%'
    THEN 'Green Cities'
  WHEN LOWER(title) LIKE '%climate%' OR LOWER(title) LIKE '%carbon%' OR LOWER(title) LIKE '%emission%'
    THEN 'Climate Action'
  WHEN LOWER(title) LIKE '%community%' OR LOWER(title) LIKE '%people%' OR LOWER(title) LIKE '%social%'
    THEN 'Community'
  WHEN LOWER(title) LIKE '%future%' OR LOWER(title) LIKE '%vision%' OR LOWER(title) LIKE '%tomorrow%'
    THEN 'Future Vision'
  ELSE 'Eco Innovation'
END
WHERE category NOT IN (
  'Renewable Energy', 'Sustainable Tech', 'Green Cities', 
  'Eco Innovation', 'Climate Action', 'Community', 'Future Vision'
);
*/

-- ============================================================================
-- AFTER RUNNING FIX: VERIFY
-- ============================================================================

-- Count articles per category (should all be valid categories now)
SELECT 
  category,
  COUNT(*) as count
FROM articles
GROUP BY category
ORDER BY count DESC;

-- All categories should be one of the 7 expected ones!
