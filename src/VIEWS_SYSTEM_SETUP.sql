-- ============================================
-- DEWII VIEWS TRACKING SYSTEM
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run
-- ============================================

-- 1. CREATE ARTICLE VIEWS TRACKING TABLE
-- Used to track daily view counts per article for analytics
CREATE TABLE IF NOT EXISTS public.article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL,
  date DATE NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one record per article per day
  UNIQUE(article_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON public.article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_date ON public.article_views(date);
CREATE INDEX IF NOT EXISTS idx_article_views_article_date ON public.article_views(article_id, date);

-- Enable RLS (Row Level Security)
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role has full access to article_views"
  ON public.article_views
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anyone can view the view counts (public data)
CREATE POLICY "Public can view article_views"
  ON public.article_views
  FOR SELECT
  TO anon, authenticated
  USING (true);

COMMENT ON TABLE public.article_views IS 'Tracks daily view counts per article for analytics and trending calculations';

-- ============================================

-- 2. CREATE USER ARTICLE VIEW LOG (for unique viewer tracking)
-- Tracks which users have viewed which articles
CREATE TABLE IF NOT EXISTS public.user_article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  article_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  session_duration INTEGER, -- seconds spent on article
  scroll_depth INTEGER, -- percentage scrolled (0-100)
  
  -- Track first view per user per article
  UNIQUE(user_id, article_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_article_views_user_id ON public.user_article_views(user_id);
CREATE INDEX IF NOT EXISTS idx_user_article_views_article_id ON public.user_article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_user_article_views_viewed_at ON public.user_article_views(viewed_at);

-- Enable RLS
ALTER TABLE public.user_article_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role has full access to user_article_views"
  ON public.user_article_views
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view their own view history
CREATE POLICY "Users can view their own article views"
  ON public.user_article_views
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.user_article_views IS 'Logs individual user article views for unique viewer counts and engagement metrics';

-- ============================================

-- 3. ENSURE ARTICLES TABLE HAS VIEWS COLUMN
-- Add views column if it doesn't exist
ALTER TABLE public.articles 
  ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Add index for sorting by views
CREATE INDEX IF NOT EXISTS idx_articles_views ON public.articles(views DESC);

-- ============================================

-- 4. CREATE FUNCTION TO AUTO-UPDATE updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for article_views
DROP TRIGGER IF EXISTS update_article_views_updated_at ON public.article_views;
CREATE TRIGGER update_article_views_updated_at
    BEFORE UPDATE ON public.article_views
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================

-- 5. GRANT PERMISSIONS
GRANT ALL ON public.article_views TO service_role;
GRANT SELECT ON public.article_views TO authenticated, anon;

GRANT ALL ON public.user_article_views TO service_role;
GRANT SELECT ON public.user_article_views TO authenticated;

-- ============================================

-- 6. VERIFY TABLES WERE CREATED
SELECT 
  tablename, 
  schemaname,
  tableowner
FROM pg_tables 
WHERE tablename IN ('article_views', 'user_article_views')
ORDER BY tablename;

-- Check articles table has views column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'articles' AND column_name = 'views';

-- ============================================
-- SUCCESS! 
-- Your views tracking system is now ready.
-- The Views tab in Admin Dashboard should now work!
-- ============================================
