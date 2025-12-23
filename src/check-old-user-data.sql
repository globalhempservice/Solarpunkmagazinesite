-- ============================================================================
-- CHECK OLD USER DATA - See what will be migrated
-- Run this FIRST to see your current data before migration
-- ============================================================================

-- 1. Check if 'points' column still exists
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_progress'
  AND column_name IN ('points', 'total_points', 'total_xp', 'user_level', 'current_xp')
ORDER BY column_name;


-- 2. Show all users with old points/activity data
SELECT 
  LEFT(user_id::TEXT, 12) AS user_id_short,
  
  -- OLD SYSTEM (what we're migrating FROM)
  COALESCE(points, 0) AS old_points,
  COALESCE(total_articles_read, 0) AS articles_read,
  COALESCE(current_streak, 0) AS current_streak,
  COALESCE(longest_streak, 0) AS longest_streak,
  
  -- NEW SYSTEM (what we're migrating TO)
  COALESCE(total_points, 0) AS new_hemp_points,
  COALESCE(total_xp, 0) AS new_total_xp,
  COALESCE(user_level, 1) AS new_level,
  COALESCE(current_xp, 0) AS new_current_xp,
  
  -- ARTICLES ACTIVITY
  COALESCE(articles_created, 0) AS articles_created,
  COALESCE(articles_shared, 0) AS articles_shared,
  COALESCE(articles_liked, 0) AS articles_liked,
  
  -- STATUS
  CASE 
    WHEN total_xp > 0 THEN '✅ Migrated'
    WHEN points > 0 OR total_articles_read > 0 THEN '⚠️ Needs Migration'
    ELSE '🆕 New User'
  END AS migration_status
  
FROM user_progress
ORDER BY 
  COALESCE(points, 0) + COALESCE(total_articles_read, 0) DESC
LIMIT 50;


-- 3. Summary statistics
SELECT 
  COUNT(*) AS total_users,
  COUNT(*) FILTER (WHERE points > 0 OR total_articles_read > 0) AS users_with_activity,
  COUNT(*) FILTER (WHERE total_xp > 0) AS users_already_migrated,
  COUNT(*) FILTER (WHERE (points > 0 OR total_articles_read > 0) AND total_xp = 0) AS users_need_migration,
  SUM(COALESCE(points, 0)) AS total_old_points_in_system,
  SUM(COALESCE(total_xp, 0)) AS total_new_xp_in_system,
  ROUND(AVG(COALESCE(total_articles_read, 0)), 1) AS avg_articles_read_per_user
FROM user_progress;


-- 4. Show what XP each user WOULD get (preview calculation)
SELECT 
  LEFT(user_id::TEXT, 12) AS user_id_short,
  COALESCE(points, 0) AS current_old_points,
  COALESCE(total_articles_read, 0) AS articles_read,
  
  -- CALCULATED XP PREVIEW (what they'll get after migration)
  (
    (COALESCE(total_articles_read, 0) * 10) + -- 10 XP per article read
    (COALESCE(points, 0) / 5) + -- Convert old points to XP (~5 points = 1 XP)
    CASE WHEN COALESCE(current_streak, 0) >= 30 THEN 625 ELSE 0 END + -- Streak achievements
    CASE WHEN COALESCE(current_streak, 0) >= 7 THEN 125 ELSE 0 END +
    CASE WHEN COALESCE(current_streak, 0) >= 3 THEN 25 ELSE 0 END
  ) AS estimated_xp_after_migration,
  
  -- ESTIMATED LEVEL (rough approximation)
  CASE 
    WHEN (COALESCE(total_articles_read, 0) * 10 + COALESCE(points, 0) / 5) < 100 THEN 1
    WHEN (COALESCE(total_articles_read, 0) * 10 + COALESCE(points, 0) / 5) < 350 THEN 2
    WHEN (COALESCE(total_articles_read, 0) * 10 + COALESCE(points, 0) / 5) < 700 THEN 3
    WHEN (COALESCE(total_articles_read, 0) * 10 + COALESCE(points, 0) / 5) < 1150 THEN 4
    WHEN (COALESCE(total_articles_read, 0) * 10 + COALESCE(points, 0) / 5) < 1700 THEN 5
    WHEN (COALESCE(total_articles_read, 0) * 10 + COALESCE(points, 0) / 5) < 2350 THEN 6
    WHEN (COALESCE(total_articles_read, 0) * 10 + COALESCE(points, 0) / 5) < 3100 THEN 7
    ELSE FLOOR((COALESCE(total_articles_read, 0) * 10 + COALESCE(points, 0) / 5) / 500) + 1
  END AS estimated_level_after_migration,
  
  COALESCE(total_xp, 0) AS current_xp_in_db
  
FROM user_progress
WHERE COALESCE(points, 0) > 0 
   OR COALESCE(total_articles_read, 0) > 0
ORDER BY estimated_xp_after_migration DESC
LIMIT 20;


-- 5. Check if any users will unlock achievements
SELECT 
  'Achievement' AS type,
  achievement_id,
  name,
  description,
  xp_reward,
  points_reward,
  requirement_type,
  requirement_value,
  (
    SELECT COUNT(*) 
    FROM user_progress up
    WHERE 
      CASE requirement_type
        WHEN 'articles_read' THEN COALESCE(up.total_articles_read, 0) >= (requirement_value::TEXT)::INTEGER
        WHEN 'current_streak' THEN COALESCE(up.current_streak, 0) >= (requirement_value::TEXT)::INTEGER
        WHEN 'articles_created' THEN COALESCE(up.articles_created, 0) >= (requirement_value::TEXT)::INTEGER
        ELSE FALSE
      END
  ) AS users_who_will_unlock
FROM achievements
WHERE category IN ('reading', 'streaks', 'creation')
ORDER BY (requirement_value::TEXT)::INTEGER;


-- ============================================================================
-- 📊 WHAT TO LOOK FOR:
--
-- Query 1: Check if columns exist
-- - Should see: points, total_points, total_xp, user_level, current_xp
--
-- Query 2: Your user data
-- - Look for "⚠️ Needs Migration" users
-- - These are users with old_points > 0 but new_total_xp = 0
--
-- Query 3: Summary
-- - users_need_migration = how many will be updated
-- - total_old_points_in_system = total HEMP points to preserve
--
-- Query 4: XP Preview
-- - Shows what each user will get after migration
-- - Check if the estimated levels look reasonable
--
-- Query 5: Achievement Preview
-- - Shows which achievements users will unlock
-- - "users_who_will_unlock" = how many will get each achievement
--
-- ✅ If everything looks good, run: migrate-old-user-data.sql
-- ============================================================================
