-- ================================================
-- DEWII SWAP SHOP - C2C BARTER MARKETPLACE
-- ================================================
-- Created: December 9, 2024
-- Purpose: Enable users to barter used hemp items
-- Flow: Post item → Send photo proposal → Accept/Reject → Chat → Complete
-- ================================================

-- ================================================
-- TABLE: swap_items (User Listings)
-- ================================================
CREATE TABLE IF NOT EXISTS swap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Owner
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Item Details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- clothing, accessories, home_goods, wellness, construction, other
  condition TEXT NOT NULL, -- like_new, good, well_loved, vintage
  
  -- Hemp Verification
  hemp_inside BOOLEAN DEFAULT true,
  hemp_percentage INTEGER, -- 0-100
  
  -- Photos
  images TEXT[] DEFAULT '{}', -- Array of Supabase Storage URLs
  
  -- Location (for shipping/meetup)
  country TEXT,
  city TEXT,
  willing_to_ship BOOLEAN DEFAULT true,
  
  -- Story/Provenance
  story TEXT, -- "I've had this hemp backpack for 3 years..."
  years_in_use INTEGER,
  original_product_id UUID REFERENCES products(id), -- Link to SWAG product if applicable
  
  -- Status
  status TEXT DEFAULT 'available', -- available, pending, swapped, removed
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  swapped_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_swap_items_user_id ON swap_items(user_id);
CREATE INDEX IF NOT EXISTS idx_swap_items_status ON swap_items(status);
CREATE INDEX IF NOT EXISTS idx_swap_items_category ON swap_items(category);
CREATE INDEX IF NOT EXISTS idx_swap_items_created_at ON swap_items(created_at DESC);

-- ================================================
-- TABLE: swap_proposals (Barter Offers)
-- ================================================
CREATE TABLE IF NOT EXISTS swap_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What they want
  swap_item_id UUID NOT NULL REFERENCES swap_items(id) ON DELETE CASCADE,
  
  -- Who's proposing
  proposer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- What they're offering (photo + description)
  offer_images TEXT[] DEFAULT '{}', -- Photos of what they're offering
  offer_description TEXT NOT NULL, -- "I have this hemp t-shirt in great condition..."
  offer_title TEXT, -- "Hemp T-Shirt - Size M"
  
  -- Additional offer details
  offer_condition TEXT, -- like_new, good, well_loved
  offer_category TEXT, -- Same categories as swap_items
  
  -- Message
  message TEXT, -- Personal message to seller
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected, completed, cancelled
  
  -- Conversation (unlocked after acceptance)
  conversation_id UUID REFERENCES conversations(id),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_swap_proposals_swap_item_id ON swap_proposals(swap_item_id);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_proposer_user_id ON swap_proposals(proposer_user_id);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_status ON swap_proposals(status);

-- ================================================
-- TABLE: swap_completions (Trust & Tracking)
-- ================================================
CREATE TABLE IF NOT EXISTS swap_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Parties
  proposal_id UUID NOT NULL REFERENCES swap_proposals(id) ON DELETE CASCADE,
  swap_item_id UUID NOT NULL REFERENCES swap_items(id),
  giver_user_id UUID NOT NULL REFERENCES auth.users(id),
  receiver_user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Confirmation (both must confirm)
  giver_confirmed BOOLEAN DEFAULT false,
  receiver_confirmed BOOLEAN DEFAULT false,
  
  -- Feedback
  giver_rating INTEGER, -- 1-5 stars
  receiver_rating INTEGER, -- 1-5 stars
  giver_feedback TEXT,
  receiver_feedback TEXT,
  
  -- Metadata
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- RLS POLICIES
-- ================================================

-- swap_items policies
ALTER TABLE swap_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view available items
CREATE POLICY "Anyone can view available swap items"
  ON swap_items FOR SELECT
  USING (status = 'available');

-- Users can view their own items (any status)
CREATE POLICY "Users can view their own swap items"
  ON swap_items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create items
CREATE POLICY "Users can create swap items"
  ON swap_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own items
CREATE POLICY "Users can update their own swap items"
  ON swap_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own items
