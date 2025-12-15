# 🔧 Fix Avatar Upload Error (30 seconds)

## Error You're Seeing
```
Avatar upload error: StorageApiError: new row violates row-level security policy
```

## What This Means
The Supabase Storage bucket needs RLS (Row-Level Security) policies to allow uploads.

---

## ⚡ Quick Fix (3 Steps)

### Step 1: Open Supabase SQL Editor (10 seconds)
1. Go to **Supabase Dashboard**
2. Click **SQL Editor** in left sidebar
3. Click **New Query**

### Step 2: Run SQL Script (15 seconds)
1. Open `/SETUP_AVATAR_STORAGE.sql` in your code editor
2. **Copy all** of it (Ctrl+A, Ctrl+C)
3. **Paste** into Supabase SQL Editor
4. Click **RUN** (or press Ctrl+Enter)
5. Wait for ✅ **Success**

### Step 3: Test Avatar Upload (5 seconds)
1. Refresh your app (F5)
2. Go to **ME** → **My Profile**
3. Click **Edit Profile**
4. Click **Change Avatar**
5. Select an image
6. Click **Save Changes**
7. ✅ **Should work!**

---

## What the SQL Script Does

### Creates the Bucket
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
```
- Creates public bucket named 'avatars'
- Public = anyone can view, but not upload without auth

### Sets Up 4 RLS Policies

1. **Anyone can view avatars** (public read)
   - Needed so avatar images display on profiles

2. **Users can upload their own avatar** (authenticated insert)
   - Allows logged-in users to upload

3. **Users can update their own avatar** (authenticated update)
   - Allows upsert (update if exists)

4. **Users can delete their own avatar** (authenticated delete)
   - Cleanup old avatars

---

## Verification Query

After running the script, verify it worked:

```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Should show:
-- id: avatars
-- name: avatars
-- public: true

-- Check policies exist
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%avatar%';

-- Should show 4 policies:
-- 1. Anyone can view avatars
-- 2. Users can upload their own avatar
-- 3. Users can update their own avatar
-- 4. Users can delete their own avatar
```

---

## After Fix Works

You'll see:
1. **No more RLS errors** ✅
2. **Toast notification**: "Profile updated successfully!" 
3. **Avatar displays** on your profile
4. **Avatar URL** saved to `user_profiles.avatar_url`

Example avatar URL:
```
https://[project].supabase.co/storage/v1/object/public/avatars/abc123-1234567890.jpg
```

---

## Troubleshooting

### Still getting error after running SQL?

**Check 1: Is bucket public?**
```sql
SELECT public FROM storage.buckets WHERE id = 'avatars';
-- Should return: true
```

**Check 2: Are you authenticated?**
- Make sure you're logged in
- Check browser console for auth errors

**Check 3: File size/type?**
- Max 2MB
- Must be image/* type (JPG, PNG, WebP)

### Error: "Bucket not found"

The bucket wasn't created. Try creating it manually:
1. Supabase Dashboard → **Storage**
2. Click **New Bucket**
3. Name: `avatars`
4. Public: ✅ **Yes**
5. Click **Create Bucket**
6. Then run the SQL script for policies

### Error: "Policy already exists"

The script tries to drop existing policies first. If you still get this:
1. Go to Storage → avatars → Policies
2. Delete all existing policies manually
3. Re-run the SQL script

---

## File Size and Format

**Supported formats:**
- JPG / JPEG
- PNG
- WebP
- GIF

**Max size:** 2MB (enforced in the UI)

**Recommended:**
- Square images (1:1 ratio)
- At least 400x400px
- Under 500KB for faster loading

---

## Phase 1 Enhancement Ideas

Future additions could include:
- Image cropping before upload
- Multiple sizes (thumbnail, medium, large)
- Image optimization/compression
- Banner images for profiles
- Badge/achievement images

---

## Success Checklist

After running the script:
- [ ] SQL shows "Success" (no errors)
- [ ] 4 policies created
- [ ] Bucket is public
- [ ] Can upload avatar without RLS error
- [ ] Avatar displays on profile
- [ ] Avatar URL saved to database
- [ ] Can update avatar (upsert works)
- [ ] **Phase 0 Avatar Upload COMPLETE!** 🎉

---

**Need help?** Check the error message in the toast notification - it now gives specific guidance!
