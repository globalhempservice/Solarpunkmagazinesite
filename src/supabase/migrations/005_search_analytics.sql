-- ============================================
-- HEMPIN UNIVERSE SEARCH ANALYTICS TABLE
-- ============================================
-- This table tracks all search queries performed on the 3D Globe
-- Used for analytics, trending searches, and improving search functionality
-- Run this SQL in your Supabase SQL Editor

-- Create search_analytics table
CREATE TABLE IF NOT EXISTS search_analytics_053bcd80 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User Information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous searches
  session_id TEXT, -- Browser session identifier for tracking anonymous users
  
  -- Search Query Data
  search_query TEXT NOT NULL, -- The actual search string
  search_query_lowercase TEXT GENERATED ALWAYS AS (LOWER(search_query)) STORED, -- For case-insensitive search
  
  -- Search Results & Interaction
  result_type TEXT, -- 'country', 'city', 'place', 'organization', 'product', 'event', NULL if no result clicked
  result_name TEXT, -- Name of the clicked result
  result_id UUID, -- ID of the clicked item (if applicable)
  results_count INTEGER DEFAULT 0, -- Number of results returned
  
  -- Result Location Data
  result_country TEXT, -- Country of the result
  result_city TEXT, -- City of the result
  result_lat DECIMAL(10, 7), -- Latitude of result (for places)
  result_lng DECIMAL(10, 7), -- Longitude of result (for places)
  
  -- User Behavior
  clicked BOOLEAN DEFAULT false, -- Did user click on a result?
  time_to_click_ms INTEGER, -- Time from search to click (in milliseconds)
  search_expanded BOOLEAN DEFAULT true, -- Was search box expanded when query made?
  
  -- Context & Environment
  active_layer TEXT, -- Which layer was active: 'organizations', 'products', 'places', 'events', 'all'
  globe_lat DECIMAL(10, 7), -- Globe latitude position when search was made
  globe_lng DECIMAL(10, 7), -- Globe longitude position when search was made
  globe_altitude DECIMAL(5, 2), -- Globe zoom level when search was made
  
  -- Technical Metadata
  ip_address TEXT, -- User IP for geographic analysis
  user_agent TEXT, -- Browser/device info
  referrer TEXT, -- How they got to the globe
  
  -- Timestamps
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  clicked_at TIMESTAMP WITH TIME ZONE, -- When result was clicked
  
  -- Constraints
  CONSTRAINT valid_time_to_click CHECK (time_to_click_ms IS NULL OR time_to_click_ms >= 0),
  CONSTRAINT valid_results_count CHECK (results_count >= 0),
  CONSTRAINT valid_result_type CHECK (result_type IN ('country', 'city', 'place', 'organization', 'product', 'event') OR result_type IS NULL)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_search_analytics_user ON search_analytics_053bcd80(user_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_session ON search_analytics_053bcd80(session_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics_053bcd80(search_query_lowercase);
CREATE INDEX IF NOT EXISTS idx_search_analytics_result_type ON search_analytics_053bcd80(result_type);
CREATE INDEX IF NOT EXISTS idx_search_analytics_layer ON search_analytics_053bcd80(active_layer);
CREATE INDEX IF NOT EXISTS idx_search_analytics_searched_at ON search_analytics_053bcd80(searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_clicked ON search_analytics_053bcd80(clicked);
CREATE INDEX IF NOT EXISTS idx_search_analytics_country ON search_analytics_053bcd80(result_country);

-- Create GIN index for full-text search on queries (useful for analytics)
CREATE INDEX IF NOT EXISTS idx_search_analytics_query_gin ON search_analytics_053bcd80 USING gin(to_tsvector('english', search_query));

-- Row Level Security (RLS) Policies
ALTER TABLE search_analytics_053bcd80 ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can create search analytics" ON search_analytics_053bcd80;
DROP POLICY IF EXISTS "Users can view their own searches" ON search_analytics_053bcd80;
DROP POLICY IF EXISTS "Admins can view all searches" ON search_analytics_053bcd80;
DROP POLICY IF EXISTS "Service role has full access" ON search_analytics_053bcd80;

-- Allow anyone (including anonymous) to insert search records
CREATE POLICY "Anyone can create search analytics"
  ON search_analytics_053bcd80
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own search history
CREATE POLICY "Users can view their own searches"
  ON search_analytics_053bcd80
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    user_id IS NULL -- Allow viewing anonymous searches for analytics
  );

-- Admin users can view all searches (replace with your admin user ID or use a role check)
CREATE POLICY "Admins can view all searches"
  ON search_analytics_053bcd80
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN (
        SELECT value::text FROM kv_store_053bcd80 
        WHERE key = 'admin_emails'
      )
    )
  );

-- Service role has full access (for server operations)
CREATE POLICY "Service role has full access"
  ON search_analytics_053bcd80
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT ON search_analytics_053bcd80 TO anon, authenticated;
GRANT ALL ON search_analytics_053bcd80 TO service_role;

