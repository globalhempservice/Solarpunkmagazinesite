# 🧪 Phase 1 Sprint 1.1 - Discovery Match Testing Guide

**Created:** December 7, 2024  
**Sprint:** Phase 1 Sprint 1.1 - Discovery Match Foundation

---

## ✅ PRE-DEPLOYMENT CHECKLIST

Before deploying to production, complete these steps:

### **1. Database Migration** ✓
- [ ] Run `/database_schemas/phase_1_discovery_matches.sql` in Supabase SQL Editor
- [ ] Verify 3 tables created: `discovery_requests`, `discovery_match_results`, `discovery_analytics`
- [ ] Verify 2 functions created: `mark_discovery_match_viewed`, `select_discovery_match_viewed`
- [ ] Verify RLS enabled on all tables

### **2. Backend Deployment** ✓
- [ ] Push code to Git (includes `discovery_routes.tsx`)
- [ ] Netlify deploys edge function automatically
- [ ] Wait ~2 minutes for deployment
- [ ] Verify endpoint responds: `/make-server-053bcd80/discovery/my-requests`

### **3. Frontend Integration** 🔜
- [ ] Add Discovery Match button to ME drawer (see integration steps below)
- [ ] Test modal opens
- [ ] Test form validation
- [ ] Test API calls
- [ ] Test match results display

---

## 🔧 FRONTEND INTEGRATION STEPS

### **Step 1: Add state to App.tsx**

Find where you manage modal states in App.tsx and add:

```typescript
const [showDiscoveryMatchModal, setShowDiscoveryMatchModal] = useState(false);
```

### **Step 2: Update MEButtonDrawer with Discovery Match button**

Add this to the `menuItems` array in `/components/MEButtonDrawer.tsx`:

```typescript
{
  icon: Sparkles, // Import from lucide-react
  label: 'Discovery Match',
  onClick: () => {
    onDiscoveryMatchClick?.()
    onClose()
  },
  gradient: 'from-yellow-500 via-orange-500 to-red-500',
  badge: 'NEW'
},
```

And add the prop:

```typescript
interface MEButtonDrawerProps {
  // ... existing props
  onDiscoveryMatchClick?: () => void; // Add this
}
```

### **Step 3: Wire up in App.tsx**

Where you render MEButtonDrawer:

```typescript
<MEButtonDrawer
  isOpen={meDrawerOpen}
  onClose={() => setMeDrawerOpen(false)}
  userId={session.user.id}
  displayName={userDisplayName || session.user.email?.split('@')[0] || 'User'}
  avatarUrl={userAvatarUrl}
  onProfileClick={() => setActivePage('profile')}
  onMyArticlesClick={() => setActivePage('dashboard')}
  onOrganizationsClick={() => setActivePage('market')}
  onSettingsClick={() => setActivePage('settings')}
  onDiscoveryMatchClick={() => setShowDiscoveryMatchModal(true)} // Add this
/>
```

### **Step 4: Add the Discovery Match Modal**

Import at top of App.tsx:

```typescript
import DiscoveryMatchModal from './components/discovery/DiscoveryMatchModal';
```

Render it (after MEButtonDrawer):

```typescript
{/* Discovery Match Modal - Phase 1 Sprint 1.1 */}
<DiscoveryMatchModal
  isOpen={showDiscoveryMatchModal}
  onClose={() => setShowDiscoveryMatchModal(false)}
  userNadaBalance={nadaBalance || 0}
/>
```

---

## 🧪 TESTING CHECKLIST

### **Test 1: Database Tables**

```sql
-- Run in Supabase SQL Editor

-- Check tables exist
SELECT COUNT(*) FROM discovery_requests;
SELECT COUNT(*) FROM discovery_match_results;
SELECT COUNT(*) FROM discovery_analytics;

-- Should all return 0 (no errors)
```

**✅ Pass if:** No errors, returns 0 rows

---

### **Test 2: Backend API - Unauthorized Access**

```bash
# Should fail without auth token
curl https://[YOUR-PROJECT].supabase.co/functions/v1/make-server-053bcd80/discovery/my-requests

# Expected: {"error": "Unauthorized"}
```

**✅ Pass if:** Returns 401 Unauthorized

---

### **Test 3: Backend API - Authorized Access**

```bash
# Get your token first (from browser console after logging in):
# localStorage.getItem('supabase.auth.token')

curl https://[YOUR-PROJECT].supabase.co/functions/v1/make-server-053bcd80/discovery/my-requests \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected: {"requests": []}
```

**✅ Pass if:** Returns empty array (you have no requests yet)

---

### **Test 4: Frontend - Open Modal**

1. Log into your app
2. Click **ME** button (bottom navbar)
3. Click **Discovery Match** button
4. Modal should open

