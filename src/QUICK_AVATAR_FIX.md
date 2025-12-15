# ⚡ Quick Avatar Fix - 2 Minutes

## The Problem
```
Error: StorageApiError: new row violates row-level security policy
```

## The Solution (UI Method - No SQL!)

---

## 🎯 Part 1: Create Bucket (30 seconds)

**Go to**: Supabase Dashboard → **Storage** → **New bucket**

**Settings**:
- Name: `avatars`
- Public: **✅ ON** (important!)
- Click **Create**

---

## 🔐 Part 2: Add 4 Policies (90 seconds)

**Go to**: Storage → **avatars** → **Policies** tab → **New Policy**

### Policy #1: Let Everyone View
```
Name: Anyone can view avatars
Type: SELECT
For: public
Expression: bucket_id = 'avatars'
```

### Policy #2: Let Users Upload
```
Name: Users can upload avatars
Type: INSERT
For: authenticated
Expression: bucket_id = 'avatars'
```

### Policy #3: Let Users Update
```
Name: Users can update avatars
Type: UPDATE
For: authenticated
USING: bucket_id = 'avatars'
WITH CHECK: bucket_id = 'avatars'
```

### Policy #4: Let Users Delete
```
Name: Users can delete avatars
Type: DELETE
For: authenticated
Expression: bucket_id = 'avatars'
```

---

## ✅ Test It

1. Refresh your app
2. ME → My Profile → Edit Profile
3. Upload an avatar
4. Save
5. **Should work!** ✅

---

## Shortcut Method

When creating policies, look for these **template options**:

1. "Enable read access to everyone" → SELECT ✅
2. "Enable insert for authenticated users only" → INSERT ✅
3. "Enable update for authenticated users only" → UPDATE ✅
4. "Enable delete for authenticated users only" → DELETE ✅

Just click the template, verify `bucket_id = 'avatars'`, and save!

---

## What Each Policy Does

| Policy | What It Allows | Who |
|--------|---------------|-----|
| SELECT | View/display avatars | Everyone (public) |
| INSERT | Upload new avatars | Logged-in users |
| UPDATE | Replace existing avatars | Logged-in users |
| DELETE | Remove old avatars | Logged-in users |

---

## Verification

After setup, in the Policies tab you should see:

```
Policies (4)
├── Anyone can view avatars         [SELECT]
├── Users can upload avatars        [INSERT]
├── Users can update avatars        [UPDATE]
└── Users can delete avatars        [DELETE]
```

---

## Still Not Working?

**Check bucket is public:**
- Storage → avatars → Configuration
- "Public bucket" should be **ON** (green toggle)

**Check all 4 policies exist:**
- Storage → avatars → Policies
- Should show 4 policies

**Hard refresh:**
- Press `Ctrl + Shift + R` (Windows/Linux)
- Press `Cmd + Shift + R` (Mac)

**Check browser console:**
- F12 → Console tab
- Look for specific error message
- Share in Discord/support if stuck

---

## Done! 🎉

Your avatar uploads should now work perfectly. The error message in the app will also guide you if something goes wrong.

**Time to upload that profile pic!** 📸
