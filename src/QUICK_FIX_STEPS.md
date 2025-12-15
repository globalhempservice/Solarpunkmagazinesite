# ⚡ QUICK FIX - White Screen (2 Minutes)

## Step 1: Check Browser Console (30 seconds)
Press **F12** → **Console** tab → Try loading profile again

Look for:
- 🔍 Starting profile load...
- ❌ Error messages (if any)

---

## Step 2: Run SQL Script (1 minute)

### If you see "Profile not set up yet" or PGRST116 error:

1. **Supabase Dashboard** → **SQL Editor**
2. **New Query**
3. Copy/paste from `/RUN_THIS_NOW.sql`
4. **RUN**
5. Wait for ✅ success

---

## Step 3: Test (30 seconds)

1. **Refresh app** (F5 or Ctrl+R)
2. Click **ME** button
3. Click **My Profile**
4. ✅ **Should work!**

---

## What You'll See After Fix:

```
╔════════════════════════════════════╗
║  Gradient Banner                   ║
║                                    ║
║  [U]  Anonymous User               ║
║       Trust Score: 0               ║
║                                    ║
║  ⚡0  💰0  📅0  📦0                ║
║                                    ║
║  [Edit Profile] button             ║
╚════════════════════════════════════╝
```

---

## If Still White Screen:

1. Check `/TROUBLESHOOT_WHITE_SCREEN.md`
2. Share console logs
3. Check if `user_profiles` table exists in Supabase

---

## After It Works:

- [ ] Profile loads ✅
- [ ] Create `avatars` bucket
- [ ] Test Edit Profile
- [ ] Upload avatar
- [ ] Add bio, location, roles
- [ ] Save and verify
- [ ] **Phase 0 DONE!** 🎉

---

**Most Common Issue:** Forgetting to run `/RUN_THIS_NOW.sql` 
**Fix:** Run it now! Takes 30 seconds. 🚀
