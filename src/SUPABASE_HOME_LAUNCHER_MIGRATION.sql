-- ========================================
-- DEWII HOME LAUNCHER - SUPABASE MIGRATION
-- ========================================
-- This migration adds support for:
-- 1. Home app launcher customization
-- 2. User progress tracking (XP, levels)
-- 3. App-specific user data
-- ========================================

-- ========================================
-- 1. ADD HOME LAYOUT CONFIGURATION
-- ========================================

-- Add home_layout_config column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS home_layout_config JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.home_layout_config IS 
'Stores user customization for home app launcher:
{
  "appOrder": ["mag", "swipe", "places", "swap", "forum", "globe"],
  "hiddenApps": [],
  "favorites": [],
  "quickActions": [],
  "gridColumns": 3,
  "iconSize": "large",
  "showStats": true,
  "showRecentApps": false
}';

-- Create GIN index for faster JSONB lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_home_layout_config 
ON user_profiles USING GIN (home_layout_config);


-- ========================================
-- 2. ADD USER PROGRESS TRACKING
-- ========================================

-- Add gamification columns to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb;

-- Add comments
COMMENT ON COLUMN user_profiles.user_level IS 'Current user level (starts at 1)';
COMMENT ON COLUMN user_profiles.current_xp IS 'XP progress towards next level';
COMMENT ON COLUMN user_profiles.total_xp IS 'Total XP earned across all time';
COMMENT ON COLUMN user_profiles.achievements IS 'Array of achievement IDs earned';

