# 🧪 Test Your Profile Data Connections

## Quick Test Checklist

### 1. Open Your Profile
- [ ] Click **ME** button (bottom nav)
- [ ] Click **My Profile**
- [ ] Profile loads without white screen

---

### 2. Check Profile Header
- [ ] Avatar shows (default gradient circle with initial if no upload)
- [ ] Display name shows ("Anonymous User" if not set)
- [ ] Trust Score badge displays (0 by default)
- [ ] Location shows if set
- [ ] Roles display as pills (if you added any)

---

### 3. Check ProfileStats (4 Data Cards)

#### Power Points Card (Yellow/Amber)
- [ ] Shows number (should match your reading activity)
- [ ] Shows "0" if you haven't read articles yet
- [ ] Hover effect works (gradient brightens)

#### NADA Balance Card (Emerald/Teal)
- [ ] Shows "0" (Phase 1 will activate)
- [ ] Gradient displays correctly
- [ ] Hover effect works

#### Days Active Card (Cyan/Blue)
- [ ] Shows days since signup
- [ ] Should be at least "0" for today
- [ ] Calculates correctly from created_at

#### Swaps Completed Card (Purple/Pink)
- [ ] Shows "0" (Phase 1 will activate)
- [ ] Gradient displays correctly
- [ ] Hover effect works

---

### 4. Check Overview Tab

#### If You've Read Articles:
- [ ] "Articles Read" card shows correct count
- [ ] XP calculation shows (count × 50)
- [ ] "Current Streak" card shows your streak
- [ ] "Longest Streak" displays below

#### If You Have Achievements:
- [ ] Achievement section shows count in header
- [ ] Achievement cards display in grid
- [ ] Names are formatted (First Read, not first-read)
- [ ] Star icons and gradients show

#### If You're a New User (No Progress):
- [ ] Empty state shows for achievements
- [ ] Message: "Start reading articles to unlock achievements!"
- [ ] Stats cards show "0"

---

### 5. Check Phase 1 Preview
- [ ] Purple/pink gradient card shows
- [ ] Lists upcoming features:
  - Activity timeline
  - Inventory management
  - Badge showcase
  - Analytics

---

### 6. Check Other Tabs
- [ ] **Inventory**: Shows "Coming in Phase 1" message
- [ ] **Activity**: Shows "Coming soon" message
- [ ] **Settings** (own profile only): Shows "Coming soon" message

---

## 🔍 Expected Console Logs

When you load your profile, you should see:

```
🔍 Starting profile load...
✅ Authenticated user: abc123-def456...
🔍 Loading profile for user_id: abc123-def456...
📊 Profile query result: { profileData: {...}, profileError: null }
✅ Profile loaded successfully: {...}
🔍 Loading user progress...
✅ User progress loaded: {...}
```

OR if you're a new user:

```
🔍 Starting profile load...
✅ Authenticated user: abc123-def456...
🔍 Loading profile for user_id: abc123-def456...
📊 Profile query result: { profileData: {...}, profileError: null }
✅ Profile loaded successfully: {...}
🔍 Loading user progress...
ℹ️ No user progress yet (new user)
```

---

## 🐛 Common Issues

### Issue: Stats Show Wrong Numbers
**Check in Supabase SQL Editor:**
```sql
-- Check your progress
SELECT * FROM user_progress WHERE user_id = auth.uid();

-- Expected columns:
-- points, total_articles_read, current_streak, longest_streak, achievements
```

### Issue: Days Active is 0 but I signed up yesterday
**Check created_at:**
```sql
SELECT 
  created_at,
  NOW() as current_time,
  EXTRACT(day FROM NOW() - created_at) as days_diff
FROM user_profiles 
WHERE user_id = auth.uid();
```

### Issue: Achievements Don't Show
**Check format:**
```sql
-- Achievements should be a JSON array
SELECT achievements FROM user_progress WHERE user_id = auth.uid();

-- Should look like: ["first-read", "reader-10"]
-- NOT like: "first-read,reader-10"
```

---

## ✅ Success State

When everything works, you should see:

```
┌─────────────────────────────────────────┐
│  [Avatar]  Your Name                    │
│  📍 City, 🏳️ Country                     │
│  Trust Score: 0                         │
│                                         │
│  ⚡ 150   💰 0   📅 2   📦 0            │
│                                         │
│  Overview Tab:                          │
│  📚 Articles Read: 3 (+150 XP)          │
│  🔥 Current Streak: 2 (Longest: 5)      │
│                                         │
│  🏆 Achievements (2):                   │
│  ⭐ First Read                           │
│  ⭐ Curious Mind                         │
│                                         │
│  🎁 Phase 1 Coming Soon...              │
└─────────────────────────────────────────┘
```

---

## 📸 Screenshot Areas to Verify

1. **Profile Header**: Avatar, name, location, trust badge
2. **Stats Grid**: All 4 cards with gradients
3. **Overview Tab**: Reading stats + achievements
4. **Tab Navigation**: All tabs present and working

---

## Next Steps After Testing

1. ✅ Verify all data displays correctly
2. ✅ Test Edit Profile functionality
3. ✅ Try adding roles and interests
4. ✅ Upload avatar (need to create storage bucket)
5. ✅ Read an article to see stats update
6. 🚀 **Phase 0 Complete!**

---

**Having issues?** Check `/TROUBLESHOOT_WHITE_SCREEN.md` for help!