CREATE POLICY "Users can delete their own swap items"
  ON swap_items FOR DELETE
  USING (auth.uid() = user_id);

-- swap_proposals policies
ALTER TABLE swap_proposals ENABLE ROW LEVEL SECURITY;

-- Users can view proposals they sent
CREATE POLICY "Users can view proposals they sent"
  ON swap_proposals FOR SELECT
  USING (auth.uid() = proposer_user_id);

-- Users can view proposals on their items
CREATE POLICY "Users can view proposals on their items"
  ON swap_proposals FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM swap_items WHERE id = swap_item_id
    )
  );

-- Users can create proposals
CREATE POLICY "Users can create proposals"
  ON swap_proposals FOR INSERT
  WITH CHECK (auth.uid() = proposer_user_id);

-- Item owners can update proposals (accept/reject)
CREATE POLICY "Item owners can update proposals"
  ON swap_proposals FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM swap_items WHERE id = swap_item_id
    )
  );

-- Proposers can cancel their own proposals
CREATE POLICY "Proposers can cancel proposals"
  ON swap_proposals FOR UPDATE
  USING (auth.uid() = proposer_user_id AND status = 'pending');

-- swap_completions policies
ALTER TABLE swap_completions ENABLE ROW LEVEL SECURITY;

-- Users can view completions they're part of
CREATE POLICY "Users can view their swap completions"
  ON swap_completions FOR SELECT
  USING (auth.uid() IN (giver_user_id, receiver_user_id));

-- Users can confirm and rate
CREATE POLICY "Users can update their swap completions"
  ON swap_completions FOR UPDATE
  USING (auth.uid() IN (giver_user_id, receiver_user_id));

-- ================================================
-- FUNCTIONS
-- ================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_swap_item_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER swap_items_updated_at
  BEFORE UPDATE ON swap_items
  FOR EACH ROW
  EXECUTE FUNCTION update_swap_item_updated_at();

CREATE OR REPLACE FUNCTION update_swap_proposal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER swap_proposals_updated_at
  BEFORE UPDATE ON swap_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_swap_proposal_updated_at();

-- ================================================
-- STORAGE BUCKET FOR SWAP IMAGES
-- ================================================
-- Note: Run this in Supabase dashboard or via server init

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('swap-images', 'swap-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- CREATE POLICY "Anyone can view swap images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'swap-images');

-- CREATE POLICY "Authenticated users can upload swap images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'swap-images' AND
--     auth.role() = 'authenticated'
--   );

-- CREATE POLICY "Users can update their own swap images"
--   ON storage.objects FOR UPDATE
--   USING (
--     bucket_id = 'swap-images' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can delete their own swap images"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'swap-images' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- ================================================
-- SAMPLE DATA (for testing)
-- ================================================
/*
-- Insert sample swap item
INSERT INTO swap_items (
  user_id,
  title,
  description,
  category,
  condition,
  hemp_inside,
  hemp_percentage,
  country,
  willing_to_ship,
  story,
  years_in_use
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Hemp Backpack - Well-Loved',
  'Durable hemp backpack that has traveled with me for years. Still in great condition, just upgrading to a larger one.',
  'accessories',
  'well_loved',
  true,
  80,
  'United States',
  true,
  'This backpack has been my daily companion for 3 years. It has traveled to 12 countries with me!',
  3
);
*/

-- ================================================
-- NOTES
-- ================================================
-- Categories:
--   - clothing
--   - accessories
--   - home_goods
--   - wellness
--   - construction
--   - other

-- Conditions:
--   - like_new (barely used, mint condition)
--   - good (normal wear, fully functional)
--   - well_loved (lots of character, still usable)
--   - vintage (old but gold)

-- Status (swap_items):
--   - available (active listing)
--   - pending (proposal accepted, arranging swap)
--   - swapped (successfully traded)
--   - removed (user removed listing)

-- Status (swap_proposals):
--   - pending (waiting for response)
--   - accepted (owner accepted, can now chat)
--   - rejected (owner declined)
--   - completed (swap finished)
--   - cancelled (proposer withdrew)

-- ================================================