**✅ Pass if:**
- Modal opens smoothly
- Shows "Discovery Match" title
- Shows your NADA balance
- Shows request form

---

### **Test 5: Form Validation**

In the Discovery Match modal:

1. Try clicking "Find Matches" without filling anything
   - **✅ Pass if:** Button is disabled

2. Type less than 20 characters
   - **✅ Pass if:** Button stays disabled, shows character count

3. Type 20+ characters but don't select category
   - **✅ Pass if:** Button stays disabled

4. Select a category
   - **✅ Pass if:** Button becomes enabled

---

### **Test 6: Insufficient NADA**

1. If your NADA balance < 10:
   - **✅ Pass if:** Shows "Insufficient NADA" error
   - **✅ Pass if:** Button is disabled

2. If you need NADA for testing:
   ```sql
   -- Run in Supabase SQL Editor
   UPDATE user_progress 
   SET nada_balance = 100 
   WHERE user_id = 'YOUR_USER_ID';
   ```

---

### **Test 7: Create Discovery Request**

1. Fill out the form:
   - **Request text:** "Looking for hemp fabric suppliers for fashion startup"
   - **Category:** Textile & Fashion
   - **Budget:** Medium
   - **Location:** International

2. Click "Find Matches"

**✅ Pass if:**
- Shows loading spinner
- NADA is deducted (check balance)
- Success toast appears
- Results screen shows

**Check database:**
```sql
SELECT * FROM discovery_requests ORDER BY created_at DESC LIMIT 1;
-- Should show your request

SELECT * FROM discovery_match_results WHERE request_id = 'YOUR_REQUEST_ID';
-- Should show matched organizations (if any exist)

SELECT * FROM nada_transactions ORDER BY created_at DESC LIMIT 1;
-- Should show -10 NADA transaction
```

---

### **Test 8: View Match Results**

After creating a request:

