# ⚡ Quick Fix for "unique_viewers column not found" Error

## 🎯 The Problem

You're seeing this error:
```
❌ Failed to insert daily views: Could not find the 'unique_viewers' column of 'article_views' in the schema cache
```

## ✅ The Fix (30 seconds)

### **Option 1: Add the Missing Column** (Recommended)

Run this in Supabase SQL Editor:

```sql
ALTER TABLE public.article_views 
  ADD COLUMN IF NOT EXISTS unique_viewers INTEGER DEFAULT 0;
```

That's it! Now try viewing an article again.

---

### **Option 2: Use the Migration Script**

If Option 1 doesn't work, run `/VIEWS_FIX_MIGRATION.sql` which checks and adds all missing columns.

---

## 🧪 Verify the Fix

Run this to check if the column was added:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'article_views' 
ORDER BY ordinal_position;
```

**Expected columns:**
- id
- article_id
- date
- views
- unique_viewers ← This should now be there!
- created_at
- updated_at

---

## 🚀 Test Again

1. **Run the ALTER TABLE command** above
2. **Open DEWII**
3. **Click an article**
4. **Check browser console**

**Expected:**
```
✅ View tracked: { success: true, views: X, message: 'View tracked' }
```

**Server logs should show:**
```
✅ Daily views created with count: 1
```

No more errors! 🎉

---

## 💡 What Happened?

The `article_views` table was created without the `unique_viewers` column. This happens if:
1. The table was created manually
2. An older version of the setup script was used
3. The column creation failed silently

The migration adds the missing column safely with `IF NOT EXISTS` so it won't fail if the column already exists.

---

## 🔍 Alternative: Recreate the Table

If you want a completely fresh start:

```sql
-- ⚠️ WARNING: This deletes all existing view data!
DROP TABLE IF EXISTS public.article_views CASCADE;

-- Then run the full setup script:
-- Copy and paste /VIEWS_SYSTEM_SETUP.sql
```

But the simple `ALTER TABLE` above is safer and preserves existing data.

---

## ✨ After the Fix

Once you run the ALTER TABLE command, your view tracking will work perfectly:

- ✅ `articles.views` increments
- ✅ `article_views` tracks daily counts
- ✅ `user_article_views` logs unique viewers
- ✅ Admin Dashboard shows analytics

**Just run that one line of SQL and you're done!** 🚀
