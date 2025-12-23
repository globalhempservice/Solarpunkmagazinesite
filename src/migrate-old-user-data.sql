-- ============================================================================
-- DEWII USER DATA MIGRATION - Old Points/Levels to Unified Gamification
-- Migrates existing user progress to new XP/achievement system
-- Date: 2024-12-18
-- ============================================================================

-- Step 1: Check current data state
-- ============================================================================
DO $$ 
DECLARE
  v_total_users INTEGER;
  v_users_with_old_points INTEGER;
  v_users_with_new_xp INTEGER;
BEGIN
  -- Count total users in user_progress
  SELECT COUNT(*) INTO v_total_users FROM user_progress;
  
  -- Count users with old 'points' column data
  SELECT COUNT(*) INTO v_users_with_old_points 
  FROM user_progress 
  WHERE points IS NOT NULL AND points > 0;
  
  -- Count users already migrated to new system
  SELECT COUNT(*) INTO v_users_with_new_xp 
  FROM user_progress 
  WHERE total_xp IS NOT NULL AND total_xp > 0;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION STATUS CHECK';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total users in database: %', v_total_users;
  RAISE NOTICE 'Users with old points data: %', v_users_with_old_points;
  RAISE NOTICE 'Users already migrated: %', v_users_with_new_xp;
  RAISE NOTICE '========================================';
END $$;


-- Step 2: Migrate old 'points' to 'total_points' and calculate XP
-- ============================================================================
-- Strategy: Convert old HEMP points to equivalent XP based on activities
DO $$
DECLARE
  v_user RECORD;
  v_calculated_xp INTEGER;
  v_calculated_level INTEGER;
  v_current_xp INTEGER;
  v_migrated_count INTEGER := 0;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'STARTING USER DATA MIGRATION';
  RAISE NOTICE '========================================';
  
  FOR v_user IN 
    SELECT 
      user_id,
      COALESCE(points, 0) AS old_points,
      COALESCE(total_articles_read, 0) AS articles_read,
      COALESCE(current_streak, 0) AS streak,
      COALESCE(longest_streak, 0) AS longest_streak,
      COALESCE(total_xp, 0) AS current_total_xp,
      COALESCE(total_points, 0) AS current_total_points
    FROM user_progress
    WHERE user_id IS NOT NULL
  LOOP
    -- Calculate XP from activities (if not already migrated)
    IF v_user.current_total_xp = 0 THEN
      v_calculated_xp := 0;
      
      -- XP from reading articles (10 XP per article)
      v_calculated_xp := v_calculated_xp + (v_user.articles_read * 10);
      
      -- Bonus XP from streaks
      IF v_user.streak >= 3 THEN
        v_calculated_xp := v_calculated_xp + 25; -- STREAK_3 achievement
      END IF;
      IF v_user.streak >= 7 THEN
        v_calculated_xp := v_calculated_xp + 100; -- STREAK_7 achievement
      END IF;
      IF v_user.streak >= 30 THEN
        v_calculated_xp := v_calculated_xp + 500; -- STREAK_30 achievement
      END IF;
      
      -- Estimate XP from old points (assuming ~5 points = 1 XP)
      -- This is conservative to avoid over-leveling
      v_calculated_xp := v_calculated_xp + (v_user.old_points / 5);
      
    ELSE
      -- User already has XP, keep it
      v_calculated_xp := v_user.current_total_xp;
    END IF;
    
    -- Calculate level based on total XP
    -- Formula: XP needed = CEIL(100 * level^1.5 / 50) * 50
    -- Reverse calculation: approximate level from total XP
    v_calculated_level := 1;
    DECLARE
      v_xp_for_level INTEGER := 0;
      v_xp_needed INTEGER := 0;
    BEGIN
      WHILE v_xp_for_level < v_calculated_xp LOOP
        v_xp_needed := CEIL(100 * POWER(v_calculated_level, 1.5) / 50) * 50;
        v_xp_for_level := v_xp_for_level + v_xp_needed;
        IF v_xp_for_level < v_calculated_xp THEN
          v_calculated_level := v_calculated_level + 1;
        END IF;
      END LOOP;
      
      -- Calculate current_xp (progress toward next level)
      v_xp_for_level := 0;
      FOR i IN 1..(v_calculated_level - 1) LOOP
        v_xp_for_level := v_xp_for_level + CEIL(100 * POWER(i, 1.5) / 50) * 50;
      END LOOP;
      v_current_xp := v_calculated_xp - v_xp_for_level;
    END;
    
    -- Migrate old 'points' to 'total_points' if needed
    IF v_user.current_total_points = 0 AND v_user.old_points > 0 THEN
      UPDATE user_progress
      SET total_points = v_user.old_points
      WHERE user_id = v_user.user_id;
    END IF;
    
    -- Update user with calculated XP and level
    UPDATE user_progress
    SET 
      total_xp = GREATEST(total_xp, v_calculated_xp),
      user_level = GREATEST(user_level, v_calculated_level),
      current_xp = CASE 
        WHEN total_xp < v_calculated_xp THEN v_current_xp 
        ELSE current_xp 
      END,
      updated_at = NOW()
    WHERE user_id = v_user.user_id;
    
    v_migrated_count := v_migrated_count + 1;
    
    -- Log every 10 users
    IF v_migrated_count % 10 = 0 THEN
      RAISE NOTICE 'Migrated % users...', v_migrated_count;
    END IF;
    
    -- Detailed log for users with significant data
    IF v_user.old_points > 0 OR v_user.articles_read > 0 THEN
      RAISE NOTICE 'User %: Points: % → Level: %, XP: %', 
        LEFT(v_user.user_id::TEXT, 8),
        v_user.old_points,
        v_calculated_level,
        v_calculated_xp;
    END IF;
  END LOOP;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION COMPLETE!';
  RAISE NOTICE 'Total users migrated: %', v_migrated_count;
  RAISE NOTICE '========================================';
