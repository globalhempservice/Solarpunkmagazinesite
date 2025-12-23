# 🔄 User Data Migration Guide - Old Points/Levels → Unified Gamification

**Date:** December 18, 2024  
**Purpose:** Migrate existing user activity data to the new unified gamification system

---

## 📋 Overview

You have users with existing points, articles read, and streaks in the **old system**. We need to:

1. ✅ **Preserve their old HEMP points** (move from `points` → `total_points`)
2. ✅ **Calculate equivalent XP** from their activity history
3. ✅ **Assign appropriate levels** based on total XP earned
4. ✅ **Unlock achievements** they've already earned
5. ✅ **Keep all existing data intact** (no data loss)

---

## 🎯 Migration Strategy

### **Old System → New System Mapping:**

| Old Column | New Column | Conversion |
|------------|------------|------------|
| `points` | `total_points` | 1:1 (preserve exact value) |
| N/A | `total_xp` | Calculate from activities |
| N/A | `user_level` | Calculate from total XP |
| N/A | `current_xp` | Progress toward next level |
| `total_articles_read` | `articles_read` | 1:1 copy |

### **XP Calculation Formula:**

```
Total XP = 
  (articles_read × 10) +           // 10 XP per article
  (old_points ÷ 5) +               // Conservative conversion
  + Streak bonuses:
    - 3-day streak: +25 XP
    - 7-day streak: +100 XP
    - 30-day streak: +500 XP
```

### **Level Calculation:**

Based on the formula: `XP_needed = CEIL(100 × level^1.5 / 50) × 50`

| Level | XP Required | Cumulative XP |
|-------|-------------|---------------|
| 1 → 2 | 100 XP | 100 |
| 2 → 3 | 250 XP | 350 |
| 3 → 4 | 350 XP | 700 |
| 4 → 5 | 450 XP | 1,150 |
| 5 → 6 | 550 XP | 1,700 |
| 10 → 11 | 1,000 XP | ~6,500 |
| 25 → 26 | 2,000 XP | ~32,000 |

---

## 🚀 Step-by-Step Migration Process

### **Step 1: Check Current Data (REQUIRED)**

Run this query to preview what will happen:

```bash
# In Supabase SQL Editor, run:
check-old-user-data.sql
```

**What to review:**
- ✅ How many users need migration
- ✅ Total old points in system
- ✅ Estimated XP/levels after migration
- ✅ Which achievements will unlock

**Example output:**
```
total_users: 50
users_with_activity: 35
users_already_migrated: 0
users_need_migration: 35
total_old_points_in_system: 45,230
```

---

### **Step 2: Review Sample Users**

Check the preview table for your top users:

```
user_id_short | old_points | articles_read | estimated_xp | estimated_level
abc123...     | 5,000      | 42            | 1,420       | 5
def456...     | 2,500      | 18            | 680         | 3
```

**Does this look reasonable?** 
- ✅ Active users should be Level 3-7
- ✅ Power users might be Level 8-12
- ✅ New users stay at Level 1

---

### **Step 3: Run Migration (When Ready)**

```bash
# In Supabase SQL Editor, run:
migrate-old-user-data.sql
```

**This script will:**
1. ✅ Migrate all user data (preserves old points)
2. ✅ Calculate XP and levels
3. ✅ Trigger achievement checks
4. ✅ Generate detailed logs
5. ✅ Show final report

**Expected runtime:** ~5-30 seconds for 100 users

---

### **Step 4: Verify Results**

After migration, check the results:

```sql
-- Your migrated users
SELECT 
  LEFT(user_id::TEXT, 12) AS user,
  user_level AS lvl,
  total_xp AS xp,
  total_points AS hemp,
  articles_read,
  (SELECT COUNT(*) FROM user_achievements ua 
   WHERE ua.user_id = up.user_id AND ua.is_completed = TRUE) AS achievements
FROM user_progress up
WHERE total_xp > 0
ORDER BY total_xp DESC
LIMIT 10;
```

**Example expected output:**
```
user        | lvl | xp   | hemp  | articles | achievements
abc123...   | 5   | 1420 | 5000  | 42       | 8
def456...   | 3   | 680  | 2500  | 18       | 5
```

---

## 📊 What Achievements Will Unlock?

The migration will **retroactively award** achievements based on user history:

### **Reading Achievements:**
- ✅ **First Reader** (1 article) → +10 XP, +50 Points
- ✅ **Bookworm** (10 articles) → +50 XP, +200 Points
- ✅ **Scholar** (50 articles) → +200 XP, +1,000 Points
- ✅ **Sage** (100 articles) → +500 XP, +2,500 Points

### **Streak Achievements:**
- ✅ **Getting Started** (3-day) → +25 XP, +100 Points
- ✅ **Week Warrior** (7-day) → +100 XP, +500 Points
- ✅ **Dedicated Reader** (30-day) → +500 XP, +2,500 Points

### **Level Achievements:**
- ✅ **Rising Star** (Level 10) → +100 XP, +500 Points
- ✅ **Expert** (Level 25) → +250 XP, +1,250 Points

**Note:** Users will get **instant XP/Points** when achievements unlock! 🎉

---

## 🔍 Migration Logs

The migration script provides detailed logging:

```
========================================
MIGRATION STATUS CHECK
========================================
Total users in database: 50
Users with old points data: 35
Users already migrated: 0
========================================

========================================
STARTING USER DATA MIGRATION
========================================
User abc123...: Points: 5000 → Level: 5, XP: 1420
User def456...: Points: 2500 → Level: 3, XP: 680
Migrated 10 users...
Migrated 20 users...

========================================
MIGRATION COMPLETE!
Total users migrated: 35
========================================

========================================
CHECKING ACHIEVEMENTS FOR ALL USERS
========================================
User abc123...: Unlocked 8 achievements: [...]
User def456...: Unlocked 5 achievements: [...]
Checked 25 users...

========================================
ACHIEVEMENT CHECK COMPLETE!
Total users checked: 35
========================================

========================================
FINAL MIGRATION REPORT
========================================
Users migrated: 35
Total achievements unlocked: 142
Average user level: 4.2
Average user XP: 893
========================================
```

---

## ⚠️ Safety Features

### **The migration is SAFE because:**

1. ✅ **No data deletion** - All old columns preserved
2. ✅ **GREATEST() function** - Only increases values, never decreases
3. ✅ **Idempotent** - Can run multiple times safely
4. ✅ **Preview first** - `check-old-user-data.sql` lets you review before migrating
5. ✅ **Logged output** - Full audit trail of all changes

### **If something goes wrong:**

```sql
-- Reset a specific user to Level 1
UPDATE user_progress
SET user_level = 1, current_xp = 0, total_xp = 0
WHERE user_id = 'user-uuid-here';

-- Re-run achievement check for specific user
SELECT check_and_award_achievements('user-uuid-here');
```

---

## 🎮 After Migration - User Experience

**Your users will see:**

### **On Home Page:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Welcome back, Alice! 👋
    
    Level 5 ━━━━━━━━━━━◯━━━━━ 420/550 XP
    
    🏆 8 achievements unlocked
    🌿 42 articles read
    🔥 7-day streak
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### **Achievement Unlocks:**
When they next login, the system will:
1. ✅ Check their progress
2. ✅ Show celebration toasts for new achievements
3. ✅ Award bonus XP/Points
4. ✅ Update their profile

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `check-old-user-data.sql` | Preview migration (run FIRST) |
| `migrate-old-user-data.sql` | Execute migration (run SECOND) |
| `USER_DATA_MIGRATION_GUIDE.md` | This guide |

---

## 🧪 Testing Checklist

Before running on production:

- [ ] Run `check-old-user-data.sql` and review output
- [ ] Verify estimated XP/levels look reasonable
- [ ] Check that total_old_points matches expectations
- [ ] Confirm users_need_migration count is correct
- [ ] Run migration on a test user first (if possible)
- [ ] Review migration logs for errors
- [ ] Query `user_progress_complete` view to verify
- [ ] Test frontend to ensure home page shows correct data
- [ ] Check browser console for XP/achievement logs

---

## 🚨 Troubleshooting

### **Issue: "Column 'points' does not exist"**
✅ This is **GOOD** - means old column was already migrated  
➡️ The script uses `COALESCE()` to handle this gracefully

### **Issue: "Users have 0 XP after migration"**
Check if old data exists:
```sql
SELECT COUNT(*) FROM user_progress 
WHERE total_articles_read > 0 OR points > 0;
```

If 0 results, there was no old data to migrate.

### **Issue: "Achievement check function not found"**
Run the main gamification migration first:
```sql
-- From GAMIFICATION_INTEGRATION_COMPLETE.md
-- The complete achievement system SQL
```

---

## 📈 Expected Results

After migration, you should see:

### **Database:**
- ✅ All users have `user_level >= 1`
- ✅ All users with activity have `total_xp > 0`
- ✅ Old `points` preserved in `total_points`
- ✅ 100+ achievements unlocked across all users

### **Frontend:**
- ✅ Home page shows real levels/XP bars
- ✅ Achievement counts appear correctly
- ✅ User progress persists across sessions
- ✅ New activities earn XP and level up users

---

## ✅ Next Steps After Migration

1. **Test the home page** - Refresh and check the launcher widget
2. **Read an article** - Verify XP increases
3. **Check achievements page** - See newly unlocked achievements
4. **Monitor logs** - Watch for XP/achievement notifications
5. **Celebrate!** 🎉 Your users now have levels!

---

## 🔧 Manual XP Award (for testing)

Want to test the system with a specific user?

```sql
-- Give user 500 XP and trigger level-up check
UPDATE user_progress
SET total_xp = total_xp + 500
WHERE user_id = 'your-test-user-id';

-- This will auto-calculate level and trigger achievements
```

---

## 📞 Support

If you see unexpected results:
1. Check the migration logs in Supabase SQL output
2. Query `user_progress_complete` view for that user
3. Verify `check_and_award_achievements()` function exists
4. Check if achievements table has 22 achievements

---

## 🎯 Summary

**Run these in order:**

1. ✅ `check-old-user-data.sql` - Preview (safe to run)
2. ✅ Review output - Make sure it looks good
3. ✅ `migrate-old-user-data.sql` - Execute migration
4. ✅ Refresh your app - See real levels!

**You're about to give all your users their earned levels! 🚀🎮**
