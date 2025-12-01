-- ============================================================================
-- CHECK FOR MULTIPLE ARTICLE TABLES
-- ============================================================================
-- The multi-author system might have created new tables
-- Let's see what article-related tables exist
-- ============================================================================

-- ============================================================================
-- 1. LIST ALL TABLES IN DATABASE
-- ============================================================================
SELECT 
  table_name,
  CASE 
    WHEN table_name LIKE '%article%' THEN '📰 ARTICLE TABLE'
    WHEN table_name LIKE '%publication%' THEN '📚 PUBLICATION TABLE'
    WHEN table_name LIKE '%post%' THEN '📝 POST TABLE'
    ELSE ''
  END as type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- 2. COUNT ROWS IN EACH ARTICLE-RELATED TABLE
-- ============================================================================

-- Count in main articles table
SELECT 'articles' as table_name, COUNT(*) as row_count FROM articles;

-- Check if other tables exist
-- (These might error if tables don't exist - that's OK)

-- SELECT 'organization_articles' as table_name, COUNT(*) as row_count FROM organization_articles;
-- SELECT 'publications' as table_name, COUNT(*) as row_count FROM publications;
-- SELECT 'posts' as table_name, COUNT(*) as row_count FROM posts;

-- ============================================================================
-- 3. CHECK IF THERE'S AN 'organization_articles' or 'publications' TABLE
-- ============================================================================
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'organization_articles'
    ) THEN '✅ organization_articles table EXISTS'
    ELSE '❌ organization_articles table DOES NOT EXIST'
  END as org_articles_check,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'publications'
    ) THEN '✅ publications table EXISTS'
    ELSE '❌ publications table DOES NOT EXIST'
  END as publications_check,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'article_authors'
    ) THEN '✅ article_authors table EXISTS (multi-author junction table)'
    ELSE '❌ article_authors table DOES NOT EXIST'
  END as article_authors_check;

-- ============================================================================
-- 4. CHECK ARTICLES TABLE STRUCTURE
-- ============================================================================
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'articles'
ORDER BY ordinal_position;

-- ============================================================================
-- 5. SAMPLE DATA FROM ARTICLES TABLE
-- ============================================================================
SELECT 
  id,
  title,
  category,
  organization_id,
  created_at,
  hidden
FROM articles
ORDER BY created_at DESC
LIMIT 5;

-- Should show your 64 articles with correct categories
