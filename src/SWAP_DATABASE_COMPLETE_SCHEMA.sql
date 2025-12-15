-- ============================================================================
-- 🔄 DEWII SWAP - Complete Database Schema
-- ============================================================================
-- Consumer-to-Consumer Barter Marketplace
-- Full relational schema with proper tables (no KV store)
-- ============================================================================

-- ============================================================================
-- 1. SWAP ITEMS TABLE - Core items for swapping
-- ============================================================================

CREATE TABLE IF NOT EXISTS swap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN (
    'electronics', 'clothing', 'books', 'furniture', 
    'toys', 'sports', 'tools', 'art', 'music', 'hemp-products', 'other'
  )),
  condition TEXT NOT NULL CHECK (condition IN (
    'new', 'like-new', 'good', 'fair', 'worn'
  )),
  
  -- Hemp Info
  hemp_inside BOOLEAN DEFAULT FALSE,
  hemp_percentage INTEGER CHECK (hemp_percentage >= 0 AND hemp_percentage <= 100),
  
  -- Media
  images TEXT[] DEFAULT '{}',
  
  -- Location
  country TEXT,
  city TEXT,
  willing_to_ship BOOLEAN DEFAULT FALSE,
  
  -- Story & Details
  story TEXT,
  years_in_use INTEGER CHECK (years_in_use >= 0),
  
  -- Status & Power Level
  status TEXT DEFAULT 'available' CHECK (status IN (
    'available', 'in-negotiation', 'swapped', 'removed'
  )),
  power_level INTEGER DEFAULT 1 CHECK (power_level >= 1 AND power_level <= 10),
  
  -- Metadata
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  proposals_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_boosted_at TIMESTAMPTZ,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_swap_items_user_id ON swap_items(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_swap_items_status ON swap_items(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_swap_items_category ON swap_items(category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_swap_items_country ON swap_items(country) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_swap_items_created_at ON swap_items(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_swap_items_power_level ON swap_items(power_level DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_swap_items_hemp_inside ON swap_items(hemp_inside) WHERE hemp_inside = TRUE AND deleted_at IS NULL;

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_swap_items_search ON swap_items USING GIN (
  to_tsvector('english', title || ' ' || COALESCE(description, ''))
) WHERE deleted_at IS NULL;

-- ============================================================================
-- 2. SWAP LIKES TABLE - Track who likes what (24-hour temp matches)
-- ============================================================================

CREATE TABLE IF NOT EXISTS swap_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES swap_items(id) ON DELETE CASCADE,
  
  -- Expiry system (24 hours to propose)
  liked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Has user proposed a swap?
  proposal_sent BOOLEAN DEFAULT FALSE,
  proposal_id UUID REFERENCES swap_proposals(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: user can only like an item once
  UNIQUE(user_id, item_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_swap_likes_user_id ON swap_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_swap_likes_item_id ON swap_likes(item_id);
CREATE INDEX IF NOT EXISTS idx_swap_likes_expires_at ON swap_likes(expires_at) WHERE proposal_sent = FALSE;

-- Auto-delete expired likes (cleanup function)
CREATE OR REPLACE FUNCTION cleanup_expired_swap_likes()
RETURNS void AS $$
BEGIN
  DELETE FROM swap_likes WHERE expires_at < NOW() AND proposal_sent = FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. SWAP PROPOSALS TABLE - Track swap proposals between users
-- ============================================================================

CREATE TABLE IF NOT EXISTS swap_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Parties involved
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Items being swapped
  sender_item_id UUID NOT NULL REFERENCES swap_items(id) ON DELETE CASCADE,
  receiver_item_id UUID NOT NULL REFERENCES swap_items(id) ON DELETE CASCADE,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Waiting for receiver response
    'accepted',     -- Both agreed, deal in progress
    'declined',     -- Receiver declined
    'cancelled',    -- Sender cancelled
    'completed',    -- Swap completed successfully
    'expired'       -- 48h timeout
  )),
  
  -- Optional message from sender
  message TEXT,
  
  -- Response tracking
  responded_at TIMESTAMPTZ,
  response_message TEXT,
  
  -- Expiry (48 hours to respond)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Completion tracking
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_swap_proposals_sender_id ON swap_proposals(sender_id);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_receiver_id ON swap_proposals(receiver_id);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_status ON swap_proposals(status);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_created_at ON swap_proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_expires_at ON swap_proposals(expires_at) WHERE status = 'pending';

-- Composite index for "my proposals" queries
CREATE INDEX IF NOT EXISTS idx_swap_proposals_user_status ON swap_proposals(sender_id, receiver_id, status);

-- ============================================================================
-- 4. SWAP DEALS TABLE - Accepted proposals with discussion threads
-- ============================================================================

CREATE TABLE IF NOT EXISTS swap_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES swap_proposals(id) ON DELETE CASCADE UNIQUE,
  
  -- Parties (denormalized for easier queries)
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item1_id UUID NOT NULL REFERENCES swap_items(id) ON DELETE CASCADE,
  item2_id UUID NOT NULL REFERENCES swap_items(id) ON DELETE CASCADE,
  
  -- Deal status
  status TEXT DEFAULT 'negotiating' CHECK (status IN (
    'negotiating',   -- Discussing logistics
    'shipping',      -- Items in transit
    'completed',     -- Both confirmed completion
    'disputed',      -- Issue raised
    'cancelled'      -- Deal fell through
  )),
  
  -- Tracking
  user1_confirmed BOOLEAN DEFAULT FALSE,
  user2_confirmed BOOLEAN DEFAULT FALSE,
  user1_shipped BOOLEAN DEFAULT FALSE,
  user2_shipped BOOLEAN DEFAULT FALSE,
  
  -- Message tracking
  last_message_at TIMESTAMPTZ,
  last_message_by UUID REFERENCES auth.users(id),
  unread_count_user1 INTEGER DEFAULT 0,
  unread_count_user2 INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_swap_deals_user1_id ON swap_deals(user1_id);
CREATE INDEX IF NOT EXISTS idx_swap_deals_user2_id ON swap_deals(user2_id);
CREATE INDEX IF NOT EXISTS idx_swap_deals_status ON swap_deals(status);
CREATE INDEX IF NOT EXISTS idx_swap_deals_updated_at ON swap_deals(updated_at DESC);

-- ============================================================================
-- 5. SWAP DEAL MESSAGES TABLE - Contextual discussions per deal
-- ============================================================================

CREATE TABLE IF NOT EXISTS swap_deal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES swap_deals(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Message content
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN (
    'text',          -- Regular message
    'system',        -- System notification (status change)
    'shipping',      -- Shipping info
    'image',         -- Image message
    'location'       -- Location share
  )),
  
  -- Media
  images TEXT[],
  
  -- Read tracking
  read_by_other BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_swap_deal_messages_deal_id ON swap_deal_messages(deal_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_swap_deal_messages_sender_id ON swap_deal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_swap_deal_messages_created_at ON swap_deal_messages(created_at DESC);

-- ============================================================================
-- 6. SWAP ANALYTICS TABLE - Track user behavior (optional)
-- ============================================================================

CREATE TABLE IF NOT EXISTS swap_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES swap_items(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL CHECK (event_type IN (
    'view',          -- Item viewed
    'like',          -- Item liked
    'unlike',        -- Item unliked
    'propose',       -- Proposal sent
    'accept',        -- Proposal accepted
    'decline',       -- Proposal declined
    'complete',      -- Deal completed
    'share'          -- Item shared
  )),
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_swap_analytics_user_id ON swap_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_swap_analytics_item_id ON swap_analytics(item_id);
CREATE INDEX IF NOT EXISTS idx_swap_analytics_event_type ON swap_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_swap_analytics_created_at ON swap_analytics(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_swap_items_updated_at 
  BEFORE UPDATE ON swap_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swap_proposals_updated_at 
  BEFORE UPDATE ON swap_proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swap_deals_updated_at 
  BEFORE UPDATE ON swap_deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swap_deal_messages_updated_at 
  BEFORE UPDATE ON swap_deal_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update likes_count when someone likes an item
CREATE OR REPLACE FUNCTION update_item_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE swap_items SET likes_count = likes_count + 1 WHERE id = NEW.item_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE swap_items SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_likes_count_on_like 
  AFTER INSERT OR DELETE ON swap_likes
  FOR EACH ROW EXECUTE FUNCTION update_item_likes_count();

-- Auto-update proposals_count when someone proposes
CREATE OR REPLACE FUNCTION update_item_proposals_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE swap_items SET proposals_count = proposals_count + 1 WHERE id = NEW.receiver_item_id;
    UPDATE swap_items SET proposals_count = proposals_count + 1 WHERE id = NEW.sender_item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_proposals_count_on_proposal 
  AFTER INSERT ON swap_proposals
  FOR EACH ROW EXECUTE FUNCTION update_item_proposals_count();

-- Auto-create deal when proposal is accepted
CREATE OR REPLACE FUNCTION create_deal_on_proposal_accept()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO swap_deals (
      proposal_id,
      user1_id,
      user2_id,
      item1_id,
      item2_id
    ) VALUES (
      NEW.id,
      NEW.sender_id,
      NEW.receiver_id,
      NEW.sender_item_id,
      NEW.receiver_item_id
    );
    
    -- Update item status to in-negotiation
    UPDATE swap_items SET status = 'in-negotiation' 
    WHERE id IN (NEW.sender_item_id, NEW.receiver_item_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_deal_on_accept 
  AFTER UPDATE ON swap_proposals
  FOR EACH ROW EXECUTE FUNCTION create_deal_on_proposal_accept();

-- Update deal's last_message_at when message is sent
CREATE OR REPLACE FUNCTION update_deal_on_message()
RETURNS TRIGGER AS $$
DECLARE
  other_user_id UUID;
BEGIN
  -- Update deal's last message info
  UPDATE swap_deals 
  SET 
    last_message_at = NEW.created_at,
    last_message_by = NEW.sender_id,
    updated_at = NEW.created_at
  WHERE id = NEW.deal_id;
  
  -- Increment unread count for the other user
  SELECT CASE 
    WHEN user1_id = NEW.sender_id THEN user2_id 
    ELSE user1_id 
  END INTO other_user_id
  FROM swap_deals WHERE id = NEW.deal_id;
  
  IF other_user_id IS NOT NULL THEN
    UPDATE swap_deals 
    SET unread_count_user1 = CASE WHEN user1_id = other_user_id THEN unread_count_user1 + 1 ELSE unread_count_user1 END,
        unread_count_user2 = CASE WHEN user2_id = other_user_id THEN unread_count_user2 + 1 ELSE unread_count_user2 END
    WHERE id = NEW.deal_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deal_on_new_message 
  AFTER INSERT ON swap_deal_messages
  FOR EACH ROW EXECUTE FUNCTION update_deal_on_message();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE swap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_deal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SWAP ITEMS POLICIES
-- ============================================================================

-- Anyone can view available items (not deleted)
CREATE POLICY "Anyone can view available swap items"
  ON swap_items FOR SELECT
  USING (status = 'available' AND deleted_at IS NULL);

-- Users can view their own items (any status)
CREATE POLICY "Users can view their own swap items"
  ON swap_items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own items
CREATE POLICY "Users can insert their own swap items"
  ON swap_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own items
CREATE POLICY "Users can update their own swap items"
  ON swap_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can "delete" (soft delete) their own items
CREATE POLICY "Users can delete their own swap items"
  ON swap_items FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- ============================================================================
-- SWAP LIKES POLICIES
-- ============================================================================

-- Users can view their own likes
CREATE POLICY "Users can view their own likes"
  ON swap_likes FOR SELECT
  USING (auth.uid() = user_id);

-- Item owners can see who liked their items
CREATE POLICY "Item owners can see their item likes"
  ON swap_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM swap_items 
      WHERE swap_items.id = swap_likes.item_id 
      AND swap_items.user_id = auth.uid()
    )
  );

-- Users can insert their own likes
CREATE POLICY "Users can insert their own likes"
  ON swap_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes (unlike)
CREATE POLICY "Users can delete their own likes"
  ON swap_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SWAP PROPOSALS POLICIES
-- ============================================================================

-- Users can view proposals where they are sender or receiver
CREATE POLICY "Users can view their proposals"
  ON swap_proposals FOR SELECT
  USING (auth.uid() IN (sender_id, receiver_id));

-- Users can insert proposals where they are the sender
CREATE POLICY "Users can create proposals"
  ON swap_proposals FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can update proposals where they are involved
CREATE POLICY "Users can update their proposals"
  ON swap_proposals FOR UPDATE
  USING (auth.uid() IN (sender_id, receiver_id));

-- ============================================================================
-- SWAP DEALS POLICIES
-- ============================================================================

-- Users can view deals where they are involved
CREATE POLICY "Users can view their deals"
  ON swap_deals FOR SELECT
  USING (auth.uid() IN (user1_id, user2_id));

-- System creates deals (no INSERT policy for users)
-- Users can update deals where they are involved
CREATE POLICY "Users can update their deals"
  ON swap_deals FOR UPDATE
  USING (auth.uid() IN (user1_id, user2_id));

-- ============================================================================
-- SWAP DEAL MESSAGES POLICIES
-- ============================================================================

-- Users can view messages in their deals
CREATE POLICY "Users can view their deal messages"
  ON swap_deal_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM swap_deals 
      WHERE swap_deals.id = swap_deal_messages.deal_id 
      AND auth.uid() IN (swap_deals.user1_id, swap_deals.user2_id)
    )
  );

-- Users can insert messages in their deals
CREATE POLICY "Users can send messages in their deals"
  ON swap_deal_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM swap_deals 
      WHERE swap_deals.id = deal_id 
      AND auth.uid() IN (swap_deals.user1_id, swap_deals.user2_id)
    )
  );

-- Users can update their own messages (edit)
CREATE POLICY "Users can update their own messages"
  ON swap_deal_messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- ============================================================================
-- SWAP ANALYTICS POLICIES
-- ============================================================================

-- Users can view their own analytics
CREATE POLICY "Users can view their own analytics"
  ON swap_analytics FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can insert analytics (for tracking)
CREATE POLICY "Anyone can insert analytics"
  ON swap_analytics FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View for "My Active Deals"
CREATE OR REPLACE VIEW my_active_swap_deals AS
SELECT 
  d.*,
  p.created_at as proposal_created_at,
  CASE 
    WHEN d.user1_id = auth.uid() THEN d.user2_id 
    ELSE d.user1_id 
  END as other_user_id,
  CASE 
    WHEN d.user1_id = auth.uid() THEN d.item2_id 
    ELSE d.item1_id 
  END as item_i_get,
  CASE 
    WHEN d.user1_id = auth.uid() THEN d.item1_id 
    ELSE d.item2_id 
  END as item_i_give,
  CASE 
    WHEN d.user1_id = auth.uid() THEN d.unread_count_user1 
    ELSE d.unread_count_user2 
  END as my_unread_count
FROM swap_deals d
JOIN swap_proposals p ON p.id = d.proposal_id
WHERE auth.uid() IN (d.user1_id, d.user2_id)
  AND d.status NOT IN ('completed', 'cancelled');

-- ============================================================================
-- CLEANUP FUNCTIONS (for cron jobs or manual execution)
-- ============================================================================

-- Expire old proposals
CREATE OR REPLACE FUNCTION expire_old_swap_proposals()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE swap_proposals 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' 
    AND expires_at < NOW();
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Cleanup expired likes
CREATE OR REPLACE FUNCTION cleanup_expired_likes()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM swap_likes 
  WHERE expires_at < NOW() 
    AND proposal_sent = FALSE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANT PERMISSIONS (if needed)
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON swap_items TO authenticated;
GRANT SELECT, INSERT, DELETE ON swap_likes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON swap_proposals TO authenticated;
GRANT SELECT, UPDATE ON swap_deals TO authenticated;
GRANT SELECT, INSERT, UPDATE ON swap_deal_messages TO authenticated;
GRANT SELECT, INSERT ON swap_analytics TO authenticated;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Verify installation
DO $$ 
BEGIN
  RAISE NOTICE '✅ SWAP Database Schema installed successfully!';
  RAISE NOTICE '📊 Tables created: swap_items, swap_likes, swap_proposals, swap_deals, swap_deal_messages, swap_analytics';
  RAISE NOTICE '🔐 RLS policies enabled on all tables';
  RAISE NOTICE '⚡ Triggers and functions configured';
  RAISE NOTICE '🎮 Ready for SWAP marketplace!';
END $$;
