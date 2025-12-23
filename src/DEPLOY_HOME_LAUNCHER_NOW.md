# 🚀 Deploy Home Launcher - Quick Start

## ✅ Pre-Flight Checklist

- [x] SQL migration already run in Supabase
- [x] Server code updated with XP fields
- [x] App.tsx integrated with HomeAppLauncher
- [x] All bugs fixed (table names, localStorage keys)

---

## 📋 Deployment Steps

### 1️⃣ Deploy Server (Edge Function)

The server needs to be redeployed to return the new XP fields.

```bash
# Option A: Supabase CLI
supabase functions deploy make-server-053bcd80

# Option B: Via Supabase Dashboard
1. Go to Edge Functions
2. Select "make-server-053bcd80"
3. Click "Deploy"
```

**Verify:** After deployment, check browser console for:
```
✅ User progress fetched: { level: 1, currentXP: 0, totalXP: 0, ... }
```

---

### 2️⃣ Test Locally (Optional)

If you want to test before deploying:

```bash
# Start dev server
npm run dev

# Open browser
http://localhost:5173

# Check console for:
✅ User authenticated
✅ User progress fetched
✅ HomeAppLauncher mounted
```

---

### 3️⃣ Deploy Frontend (Netlify)

```bash
# Option A: Git push (auto-deploy)
git add .
git commit -m "feat: Add iOS-style home launcher with XP system"
git push origin main

# Option B: Manual deploy
npm run build
netlify deploy --prod
```

---

## 🧪 Testing After Deployment

### Test the Homepage:
1. ✅ Login to DEWII
2. ✅ You should see the new app launcher on the feed view
3. ✅ Check that 6 apps are displayed (MAG, SWIPE, PLACES, SWAP, FORUM, GLOBE)
4. ✅ Verify progress widget shows "Level 1" and "0 / 100 XP"
5. ✅ Greeting should be time-appropriate (Good morning/afternoon/evening)

### Test Edit Mode:
1. ✅ Click "Edit" button (top-right)
2. ✅ Icons should start wiggling
3. ✅ Drag an app to reorder
4. ✅ Click "Done"
5. ✅ Refresh page - layout should persist

### Test Navigation:
1. ✅ Click MAG icon → should go to browse view
2. ✅ Click SWIPE icon → should go to swipe mode
3. ✅ Click PLACES icon → should go to places directory
4. ✅ Click SWAP icon → should go to swap shop
5. ✅ Click FORUM icon → should go to community market
6. ✅ Click GLOBE icon → should go to globe view

### Test Responsive:
1. ✅ Mobile (<768px) → 3 columns
2. ✅ Tablet (768-1024px) → 4 columns
3. ✅ Desktop (>1024px) → 5 columns

---

## 🐛 Common Issues & Fixes

### Issue: "user_progress table not found"
**Fix:** Run the SQL migration in Supabase SQL Editor:
```sql
-- Copy and paste /DEWII_HOME_LAUNCHER_ADAPTIVE_MIGRATION.sql
```

### Issue: "home_layout_config is null"
**Fix:** This is normal for new users. The app will use default layout.
No action needed - it will save on first reorder.

### Issue: "Server not deployed - Failed to fetch"
**Fix:** Redeploy the edge function:
```bash
supabase functions deploy make-server-053bcd80
```

### Issue: "XP shows as 0 / 0"
**Fix:** Server might not be returning XP fields. Check:
1. Edge function deployed?
2. Browser console shows user progress?
3. Server logs in Supabase Dashboard?

### Issue: "Icons not reordering"
**Fix:** Check browser console for errors. Verify:
1. Motion library loaded (check network tab)
2. Edit mode enabled (icons should wiggle)
3. No JavaScript errors blocking drag

---

## 📊 Expected Console Output

When you load the homepage, you should see:

```
🔐 User authenticated: Fetching user-specific data
✅ User progress fetched: {
  userId: "...",
  level: 1,
  currentXP: 0,
  totalXP: 0,
  homeLayoutConfig: null,  // or { appOrder: [...] }
  points: 0,
  ...
}
🎨 HomeAppLauncher mounted
```

When you reorder apps:

```
🔄 App order changed: ['mag', 'places', 'swipe', 'swap', 'forum', 'globe']
💾 Saved to localStorage
⏱️  Debouncing Supabase save...
✅ Saved to Supabase user_progress.home_layout_config
```

When you click an app:

```
🚀 Launching app: mag
➡️  Navigating to: browse
```

---

## 🎯 Next Steps After Deployment

### Immediate:
1. ✅ Test all 6 app icons
2. ✅ Test edit mode drag & drop
3. ✅ Test on mobile device
4. ✅ Verify layout persists after refresh

### Phase 2 (Later):
1. Wire up XP awards (award_xp function)
2. Add app badges (notification counts)
3. Add level-up celebration
4. Track app usage to app_usage_logs
5. Add recent apps section

---

## 🔥 Quick Health Check

Run this in browser console after login:

```javascript
// Check user progress data
console.log('User Progress:', userProgress)

// Check localStorage
console.log('Home Layout (Local):', localStorage.getItem('home-layout-config'))

// Check if HomeAppLauncher rendered
console.log('Launcher element:', document.querySelector('[class*="max-w-6xl"]'))
```

Expected output:
```
✅ User Progress: { level: 1, currentXP: 0, totalXP: 0, ... }
✅ Home Layout (Local): null  // or JSON config
✅ Launcher element: <div class="max-w-6xl mx-auto">...</div>
```

---

## 📞 Support

If you encounter issues:

1. **Check browser console** - Look for errors
2. **Check Supabase logs** - Edge Functions > Logs
3. **Verify migration** - SQL Editor > Run test queries
4. **Check network tab** - Verify API calls succeed

---

## ✅ Success Criteria

You'll know it's working when:

- ✅ Homepage shows iOS-style app launcher
- ✅ 6 apps visible with colored icons
- ✅ Progress widget shows "Level 1" and XP bar
- ✅ Personalized greeting appears
- ✅ Edit mode allows drag & drop
- ✅ Layout persists after refresh
- ✅ Clicking apps navigates correctly
- ✅ Responsive on mobile/tablet/desktop

---

**Ready to launch!** 🚀

Follow the steps above and your new home launcher will be live!
