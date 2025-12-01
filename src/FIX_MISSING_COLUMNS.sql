-- ============================================================================
-- FIX MISSING COLUMNS IN ARTICLES TABLE
-- ============================================================================
-- This adds all the columns that the NEW multi-author system expects
-- but which don't exist in your OLD articles table
-- ============================================================================

-- Run this in Supabase SQL Editor to fix your articles table

-- ============================================================================
-- ADD MISSING COLUMNS (Safe - won't affect existing articles)
-- ============================================================================

-- Add author name (for display, separate from author_id which is UUID)
ALTER TABLE articles 
  ADD COLUMN IF NOT EXISTS author TEXT;

-- Add author image URL
ALTER TABLE articles 
  ADD COLUMN IF NOT EXISTS author_image TEXT;

-- Add author title/role (e.g., "Senior Editor", "Contributor")
ALTER TABLE articles 
  ADD COLUMN IF NOT EXISTS author_title TEXT;

-- Add publish date (different from created_at for scheduled publishing)
ALTER TABLE articles 
  ADD COLUMN IF NOT EXISTS publish_date TIMESTAMPTZ;

-- Add source (e.g., "user", "rss", "import")
ALTER TABLE articles 
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'user';

-- Add source URL (for RSS articles, LinkedIn imports, etc.)
ALTER TABLE articles 
  ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Add hidden flag (to hide articles without deleting them)
ALTER TABLE articles 
  ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false;

-- Add feed title (for RSS feed name)
ALTER TABLE articles 
  ADD COLUMN IF NOT EXISTS feed_title TEXT;

-- Add feed URL (for RSS feed homepage)
ALTER TABLE articles 
  ADD COLUMN IF NOT EXISTS feed_url TEXT;

-- Add media array (for multiple images/videos in article)
ALTER TABLE articles 
  ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::jsonb;

-- Add organization_id (for multi-author organization publishing)
ALTER TABLE articles 
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES companies(id);

-- ============================================================================
-- CREATE INDEXES FOR NEW COLUMNS
-- ============================================================================

-- Index for hidden articles (filtering)
CREATE INDEX IF NOT EXISTS idx_articles_hidden ON articles(hidden);

-- Index for organization articles (filtering by organization)
CREATE INDEX IF NOT EXISTS idx_articles_organization ON articles(organization_id);

-- Index for source type (filtering by source)
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);

-- ============================================================================
-- SET DEFAULT VALUES FOR EXISTING ARTICLES
-- ============================================================================

-- Make sure all existing articles are visible (not hidden)
UPDATE articles 
SET hidden = false 
WHERE hidden IS NULL;

-- Set source to 'user' for existing articles (they were user-created)
UPDATE articles 
SET source = 'user' 
WHERE source IS NULL;

-- Set media to empty array if NULL
UPDATE articles 
SET media = '[]'::jsonb 
WHERE media IS NULL;

-- ============================================================================
-- VERIFY THE FIX
-- ============================================================================

-- Check that all columns now exist
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'author') 
    THEN '✅ author' ELSE '❌ author' END as col1,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'author_image') 
    THEN '✅ author_image' ELSE '❌ author_image' END as col2,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'author_title') 
    THEN '✅ author_title' ELSE '❌ author_title' END as col3,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'publish_date') 
    THEN '✅ publish_date' ELSE '❌ publish_date' END as col4,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'source') 
    THEN '✅ source' ELSE '❌ source' END as col5,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'source_url') 
    THEN '✅ source_url' ELSE '❌ source_url' END as col6,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'hidden') 
    THEN '✅ hidden' ELSE '❌ hidden' END as col7,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'feed_title') 
    THEN '✅ feed_title' ELSE '❌ feed_title' END as col8,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'feed_url') 
    THEN '✅ feed_url' ELSE '❌ feed_url' END as col9,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'media') 
    THEN '✅ media' ELSE '❌ media' END as col10,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'organization_id') 
    THEN '✅ organization_id' ELSE '❌ organization_id' END as col11;

-- Expected: All should show ✅

-- ============================================================================
-- TEST QUERY - Should work now without errors
-- ============================================================================

SELECT 
  id,
  title,
  author,
  author_image,
  author_title,
  publish_date,
  source,
  source_url,
  hidden,
  feed_title,
  feed_url,
  media,
  organization_id,
  created_at
FROM articles 
ORDER BY created_at DESC
LIMIT 5;

-- Expected: Should return 5 articles with all columns populated (some may be NULL, that's OK)

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

SELECT 
  COUNT(*) as total_articles,
  COUNT(*) FILTER (WHERE hidden = false) as visible_articles,
  COUNT(*) FILTER (WHERE hidden = true) as hidden_articles
FROM articles;

-- Expected: 
-- total_articles: 64
-- visible_articles: 64
-- hidden_articles: 0

-- ============================================================================
-- 🎉 SUCCESS!
-- ============================================================================

-- If all the above queries work, your database is now compatible with the new code!
-- Go to your DEWII site and refresh - articles should appear!

-- If articles still don't show:
-- 1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
-- 2. Check Edge Function logs for any remaining errors
-- 3. Open /TEST_ARTICLES_DEBUG.html to verify API response
