-- ============================================================================
-- 🔄 DEWII SWAP - SAFE Migration Script (Preserves Existing Data)
-- ============================================================================
-- This script ADDS missing functionality to your existing SWAP schema
-- ✅ Preserves all 53 existing swap_items
-- ✅ Preserves swap_proposals structure
-- ✅ Preserves swap_completions structure
-- ✅ Integrates with existing messages table for general chat
-- ✅ Creates swap_deal_messages for deal logistics
-- ============================================================================

-- ============================================================================
-- 1. ALTER EXISTING TABLES - Add missing columns
-- ============================================================================

-- Add columns to swap_items
ALTER TABLE swap_items 
  ADD COLUMN IF NOT EXISTS power_level INTEGER DEFAULT 1 CHECK (power_level >= 1 AND power_level <= 10),
  ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS proposals_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_boosted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add columns to swap_proposals
ALTER TABLE swap_proposals
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
  ADD COLUMN IF NOT EXISTS proposer_item_id UUID REFERENCES swap_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS proposal_type TEXT DEFAULT 'item' CHECK (proposal_type IN ('item', 'service'));

-- Add comments for clarity
COMMENT ON COLUMN swap_items.power_level IS 'Gamification: 1-10 stars based on item details completeness';
COMMENT ON COLUMN swap_items.likes_count IS 'Number of users who liked this item';
COMMENT ON COLUMN swap_items.proposals_count IS 'Number of proposals received for this item';
COMMENT ON COLUMN swap_items.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN swap_proposals.expires_at IS 'Proposal expires 48 hours after creation';
COMMENT ON COLUMN swap_proposals.proposer_item_id IS 'If proposer offers item from inventory (encouraged path)';
COMMENT ON COLUMN swap_proposals.proposal_type IS 'item = item-to-item swap, service = skills/help offer';

-- ============================================================================
-- 2. CREATE NEW TABLE: swap_likes (24-hour temporary matches)
-- ============================================================================

CREATE TABLE IF NOT EXISTS swap_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES swap_items(id) ON DELETE CASCADE,
  
  -- Expiry system (24 hours to propose)
  liked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  
  -- Has user proposed a swap?
  proposal_sent BOOLEAN DEFAULT FALSE,
  proposal_id UUID REFERENCES swap_proposals(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: user can only like an item once
  UNIQUE(user_id, item_id)
);

-- Indexes for swap_likes
CREATE INDEX IF NOT EXISTS idx_swap_likes_user_id ON swap_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_swap_likes_item_id ON swap_likes(item_id);
CREATE INDEX IF NOT EXISTS idx_swap_likes_expires_at ON swap_likes(expires_at) WHERE proposal_sent = FALSE;

COMMENT ON TABLE swap_likes IS '24-hour temporary matches: users like items and have 24h to propose a swap';

