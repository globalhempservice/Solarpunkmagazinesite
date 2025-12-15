# 🔧 Troubleshooting White Screen

## Step 1: Open Browser Console

1. Press **F12** (or right-click → Inspect)
2. Click **Console** tab
3. Click **ME button** → **My Profile**
4. Look for colored emoji logs:

### What You Should See:

```
🔍 Starting profile load...
✅ Authenticated user: abc123...
🔍 Loading profile for user_id: abc123...
📊 Profile query result: { profileData: {...}, profileError: null }
✅ Profile loaded successfully: {...}
```

### If You See Error Messages:

---

## Error: "PGRST116" or "Profile not set up yet"

**Cause:** No `user_profiles` row exists for your account

**Fix:**
1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy/paste ALL of `/RUN_THIS_NOW.sql`
3. Click **RUN**
4. Refresh your app (F5)
5. Try again

---

## Error: "relation user_profiles does not exist"

**Cause:** The `user_profiles` table hasn't been created yet

**Fix:**
1. Run `/database_schemas/phase_0_user_profile_schema.sql` FIRST
2. Then run `/RUN_THIS_NOW.sql`
3. Refresh app

---

## Error: "column display_name does not exist"

**Cause:** Old schema version missing columns

**Fix:**
1. Run `/database_schemas/phase_0_user_profile_schema.sql`
2. This adds all missing columns
3. Then run `/RUN_THIS_NOW.sql`
4. Refresh app

---

## Error: Permission denied / RLS policy

**Cause:** Row-Level Security blocking access

**Fix:**
1. Go to Supabase → **Table Editor** → `user_profiles`
2. Click **RLS** tab
3. Make sure you have these policies:
   - "Users can view own profile"
   - "Users can update own profile"
4. Or temporarily disable RLS for testing

---

## Error: Network error / 401 Unauthorized

**Cause:** Not logged in or session expired

**Fix:**
1. Check if you're logged in
2. Try logging out and back in
3. Check Supabase project URL is correct
4. Check Supabase keys in `.env`

---

## Still White Screen with NO Errors?

This means JavaScript crashed before React error boundary caught it.

**Check:**
1. Any red errors in console?
2. Look in **Console** → **Sources** tab for crashed files
3. Check if ProfileStats, ProfileHeader, or ProfileTabs are imported correctly

**Common causes:**
- Missing import file
- Circular dependency
- Invalid JSX syntax

---

## Quick Test: Does Profile Table Exist?

Run this in Supabase SQL Editor:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
);

-- Check if YOUR row exists
SELECT * FROM user_profiles WHERE user_id = auth.uid();

-- Count all profiles
SELECT COUNT(*) FROM user_profiles;
```

You should see:
- Table exists: `true`
- Your row: Shows your profile data
- Count: At least 1

---

## After Running SQL, Profile Shows:

```
┌──────────────────────────────────┐
│  U  Anonymous User               │ ← Default until you edit
│                                  │
│  Trust Score: 0                  │
│                                  │
│  Power Points: 0                 │
│  NADA Balance: 0                 │
│  Days Active: 0                  │
│  Swaps Completed: 0              │
└──────────────────────────────────┘
```

Then click **Edit Profile** to customize!

---

## Next Step After It Works:

1. ✅ Profile loads
2. Click **Edit Profile**
3. Test uploading avatar (need to create bucket first)
4. Save profile
5. Verify changes persist

---

**Share the console logs if still stuck!** The emoji logs will help debug. 🐛
