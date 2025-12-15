-- ============================================================================
-- HEMP'IN UNIVERSE: THREE RAILS MARKETPLACE SCHEMA
-- ============================================================================
-- Date: December 5, 2024
-- Purpose: Database schema for C2C SWAP, B2C/B2B SWAG, and B2B RFP rails
-- ============================================================================

-- ============================================================================
-- SECTION 1: USER PROFILE ENHANCEMENTS
-- ============================================================================

-- Extend user_profiles table with marketplace fields
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS country VARCHAR(2), -- ISO country code
ADD COLUMN IF NOT EXISTS region VARCHAR(100), -- State/province
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS id_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS professional_bio TEXT,
ADD COLUMN IF NOT EXISTS looking_for TEXT, -- What they're seeking
ADD COLUMN IF NOT EXISTS can_offer TEXT; -- What they can provide

-- User roles (many-to-many)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'consumer', 'professional', 'founder', 'designer', 'buyer', 'researcher', 'farmer', etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- User interests (many-to-many)
CREATE TABLE IF NOT EXISTS user_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    interest VARCHAR(50) NOT NULL, -- 'textiles', 'construction', 'food', 'personal_care', 'cultivation', 'research'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, interest)
);

CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_interest ON user_interests(interest);

-- User saved items (favorites)
CREATE TABLE IF NOT EXISTS user_saved_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL, -- 'product', 'organization', 'place', 'article'
    item_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_saved_items_user_id ON user_saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_items_item ON user_saved_items(item_type, item_id);

-- ============================================================================
-- SECTION 2: C2C SWAP SHOP
-- ============================================================================

-- User inventory (items owned by users)
CREATE TABLE IF NOT EXISTS user_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL, -- Link to original product if applicable
    title VARCHAR(255) NOT NULL,
    description TEXT,
    condition VARCHAR(20) NOT NULL, -- 'mint', 'excellent', 'good', 'fair', 'poor'
    story TEXT, -- Provenance, how they got it, why they love it
    available_for_swap BOOLEAN DEFAULT FALSE,
    main_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_product_id ON user_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_available ON user_inventory(available_for_swap);

