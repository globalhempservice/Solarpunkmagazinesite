-- ================================================
-- SWAP SHOP - QUICK SETUP SCRIPT
-- ================================================
-- Run this in your Supabase SQL Editor
-- ================================================

-- 1. Create swap_items table
CREATE TABLE IF NOT EXISTS swap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  hemp_inside BOOLEAN DEFAULT true,
  hemp_percentage INTEGER,
  images TEXT[] DEFAULT '{}',
  country TEXT,
  city TEXT,
  willing_to_ship BOOLEAN DEFAULT true,
  story TEXT,
  years_in_use INTEGER,
  original_product_id UUID,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  swapped_at TIMESTAMP WITH TIME ZONE
);

-- 2. Create swap_proposals table
CREATE TABLE IF NOT EXISTS swap_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swap_item_id UUID NOT NULL REFERENCES swap_items(id) ON DELETE CASCADE,
  proposer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_images TEXT[] DEFAULT '{}',
  offer_description TEXT NOT NULL,
  offer_title TEXT,
  offer_condition TEXT,
  offer_category TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  conversation_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Create swap_completions table
CREATE TABLE IF NOT EXISTS swap_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES swap_proposals(id) ON DELETE CASCADE,
  swap_item_id UUID NOT NULL REFERENCES swap_items(id),
  giver_user_id UUID NOT NULL REFERENCES auth.users(id),
  receiver_user_id UUID NOT NULL REFERENCES auth.users(id),
  giver_confirmed BOOLEAN DEFAULT false,
  receiver_confirmed BOOLEAN DEFAULT false,
  giver_rating INTEGER,
  receiver_rating INTEGER,
  giver_feedback TEXT,
  receiver_feedback TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_swap_items_user_id ON swap_items(user_id);
CREATE INDEX IF NOT EXISTS idx_swap_items_status ON swap_items(status);
CREATE INDEX IF NOT EXISTS idx_swap_items_category ON swap_items(category);
CREATE INDEX IF NOT EXISTS idx_swap_items_created_at ON swap_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_swap_item_id ON swap_proposals(swap_item_id);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_proposer_user_id ON swap_proposals(proposer_user_id);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_status ON swap_proposals(status);

-- 5. Enable RLS
ALTER TABLE swap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_completions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for swap_items
DROP POLICY IF EXISTS "Anyone can view available swap items" ON swap_items;
CREATE POLICY "Anyone can view available swap items"
  ON swap_items FOR SELECT
  USING (status = 'available');

DROP POLICY IF EXISTS "Users can view their own swap items" ON swap_items;
CREATE POLICY "Users can view their own swap items"
  ON swap_items FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create swap items" ON swap_items;
CREATE POLICY "Users can create swap items"
  ON swap_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own swap items" ON swap_items;
CREATE POLICY "Users can update their own swap items"
  ON swap_items FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own swap items" ON swap_items;
CREATE POLICY "Users can delete their own swap items"
  ON swap_items FOR DELETE
  USING (auth.uid() = user_id);

-- 7. RLS Policies for swap_proposals
DROP POLICY IF EXISTS "Users can view proposals they sent" ON swap_proposals;
CREATE POLICY "Users can view proposals they sent"
  ON swap_proposals FOR SELECT
  USING (auth.uid() = proposer_user_id);

DROP POLICY IF EXISTS "Users can view proposals on their items" ON swap_proposals;
CREATE POLICY "Users can view proposals on their items"
  ON swap_proposals FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM swap_items WHERE id = swap_item_id
    )
  );

DROP POLICY IF EXISTS "Users can create proposals" ON swap_proposals;
CREATE POLICY "Users can create proposals"
  ON swap_proposals FOR INSERT
  WITH CHECK (auth.uid() = proposer_user_id);

DROP POLICY IF EXISTS "Item owners can update proposals" ON swap_proposals;
CREATE POLICY "Item owners can update proposals"
  ON swap_proposals FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM swap_items WHERE id = swap_item_id
    )
  );

DROP POLICY IF EXISTS "Proposers can cancel proposals" ON swap_proposals;
CREATE POLICY "Proposers can cancel proposals"
  ON swap_proposals FOR UPDATE
  USING (auth.uid() = proposer_user_id AND status = 'pending');

-- 8. RLS Policies for swap_completions
DROP POLICY IF EXISTS "Users can view their swap completions" ON swap_completions;
CREATE POLICY "Users can view their swap completions"
  ON swap_completions FOR SELECT
  USING (auth.uid() IN (giver_user_id, receiver_user_id));

DROP POLICY IF EXISTS "Users can update their swap completions" ON swap_completions;
CREATE POLICY "Users can update their swap completions"
  ON swap_completions FOR UPDATE
  USING (auth.uid() IN (giver_user_id, receiver_user_id));

-- 9. Create trigger functions
CREATE OR REPLACE FUNCTION update_swap_item_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS swap_items_updated_at ON swap_items;
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

DROP TRIGGER IF EXISTS swap_proposals_updated_at ON swap_proposals;
CREATE TRIGGER swap_proposals_updated_at
  BEFORE UPDATE ON swap_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_swap_proposal_updated_at();

-- ================================================
-- DONE! Your SWAP shop database is ready 🎉
-- ================================================
