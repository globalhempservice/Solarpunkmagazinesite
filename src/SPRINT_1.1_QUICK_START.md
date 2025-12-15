# ⚡ Sprint 1.1 - Discovery Match Quick Start

**Status:** ✅ Code Complete, Ready to Deploy  
**Date:** December 7, 2024

---

## 🎯 WHAT IS THIS?

Discovery Match lets users spend 10 NADA to find hemp organizations that match their needs. It's the first step in the Hero Loop!

**Flow:**
```
User fills form → Spends 10 NADA → System matches with orgs → 
User picks org → Requests intro → (Chat in Sprint 1.2)
```

---

## 📦 FILES CREATED

### **Database:**
- `/database_schemas/phase_1_discovery_matches.sql` - 3 tables, 2 functions, RLS policies

### **Backend:**
- `/supabase/functions/server/discovery_routes.tsx` - NEW (5 API routes)
- `/supabase/functions/server/index.tsx` - UPDATED (routes mounted)

### **Frontend:**
- `/components/discovery/DiscoveryMatchModal.tsx` - Main modal
- `/components/discovery/DiscoveryRequestForm.tsx` - Request form
- `/components/discovery/DiscoveryMatchResults.tsx` - Results display

### **Documentation:**
- `/PHASE_1_ROADMAP_DEC_2024.md` - Full Phase 1 plan
- `/PHASE_1_SPRINT_1.1_TESTING_GUIDE.md` - Complete testing guide (17 tests)
- `/SPRINT_1.1_QUICK_START.md` - This file

---

## ⚡ 3-STEP DEPLOYMENT

### **STEP 1: Deploy Database** (2 minutes)

**IMPORTANT: Run migrations in this order!**

#### **1A) Create Organizations Table First**

1. Open Supabase Dashboard → SQL Editor
2. Copy `/database_schemas/organizations_base_schema.sql`
3. Paste and click **Run**
4. Verify: `SELECT COUNT(*) FROM organizations WHERE is_verified = true;`
   - Should return 8 (test organizations)

#### **1B) Create Discovery Match Tables**

1. Still in SQL Editor, click **New Query**
2. Copy `/database_schemas/phase_1_discovery_matches.sql`
3. Paste and click **Run**
4. Verify: `SELECT tablename FROM pg_tables WHERE tablename LIKE 'discovery%';`
   - Should return 3 tables

**Should see:** 
- `organizations` (with 8 test orgs)
- `organization_interests`
- `discovery_requests`
- `discovery_match_results`
- `discovery_analytics`

---

### **STEP 2: Deploy Backend** (5 minutes)

```bash
# Backend is ready, just push to Git
git add supabase/functions/server/discovery_routes.tsx
git add supabase/functions/server/index.tsx
git commit -m "feat: Add Discovery Match backend (Sprint 1.1)"
git push origin main

# Netlify auto-deploys (wait ~2 min)
```

**Verify:**
```bash
# Test endpoint (replace [PROJECT-ID] and [YOUR-TOKEN])
curl https://[PROJECT-ID].supabase.co/functions/v1/make-server-053bcd80/discovery/my-requests \
  -H "Authorization: Bearer [YOUR-TOKEN]"

# Should return: {"requests": []}
```

---

### **STEP 3: Integrate Frontend** (10 minutes)

#### **A) Add modal state to App.tsx:**

```typescript
const [showDiscoveryMatchModal, setShowDiscoveryMatchModal] = useState(false);
```

#### **B) Import at top of App.tsx:**

```typescript
import DiscoveryMatchModal from './components/discovery/DiscoveryMatchModal';
import { Sparkles } from 'lucide-react';
```

#### **C) Update MEButtonDrawer props in App.tsx:**

Find where you render `<MEButtonDrawer>` and add:

```typescript
<MEButtonDrawer
  // ... existing props
  onDiscoveryMatchClick={() => setShowDiscoveryMatchModal(true)}
/>
```

#### **D) Add prop to MEButtonDrawer.tsx interface:**

```typescript
interface MEButtonDrawerProps {
  // ... existing props
  onDiscoveryMatchClick?: () => void;
}
```

#### **E) Add menu item to MEButtonDrawer.tsx:**

In the `menuItems` array (around line 67), add after "My Articles":

```typescript
{
  icon: Sparkles,
  label: 'Discovery Match',
  onClick: () => {
    onDiscoveryMatchClick?.()
    onClose()
  },
  gradient: 'from-yellow-500 via-orange-500 to-red-500',
  badge: 'NEW'
},
```