-- Additional photos for inventory items
CREATE TABLE IF NOT EXISTS inventory_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID NOT NULL REFERENCES user_inventory(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_photos_item_id ON inventory_photos(inventory_item_id);

-- Swap proposals
CREATE TABLE IF NOT EXISTS swap_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposer_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    target_item_id UUID NOT NULL REFERENCES user_inventory(id) ON DELETE CASCADE, -- Item they want
    nada_offered INTEGER DEFAULT 0, -- NADA to balance trade
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'countered', 'accepted', 'declined', 'completed', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_swap_proposals_proposer ON swap_proposals(proposer_user_id);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_target_user ON swap_proposals(target_user_id);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_target_item ON swap_proposals(target_item_id);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_status ON swap_proposals(status);

-- Items offered in swap proposal
CREATE TABLE IF NOT EXISTS swap_proposal_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES swap_proposals(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES user_inventory(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_swap_proposal_items_proposal ON swap_proposal_items(proposal_id);

-- Swap history (completed swaps for provenance)
CREATE TABLE IF NOT EXISTS swap_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES swap_proposals(id),
    from_user_id UUID NOT NULL REFERENCES user_profiles(id),
    to_user_id UUID NOT NULL REFERENCES user_profiles(id),
    items_json JSONB NOT NULL, -- Array of items exchanged
    nada_exchanged INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_swap_history_proposal ON swap_history(proposal_id);
CREATE INDEX IF NOT EXISTS idx_swap_history_from_user ON swap_history(from_user_id);
CREATE INDEX IF NOT EXISTS idx_swap_history_to_user ON swap_history(to_user_id);

-- ============================================================================
-- SECTION 3: B2C/B2B SWAG ENHANCEMENTS
-- ============================================================================

-- Quote requests (for B2B products)
CREATE TABLE IF NOT EXISTS quote_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER,
    specifications TEXT,
    timeline VARCHAR(100),
    budget_range VARCHAR(100),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'responded', 'quoted', 'accepted', 'declined', 'completed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_user ON quote_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_org ON quote_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_product ON quote_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);

-- Product views (enhanced analytics)
CREATE TABLE IF NOT EXISTS product_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    session_id VARCHAR(255), -- For anonymous users
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    source VARCHAR(50) -- 'browse', 'search', 'organization_page', 'globe', etc.
);

CREATE INDEX IF NOT EXISTS idx_product_views_product ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_user ON product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_date ON product_views(viewed_at);

-- External shop clicks (track referrals)
CREATE TABLE IF NOT EXISTS external_shop_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_external_shop_clicks_product ON external_shop_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_external_shop_clicks_user ON external_shop_clicks(user_id);

-- ============================================================================
-- SECTION 4: B2B RFP / DISCOVERY MATCH
-- ============================================================================

-- Discovery match requests (Hero Loop)
CREATE TABLE IF NOT EXISTS discovery_match_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    nada_spent INTEGER NOT NULL DEFAULT 3,
    
    -- Request details
    looking_for TEXT NOT NULL,
    role VARCHAR(100),
    organization_name VARCHAR(255), -- If representing an org
    geography VARCHAR(255),
    timeline VARCHAR(100),
    budget_range VARCHAR(100),
    can_offer TEXT,
    additional_info TEXT,
    
    -- Admin handling
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewing', 'matched', 'completed', 'declined'
    admin_notes TEXT,
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discovery_requests_user ON discovery_match_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_discovery_requests_status ON discovery_match_requests(status);
CREATE INDEX IF NOT EXISTS idx_discovery_requests_date ON discovery_match_requests(created_at);

-- Matches made by admin
CREATE TABLE IF NOT EXISTS discovery_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES discovery_match_requests(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    match_reason TEXT, -- Why admin thinks this is a good match
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'intro_sent', 'connected', 'deal_made', 'no_response'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discovery_matches_request ON discovery_matches(request_id);
CREATE INDEX IF NOT EXISTS idx_discovery_matches_org ON discovery_matches(organization_id);
CREATE INDEX IF NOT EXISTS idx_discovery_matches_status ON discovery_matches(status);

-- Match outcomes (track success)
CREATE TABLE IF NOT EXISTS match_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES discovery_matches(id) ON DELETE CASCADE,
    outcome_type VARCHAR(50), -- 'meeting_scheduled', 'sample_sent', 'contract_signed', 'deal_value', 'no_fit', etc.
    outcome_value DECIMAL(10, 2), -- Dollar value if applicable
    outcome_notes TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_match_outcomes_match ON match_outcomes(match_id);
CREATE INDEX IF NOT EXISTS idx_match_outcomes_type ON match_outcomes(outcome_type);

-- RFP posts (future: public/private requests)
CREATE TABLE IF NOT EXISTS rfp_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    posted_by_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50), -- 'materials', 'manufacturing', 'distribution', 'services', etc.
    quantity VARCHAR(100),
    specifications TEXT,
    timeline VARCHAR(100),
    budget_range VARCHAR(100),
    geography VARCHAR(255),
    
    visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'private', 'verified_only'
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'closed', 'awarded'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closes_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_rfp_posts_posted_by ON rfp_posts(posted_by_user_id);
CREATE INDEX IF NOT EXISTS idx_rfp_posts_org ON rfp_posts(organization_id);
CREATE INDEX IF NOT EXISTS idx_rfp_posts_category ON rfp_posts(category);
CREATE INDEX IF NOT EXISTS idx_rfp_posts_status ON rfp_posts(status);
CREATE INDEX IF NOT EXISTS idx_rfp_posts_visibility ON rfp_posts(visibility);

-- RFP responses
CREATE TABLE IF NOT EXISTS rfp_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfp_id UUID NOT NULL REFERENCES rfp_posts(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    proposal TEXT NOT NULL,
    estimated_cost DECIMAL(10, 2),
    estimated_timeline VARCHAR(100),
    attachments_json JSONB, -- URLs to attachments
    
    status VARCHAR(20) DEFAULT 'submitted', -- 'submitted', 'shortlisted', 'awarded', 'declined'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfp_responses_rfp ON rfp_responses(rfp_id);
CREATE INDEX IF NOT EXISTS idx_rfp_responses_org ON rfp_responses(organization_id);
CREATE INDEX IF NOT EXISTS idx_rfp_responses_status ON rfp_responses(status);

-- ============================================================================
-- SECTION 5: MESSAGING / CHAT SYSTEM
-- ============================================================================

-- Threads (conversation containers)
CREATE TABLE IF NOT EXISTS threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_type VARCHAR(20) NOT NULL, -- 'swap', 'swag', 'rfp', 'general'
    subject VARCHAR(255),
    
    -- Contextual references
    swap_proposal_id UUID REFERENCES swap_proposals(id) ON DELETE SET NULL,
    quote_request_id UUID REFERENCES quote_requests(id) ON DELETE SET NULL,
    discovery_match_id UUID REFERENCES discovery_matches(id) ON DELETE SET NULL,
    rfp_post_id UUID REFERENCES rfp_posts(id) ON DELETE SET NULL,
    
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'completed', 'closed'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_threads_type ON threads(thread_type);
CREATE INDEX IF NOT EXISTS idx_threads_status ON threads(status);
CREATE INDEX IF NOT EXISTS idx_threads_last_message ON threads(last_message_at);

-- Thread participants
CREATE TABLE IF NOT EXISTS thread_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    role VARCHAR(20) DEFAULT 'participant', -- 'participant', 'admin', 'moderator'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    
    CONSTRAINT thread_participant_check CHECK (user_id IS NOT NULL OR organization_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_thread_participants_thread ON thread_participants(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_participants_user ON thread_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_participants_org ON thread_participants(organization_id);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    sender_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    sender_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    
    content TEXT NOT NULL,
    attachments_json JSONB, -- Array of {type, url, name}
    
    is_system_message BOOLEAN DEFAULT FALSE, -- Auto-generated messages
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT message_sender_check CHECK (sender_user_id IS NOT NULL OR sender_organization_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_user ON messages(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_org ON messages(sender_organization_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- Message read receipts
CREATE TABLE IF NOT EXISTS message_read_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_receipts_message ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_receipts_user ON message_read_receipts(user_id);

-- ============================================================================
-- SECTION 6: TRUST & VERIFICATION
-- ============================================================================

-- Trust events (log all trust-building actions)
CREATE TABLE IF NOT EXISTS trust_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'swap_completed', 'purchase_made', 'quote_fulfilled', 'deal_closed', 'verification_completed'
    points_change INTEGER NOT NULL, -- Can be positive or negative
    reference_type VARCHAR(20), -- 'swap', 'purchase', 'deal', etc.
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trust_events_user ON trust_events(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_events_type ON trust_events(event_type);
CREATE INDEX IF NOT EXISTS idx_trust_events_date ON trust_events(created_at);

-- Verification requests
CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    verification_type VARCHAR(20) NOT NULL, -- 'phone', 'id', 'business'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    submitted_data_json JSONB,
    admin_notes TEXT,
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_requests_user ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_type ON verification_requests(verification_type);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);

-- ============================================================================
-- SECTION 7: FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Update thread last_message_at
CREATE OR REPLACE FUNCTION update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE threads
    SET last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.thread_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thread_last_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_thread_last_message();

-- Function: Update user trust score
CREATE OR REPLACE FUNCTION update_user_trust_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_profiles
    SET trust_score = (
        SELECT COALESCE(SUM(points_change), 0)
        FROM trust_events
        WHERE user_id = NEW.user_id
    )
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_trust_score
AFTER INSERT ON trust_events
FOR EACH ROW
EXECUTE FUNCTION update_user_trust_score();

-- Function: Update swap proposal status
CREATE OR REPLACE FUNCTION update_swap_proposal_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    IF NEW.status IN ('accepted', 'declined') AND OLD.status = 'pending' THEN
        NEW.responded_at = NOW();
    END IF;
    
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_swap_proposal_timestamp
BEFORE UPDATE ON swap_proposals
FOR EACH ROW
EXECUTE FUNCTION update_swap_proposal_timestamp();

-- ============================================================================
-- SECTION 8: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_proposal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_shop_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (simplified - expand as needed)

-- User inventory: Users can see their own and public swap items
CREATE POLICY user_inventory_select ON user_inventory
    FOR SELECT USING (
        user_id = auth.uid() OR available_for_swap = true
    );

CREATE POLICY user_inventory_insert ON user_inventory
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY user_inventory_update ON user_inventory
    FOR UPDATE USING (user_id = auth.uid());

-- Swap proposals: Users see proposals they're involved in
CREATE POLICY swap_proposals_select ON swap_proposals
    FOR SELECT USING (
        proposer_user_id = auth.uid() OR target_user_id = auth.uid()
    );

CREATE POLICY swap_proposals_insert ON swap_proposals
    FOR INSERT WITH CHECK (proposer_user_id = auth.uid());

-- Messages: Users see messages in threads they're part of
CREATE POLICY messages_select ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM thread_participants
            WHERE thread_id = messages.thread_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY messages_insert ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM thread_participants
            WHERE thread_id = messages.thread_id
            AND user_id = auth.uid()
        )
    );

-- Discovery matches: Only admins and involved users can see
CREATE POLICY discovery_matches_select ON discovery_matches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM discovery_match_requests
            WHERE id = discovery_matches.request_id
            AND user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Summary:
-- - User profile enhancements for marketplace needs
-- - C2C SWAP: inventory, proposals, history
-- - B2C/B2B SWAG: quotes, analytics, clicks
-- - B2B RFP: discovery matches, RFP posts, responses
-- - Messaging: threads, participants, messages
-- - Trust: events, verification, scores
-- ============================================================================