-- Create a view for search analytics dashboard (aggregated data)
CREATE OR REPLACE VIEW search_analytics_summary_053bcd80 AS
SELECT 
  DATE_TRUNC('day', searched_at) as search_date,
  COUNT(*) as total_searches,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(*) FILTER (WHERE clicked = true) as searches_with_clicks,
  ROUND(COUNT(*) FILTER (WHERE clicked = true)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as click_through_rate,
  AVG(time_to_click_ms) FILTER (WHERE time_to_click_ms IS NOT NULL) as avg_time_to_click_ms,
  AVG(results_count) as avg_results_count,
  active_layer,
  result_type
FROM search_analytics_053bcd80
GROUP BY DATE_TRUNC('day', searched_at), active_layer, result_type
ORDER BY search_date DESC;

-- Grant access to the view
GRANT SELECT ON search_analytics_summary_053bcd80 TO anon, authenticated, service_role;

-- Create a view for top searches
CREATE OR REPLACE VIEW top_searches_053bcd80 AS
SELECT 
  search_query_lowercase as search_query,
  COUNT(*) as search_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) FILTER (WHERE clicked = true) as clicks,
  ROUND(COUNT(*) FILTER (WHERE clicked = true)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as ctr,
  MAX(searched_at) as last_searched,
  ARRAY_AGG(DISTINCT result_type) FILTER (WHERE result_type IS NOT NULL) as result_types
FROM search_analytics_053bcd80
WHERE searched_at > NOW() - INTERVAL '30 days' -- Last 30 days
GROUP BY search_query_lowercase
ORDER BY search_count DESC
LIMIT 100;

-- Grant access to the view
GRANT SELECT ON top_searches_053bcd80 TO anon, authenticated, service_role;

-- Comments for documentation
COMMENT ON TABLE search_analytics_053bcd80 IS 'Tracks all search queries performed on the Hemp Universe 3D Globe for analytics and UX improvement';
COMMENT ON COLUMN search_analytics_053bcd80.session_id IS 'Browser session identifier for tracking anonymous user search patterns';
COMMENT ON COLUMN search_analytics_053bcd80.time_to_click_ms IS 'Time between search query and clicking a result, indicates result relevance';
COMMENT ON COLUMN search_analytics_053bcd80.active_layer IS 'Which globe layer was active when search was performed';
COMMENT ON VIEW search_analytics_summary_053bcd80 IS 'Aggregated search metrics grouped by day, layer, and result type';
COMMENT ON VIEW top_searches_053bcd80 IS 'Top 100 most searched queries in the last 30 days with engagement metrics';

-- Create function to get trending searches
CREATE OR REPLACE FUNCTION get_trending_searches_053bcd80(
  days_back INTEGER DEFAULT 7,
  result_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  search_query TEXT,
  search_count BIGINT,
  trend_score NUMERIC,
  avg_ctr NUMERIC,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.search_query_lowercase::TEXT,
    COUNT(*)::BIGINT as search_count,
    -- Trend score: recent searches weighted more heavily
    (COUNT(*) * 1.0 / NULLIF(EXTRACT(DAY FROM NOW() - MAX(sa.searched_at)), 0))::NUMERIC as trend_score,
    ROUND(
      COUNT(*) FILTER (WHERE sa.clicked = true)::numeric / 
      NULLIF(COUNT(*), 0) * 100, 
      2
    ) as avg_ctr,
    COUNT(DISTINCT sa.user_id)::BIGINT as unique_users
  FROM search_analytics_053bcd80 sa
  WHERE sa.searched_at > NOW() - (days_back || ' days')::INTERVAL
  GROUP BY sa.search_query_lowercase
  HAVING COUNT(*) >= 2 -- At least 2 searches to be considered trending
  ORDER BY trend_score DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on function
GRANT EXECUTE ON FUNCTION get_trending_searches_053bcd80 TO anon, authenticated, service_role;

-- Create function to get search suggestions based on partial query
CREATE OR REPLACE FUNCTION get_search_suggestions_053bcd80(
  partial_query TEXT,
  suggestion_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  suggestion TEXT,
  search_count BIGINT,
  last_used TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.search_query_lowercase::TEXT,
    COUNT(*)::BIGINT as search_count,
    MAX(sa.searched_at) as last_used
  FROM search_analytics_053bcd80 sa
  WHERE sa.search_query_lowercase LIKE LOWER(partial_query) || '%'
    AND sa.searched_at > NOW() - INTERVAL '90 days' -- Last 90 days
  GROUP BY sa.search_query_lowercase
  ORDER BY COUNT(*) DESC, MAX(sa.searched_at) DESC
  LIMIT suggestion_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on function
GRANT EXECUTE ON FUNCTION get_search_suggestions_053bcd80 TO anon, authenticated, service_role;
