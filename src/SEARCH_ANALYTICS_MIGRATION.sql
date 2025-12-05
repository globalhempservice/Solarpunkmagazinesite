-- ============================================
-- HEMP'IN UNIVERSE - SEARCH ANALYTICS MIGRATION
-- ============================================
-- This SQL script creates all necessary tables, views, and functions
-- for the 3D Globe search analytics system.
-- 
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- ============================================

-- ============================================
-- 1. CREATE MAIN SEARCH ANALYTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS search_analytics_053bcd80 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User & Session Info
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  
  -- Search Query Info
  search_query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  active_layer TEXT DEFAULT 'all',
  
  -- Globe Position at Search Time
  globe_lat DOUBLE PRECISION,
  globe_lng DOUBLE PRECISION,
  globe_altitude DOUBLE PRECISION,
  search_expanded BOOLEAN DEFAULT true,
  
  -- Click Tracking
  clicked BOOLEAN DEFAULT false,
  result_type TEXT,
  result_name TEXT,
  result_id TEXT,
  result_country TEXT,
  result_city TEXT,
  result_lat DOUBLE PRECISION,
  result_lng DOUBLE PRECISION,
  time_to_click_ms INTEGER,
  clicked_at TIMESTAMPTZ,
  
  -- Request Metadata
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  
  -- Timestamps
  searched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_search_analytics_user_id ON search_analytics_053bcd80(user_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_session_id ON search_analytics_053bcd80(session_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_searched_at ON search_analytics_053bcd80(searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_search_query ON search_analytics_053bcd80(search_query);
CREATE INDEX IF NOT EXISTS idx_search_analytics_results_count ON search_analytics_053bcd80(results_count);
CREATE INDEX IF NOT EXISTS idx_search_analytics_clicked ON search_analytics_053bcd80(clicked);
CREATE INDEX IF NOT EXISTS idx_search_analytics_result_type ON search_analytics_053bcd80(result_type);

-- Enable Row Level Security
ALTER TABLE search_analytics_053bcd80 ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anyone to insert (for tracking anonymous searches)
CREATE POLICY "Allow public insert" ON search_analytics_053bcd80
  FOR INSERT WITH CHECK (true);

-- Allow users to view their own searches
CREATE POLICY "Users can view own searches" ON search_analytics_053bcd80
  FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to view all searches
CREATE POLICY "Admins can view all searches" ON search_analytics_053bcd80
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM kv_store_053bcd80
      WHERE key = 'admin_user_id' AND value = auth.uid()::text
    )
  );

-- Allow admins to update searches
CREATE POLICY "Admins can update searches" ON search_analytics_053bcd80
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM kv_store_053bcd80
      WHERE key = 'admin_user_id' AND value = auth.uid()::text
    )
  );

-- ============================================
-- 2. CREATE SUMMARY VIEW
-- ============================================

CREATE OR REPLACE VIEW search_analytics_summary_053bcd80 AS
SELECT
  DATE(searched_at) as search_date,
  COUNT(*) as total_searches,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(*) FILTER (WHERE clicked = true) as total_clicks,
  ROUND(
    (COUNT(*) FILTER (WHERE clicked = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as click_rate,
  AVG(results_count) as avg_results_count,
  AVG(time_to_click_ms) FILTER (WHERE time_to_click_ms IS NOT NULL) as avg_time_to_click_ms
FROM search_analytics_053bcd80
GROUP BY DATE(searched_at)
ORDER BY search_date DESC;

-- ============================================
-- 3. CREATE TOP SEARCHES VIEW
-- ============================================

CREATE OR REPLACE VIEW top_searches_053bcd80 AS
SELECT
  LOWER(search_query) as query,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE clicked = true) as click_count,
  ROUND(
    (COUNT(*) FILTER (WHERE clicked = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
    2
  ) as click_rate,
  MAX(searched_at) as last_searched
FROM search_analytics_053bcd80
WHERE searched_at >= NOW() - INTERVAL '30 days'
GROUP BY LOWER(search_query)
ORDER BY count DESC, last_searched DESC
LIMIT 50;

-- ============================================
-- 4. CREATE SEARCH SUGGESTIONS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_search_suggestions_053bcd80(
  partial_query TEXT,
  suggestion_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  query TEXT,
  count BIGINT,
  last_searched TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    search_query as query,
    COUNT(*) as count,
    MAX(searched_at) as last_searched
  FROM search_analytics_053bcd80
  WHERE 
    LOWER(search_query) LIKE LOWER(partial_query || '%')
    AND searched_at >= NOW() - INTERVAL '90 days'
  GROUP BY search_query
  ORDER BY COUNT(*) DESC, MAX(searched_at) DESC
  LIMIT suggestion_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. CREATE TRENDING SEARCHES FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_trending_searches_053bcd80(
  days_back INTEGER DEFAULT 7,
  result_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  query TEXT,
  count BIGINT,
  growth_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH current_period AS (
    SELECT
      LOWER(search_query) as query,
      COUNT(*) as count
    FROM search_analytics_053bcd80
    WHERE searched_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY LOWER(search_query)
  ),
  previous_period AS (
    SELECT
      LOWER(search_query) as query,
      COUNT(*) as count
    FROM search_analytics_053bcd80
    WHERE 
      searched_at >= NOW() - (days_back * 2 || ' days')::INTERVAL
      AND searched_at < NOW() - (days_back || ' days')::INTERVAL
    GROUP BY LOWER(search_query)
  )
  SELECT
    c.query,
    c.count,
    CASE
      WHEN p.count IS NULL OR p.count = 0 THEN 100.0
      ELSE ROUND(((c.count - p.count)::NUMERIC / p.count) * 100, 2)
    END as growth_rate
  FROM current_period c
  LEFT JOIN previous_period p ON c.query = p.query
  WHERE c.count >= 2  -- Minimum 2 searches to be considered trending
  ORDER BY growth_rate DESC, c.count DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. GRANT PERMISSIONS
-- ============================================

-- Grant access to authenticated users
GRANT SELECT ON search_analytics_053bcd80 TO authenticated;
GRANT INSERT ON search_analytics_053bcd80 TO authenticated;
GRANT UPDATE ON search_analytics_053bcd80 TO authenticated;

-- Grant access to anonymous users for tracking
GRANT INSERT ON search_analytics_053bcd80 TO anon;

-- Grant view access
GRANT SELECT ON search_analytics_summary_053bcd80 TO authenticated;
GRANT SELECT ON top_searches_053bcd80 TO authenticated;

-- Grant function execution
GRANT EXECUTE ON FUNCTION get_search_suggestions_053bcd80(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_search_suggestions_053bcd80(TEXT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_trending_searches_053bcd80(INTEGER, INTEGER) TO authenticated;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Search Analytics Migration Complete!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Created:';
  RAISE NOTICE '   - search_analytics_053bcd80 table';
  RAISE NOTICE '   - search_analytics_summary_053bcd80 view';
  RAISE NOTICE '   - top_searches_053bcd80 view';
  RAISE NOTICE '   - get_search_suggestions_053bcd80() function';
  RAISE NOTICE '   - get_trending_searches_053bcd80() function';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Row Level Security enabled with proper policies';
  RAISE NOTICE '📈 Indexes created for optimal performance';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready to track search analytics!';
END $$;
