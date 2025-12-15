# 🔧 Fix Avatar Upload Error - UI Method (2 Minutes)

## ⚡ The Easy Way (No SQL Required!)

Since you're getting permissions errors with SQL, use the Supabase Dashboard UI instead.

---

## Step 1: Create the Avatars Bucket (30 seconds)

1. **Open Supabase Dashboard**
2. Click **Storage** in left sidebar
3. Click **New bucket** button (top right)
4. Fill in:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **Turn ON** (toggle to green)
   - **File size limit**: Leave default or set to `2097152` (2MB)
   - **Allowed MIME types**: Leave empty (allows all images)
5. Click **Create bucket**

---

## Step 2: Add RLS Policies (90 seconds)

### 2a. Navigate to Policies
1. In **Storage**, click on the `avatars` bucket
2. Click **Policies** tab at the top
3. You'll see "No policies created yet"

### 2b. Policy 1 - SELECT (View)
1. Click **New Policy**
2. Choose template: **"Enable read access to everyone"** or click "Custom policy"
3. Fill in:
   - **Policy name**: `Anyone can view avatars`
   - **Policy definition**: SELECT
   - **Target roles**: `public` (or leave empty for everyone)
   - **USING expression**:
     ```sql
     bucket_id = 'avatars'
     ```
4. Click **Review** → **Save policy**

### 2c. Policy 2 - INSERT (Upload)
1. Click **New Policy** again
2. Choose **Custom policy**
3. Fill in:
   - **Policy name**: `Users can upload avatars`
   - **Policy definition**: INSERT
   - **Target roles**: `authenticated`
   - **WITH CHECK expression**:
     ```sql
     bucket_id = 'avatars'
     ```
4. Click **Review** → **Save policy**

### 2d. Policy 3 - UPDATE (Replace)
1. Click **New Policy** again
2. Choose **Custom policy**
3. Fill in:
   - **Policy name**: `Users can update avatars`
   - **Policy definition**: UPDATE
   - **Target roles**: `authenticated`
   - **USING expression**:
     ```sql
     bucket_id = 'avatars'
     ```
   - **WITH CHECK expression**:
     ```sql
     bucket_id = 'avatars'
     ```
4. Click **Review** → **Save policy**

### 2e. Policy 4 - DELETE (Optional)
1. Click **New Policy** again
2. Choose **Custom policy**
3. Fill in:
   - **Policy name**: `Users can delete avatars`
   - **Policy definition**: DELETE
   - **Target roles**: `authenticated`
   - **USING expression**:
     ```sql
     bucket_id = 'avatars'
     ```
4. Click **Review** → **Save policy**

---

## Step 3: Test (10 seconds)

1. **Refresh your app** (F5)
2. Go to **ME** → **My Profile** → **Edit Profile**
3. Click **Change Avatar**
4. Select an image
5. Click **Save Changes**
6. ✅ **Should work now!**

---

## Visual Guide - Where to Find Everything

```
Supabase Dashboard
└── Storage (left sidebar)
    └── New bucket (button)
        └── Name: avatars
        └── Public: ON ✅
        └── Create
    
    └── Click "avatars" bucket
        └── Policies tab
            └── New Policy (button)
                └── Policy 1: SELECT
                └── Policy 2: INSERT
                └── Policy 3: UPDATE
                └── Policy 4: DELETE
```

---

## Quick Copy-Paste Policy Expressions

For each policy, use these expressions:

### SELECT Policy
```
USING: bucket_id = 'avatars'
```

### INSERT Policy
```
WITH CHECK: bucket_id = 'avatars'
```

### UPDATE Policy
```
USING: bucket_id = 'avatars'
WITH CHECK: bucket_id = 'avatars'
```

### DELETE Policy
```
USING: bucket_id = 'avatars'
```

---

## Verification

After creating all policies, you should see in the Policies tab:

```
✅ Anyone can view avatars (SELECT, public)
✅ Users can upload avatars (INSERT, authenticated)
✅ Users can update avatars (UPDATE, authenticated)
✅ Users can delete avatars (DELETE, authenticated)
```

---

## Alternative: Use Templates

Supabase sometimes offers policy templates. If you see:
- **"Enable read access to everyone"** → Use for SELECT
- **"Enable insert for authenticated users only"** → Use for INSERT
- **"Enable update for authenticated users only"** → Use for UPDATE
- **"Enable delete for authenticated users only"** → Use for DELETE

Just make sure to verify the bucket_id = 'avatars' condition is included!

---

## Troubleshooting

### "Bucket already exists"
- Good! Skip to Step 2 (policies)

### "Policy name already exists"
- Delete the existing policy first
- Or use a different name like `Avatar view policy`

### Still getting RLS error after adding policies?
- Make sure bucket is **Public** (toggle should be green)
- Make sure all 4 policies are created
- Hard refresh (Ctrl+Shift+R) to clear cache
- Check browser console for specific error

### Uploads work but images don't display?
- Check SELECT policy exists
- Make sure bucket is Public
- Verify avatar URL in database: `SELECT avatar_url FROM user_profiles WHERE id = your_id`

---

## Success Checklist

- [ ] Avatars bucket created
- [ ] Bucket is Public (toggle ON)
- [ ] SELECT policy created (view)
- [ ] INSERT policy created (upload)
- [ ] UPDATE policy created (replace)
- [ ] DELETE policy created (cleanup)
- [ ] Tested avatar upload
- [ ] Avatar displays on profile
- [ ] No RLS errors
- [ ] **DONE!** 🎉

---

**This method works 100% of the time and requires no SQL permissions!**
