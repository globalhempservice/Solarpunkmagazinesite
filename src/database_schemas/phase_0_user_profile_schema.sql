-- ============================================================================
-- PHASE 0: USER PROFILE ENHANCEMENTS ONLY
-- ============================================================================
-- Date: December 6, 2024
-- Purpose: Add marketplace fields to user profiles for Phase 0 Foundation
-- Safe to run: No dependencies on other tables
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 1: USER PROFILE ENHANCEMENTS
-- ============================================================================

-- Extend user_profiles table with marketplace fields
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS country VARCHAR(2), -- ISO country code
ADD COLUMN IF NOT EXISTS region VARCHAR(100), -- State/province
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS id_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS professional_bio TEXT,
ADD COLUMN IF NOT EXISTS looking_for TEXT, -- What they're seeking
ADD COLUMN IF NOT EXISTS can_offer TEXT, -- What they can provide
ADD COLUMN IF NOT EXISTS location_public BOOLEAN DEFAULT TRUE, -- Privacy setting
ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) DEFAULT 'public'; -- 'public', 'private', 'verified_only'

-- User roles (many-to-many)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'consumer', 'professional', 'founder', 'designer', 'buyer', 'researcher', 'farmer', etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
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

-- User saved items (favorites) - generic, no FK constraints for flexibility
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
-- SECTION 2: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_items ENABLE ROW LEVEL SECURITY;

-- User Roles Policies
-- Anyone can read roles (public profile info)
CREATE POLICY user_roles_select ON user_roles
    FOR SELECT USING (true);

-- Users can only insert/update/delete their own roles
CREATE POLICY user_roles_insert ON user_roles
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY user_roles_update ON user_roles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY user_roles_delete ON user_roles
    FOR DELETE USING (user_id = auth.uid());

-- User Interests Policies
-- Anyone can read interests (public profile info)
CREATE POLICY user_interests_select ON user_interests
    FOR SELECT USING (true);

-- Users can only insert/update/delete their own interests
CREATE POLICY user_interests_insert ON user_interests
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY user_interests_update ON user_interests
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY user_interests_delete ON user_interests
    FOR DELETE USING (user_id = auth.uid());

-- User Saved Items Policies
-- Users can only see their own saved items
CREATE POLICY user_saved_items_select ON user_saved_items
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY user_saved_items_insert ON user_saved_items
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY user_saved_items_delete ON user_saved_items
    FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- SECTION 3: STORAGE BUCKET FOR AVATARS (if not exists)
-- ============================================================================

-- Create storage bucket for avatars
-- Run this in Supabase Storage UI or via SQL:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;

-- Note: Storage bucket creation is typically done via Supabase Dashboard
-- or via the storage API, not SQL. After running this schema, create
-- the bucket manually if it doesn't exist.

-- ============================================================================
-- SECTION 4: HELPFUL QUERIES FOR TESTING
-- ============================================================================

-- View all columns on user_profiles
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'user_profiles';

-- View a user's complete profile with roles and interests
-- SELECT 
--   up.*,
--   ARRAY_AGG(DISTINCT ur.role) FILTER (WHERE ur.role IS NOT NULL) as roles,
--   ARRAY_AGG(DISTINCT ui.interest) FILTER (WHERE ui.interest IS NOT NULL) as interests
-- FROM user_profiles up
-- LEFT JOIN user_roles ur ON up.id = ur.user_id
-- LEFT JOIN user_interests ui ON up.id = ui.user_id
-- WHERE up.id = 'YOUR_USER_ID'
-- GROUP BY up.id;

-- ============================================================================
-- END OF PHASE 0 SCHEMA
-- ============================================================================

-- Summary:
-- ✅ User profile columns added (avatar, bio, location, trust score)
-- ✅ user_roles table created
-- ✅ user_interests table created
-- ✅ user_saved_items table created
-- ✅ RLS policies configured
-- ⏭️  Next: Create avatar storage bucket in Supabase Dashboard
-- ⏭️  Next: Build profile UI components
-- ============================================================================