-- Create indexes for progress queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_level 
ON user_profiles (user_level DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_total_xp 
ON user_profiles (total_xp DESC);


-- ========================================
-- 3. CREATE XP CALCULATION FUNCTION
-- ========================================

-- Function to calculate XP needed for next level
-- Formula: base * (level ^ 1.5) rounded to nearest 50
CREATE OR REPLACE FUNCTION calculate_next_level_xp(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN CEIL((100 * POWER(current_level, 1.5)) / 50) * 50;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_next_level_xp IS 
'Calculates XP required for next level using formula: 100 * (level ^ 1.5), rounded to nearest 50';


-- ========================================
-- 4. CREATE LEVEL UP TRIGGER
-- ========================================

-- Function to handle level up when XP threshold reached
CREATE OR REPLACE FUNCTION handle_level_up()
RETURNS TRIGGER AS $$
DECLARE
  next_level_xp INTEGER;
BEGIN
  -- Calculate XP needed for next level
  next_level_xp := calculate_next_level_xp(NEW.user_level);
  
  -- Check if user has enough XP to level up
  WHILE NEW.current_xp >= next_level_xp LOOP
    -- Level up!
    NEW.user_level := NEW.user_level + 1;
    NEW.current_xp := NEW.current_xp - next_level_xp;
    
    -- Recalculate for new level
    next_level_xp := calculate_next_level_xp(NEW.user_level);
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_level_up ON user_profiles;
CREATE TRIGGER trigger_level_up
  BEFORE UPDATE OF current_xp, total_xp
  ON user_profiles
  FOR EACH ROW
  WHEN (NEW.current_xp IS DISTINCT FROM OLD.current_xp OR NEW.total_xp IS DISTINCT FROM OLD.total_xp)
  EXECUTE FUNCTION handle_level_up();

COMMENT ON FUNCTION handle_level_up IS 
'Automatically levels up user when XP threshold is reached';


-- ========================================
-- 5. CREATE XP AWARD FUNCTION
-- ========================================

-- Drop any existing versions of award_xp to avoid conflicts
DROP FUNCTION IF EXISTS award_xp(UUID, INTEGER, TEXT);
DROP FUNCTION IF EXISTS award_xp(UUID, INTEGER, TEXT, TEXT);

-- Function to award XP to a user (with optional action_key for logging)
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_reason TEXT DEFAULT NULL,
  p_action_key TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_leveled_up BOOLEAN;
BEGIN
  -- Get current level
  SELECT user_level INTO v_old_level
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  -- Award XP
  UPDATE user_profiles
  SET 
    current_xp = current_xp + p_xp_amount,
    total_xp = total_xp + p_xp_amount
  WHERE user_id = p_user_id
  RETURNING user_level INTO v_new_level;
  
  -- Log to history (will be created later in migration)
  -- Using INSERT with exception handling in case xp_history doesn't exist yet
  BEGIN
    INSERT INTO xp_history (user_id, action_key, xp_amount, reason)
    VALUES (p_user_id, p_action_key, p_xp_amount, p_reason);
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist yet, skip logging
    NULL;
  END;
  
  -- Check if leveled up
  v_leveled_up := v_new_level > v_old_level;
  
  -- Return result
  RETURN json_build_object(
    'success', true,
    'xp_awarded', p_xp_amount,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'leveled_up', v_leveled_up,
    'reason', p_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION award_xp IS 
'Awards XP to a user and returns level up status
Example: SELECT award_xp(''user-uuid'', 50, ''Published article'', ''create_article'');';


-- ========================================
-- 6. CREATE APP USAGE TRACKING TABLE
-- ========================================

-- Track which apps users use and when
CREATE TABLE IF NOT EXISTS app_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_key TEXT NOT NULL,
  session_duration INTEGER, -- seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_app_key CHECK (app_key IN ('mag', 'swipe', 'places', 'swap', 'forum', 'globe'))
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_app_usage_user_id 
ON app_usage_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_app_usage_app_key 
ON app_usage_logs (app_key);

CREATE INDEX IF NOT EXISTS idx_app_usage_created_at 
ON app_usage_logs (created_at DESC);

-- Add RLS policies
ALTER TABLE app_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own logs
CREATE POLICY "Users can view own app usage logs"
  ON app_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own logs
CREATE POLICY "Users can insert own app usage logs"
  ON app_usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE app_usage_logs IS 
'Tracks user app usage for analytics and personalization';


-- ========================================
-- 7. CREATE APP BADGES TABLE
-- ========================================

-- Track notification badges for each app
CREATE TABLE IF NOT EXISTS app_badges (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_key TEXT NOT NULL,
  badge_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  -- Primary key
  PRIMARY KEY (user_id, app_key),
  
  -- Constraints
  CONSTRAINT valid_app_key CHECK (app_key IN ('mag', 'swipe', 'places', 'swap', 'forum', 'globe')),
  CONSTRAINT non_negative_count CHECK (badge_count >= 0)
);

-- Add index
CREATE INDEX IF NOT EXISTS idx_app_badges_user_id 
ON app_badges (user_id);

-- Add RLS policies
ALTER TABLE app_badges ENABLE ROW LEVEL SECURITY;

-- Users can read their own badges
CREATE POLICY "Users can view own app badges"
  ON app_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own badges
CREATE POLICY "Users can update own app badges"
  ON app_badges FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert/update badges
CREATE POLICY "System can manage app badges"
  ON app_badges FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE app_badges IS 
'Stores notification badge counts for each app per user';


-- ========================================
-- 8. CREATE FUNCTION TO UPDATE APP BADGE
-- ========================================

CREATE OR REPLACE FUNCTION update_app_badge(
  p_user_id UUID,
  p_app_key TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS INTEGER AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  -- Insert or update badge count
  INSERT INTO app_badges (user_id, app_key, badge_count, last_updated)
  VALUES (p_user_id, p_app_key, GREATEST(0, p_increment), NOW())
  ON CONFLICT (user_id, app_key) 
  DO UPDATE SET 
    badge_count = GREATEST(0, app_badges.badge_count + p_increment),
    last_updated = NOW()
  RETURNING badge_count INTO v_new_count;
  
  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_app_badge IS 
'Updates badge count for an app. Use negative increment to decrease.
Example: SELECT update_app_badge(''user-uuid'', ''forum'', 1); -- Add 1
         SELECT update_app_badge(''user-uuid'', ''forum'', -1); -- Remove 1';


-- ========================================
-- 9. CREATE FUNCTION TO CLEAR APP BADGE
-- ========================================

CREATE OR REPLACE FUNCTION clear_app_badge(
  p_user_id UUID,
  p_app_key TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE app_badges
  SET badge_count = 0, last_updated = NOW()
  WHERE user_id = p_user_id AND app_key = p_app_key;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION clear_app_badge IS 
'Clears badge count for an app
Example: SELECT clear_app_badge(''user-uuid'', ''forum'');';


-- ========================================
-- 10. CREATE XP REWARD CONFIGURATION TABLE
-- ========================================

-- Define XP rewards for different actions
CREATE TABLE IF NOT EXISTS xp_rewards (
  action_key TEXT PRIMARY KEY,
  xp_amount INTEGER NOT NULL,
  cooldown_minutes INTEGER DEFAULT 0,
  max_per_day INTEGER,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT positive_xp CHECK (xp_amount > 0)
);

-- Add common XP rewards
INSERT INTO xp_rewards (action_key, xp_amount, cooldown_minutes, max_per_day, description) VALUES
  ('daily_login', 10, 1440, 1, 'Daily login bonus'),
  ('create_article', 50, 0, NULL, 'Publish a new article'),
  ('create_swap', 25, 0, NULL, 'Create a new swap listing'),
  ('complete_trade', 100, 0, NULL, 'Complete a successful trade'),
  ('forum_post', 15, 10, 10, 'Create a forum post'),
  ('forum_reply', 5, 5, 20, 'Reply to a forum thread'),
  ('swipe_match', 10, 1, NULL, 'Match on Swipe'),
  ('add_place', 30, 0, NULL, 'Add a new hemp place'),
  ('profile_complete', 100, NULL, 1, 'Complete profile 100%')
ON CONFLICT (action_key) DO NOTHING;

-- Add RLS policy
ALTER TABLE xp_rewards ENABLE ROW LEVEL SECURITY;

-- Everyone can read XP rewards
CREATE POLICY "Anyone can view xp rewards"
  ON xp_rewards FOR SELECT
  USING (is_active = true);

-- Only service role can modify (via server functions)
-- Users cannot directly modify xp_rewards table
CREATE POLICY "Service role can modify xp rewards"
  ON xp_rewards FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

COMMENT ON TABLE xp_rewards IS 
'Configuration for XP rewards for different user actions';


-- ========================================
-- 11. CREATE XP HISTORY TABLE
-- ========================================

-- Track all XP awards for transparency and debugging
CREATE TABLE IF NOT EXISTS xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_key TEXT,
  xp_amount INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_xp_history_user_id 
ON xp_history (user_id);

CREATE INDEX IF NOT EXISTS idx_xp_history_created_at 
ON xp_history (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_xp_history_action_key 
ON xp_history (action_key);

-- Add RLS policies
ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own history
CREATE POLICY "Users can view own xp history"
  ON xp_history FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert history
CREATE POLICY "System can insert xp history"
  ON xp_history FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE xp_history IS 
'Complete history of all XP awards for each user';


-- ========================================
-- 13. GRANT PERMISSIONS
-- ========================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION calculate_next_level_xp TO authenticated;
GRANT EXECUTE ON FUNCTION award_xp TO authenticated;
GRANT EXECUTE ON FUNCTION update_app_badge TO authenticated;
GRANT EXECUTE ON FUNCTION clear_app_badge TO authenticated;


-- ========================================
-- 14. CREATE HELPER VIEWS
-- ========================================

-- Drop existing objects if they exist (table or view)
DROP VIEW IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;

-- View for user progress with calculated next level XP
CREATE OR REPLACE VIEW user_progress AS
SELECT 
  user_id,
  user_level,
  current_xp,
  total_xp,
  calculate_next_level_xp(user_level) AS next_level_xp,
  ROUND((current_xp::NUMERIC / calculate_next_level_xp(user_level)::NUMERIC) * 100, 2) AS progress_percentage
FROM user_profiles;

COMMENT ON VIEW user_progress IS 
'User progress with calculated next level XP and progress percentage';


-- Drop existing objects if they exist (table or view)
DROP VIEW IF EXISTS user_app_stats CASCADE;
DROP TABLE IF EXISTS user_app_stats CASCADE;

-- View for app statistics per user
CREATE OR REPLACE VIEW user_app_stats AS
SELECT 
  user_id,
  app_key,
  COUNT(*) AS usage_count,
  SUM(session_duration) AS total_duration_seconds,
  MAX(created_at) AS last_used,
  MIN(created_at) AS first_used
FROM app_usage_logs
GROUP BY user_id, app_key;

COMMENT ON VIEW user_app_stats IS 
'Aggregated app usage statistics per user';

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Verify tables exist
DO $$
BEGIN
  RAISE NOTICE 'Migration complete! Created:';
  RAISE NOTICE '  - home_layout_config column in user_profiles';
  RAISE NOTICE '  - user_level, current_xp, total_xp columns in user_profiles';
  RAISE NOTICE '  - app_usage_logs table';
  RAISE NOTICE '  - app_badges table';
  RAISE NOTICE '  - xp_rewards table';
  RAISE NOTICE '  - xp_history table';
  RAISE NOTICE '  - 6 functions (award_xp, update_app_badge, etc.)';
  RAISE NOTICE '  - 2 views (user_progress, user_app_stats)';
  RAISE NOTICE '  - All necessary indexes and RLS policies';
END $$;