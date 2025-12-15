-- ============================================================================
-- PHASE 1 SPRINT 1.1: DISCOVERY MATCH SYSTEM
-- ============================================================================
-- Purpose: Users spend NADA to get matched with relevant hemp companies
-- Part of: Hero Loop (Read → Earn → NADA → Discovery → Intro → Outcome)
-- Created: December 7, 2024
-- Depends on: companies table (from company_system_migration.sql)
-- ============================================================================

-- ============================================================================
-- TABLE: discovery_requests
-- ============================================================================
-- Users create discovery requests describing what they're looking for
-- System matches them with relevant organizations
-- ============================================================================

CREATE TABLE IF NOT EXISTS discovery_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Request details
  request_text TEXT NOT NULL, -- What are you looking for?
  category TEXT NOT NULL, -- textile, food, construction, wellness, education, other
  budget_range TEXT, -- low, medium, high, enterprise
  location_preference TEXT, -- local, regional, national, international
  
  -- Matching criteria (JSON for flexibility)
  criteria JSONB DEFAULT '{}'::jsonb,
  -- Example: { "interests": ["textile", "fashion"], "distance_km": 100, "verified_only": true }
  
  -- NADA cost
  nada_cost INTEGER NOT NULL DEFAULT 10, -- How much NADA was spent
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, matched, accepted, expired
  
  -- Results
  matched_organization_ids UUID[] DEFAULT ARRAY[]::UUID[], -- Array of matched org IDs
  match_scores JSONB DEFAULT '{}'::jsonb, -- { "org_id": score } for ranking
  
  -- Interaction
  selected_organization_id UUID REFERENCES companies(id) ON DELETE SET NULL, -- Which org did user pick?
  chat_thread_id UUID, -- Link to chat thread (if intro accepted)
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  matched_at TIMESTAMPTZ, -- When matches were generated
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'), -- Matches expire after 7 days
  
  -- Metadata
  user_agent TEXT, -- For analytics
  ip_address TEXT -- For fraud prevention
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_discovery_requests_user_id ON discovery_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_discovery_requests_status ON discovery_requests(status);
CREATE INDEX IF NOT EXISTS idx_discovery_requests_category ON discovery_requests(category);
CREATE INDEX IF NOT EXISTS idx_discovery_requests_created_at ON discovery_requests(created_at DESC);

-- ============================================================================
-- TABLE: discovery_match_results
-- ============================================================================
-- Individual match results (many-to-many: requests to organizations)
-- Stores detailed scoring and reasoning for each match
-- ============================================================================

CREATE TABLE IF NOT EXISTS discovery_match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES discovery_requests(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Match quality
  match_score DECIMAL(5,2) NOT NULL, -- 0-100 score
  match_rank INTEGER NOT NULL, -- 1, 2, 3, etc.
  
  -- Scoring factors (for transparency)
  score_breakdown JSONB DEFAULT '{}'::jsonb,
  -- Example: {
  --   "category_match": 40,
  --   "location_match": 25,
  --   "interest_match": 20,
  --   "trust_score": 10,
  --   "activity_level": 5
  -- }
  
  -- Explanation (why this match?)
  match_reason TEXT, -- Human-readable explanation
  
  -- User interaction
  viewed BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMPTZ,
  selected BOOLEAN DEFAULT FALSE, -- Did user pick this org?
  selected_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_discovery_match_results_request_id ON discovery_match_results(request_id);
CREATE INDEX IF NOT EXISTS idx_discovery_match_results_org_id ON discovery_match_results(organization_id);
CREATE INDEX IF NOT EXISTS idx_discovery_match_results_score ON discovery_match_results(match_score DESC);

-- Unique constraint: one match per request-org pair
CREATE UNIQUE INDEX IF NOT EXISTS idx_discovery_match_unique 
  ON discovery_match_results(request_id, organization_id);

-- ============================================================================
-- TABLE: discovery_analytics
-- ============================================================================
-- Track discovery match performance for analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS discovery_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES discovery_requests(id) ON DELETE CASCADE,
  
  -- Events
  event_type TEXT NOT NULL, -- request_created, matches_generated, match_viewed, match_selected, intro_sent
  event_data JSONB DEFAULT '{}'::jsonb,
  
  -- Context
  organization_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_discovery_analytics_request_id ON discovery_analytics(request_id);
CREATE INDEX IF NOT EXISTS idx_discovery_analytics_event_type ON discovery_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_discovery_analytics_created_at ON discovery_analytics(created_at DESC);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE discovery_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_analytics ENABLE ROW LEVEL SECURITY;

-- discovery_requests policies
CREATE POLICY "Users can view their own discovery requests"
  ON discovery_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create discovery requests"
  ON discovery_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discovery requests"
  ON discovery_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- discovery_match_results policies
CREATE POLICY "Users can view matches for their requests"
  ON discovery_match_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM discovery_requests
      WHERE id = request_id AND user_id = auth.uid()
    )
  );