**If matches found:**
- **✅ Pass if:** Shows "Found X Matches" title
- **✅ Pass if:** Organizations display with:
  - Rank badge (#1, #2, etc.)
  - Logo/banner
  - Name and description
  - Match score (percentage)
  - Match reason (green box)
  - "Request Introduction" button
  - "Visit Website" button (if org has website)

**If no matches:**
- **✅ Pass if:** Shows "No matches found" message
- **✅ Pass if:** Shows "Try Again" button

---

### **Test 9: Select a Match**

1. Click "Request Introduction" on a match
2. Should show loading spinner
3. Should show success toast: "Selected [Org Name]! Messaging coming in Sprint 1.2."

**Check database:**
```sql
SELECT selected, selected_at FROM discovery_match_results 
WHERE id = 'YOUR_MATCH_ID';
-- Should show selected = true, selected_at = timestamp

SELECT status, selected_organization_id FROM discovery_requests 
WHERE id = 'YOUR_REQUEST_ID';
-- Should show status = 'accepted', selected_organization_id = org ID

SELECT * FROM discovery_analytics 
WHERE event_type = 'match_selected' 
ORDER BY created_at DESC LIMIT 1;
-- Should show analytics event
```

**✅ Pass if:** All database updates correct

---

### **Test 10: Visit Organization Website**

1. Click "Visit Website" button (if available)
2. Should open org website in new tab

**✅ Pass if:** Opens in new tab, doesn't navigate away

---

### **Test 11: Close Modal**

1. Click "Close" button at bottom
2. Modal should close
3. Click X button in top right
4. Modal should close

**✅ Pass if:** Modal closes smoothly both ways

---

### **Test 12: NADA Balance Updates**

1. Note NADA balance before request
2. Create discovery request (costs 10 NADA)
3. Check NADA balance after

**✅ Pass if:**
- Balance decreased by 10
- Shows in wallet/stats
- Transaction logged in database

---

### **Test 13: Multiple Requests**

1. Create 3 different discovery requests
2. Go to ME → Discovery Match
3. Should see history (future feature)

**Check database:**
```sql
SELECT COUNT(*) FROM discovery_requests WHERE user_id = 'YOUR_USER_ID';
-- Should show 3 (or however many you created)
```

**✅ Pass if:** All requests saved

---

### **Test 14: Error Handling**

**Test offline mode:**
1. Disconnect internet
2. Try to create discovery request
3. Should show error toast

**✅ Pass if:** Shows "Failed to create discovery request" error

**Test invalid session:**
1. Clear localStorage
2. Try to use Discovery Match
3. Should redirect to login or show error

**✅ Pass if:** Proper error handling

---

### **Test 15: Mobile Responsiveness**

Test on mobile device or Chrome DevTools mobile view:

1. Open Discovery Match modal
   - **✅ Pass if:** Modal is full-screen on mobile
   
2. Fill out form
   - **✅ Pass if:** All buttons are touch-friendly (44px min)
   - **✅ Pass if:** Category grid is 2 columns on mobile
   
3. View results
   - **✅ Pass if:** Match cards stack vertically
   - **✅ Pass if:** No horizontal scroll
   - **✅ Pass if:** Text is readable

---

### **Test 16: Matching Algorithm**

Create requests with different criteria:

**Test A: Category matching**
- Request: "textile"
- **✅ Pass if:** Textile organizations rank higher

**Test B: Location matching**
- Set location preference to "Local"
- **✅ Pass if:** Same-country orgs rank higher

**Test C: Keyword matching**
- Request text: "sustainable organic fabric"
- **✅ Pass if:** Orgs with those keywords rank higher

---

### **Test 17: Analytics Tracking**

```sql
-- Check analytics events
SELECT event_type, COUNT(*) 
FROM discovery_analytics 
GROUP BY event_type;

-- Should show:
-- request_created: X
-- match_viewed: Y (if you viewed matches)
-- match_selected: Z (if you selected any)
```

**✅ Pass if:** All events logged

---

## 🐛 COMMON ISSUES & FIXES

### **Issue 1: "Unauthorized" error**

**Cause:** Not logged in or session expired

**Fix:**
```typescript
// Check in browser console
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)

// If null, log in again
```

---

### **Issue 2: "Failed to fetch" error**

**Cause:** Edge function not deployed or CORS issue

**Fix:**
1. Check Netlify deployment logs
2. Wait 2-3 minutes after push
3. Verify function is live:
   ```bash
   curl https://[PROJECT].supabase.co/functions/v1/make-server-053bcd80/discovery/my-requests
   ```

---

### **Issue 3: No matches found**

**Cause:** No organizations in database or none match criteria

**Fix:**
```sql
-- Check if you have verified organizations
SELECT COUNT(*) FROM organizations WHERE is_verified = true;

-- If 0, create a test organization
INSERT INTO organizations (
  name, description, category, is_verified, city, country
) VALUES (
  'Test Hemp Co', 
  'Sustainable hemp products', 
  'textile', 
  true, 
  'Portland', 
  'USA'
);
```

---

### **Issue 4: Modal doesn't open**

**Cause:** State not wired up correctly

**Fix:**
Check in App.tsx:
```typescript
// Make sure you have:
const [showDiscoveryMatchModal, setShowDiscoveryMatchModal] = useState(false);

// And the modal is rendered:
<DiscoveryMatchModal
  isOpen={showDiscoveryMatchModal}
  onClose={() => setShowDiscoveryMatchModal(false)}
  userNadaBalance={nadaBalance || 0}
/>
```

---

### **Issue 5: NADA not deducting**

**Cause:** Service role key issue or RLS blocking

**Fix:**
```sql
-- Check user_progress exists
SELECT * FROM user_progress WHERE user_id = 'YOUR_USER_ID';

-- If not, create it
INSERT INTO user_progress (user_id, nada_balance, power_points)
VALUES ('YOUR_USER_ID', 100, 0);
```

---

## 📊 SUCCESS CRITERIA

Sprint 1.1 is successful when:

- [ ] ✅ Database tables created and RLS working
- [ ] ✅ Backend API endpoints respond correctly
- [ ] ✅ Modal opens from ME drawer
- [ ] ✅ Form validation works
- [ ] ✅ NADA deduction works
- [ ] ✅ Matching algorithm returns results
- [ ] ✅ Match results display correctly
- [ ] ✅ "Request Introduction" button works (logs selection)
- [ ] ✅ Analytics events logged
- [ ] ✅ Mobile responsive
- [ ] ✅ No console errors
- [ ] ✅ All 17 tests pass

---

## 🚀 DEPLOYMENT TO PRODUCTION

When all tests pass:

```bash
# 1. Commit all changes
git add .
git commit -m "feat: Discovery Match system (Phase 1 Sprint 1.1) - TESTED"

# 2. Push to main
git push origin main

# 3. Netlify deploys automatically

# 4. Verify on production
# - Log into live site
# - Test Discovery Match
# - Check Supabase logs
```

---

## 📝 POST-DEPLOYMENT CHECKLIST

After deploying to production:

- [ ] Test on live site (not localhost)
- [ ] Test on mobile device
- [ ] Check Supabase logs for errors
- [ ] Monitor NADA transactions
- [ ] Check analytics dashboard
- [ ] Announce to users (optional)

---

## 🎯 NEXT STEPS (Sprint 1.2)

After Sprint 1.1 is complete and tested:

→ **Sprint 1.2: Messaging System V0.1**
- Chat threads
- Messages
- Link from "Request Introduction" to actual chat
- Real-time updates (polling)

---

**Discovery Match is ready to ship!** 🚀🌿

Test thoroughly, then push to production!
