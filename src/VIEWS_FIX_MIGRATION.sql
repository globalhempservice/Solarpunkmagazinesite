-- ============================================
-- DEWII VIEWS TRACKING - FIX MIGRATION
-- ============================================
-- Run this if you're getting the error:
-- "Could not find the 'unique_viewers' column"
-- ============================================

-- Option 1: Add missing column (if table exists but column is missing)
ALTER TABLE public.article_views 
  ADD COLUMN IF NOT EXISTS unique_viewers INTEGER DEFAULT 0;

-- Option 2: Ensure all required columns exist
DO $$ 
BEGIN
  -- Check and add views column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'article_views' AND column_name = 'views'
  ) THEN
    ALTER TABLE public.article_views ADD COLUMN views INTEGER NOT NULL DEFAULT 0;
  END IF;

  -- Check and add unique_viewers column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'article_views' AND column_name = 'unique_viewers'
  ) THEN
    ALTER TABLE public.article_views ADD COLUMN unique_viewers INTEGER DEFAULT 0;
  END IF;

  -- Check and add created_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'article_views' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.article_views ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;

  -- Check and add updated_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'article_views' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.article_views ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- Verify the fix
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'article_views'
ORDER BY ordinal_position;

-- Expected columns:
-- id, article_id, date, views, unique_viewers, created_at, updated_at

-- ============================================
-- SUCCESS! The unique_viewers column should now exist.
-- Try viewing an article again!
-- ============================================
