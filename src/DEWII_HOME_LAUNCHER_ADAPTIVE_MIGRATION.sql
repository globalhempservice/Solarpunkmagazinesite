-- ========================================
-- DEWII HOME LAUNCHER - ADAPTIVE MIGRATION
-- ========================================
-- This migration adapts to existing schema:
-- - user_profiles table (basic info)
-- - user_progress table (gamification, themes, stats)
-- ========================================

-- ========================================
-- 1. ADD HOME LAYOUT TO user_progress
-- ========================================

-- Add home_layout_config to user_progress (where other settings live)
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS home_layout_config JSONB DEFAULT NULL;

COMMENT ON COLUMN user_progress.home_layout_config IS 
'Home app launcher customization:
{
  "appOrder": ["mag", "swipe", "places", "swap", "forum", "globe"],
  "hiddenApps": [],
  "favorites": []
}';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_progress_home_layout_config 
ON user_progress USING GIN (home_layout_config);


-- ========================================
-- 2. ADD XP/LEVEL COLUMNS TO user_progress
-- ========================================

-- Add XP tracking (complementing existing "points" column)
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS user_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN user_progress.user_level IS 'User level (starts at 1)';
COMMENT ON COLUMN user_progress.current_xp IS 'XP progress towards next level';
COMMENT ON COLUMN user_progress.total_xp IS 'Total lifetime XP (separate from points)';
COMMENT ON COLUMN user_progress.achievements IS 'Achievement IDs earned';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_level 
ON user_progress (user_level DESC);

CREATE INDEX IF NOT EXISTS idx_user_progress_total_xp 
ON user_progress (total_xp DESC);


-- ========================================
-- 3. CREATE XP CALCULATION FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION calculate_next_level_xp(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN CEIL((100 * POWER(current_level, 1.5)) / 50) * 50;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_next_level_xp IS 
'Calculates XP for next level: 100 * (level ^ 1.5), rounded to nearest 50';


-- ========================================
-- 4. CREATE LEVEL UP TRIGGER
-- ========================================

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

-- Create trigger on user_progress
DROP TRIGGER IF EXISTS trigger_level_up ON user_progress;
CREATE TRIGGER trigger_level_up
  BEFORE UPDATE OF current_xp, total_xp
  ON user_progress
  FOR EACH ROW
  WHEN (NEW.current_xp IS DISTINCT FROM OLD.current_xp OR NEW.total_xp IS DISTINCT FROM OLD.total_xp)
  EXECUTE FUNCTION handle_level_up();


-- ========================================
-- 5. CREATE XP AWARD FUNCTION
-- ========================================

-- Single unified award_xp function
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
  FROM user_progress
  WHERE user_id = p_user_id;
  
  -- Award XP
  UPDATE user_progress
  SET 
    current_xp = current_xp + p_xp_amount,
    total_xp = total_xp + p_xp_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING user_level INTO v_new_level;
  
  -- Log to history
  BEGIN
    INSERT INTO xp_history (user_id, action_key, xp_amount, reason)
    VALUES (p_user_id, p_action_key, p_xp_amount, p_reason);
  EXCEPTION WHEN undefined_table THEN
    NULL; -- Table doesn't exist yet, skip
  END;
  
  -- Check if leveled up
  v_leveled_up := v_new_level > v_old_level;
  
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
'Awards XP to user and returns level up status';


-- ========================================
-- 6. CREATE APP USAGE TRACKING TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS app_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_key TEXT NOT NULL,
  session_duration INTEGER, -- seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_app_key CHECK (app_key IN ('mag', 'swipe', 'places', 'swap', 'forum', 'globe'))
);

CREATE INDEX IF NOT EXISTS idx_app_usage_user_id 
ON app_usage_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_app_usage_app_key 
ON app_usage_logs (app_key);

CREATE INDEX IF NOT EXISTS idx_app_usage_created_at 
ON app_usage_logs (created_at DESC);

-- RLS policies
ALTER TABLE app_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own app usage logs"
  ON app_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own app usage logs"
  ON app_usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ========================================
-- 7. CREATE APP BADGES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS app_badges (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_key TEXT NOT NULL,
  badge_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (user_id, app_key),
  
  CONSTRAINT valid_app_key CHECK (app_key IN ('mag', 'swipe', 'places', 'swap', 'forum', 'globe')),
  CONSTRAINT non_negative_count CHECK (badge_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_app_badges_user_id 
ON app_badges (user_id);

-- RLS policies
ALTER TABLE app_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own app badges"
  ON app_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own app badges"
  ON app_badges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage app badges"
  ON app_badges FOR ALL
  USING (true)
  WITH CHECK (true);


-- ========================================
-- 8. BADGE MANAGEMENT FUNCTIONS
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


-- ========================================
-- 9. CREATE XP REWARDS CONFIG TABLE
-- ========================================

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

-- Add default XP rewards
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

-- RLS
ALTER TABLE xp_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view xp rewards"
  ON xp_rewards FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role can modify xp rewards"
  ON xp_rewards FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');


-- ========================================
-- 10. CREATE XP HISTORY TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_key TEXT,
  xp_amount INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_history_user_id 
ON xp_history (user_id);

CREATE INDEX IF NOT EXISTS idx_xp_history_created_at 
ON xp_history (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_xp_history_action_key 
ON xp_history (action_key);

-- RLS
ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own xp history"
  ON xp_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert xp history"
  ON xp_history FOR INSERT
  WITH CHECK (true);


-- ========================================
-- 11. GRANT PERMISSIONS
-- ========================================

GRANT EXECUTE ON FUNCTION calculate_next_level_xp TO authenticated;
GRANT EXECUTE ON FUNCTION award_xp TO authenticated;
GRANT EXECUTE ON FUNCTION update_app_badge TO authenticated;
GRANT EXECUTE ON FUNCTION clear_app_badge TO authenticated;


-- ========================================
-- MIGRATION COMPLETE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ DEWII Home Launcher Migration Complete!';
  RAISE NOTICE '  📊 Added to user_progress: home_layout_config, user_level, current_xp, total_xp, achievements';
  RAISE NOTICE '  🗄️  Created tables: app_usage_logs, app_badges, xp_rewards, xp_history';
  RAISE NOTICE '  ⚙️  Created functions: award_xp, update_app_badge, clear_app_badge, handle_level_up';
  RAISE NOTICE '  🔒 RLS policies enabled on all new tables';
END $$;
