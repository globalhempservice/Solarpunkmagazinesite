# 🔧 FIX PROFILE PAGE NOW (5 Minutes)

## The Problem
Your ME drawer works ✅, but clicking "My Profile" gets stuck because your user doesn't have a `user_profiles` row yet.

## The Solution
Run one SQL script to auto-create profiles for all users.

---

## 🎯 Step 1: Open Supabase SQL Editor

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **"SQL Editor"** in left sidebar
4. Click **"New query"** button

---

## 📝 Step 2: Paste This SQL

**Copy this entire block:**

```sql
-- ============================================================================
-- PHASE 0: AUTO-CREATE USER PROFILE TRIGGER
-- Creates profiles for all existing users + auto-creates for new signups
-- ============================================================================

-- 1. Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    display_name,
    trust_score,
    id_verified,
    phone_verified
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    0,
    false,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create trigger for future signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. BACKFILL: Create profiles for ALL existing users right now
INSERT INTO public.user_profiles (id, display_name, trust_score, id_verified, phone_verified)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'display_name', SPLIT_PART(au.email, '@', 1)),
  0,
  false,
  false
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
);

-- 5. VERIFY: Check that it worked
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM user_profiles) as total_profiles,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM user_profiles)
    THEN '✅ SUCCESS! All users have profiles'
    ELSE '⚠️  Mismatch - check logs'
  END as status;
```

---

## ▶️ Step 3: Run It

1. Click **"RUN"** button (bottom right)
2. Wait 2-5 seconds
3. You should see output like:
   ```
   total_users | total_profiles | status
   -----------|----------------|-------------------------
   5          | 5              | ✅ SUCCESS! All users have profiles
   ```

---

## ✅ Step 4: Verify Your Profile

Run this query to check YOUR profile specifically:

```sql
SELECT 
  id,
  display_name,
  avatar_url,
  bio,
  trust_score,
  created_at
FROM user_profiles 
WHERE id = auth.uid();
```

You should see:
- ✅ Your user ID
- ✅ Display name (based on your email)
- ✅ trust_score: 0
- ✅ Other fields: NULL (that's okay!)

---

## 🎉 Step 5: Test Profile Page

1. Go back to your app
2. **Refresh the page** (F5)
3. Click **ME button** (center purple)
4. Click **"My Profile"**
5. 🎊 **Profile should load now!**

You'll see:
- Banner with gradient
- Avatar placeholder (gradient circle with your initial)
- Your display name
- Trust score badge (New User, score 0)
- 4 stats cards (all zeros for now)
- Tabs (Overview active)

---

## 🖼️ What You Should See

```
┌─────────────────────────────────────────┐
│ ═══════════════════════════════════════ │ ← Gradient banner
│                                         │
│   ┌───┐                                 │
│   │ J │  john (from john@email.com)    │ ← Initial + name
│   └───┘                                 │
│         🛡️ New User · 0                 │ ← Trust badge
│                                         │
│   ┌────────┐ ┌────────┐ ┌────────┐    │
│   │ ⚡ 0   │ │ 💰 0   │ │ 📅 0   │    │ ← Stats
│   └────────┘ └────────┘ └────────┘    │
│                                         │
│   Overview │ Inventory [Soon]          │ ← Tabs
│   ═════════                             │
└─────────────────────────────────────────┘
```

---

## 🎨 Next: Complete Your Profile

1. Click **"Edit Profile"** button
2. Upload an avatar (JPG/PNG, max 2MB)
3. Set a better display name
4. Write a bio
5. Add location (country, city)
6. Select roles (e.g., Consumer, Professional)
7. Select interests (e.g., Textiles, Sustainability)
8. Click **"Save Changes"**
9. ✅ See success toast
10. ✅ Modal closes
11. ✅ Profile refreshes with your data

---

## 📦 Don't Forget: Avatars Bucket

If you haven't created the `avatars` storage bucket yet:

1. **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Settings:
   - **Name:** `avatars`
   - **Public:** ✅ **YES** (important!)
   - **File size limit:** 2097152 (2MB)
4. Click **"Create bucket"**

Without this, avatar upload will fail!

---

## 🐛 Still Not Working?

### Profile page blank or error?

**Check browser console (F12):**
- Look for red errors
- Should see: `✅ Profile loaded successfully: {...}`
- If error, share the message

**Check database:**
```sql
-- Does your profile exist?
SELECT * FROM user_profiles WHERE id = auth.uid();

-- If no results, run:
INSERT INTO user_profiles (id, display_name, trust_score)
VALUES (auth.uid(), 'Your Name', 0);
```

### Edit modal not opening?

**Check:**
1. "Edit Profile" button visible?
2. Click it - anything in console?
3. Profile data loaded? (check console logs)

### Avatar upload fails?

**Check:**
1. Avatars bucket exists?
2. Bucket is PUBLIC? (not private)
3. File size < 2MB?
4. File type is image?

---

## 📊 Phase 0 Completion Status

After fixing the profile:

```
✅ ME Drawer working
✅ Profile page loading
⏳ Edit profile modal (test next)
⏳ Avatar upload (needs bucket)
⏳ Save profile data
⏳ Full testing

Next Steps:
1. Fix profile ← YOU ARE HERE
2. Create avatars bucket
3. Test edit modal
4. Upload avatar
5. Save data
6. Phase 0 complete! 🎉
```

---

## ⏱️ Time Estimate

- Run SQL: 2 minutes
- Verify: 1 minute
- Test profile: 2 minutes
- **Total: 5 minutes**

---

## 🎯 Success Criteria

**Profile page is fixed when:**
- [ ] SQL script runs successfully
- [ ] Verification shows counts match
- [ ] Your profile exists in database
- [ ] Profile page loads (no errors)
- [ ] See banner, avatar, name, trust badge
- [ ] See 4 stats cards
- [ ] "Edit Profile" button visible

**All checked?** ✅ Profile is working! Move to testing edit modal.

---

## 📞 Quick Reference

**SQL to create your profile manually:**
```sql
INSERT INTO user_profiles (id, display_name, trust_score)
VALUES (auth.uid(), 'Your Name Here', 0);
```

**SQL to check if profile exists:**
```sql
SELECT COUNT(*) FROM user_profiles WHERE id = auth.uid();
-- Should return: 1
```

**SQL to see all your data:**
```sql
SELECT * FROM user_profiles WHERE id = auth.uid();
SELECT * FROM user_roles WHERE user_id = auth.uid();
SELECT * FROM user_interests WHERE user_id = auth.uid();
```

---

**Ready?** Open Supabase SQL Editor and paste that script! 🚀

Let me know when it's done and I'll help you test the edit profile next!