-- ============================================================================
-- 3. CREATE NEW TABLE: swap_deals (Active swap management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS swap_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES swap_proposals(id) ON DELETE CASCADE UNIQUE,
  
  -- Parties (denormalized for easier queries)
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item1_id UUID REFERENCES swap_items(id) ON DELETE SET NULL,
  item2_id UUID REFERENCES swap_items(id) ON DELETE SET NULL,
  
  -- Deal status
  status TEXT DEFAULT 'negotiating' CHECK (status IN (
    'negotiating',   -- Discussing logistics
    'shipping',      -- Items in transit
    'completed',     -- Both confirmed completion (links to swap_completions)
    'disputed',      -- Issue raised
    'cancelled'      -- Deal fell through
  )),
  
  -- Tracking
  user1_confirmed BOOLEAN DEFAULT FALSE,
  user2_confirmed BOOLEAN DEFAULT FALSE,
  user1_shipped BOOLEAN DEFAULT FALSE,
  user2_shipped BOOLEAN DEFAULT FALSE,
  
  -- Link to existing conversation system
  conversation_id UUID,
  
  -- Message tracking
  last_message_at TIMESTAMPTZ,
  unread_count_user1 INTEGER DEFAULT 0,
  unread_count_user2 INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for swap_deals
CREATE INDEX IF NOT EXISTS idx_swap_deals_user1_id ON swap_deals(user1_id);
CREATE INDEX IF NOT EXISTS idx_swap_deals_user2_id ON swap_deals(user2_id);
CREATE INDEX IF NOT EXISTS idx_swap_deals_status ON swap_deals(status);
CREATE INDEX IF NOT EXISTS idx_swap_deals_updated_at ON swap_deals(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_swap_deals_conversation_id ON swap_deals(conversation_id);

COMMENT ON TABLE swap_deals IS 'Active swap management when proposals are accepted';

-- ============================================================================
-- 4. CREATE NEW TABLE: swap_deal_messages (Contextual chat per deal)
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

-- Indexes for swap_deal_messages
CREATE INDEX IF NOT EXISTS idx_swap_deal_messages_deal_id ON swap_deal_messages(deal_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_swap_deal_messages_sender_id ON swap_deal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_swap_deal_messages_created_at ON swap_deal_messages(created_at DESC);

COMMENT ON TABLE swap_deal_messages IS 'Contextual messaging per swap deal';

-- ============================================================================
-- 5. CREATE NEW TABLE: swap_analytics (Event tracking - Optional)
-- ============================================================================

CREATE TABLE IF NOT EXISTS swap_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES swap_items(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL CHECK (event_type IN (
    'view', 'like', 'unlike', 'propose', 'accept', 'decline', 'complete', 'share'
  )),
  
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for swap_analytics
CREATE INDEX IF NOT EXISTS idx_swap_analytics_user_id ON swap_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_swap_analytics_item_id ON swap_analytics(item_id);
CREATE INDEX IF NOT EXISTS idx_swap_analytics_event_type ON swap_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_swap_analytics_created_at ON swap_analytics(created_at DESC);

-- ============================================================================
-- 6. ADD MISSING INDEXES to existing tables
-- ============================================================================

-- Indexes for swap_items
CREATE INDEX IF NOT EXISTS idx_swap_items_user_id ON swap_items(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_swap_items_status ON swap_items(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_swap_items_category ON swap_items(category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_swap_items_country ON swap_items(country) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_swap_items_power_level ON swap_items(power_level DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_swap_items_hemp_inside ON swap_items(hemp_inside) WHERE hemp_inside = TRUE AND deleted_at IS NULL;

-- Geo-location indexes (simple lat/long indexes for now)
CREATE INDEX IF NOT EXISTS idx_swap_items_latitude ON swap_items(latitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_swap_items_longitude ON swap_items(longitude) WHERE longitude IS NOT NULL;

-- Full text search on swap_items
CREATE INDEX IF NOT EXISTS idx_swap_items_search ON swap_items USING GIN (
  to_tsvector('english', title || ' ' || COALESCE(description, ''))
) WHERE deleted_at IS NULL;

-- Indexes for swap_proposals
CREATE INDEX IF NOT EXISTS idx_swap_proposals_swap_item_id ON swap_proposals(swap_item_id);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_proposer_user_id ON swap_proposals(proposer_user_id);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_status ON swap_proposals(status);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_expires_at ON swap_proposals(expires_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_swap_proposals_conversation_id ON swap_proposals(conversation_id);

-- ============================================================================
-- 7. TRIGGERS - Auto-update functionality
-- ============================================================================

-- Auto-update updated_at on swap_items
CREATE OR REPLACE FUNCTION update_swap_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_swap_items_updated_at ON swap_items;
CREATE TRIGGER trigger_swap_items_updated_at
  BEFORE UPDATE ON swap_items
  FOR EACH ROW EXECUTE FUNCTION update_swap_items_updated_at();

-- Auto-update updated_at on swap_proposals
CREATE OR REPLACE FUNCTION update_swap_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_swap_proposals_updated_at ON swap_proposals;
CREATE TRIGGER trigger_swap_proposals_updated_at
  BEFORE UPDATE ON swap_proposals
  FOR EACH ROW EXECUTE FUNCTION update_swap_proposals_updated_at();

-- Auto-increment likes_count when someone likes an item
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

DROP TRIGGER IF EXISTS trigger_update_likes_count ON swap_likes;
CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON swap_likes
  FOR EACH ROW EXECUTE FUNCTION update_item_likes_count();

-- Auto-increment proposals_count when someone proposes
CREATE OR REPLACE FUNCTION update_item_proposals_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE swap_items SET proposals_count = proposals_count + 1 WHERE id = NEW.swap_item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_proposals_count ON swap_proposals;
CREATE TRIGGER trigger_update_proposals_count
  AFTER INSERT ON swap_proposals
  FOR EACH ROW EXECUTE FUNCTION update_item_proposals_count();

-- ============================================================================
-- 8. RLS POLICIES - Enable if not already enabled
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE swap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_deal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate (to ensure consistency)
DROP POLICY IF EXISTS "Anyone can view available swap items" ON swap_items;
DROP POLICY IF EXISTS "Users can view their own swap items" ON swap_items;
DROP POLICY IF EXISTS "Users can insert their own swap items" ON swap_items;
DROP POLICY IF EXISTS "Users can update their own swap items" ON swap_items;

-- SWAP ITEMS POLICIES
CREATE POLICY "Anyone can view available swap items"
  ON swap_items FOR SELECT
  USING (status = 'available' AND deleted_at IS NULL);

CREATE POLICY "Users can view their own swap items"
  ON swap_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own swap items"
  ON swap_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own swap items"
  ON swap_items FOR UPDATE
  USING (auth.uid() = user_id);

-- SWAP LIKES POLICIES
DROP POLICY IF EXISTS "Users can view their own likes" ON swap_likes;
DROP POLICY IF EXISTS "Item owners can see their item likes" ON swap_likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON swap_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON swap_likes;

CREATE POLICY "Users can view their own likes"
  ON swap_likes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Item owners can see their item likes"
  ON swap_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM swap_items 
      WHERE swap_items.id = swap_likes.item_id 
      AND swap_items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own likes"
  ON swap_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON swap_likes FOR DELETE
  USING (auth.uid() = user_id);

-- SWAP PROPOSALS POLICIES
DROP POLICY IF EXISTS "Users can view proposals involving them" ON swap_proposals;
DROP POLICY IF EXISTS "Users can create proposals" ON swap_proposals;
DROP POLICY IF EXISTS "Users can update proposals involving them" ON swap_proposals;

CREATE POLICY "Users can view proposals involving them"
  ON swap_proposals FOR SELECT
  USING (
    auth.uid() = proposer_user_id OR
    EXISTS (
      SELECT 1 FROM swap_items 
      WHERE swap_items.id = swap_proposals.swap_item_id 
      AND swap_items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create proposals"
  ON swap_proposals FOR INSERT
  WITH CHECK (auth.uid() = proposer_user_id);

CREATE POLICY "Users can update proposals involving them"
  ON swap_proposals FOR UPDATE
  USING (
    auth.uid() = proposer_user_id OR
    EXISTS (
      SELECT 1 FROM swap_items 
      WHERE swap_items.id = swap_proposals.swap_item_id 
      AND swap_items.user_id = auth.uid()
    )
  );

-- SWAP DEALS POLICIES
DROP POLICY IF EXISTS "Users can view their deals" ON swap_deals;
DROP POLICY IF EXISTS "Users can update their deals" ON swap_deals;

CREATE POLICY "Users can view their deals"
  ON swap_deals FOR SELECT
  USING (auth.uid() IN (user1_id, user2_id));

CREATE POLICY "Users can update their deals"
  ON swap_deals FOR UPDATE
  USING (auth.uid() IN (user1_id, user2_id));

-- SWAP DEAL MESSAGES POLICIES
DROP POLICY IF EXISTS "Users can view their deal messages" ON swap_deal_messages;
DROP POLICY IF EXISTS "Users can send messages in their deals" ON swap_deal_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON swap_deal_messages;

CREATE POLICY "Users can view their deal messages"
  ON swap_deal_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM swap_deals 
      WHERE swap_deals.id = swap_deal_messages.deal_id 
      AND auth.uid() IN (swap_deals.user1_id, swap_deals.user2_id)
    )
  );

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

CREATE POLICY "Users can update their own messages"
  ON swap_deal_messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- ============================================================================
-- 9. HELPER FUNCTIONS
-- ============================================================================

-- Cleanup expired likes (can be run manually or via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_swap_likes()
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

-- Expire old proposals (can be run manually or via cron)
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

-- ============================================================================
-- 10. VERIFICATION & SUCCESS MESSAGE
-- ============================================================================

DO $$ 
DECLARE
  items_count INTEGER;
  proposals_count INTEGER;
  completions_count INTEGER;
BEGIN
  -- Count existing data
  SELECT COUNT(*) INTO items_count FROM swap_items;
  SELECT COUNT(*) INTO proposals_count FROM swap_proposals;
  SELECT COUNT(*) INTO completions_count FROM swap_completions;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SWAP Migration completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Existing Data Preserved:';
  RAISE NOTICE '   - swap_items: % rows', items_count;
  RAISE NOTICE '   - swap_proposals: % rows', proposals_count;
  RAISE NOTICE '   - swap_completions: % rows', completions_count;
  RAISE NOTICE '';
  RAISE NOTICE '🆕 New Columns Added:';
  RAISE NOTICE '   - swap_items: power_level, likes_count, proposals_count, views_count, deleted_at';
  RAISE NOTICE '   - swap_proposals: expires_at, proposer_item_id, proposal_type';
  RAISE NOTICE '';
  RAISE NOTICE '🆕 New Tables Created:';
  RAISE NOTICE '   - swap_likes (24-hour temp matches)';
  RAISE NOTICE '   - swap_deals (active swap management)';
  RAISE NOTICE '   - swap_deal_messages (contextual chat)';
  RAISE NOTICE '   - swap_analytics (event tracking)';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ Triggers & Indexes:';
  RAISE NOTICE '   - Auto-update timestamps ✅';
  RAISE NOTICE '   - Auto-increment counters ✅';
  RAISE NOTICE '   - Performance indexes ✅';
  RAISE NOTICE '   - Full-text search ✅';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 RLS Policies: ENABLED';
  RAISE NOTICE '';
  RAISE NOTICE '🎮 Ready for SWAP marketplace!';
  RAISE NOTICE '========================================';
END $$;