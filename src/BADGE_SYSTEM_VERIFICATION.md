# 🔍 BADGE SYSTEM VERIFICATION GUIDE

## ✅ All Fixes Applied

### 1. Route Fix
- ✅ Changed `/owned-swag-items/` → `/user-swag-items/`
- ✅ Added data transformation for compatibility

### 2. Data Format Fix
- ✅ Backend returns: `{ items: ['badge-founder'] }`
- ✅ Frontend converts to: `[{ item_id: 'badge-founder', item_name: '...' }]`

### 3. State Refresh Fix
- ✅ Added `onBadgeEquipped` callback to AccountSettings
- ✅ App.tsx now refreshes `userProgress` after badge equip
- ✅ Dashboard will immediately show new badge

---

## 🗄️ SQL Queries to Run in Supabase SQL Editor

### Query 1: Check Current Table Structure
```sql
-- See all columns in user_swag_items table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_swag_items';
```

### Query 2: Check Your Badge Purchases
**Replace `YOUR_USER_ID` with your actual user ID from auth.users**
```sql
SELECT 
  item_id, 
  item_name, 
  price_paid, 
  purchased_at 
FROM user_swag_items 
WHERE user_id = 'YOUR_USER_ID' 
AND item_id LIKE 'badge-%'
ORDER BY purchased_at DESC;
```

### Query 3: Check Your Equipped Badge
```sql
SELECT 
  user_id,
  selected_badge,
  selected_theme,
  points
FROM user_progress 
WHERE user_id = 'YOUR_USER_ID';
```

### Query 4: See All Badge Purchases (Platform-Wide)
```sql
SELECT 
  u.email,
  us.item_id,
  us.price_paid,
  us.purchased_at
FROM user_swag_items us
JOIN auth.users u ON us.user_id = u.id
WHERE us.item_id LIKE 'badge-%'
ORDER BY us.purchased_at DESC
LIMIT 20;
```

### Query 5: Verify RLS Policies
```sql
-- Check Row Level Security policies on user_swag_items
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_swag_items';
```

---

## 🧪 Manual Testing Steps

### Test 1: Fresh Badge Purchase
1. **Check Current NADA**: Note your current NADA balance
2. **Go to**: Community Market → ME → Badges tab (OR Swag Shop)
3. **Purchase**: Buy "Founder Badge" (should cost 5000 NADA)
4. **Expected Result**: 
   - ✅ NADA deducted (balance - 5000)
   - ✅ "Already Owned" badge appears
   - ✅ Toast notification shows success

### Test 2: Badge Appears in Settings
1. **Go to**: Settings (gear icon) → Scroll to "Badges" section
2. **Expected Result**: 
   - ✅ Founder badge shows as UNLOCKED (not grayed out)
   - ✅ Shows "Click to Equip" button
   - ✅ No lock icon overlay

### Test 3: Equip Badge in Settings
1. **In Settings → Badges**: Click the Founder badge
2. **Expected Result**: 
   - ✅ Badge animates/pulses briefly
   - ✅ Shows "Equipped" with green checkmark
   - ✅ Success message appears
3. **Go to Dashboard**
4. **Expected Result**: 
   - ✅ Badge displays below your level indicator
   - ✅ Badge has sparkle/equipped indicator

### Test 4: Badge Persists After Refresh
1. **With badge equipped**: Press F5 to refresh page
2. **Wait for load**: Page reloads completely
3. **Check Dashboard**: 
   - ✅ Badge still displays
4. **Check Settings → Badges**: 
   - ✅ Badge still shows as "Equipped"

### Test 5: Cross-App Consistency
1. **Equip badge** in Settings → Badges
2. **Go to**: Community Market → ME page
3. **Expected Result**: 
   - ✅ Same badge shows in ME profile panel
   - ✅ Badge displays next to your info
4. **Try equipping different badge** in ME page
5. **Go back to Settings**
6. **Expected Result**: 
   - ✅ New badge now shows as "Equipped"
   - ✅ Old badge shows "Click to Equip"

---

## 🐛 Troubleshooting

