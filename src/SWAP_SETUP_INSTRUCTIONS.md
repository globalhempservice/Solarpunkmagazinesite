# 🔄 SWAP Shop - Setup Instructions

## 🚨 Quick Fix for Errors

You're seeing errors because the database tables don't exist yet. Here's how to fix it:

---

## ✅ Step 1: Run the SQL Setup Script

1. Go to your **Supabase Dashboard**
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `/SETUP_SWAP_DATABASE.sql`
5. Paste it into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

**This will create:**
- ✅ 3 tables (`swap_items`, `swap_proposals`, `swap_completions`)
- ✅ All necessary indexes
- ✅ Row Level Security (RLS) policies
- ✅ Trigger functions for auto-updating timestamps

---

## ✅ Step 2: Verify Tables Created

In Supabase Dashboard:
1. Go to **Table Editor**
2. You should see 3 new tables:
   - `swap_items`
   - `swap_proposals`
   - `swap_completions`

---

## ✅ Step 3: Refresh Your App

1. Go back to your app
2. Hard refresh (Cmd/Ctrl + Shift + R)
3. Click the **SWAP** card on homepage
4. You should now see the empty state (no more errors!)

---

## 📝 What Each Error Meant

### ❌ Error: "Failed to fetch swap items"
**Cause:** The `swap_items` table didn't exist yet  
**Fix:** Running the SQL script creates the table

### ⚠️ Warning: "Multiple GoTrueClient instances"
**Cause:** We were creating a Supabase client in AddSwapItemModal  
**Fix:** Removed the client creation, now using base64 for images (temporary)

### ⚠️ Warning: "No user profile found"
**Cause:** Normal - some users don't have profiles yet  
**Fix:** This is expected and handled gracefully

---

## 🎨 Optional: Storage Bucket for Images

Right now, images are stored as base64 data URLs (temporary solution).

**To enable proper image storage:**

1. Go to **Supabase Dashboard** → **Storage**
2. Click **New Bucket**
3. Name it: `swap-images`
4. Make it **Public**
5. Click **Create Bucket**

Then run this SQL to set up policies:

```sql
-- Allow anyone to view images
CREATE POLICY "Anyone can view swap images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'swap-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload swap images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'swap-images' AND
    auth.role() = 'authenticated'
  );

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own swap images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'swap-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## ✅ Testing Your Setup

### **Test 1: View Empty Feed**
1. Click SWAP card on homepage
2. Should see "No items yet" message
3. No errors in console

### **Test 2: Add an Item (if logged in)**
1. Click floating "+" button
2. Fill out the 3-step form
3. Upload a photo
4. Submit
5. Item should appear in feed

### **Test 3: View Item Details**
1. Click any item card
2. Detail modal should open
3. All info displayed correctly

---

## 🐛 Still Seeing Errors?

### Check the Browser Console:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for specific error messages
4. Share them for help

### Common Issues:

**"relation 'swap_items' does not exist"**
→ SQL script didn't run successfully. Try again.

**"permission denied for table swap_items"**
→ RLS policies didn't apply. Run the SQL script again.

**"Failed to fetch"**
→ Server might not be deployed yet. Check if `/swap/items` route is working.

---

## 🎉 Success Checklist

- [ ] SQL script ran without errors
- [ ] 3 tables visible in Table Editor
- [ ] SWAP feed opens without errors
- [ ] Empty state displays properly
- [ ] Can open add item modal (if logged in)
- [ ] No console errors

---

## 📦 What You Have Now

✅ **Homepage Card:** Yellow SWAP card on homepage  
✅ **Infinite Feed:** Full-screen vertical scroll  
✅ **Floating Button:** "+" button to add items  
✅ **Add Item Modal:** 3-step wizard  
✅ **Detail Modal:** View item info  
✅ **Backend API:** All 11 endpoints ready  
✅ **Database:** Tables, indexes, RLS policies

---

## 🔜 What's Next

After the database is set up, we can build:
1. **Swap Proposal Flow** - Send barter offers with photos
2. **Swap Inbox** - Manage incoming/outgoing proposals
3. **Messaging Integration** - Chat after acceptance
4. **Completion Tracking** - Mark swaps as done

---

## 🆘 Need Help?

If you're still having issues after running the SQL script:

1. Share the exact error message
2. Check if the tables exist in Supabase
3. Verify you're connected to the right project
4. Try a hard refresh

---

**Last Updated:** December 9, 2024  
**Status:** Ready for database setup