And add the import at the top:
```typescript
import { User, Settings, Building2, Package, LogOut, X, FileText, Sparkles } from 'lucide-react'
```

#### **F) Render modal in App.tsx:**

Add after `<MEButtonDrawer>`:

```typescript
{/* Discovery Match Modal - Phase 1 Sprint 1.1 */}
<DiscoveryMatchModal
  isOpen={showDiscoveryMatchModal}
  onClose={() => setShowDiscoveryMatchModal(false)}
  userNadaBalance={nadaBalance || 0}
/>
```

---

## 🧪 QUICK TEST

1. **Database:** Run `SELECT COUNT(*) FROM discovery_requests;` → Should return 0 (no error)
2. **Backend:** `curl [endpoint]/discovery/my-requests` → Should return `{"requests":[]}`
3. **Frontend:**
   - Click ME button
   - Click "Discovery Match" (should see badge: NEW)
   - Modal opens
   - Fill form (20+ chars, select category)
   - Click "Find Matches"
   - Should deduct 10 NADA and show results

---

## 📊 WHAT TO PUSH TO SUPABASE

### **Run in Supabase SQL Editor:**

```sql
-- Copy and paste the entire file:
-- /database_schemas/phase_1_discovery_matches.sql

-- Click RUN
```

That's it! Tables, functions, and RLS policies are all in that one file.

---

## 🚀 WHAT TO PUSH TO GIT

```bash
# Add all Sprint 1.1 files
git add database_schemas/phase_1_discovery_matches.sql
git add supabase/functions/server/discovery_routes.tsx
git add supabase/functions/server/index.tsx
git add components/discovery/

# Commit
git commit -m "feat: Phase 1 Sprint 1.1 - Discovery Match complete

- Database schema (3 tables, 2 functions, RLS)
- Backend API (5 routes)
- Frontend components (modal, form, results)
- Matching algorithm V1 (category, location, keywords)
- NADA integration (10 NADA per request)
- Analytics tracking

Ready to test and deploy"

# Push
git push origin main
```

Netlify will auto-deploy the backend!

---

## ✅ SUCCESS CHECKLIST

Before marking Sprint 1.1 complete:

- [ ] Database tables created in Supabase
- [ ] Backend deployed and responding
- [ ] Frontend integrated (modal opens from ME drawer)
- [ ] Tested: Create request, see matches, select match
- [ ] NADA deduction works
- [ ] Mobile responsive
- [ ] No console errors

---

## 🐛 TROUBLESHOOTING

**"No matches found":**
- Need verified organizations in database
- Run: `SELECT COUNT(*) FROM organizations WHERE is_verified = true;`
- If 0, create test org (see testing guide)

**"Insufficient NADA":**
- Give yourself NADA for testing
- Run: `UPDATE user_progress SET nada_balance = 100 WHERE user_id = '[YOUR-ID]';`

**"Unauthorized":**
- Check session: `supabase.auth.getSession()`
- Re-login if needed

**Modal doesn't open:**
- Check state wiring in App.tsx
- Check prop passed to MEButtonDrawer
- Check console for errors

---

## 📚 FULL DOCUMENTATION

- **Complete Roadmap:** `/PHASE_1_ROADMAP_DEC_2024.md`
- **Testing Guide:** `/PHASE_1_SPRINT_1.1_TESTING_GUIDE.md` (17 detailed tests)
- **Transition Guide:** `/PHASE_0_TO_PHASE_1_TRANSITION.md`

---

## 🎯 NEXT SPRINT

**Sprint 1.2: Messaging System V0.1** (Week 1-2)

After Discovery Match is working:
- Chat threads
- Messages (text only)
- Link "Request Introduction" to chat
- Polling for real-time updates
- Unread message badges

---

## 🎉 SUMMARY

**What we built:**
- Complete Discovery Match system
- NADA-powered organizational matching
- Smart algorithm (category + location + keywords)
- Beautiful UI with solarpunk aesthetic
- Full analytics tracking

**What it does:**
- Users spend 10 NADA
- Get matched with up to 5 relevant hemp orgs
- Can request introductions
- Lays foundation for messaging (Sprint 1.2)

**Impact:**
- Completes Step 4-5 of Hero Loop
- First real marketplace feature
- Drives NADA circulation
- Creates business connections

---

**Discovery Match is ready! Test thoroughly, then ship it!** 🚀🌿✨

---

**Questions? Check:**
- `/PHASE_1_SPRINT_1.1_TESTING_GUIDE.md` for detailed testing
- `/PHASE_1_ROADMAP_DEC_2024.md` for big picture
- Console logs for debugging

**Ready to deploy? Follow 3-step guide above** ☝️