### Issue: Badge shows as locked in Settings but I purchased it

**Check 1**: Open browser DevTools (F12) → Console tab
- Look for: `"Owned badges:"` log message
- Should show: `['badge-founder']` or similar

**Check 2**: Run SQL query in Supabase:
```sql
SELECT item_id FROM user_swag_items 
WHERE user_id = 'YOUR_USER_ID' 
AND item_id LIKE 'badge-%';
```

**Check 3**: Verify the badge ID format:
- ✅ Correct: `badge-founder`
- ❌ Wrong: `founder`, `Founder Badge`, `badge_founder`

**Fix**: If SQL shows the badge but Settings doesn't:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check console for API errors

---

### Issue: Badge equips but doesn't show in Dashboard

**Check 1**: DevTools → Network tab
- Find: Request to `/users/${userId}/select-badge`
- Status should be: `200 OK`
- Response should be: `{"success": true, "badge": "badge-founder"}`

**Check 2**: Run SQL query:
```sql
SELECT selected_badge FROM user_progress 
WHERE user_id = 'YOUR_USER_ID';
```

**Check 3**: Verify Dashboard props:
- Open React DevTools
- Find `<UserDashboard>` component
- Check props: `equippedBadgeId` should not be null

**Fix**: If SQL shows badge but Dashboard doesn't:
1. Badge might be invalid ID - check BADGE_DEFINITIONS in BadgeDisplay.tsx
2. UserProgress might not be refreshing - check App.tsx state
3. Hard refresh the page (Ctrl+F5)

---

### Issue: Badge doesn't persist after page refresh

**Check 1**: Ensure badge was saved to database:
```sql
SELECT selected_badge FROM user_progress 
WHERE user_id = 'YOUR_USER_ID';
```

**Check 2**: Check if userProgress is being fetched on load:
- DevTools → Console
- Look for: `"✅ User progress fetched:"`
- Should include: `selectedBadge: "badge-founder"`

**Check 3**: Verify App.tsx loads userProgress:
```javascript
// Should be called in useEffect when authenticated
fetchUserProgress()
```

**Fix**: If database has badge but doesn't persist:
1. Check browser console for fetchUserProgress errors
2. Verify `/users/${userId}/progress` endpoint works
3. Check App.tsx useEffect dependencies

---

## 📝 Badge ID Reference

### Available Badge IDs (Must Match Exactly)
```javascript
'badge-founder'         // Founder Badge (Legendary)
'badge-hemp-pioneer'    // Hemp Pioneer Badge (Epic)  
'badge-nada-whale'      // NADA Whale Badge (Rare)
```

### Badge Sources
- **Defined in**: `/components/BadgeDisplay.tsx` → `BADGE_DEFINITIONS`
- **Also in**: `/components/MarketProfilePanel.tsx` → `BADGES_INFO`
- **Must match**: Database `item_id` column exactly

---

## ✅ Expected Database State After Success

### user_swag_items table
```
user_id          | item_id         | price_paid | purchased_at
-----------------|-----------------|------------|------------------
abc-123-def...   | badge-founder   | 5000       | 2024-11-28 ...
```

### user_progress table
```
user_id          | selected_badge  | selected_theme      | points
-----------------|-----------------|---------------------|-------
abc-123-def...   | badge-founder   | midnight-hemp       | 12500
```

---

## 🎯 Success Criteria

- ✅ Badge purchase shows in Supabase `user_swag_items` table
- ✅ Badge shows as unlocked in Settings → Badges section
- ✅ Badge can be equipped by clicking
- ✅ Equipped badge shows in Dashboard below level
- ✅ Equipped badge persists after page refresh
- ✅ Same badge shows in Market ME page
- ✅ Can switch between different badges
- ✅ Only owned badges can be equipped

---

## 🚀 All Systems Ready!

**What's Fixed:**
1. ✅ Route mismatch corrected
2. ✅ Data format transformation added
3. ✅ State refresh callback implemented
4. ✅ Badge persistence ensured

**Ready to Test!** 🎉

The badge you purchased in the Market should now show up in the Settings → Badges section and be equippable!