-- Organization owners can see when they're matched
CREATE POLICY "Org owners can see their match results"
  ON discovery_match_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE id = organization_id 
      AND owner_id = auth.uid()
    )
  );

-- discovery_analytics policies (read-only for users)
CREATE POLICY "Users can view analytics for their requests"
  ON discovery_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM discovery_requests
      WHERE id = request_id AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Mark match as viewed
CREATE OR REPLACE FUNCTION mark_discovery_match_viewed(
  p_match_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE discovery_match_results
  SET 
    viewed = TRUE,
    viewed_at = NOW()
  WHERE id = p_match_id
    AND NOT viewed; -- Only update if not already viewed
    
  -- Log analytics event
  INSERT INTO discovery_analytics (request_id, event_type, event_data, organization_id)
  SELECT 
    request_id,
    'match_viewed',
    jsonb_build_object('match_id', p_match_id),
    organization_id
  FROM discovery_match_results
  WHERE id = p_match_id;
END;
$$;

-- Function: Select a match (user picks this org)
CREATE OR REPLACE FUNCTION select_discovery_match(
  p_match_id UUID,
  p_user_id UUID
)
RETURNS UUID -- Returns chat_thread_id
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_id UUID;
  v_org_id UUID;
  v_chat_thread_id UUID;
BEGIN
  -- Get request and org IDs
  SELECT request_id, organization_id
  INTO v_request_id, v_org_id
  FROM discovery_match_results
  WHERE id = p_match_id;
  
  -- Verify user owns this request
  IF NOT EXISTS (
    SELECT 1 FROM discovery_requests
    WHERE id = v_request_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Mark match as selected
  UPDATE discovery_match_results
  SET 
    selected = TRUE,
    selected_at = NOW()
  WHERE id = p_match_id;
  
  -- Update request status
  UPDATE discovery_requests
  SET 
    status = 'accepted',
    selected_organization_id = v_org_id
  WHERE id = v_request_id;
  
  -- Log analytics event
  INSERT INTO discovery_analytics (request_id, event_type, event_data, organization_id)
  VALUES (
    v_request_id,
    'match_selected',
    jsonb_build_object('match_id', p_match_id, 'organization_id', v_org_id),
    v_org_id
  );
  
  -- Create chat thread (will be implemented in Sprint 1.2)
  -- For now, return NULL
  v_chat_thread_id := NULL;
  
  -- Update request with chat thread ID (when available)
  UPDATE discovery_requests
  SET chat_thread_id = v_chat_thread_id
  WHERE id = v_request_id;
  
  RETURN v_chat_thread_id;
END;
$$;

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Sample discovery request (commented out - run manually if needed)
/*
INSERT INTO discovery_requests (
  user_id,
  request_text,
  category,
  budget_range,
  location_preference,
  nada_cost,
  status
) VALUES (
  auth.uid(), -- Replace with actual user ID
  'Looking for sustainable hemp fabric suppliers for a fashion startup',
  'textile',
  'medium',
  'national',
  10,
  'pending'
);
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE discovery_requests IS 'User requests for discovering hemp organizations - Phase 1 Sprint 1.1';
COMMENT ON TABLE discovery_match_results IS 'Individual match results with scoring - Phase 1 Sprint 1.1';
COMMENT ON TABLE discovery_analytics IS 'Analytics for discovery match performance - Phase 1 Sprint 1.1';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if tables exist
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'discovery%';

-- Count discovery requests
-- SELECT COUNT(*) as discovery_requests FROM discovery_requests;

-- Count match results
-- SELECT COUNT(*) as match_results FROM discovery_match_results;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================