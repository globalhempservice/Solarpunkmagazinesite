-- ============================================
-- DEWII Community Market - Public Profile System
-- Complete SQL Schema for User Profiles
-- ============================================

-- This schema extends the existing user_progress table and adds
-- new tables for public profile features with privacy controls

-- ============================================
-- 1. EXTEND user_progress table (if columns don't exist)
-- ============================================

-- Add profile visibility columns to user_progress
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS profile_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS profile_bio TEXT,
ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_stats BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_badges BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_achievements BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS profile_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS profile_created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMP DEFAULT NOW();

-- Ensure selected_badge column exists (should already exist)
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS selected_badge VARCHAR(100) DEFAULT 'default';

-- Add index for faster profile lookups
CREATE INDEX IF NOT EXISTS idx_user_progress_profile_public ON user_progress(profile_public);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- ============================================
-- 2. CREATE user_profiles table (Alternative approach - separate table)
-- ============================================

-- This is an ALTERNATIVE to modifying user_progress
-- Use this if you want to keep profile data separate
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Profile Display Settings
  profile_public BOOLEAN DEFAULT false,
  display_name VARCHAR(100),
  profile_bio TEXT,
  profile_avatar_url TEXT,
  profile_banner_url TEXT,
  
  -- Privacy Controls
  show_email BOOLEAN DEFAULT false,
  show_stats BOOLEAN DEFAULT true,
  show_badges BOOLEAN DEFAULT true,
  show_achievements BOOLEAN DEFAULT true,
  show_nada_balance BOOLEAN DEFAULT false,
  show_reading_history BOOLEAN DEFAULT false,
  
  -- Active Display Items
  selected_badge VARCHAR(100) DEFAULT 'default',
  featured_achievement VARCHAR(100),
  
  -- Profile Metadata
  profile_views INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_public ON user_profiles(profile_public);

-- ============================================
-- 3. CREATE profile_views table (Track who viewed profiles)
-- ============================================

CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewer_ip VARCHAR(50),
  viewed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_user ON profile_views(profile_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON profile_views(viewed_at);

-- ============================================
-- 4. CREATE user_badges table (Track owned badges separately)
-- ============================================

-- This provides better structure than storing in JSON
CREATE TABLE IF NOT EXISTS user_owned_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id VARCHAR(100) NOT NULL,
  purchased_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_owned_badges(user_id);

-- ============================================
-- 5. Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile (private or public)
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Anyone can view public profiles
CREATE POLICY "Anyone can view public profiles"
  ON user_profiles
  FOR SELECT
  USING (profile_public = true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable RLS on user_owned_badges
ALTER TABLE user_owned_badges ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own badges
CREATE POLICY "Users can view own badges"
  ON user_owned_badges
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Anyone can view badges of public profiles
CREATE POLICY "Public can view badges of public profiles"
  ON user_owned_badges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = user_owned_badges.user_id 
      AND user_profiles.profile_public = true
      AND user_profiles.show_badges = true
    )
  );

-- Enable RLS on profile_views
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view who viewed their profile
CREATE POLICY "Users can view own profile views"
  ON profile_views
  FOR SELECT
  USING (auth.uid() = profile_user_id);

-- Policy: System can insert profile views
CREATE POLICY "Anyone can insert profile views"
  ON profile_views
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 6. Functions & Triggers
-- ============================================

-- Function to update profile_updated_at timestamp
CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update profile_updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();

-- Function to increment profile views
CREATE OR REPLACE FUNCTION increment_profile_views(profile_uid UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET 
    profile_views = profile_views + 1,
    last_viewed_at = NOW()
  WHERE user_id = profile_uid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Sample Data Queries
-- ============================================

-- Query to get a public profile with all data
-- This is what your backend endpoint should use:
/*
SELECT 
  up.user_id,
  up.display_name,
  up.profile_bio,
  up.profile_avatar_url,
  up.profile_banner_url,
  up.show_email,
  up.show_stats,
  up.show_badges,
  up.show_achievements,
  up.selected_badge,
  up.profile_views,
  CASE WHEN up.show_email THEN u.email ELSE NULL END as email,
  CASE WHEN up.show_stats THEN prog.total_articles_read ELSE NULL END as total_articles_read,
  CASE WHEN up.show_stats THEN prog.points ELSE NULL END as points,
  CASE WHEN up.show_nada_balance THEN wallet.nada_points ELSE NULL END as nada_points
FROM user_profiles up
LEFT JOIN auth.users u ON up.user_id = u.id
LEFT JOIN user_progress prog ON up.user_id = prog.user_id
LEFT JOIN user_nada_wallet wallet ON up.user_id = wallet.user_id
WHERE up.user_id = $1 AND up.profile_public = true;
*/

-- Query to get user's owned badges
/*
SELECT badge_id, purchased_at
FROM user_owned_badges
WHERE user_id = $1
ORDER BY purchased_at DESC;
*/

-- ============================================
-- 8. Migration Notes
-- ============================================

/*
IMPORTANT NOTES:

1. BADGE PERSISTENCE IS ALREADY WORKING!
   - The 'selected_badge' column already exists in user_progress
   - The backend endpoint '/users/:userId/select-badge' already saves it
   - The badge should persist across sessions automatically

2. IF BADGE IS NOT PERSISTING, CHECK:
   - Browser localStorage might be interfering
   - The API might not be returning selectedBadge correctly
   - The frontend might not be reading userProgress.selectedBadge

3. RECOMMENDED APPROACH:
   - Use Option 1: Add columns to user_progress (simpler, fewer joins)
   - Only create user_profiles table if you want strict separation

4. FOR PUBLIC PROFILES:
   - You'll need to create backend endpoints:
     * GET /public-profile/:userId - Get public profile
     * PUT /profile/settings - Update profile privacy settings
     * GET /profile/views - Get profile view analytics
   
5. PRIVACY BY DEFAULT:
   - All profiles are private by default (profile_public = false)
   - Users must explicitly enable public profile
   - Email is hidden by default (show_email = false)

6. PERFORMANCE:
   - Indexes are created for frequently queried columns
   - RLS policies ensure security without performance hit
   - Consider adding caching for public profiles

7. FUTURE ENHANCEMENTS:
   - Profile slugs/usernames for SEO-friendly URLs
   - Social links (Twitter, Instagram, etc.)
   - Custom profile themes
   - Profile badges/achievements showcase
   - Activity feed on public profile
*/
