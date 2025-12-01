-- SWAG PURCHASE ANALYTICS TABLE
-- Tracks user interactions with products: views, click-throughs, purchases
-- Used for analytics, NADA rewards, and marketplace insights

CREATE TABLE IF NOT EXISTS swag_purchase_analytics_053bcd80 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES swag_products_053bcd80(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Action tracking
  action_type TEXT NOT NULL, -- 'product_view', 'click_through', 'purchase_complete'
  external_shop_platform TEXT, -- 'shopify', 'lazada', 'shopee', 'custom', NULL
  
  -- NADA rewards
  nada_points_awarded INTEGER DEFAULT 0,
  
  -- Metadata (optional)
  user_agent TEXT,
  referrer TEXT,
  metadata JSONB, -- For future extensibility
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_action_type CHECK (
    action_type IN ('product_view', 'click_through', 'purchase_complete')
  ),
  CONSTRAINT valid_nada_points CHECK (nada_points_awarded >= 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_user 
  ON swag_purchase_analytics_053bcd80(user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_product 
  ON swag_purchase_analytics_053bcd80(product_id);

CREATE INDEX IF NOT EXISTS idx_analytics_company 
  ON swag_purchase_analytics_053bcd80(company_id);

CREATE INDEX IF NOT EXISTS idx_analytics_action 
  ON swag_purchase_analytics_053bcd80(action_type);

CREATE INDEX IF NOT EXISTS idx_analytics_date 
  ON swag_purchase_analytics_053bcd80(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_product_action 
  ON swag_purchase_analytics_053bcd80(product_id, action_type);

CREATE INDEX IF NOT EXISTS idx_analytics_company_action 
  ON swag_purchase_analytics_053bcd80(company_id, action_type);

-- Row Level Security
ALTER TABLE swag_purchase_analytics_053bcd80 ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own analytics
CREATE POLICY "Users can view own analytics"
  ON swag_purchase_analytics_053bcd80
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own analytics
CREATE POLICY "Users can insert own analytics"
  ON swag_purchase_analytics_053bcd80
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Organizations can view analytics for their products
CREATE POLICY "Organizations can view product analytics"
  ON swag_purchase_analytics_053bcd80
  FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies 
      WHERE owner_id = auth.uid()
    )
  );

-- Policy: Service role can do everything (for server-side operations)
CREATE POLICY "Service role full access"
  ON swag_purchase_analytics_053bcd80
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Create a view for aggregated analytics (organizations can use this)
CREATE OR REPLACE VIEW swag_product_analytics_summary AS
SELECT 
  product_id,
  company_id,
  COUNT(*) FILTER (WHERE action_type = 'product_view') AS total_views,
  COUNT(*) FILTER (WHERE action_type = 'click_through') AS total_clicks,
  COUNT(*) FILTER (WHERE action_type = 'purchase_complete') AS total_purchases,
  COUNT(DISTINCT user_id) AS unique_users,
  CASE 
    WHEN COUNT(*) FILTER (WHERE action_type = 'product_view') > 0 
    THEN ROUND(
      (COUNT(*) FILTER (WHERE action_type = 'click_through')::DECIMAL / 
       COUNT(*) FILTER (WHERE action_type = 'product_view') * 100), 
      2
    )
    ELSE 0 
  END AS click_through_rate,
  SUM(nada_points_awarded) AS total_nada_awarded,
  MAX(created_at) AS last_interaction
FROM swag_purchase_analytics_053bcd80
GROUP BY product_id, company_id;

-- Grant access to the view
GRANT SELECT ON swag_product_analytics_summary TO authenticated;

-- Comments for documentation
COMMENT ON TABLE swag_purchase_analytics_053bcd80 IS 'Tracks user interactions with swag products for analytics and NADA rewards';
COMMENT ON COLUMN swag_purchase_analytics_053bcd80.action_type IS 'Type of action: product_view (opened modal), click_through (redirected to external shop), purchase_complete (completed internal purchase)';
COMMENT ON COLUMN swag_purchase_analytics_053bcd80.nada_points_awarded IS 'NADA points awarded for this action (50 base + bonuses for verified provenance)';
COMMENT ON VIEW swag_product_analytics_summary IS 'Aggregated analytics per product: views, clicks, purchases, CTR';