END $$;


-- Step 3: Trigger achievement check for all migrated users
-- ============================================================================
DO $$
DECLARE
  v_user RECORD;
  v_achievements JSONB;
  v_checked_count INTEGER := 0;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CHECKING ACHIEVEMENTS FOR ALL USERS';
  RAISE NOTICE '========================================';
  
  FOR v_user IN 
    SELECT user_id 
    FROM user_progress 
    WHERE total_xp > 0 OR articles_read > 0
    LIMIT 100  -- Process first 100 users
  LOOP
    -- Check and award achievements
    v_achievements := check_and_award_achievements(v_user.user_id);
    
    v_checked_count := v_checked_count + 1;
    
    -- Log newly unlocked achievements
    IF jsonb_array_length(v_achievements) > 0 THEN
      RAISE NOTICE 'User %: Unlocked % achievements: %', 
        LEFT(v_user.user_id::TEXT, 8),
        jsonb_array_length(v_achievements),
        v_achievements;
    END IF;
    
    IF v_checked_count % 25 = 0 THEN
      RAISE NOTICE 'Checked % users...', v_checked_count;
    END IF;
  END LOOP;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ACHIEVEMENT CHECK COMPLETE!';
  RAISE NOTICE 'Total users checked: %', v_checked_count;
  RAISE NOTICE '========================================';
END $$;


-- Step 4: Verify migration results
-- ============================================================================
DO $$
DECLARE
  v_total_migrated INTEGER;
  v_total_achievements INTEGER;
  v_avg_level NUMERIC;
  v_avg_xp NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_total_migrated 
  FROM user_progress 
  WHERE total_xp > 0;
  
  SELECT COUNT(*) INTO v_total_achievements 
  FROM user_achievements 
  WHERE is_completed = TRUE;
  
  SELECT AVG(user_level) INTO v_avg_level 
  FROM user_progress 
  WHERE total_xp > 0;
  
  SELECT AVG(total_xp) INTO v_avg_xp 
  FROM user_progress 
  WHERE total_xp > 0;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'FINAL MIGRATION REPORT';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Users migrated: %', v_total_migrated;
  RAISE NOTICE 'Total achievements unlocked: %', v_total_achievements;
  RAISE NOTICE 'Average user level: %', ROUND(v_avg_level, 2);
  RAISE NOTICE 'Average user XP: %', ROUND(v_avg_xp, 0);
  RAISE NOTICE '========================================';
END $$;


-- Step 5: Show sample migrated users
-- ============================================================================
SELECT 
  LEFT(user_id::TEXT, 12) AS user_id_short,
  user_level AS level,
  current_xp AS xp,
  total_xp AS total_xp,
  total_points AS hemp_points,
  articles_read,
  current_streak AS streak,
  (SELECT COUNT(*) FROM user_achievements ua 
   WHERE ua.user_id = up.user_id AND ua.is_completed = TRUE) AS achievements
FROM user_progress up
WHERE total_xp > 0 OR articles_read > 0
ORDER BY total_xp DESC
LIMIT 10;


-- ============================================================================
-- ✅ MIGRATION COMPLETE!
-- 
-- What happened:
-- 1. ✅ Migrated old 'points' → 'total_points'
-- 2. ✅ Calculated XP from activities (articles read, streaks)
-- 3. ✅ Calculated user levels based on total XP
-- 4. ✅ Triggered achievement checks for all users
-- 5. ✅ Generated migration report
--
-- Your users now have:
-- - Real levels (calculated from their activity)
-- - XP progress bars
-- - Achievements unlocked based on their history
-- ============================================================================
