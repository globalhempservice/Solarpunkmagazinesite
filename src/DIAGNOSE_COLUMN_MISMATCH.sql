-- ============================================================================
-- DIAGNOSE COLUMN MISMATCH - Why 64 Articles Aren't Showing
-- ============================================================================
-- The database HAS 64 articles, but the API returns 0
-- This means the query is likely failing due to missing columns
-- ============================================================================

-- ============================================================================
-- 1. CHECK WHICH COLUMNS EXIST IN YOUR ARTICLES TABLE
-- ============================================================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'articles'
ORDER BY ordinal_position;

-- ============================================================================
-- 2. CHECK IF THESE SPECIFIC COLUMNS EXIST
-- ============================================================================
-- The new Edge Function code tries to access these columns:

SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'author') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as author_column,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'author_image') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as author_image_column,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'author_title') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as author_title_column,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'publish_date') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as publish_date_column,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'feed_title') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as feed_title_column,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'feed_url') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as feed_url_column,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'hidden') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as hidden_column,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'source') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as source_column,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'source_url') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as source_url_column,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'media') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as media_column,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'organization_id') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as organization_id_column;

-- ============================================================================
-- 3. SEE A SAMPLE ARTICLE WITH ALL ITS ACTUAL COLUMNS
-- ============================================================================
SELECT * FROM articles LIMIT 1;

-- ============================================================================
-- 4. CHECK IF QUERY WITH MISSING COLUMNS WOULD FAIL
-- ============================================================================
-- Try to select with all the columns the new code expects
-- This will show which columns cause errors

-- Basic columns (should always exist):
SELECT 
  id,
  title,
  content,
  excerpt,
  category,
  cover_image,
  reading_time,
  author_id,
  views,
  likes,
  created_at,
  updated_at
FROM articles LIMIT 1;

-- ============================================================================
-- 📊 INTERPRETATION
-- ============================================================================

/*

If ANY of these columns show ❌ MISSING:
- author
- author_image  
- author_title
- publish_date
- feed_title
- feed_url
- hidden
- source
- source_url
- media
- organization_id

Then the NEW code is trying to SELECT columns that don't exist in your OLD schema!

This is likely why:
- Old code works (doesn't query these columns)
- New code fails (queries non-existent columns)

THE FIX: Add these missing columns to your articles table

*/
