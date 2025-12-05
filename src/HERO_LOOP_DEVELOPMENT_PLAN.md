# 🌟 HEMP'IN UNIVERSE - HERO LOOP DEVELOPMENT PLAN

## 🎯 VISION: The Hero Loop
**Read → Earn Power Points → Convert to NADA → Discovery Match → Intro → Outcome**

This creates a flywheel where reading generates value that drives real-world connections and business outcomes.

---

## 📊 SYSTEM ENTITIES MAP

```
┌─────────────────────────────────────────────────────────────────┐
│                     HEMP'IN UNIVERSE ECOSYSTEM                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  USERS (Readers/Creators/Members)                                │
│     ↓ Read Articles                                              │
│     ↓ Earn Power Points (XP)                                     │
│     ↓ Convert to NADA                                            │
│     ↓                                                             │
│  ┌──────────────────────────────────────────────────┐           │
│  │            NADA UTILITY SYSTEM                    │           │
│  ├──────────────────────────────────────────────────┤           │
│  │  1. 🎯 DISCOVERY MATCH (Hero Loop - NEW!)        │           │
│  │  2. 🎨 PLUGINS SHOP (Themes/Badges - EXISTS)     │           │
│  │  3. 🔄 SWAP BOOST (Highlight listings - NEW!)    │           │
│  │  4. 📢 PROMOTED LISTINGS (Visibility - NEW!)     │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                   │
│  ORGANIZATIONS                                                    │
│     ↔ Linked to: Places, Products, Articles, Badges              │
│     ↔ Discoverable via: Discovery Match                          │
│                                                                   │
│  PLACES (Physical Locations)                                      │
│     ↔ Linked to: Organizations, Products                         │
│     ↔ Searchable: Hemp Atlas 3D Globe                            │
│                                                                   │
│  🛍️ SWAG MARKET (Primary Commerce)                               │
│     ├─ Products (Digital & Physical)                             │
│     ├─ Owned by Organizations                                    │
│     ├─ Hemp Provenance Badges                                    │
│     └─ Can become SWAP items later                               │
│                                                                   │
│  🔄 SWAP SHOP (Second-Hand Barter - NEW!)                        │
│     ├─ User-listed hemp items                                    │
│     ├─ "Hemp Inside" verified                                    │
│     ├─ Linked back to original SWAG product                      │
│     ├─ Swap proposals (no direct $)                              │
│     └─ Barter RFP system                                         │
│                                                                   │
│  📋 REQUESTS HUB (Unified RFP System - NEW!)                     │
│     ├─ Discovery Match Requests (B2B intros)                     │
│     ├─ SWAP Requests (barter RFPs)                               │
│     └─ Material/Service RFPs (future)                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

💰 MONETIZATION LAYERS (Subtle & Ethical):
   ├─ Platform logistics fee (shipping coordination)
   ├─ Verification services (high-value swaps)
   ├─ Listing boosts (NADA or small fee)
   ├─ Premium membership (trust badges, analytics)
   ├─ Analytics dashboard for organizations
   └─ Discovery Match intelligence (data insights)
```

---

## 🚀 DEVELOPMENT SPRINTS

### **SPRINT 0: Foundation & Planning** (5,000 tokens)
**Goal:** Design system architecture and database schemas

**Deliverables:**
- [ ] System map document with all entities
- [ ] Database schemas for Discovery Match, SWAP Shop, Requests Hub
- [ ] API route planning
- [ ] UI/UX wireframes for Hero Loop
- [ ] Token economy audit (NADA sources & sinks)

**Files to Create:**
- `/database_schemas/discovery_matches.sql`
- `/database_schemas/swap_shop.sql`
- `/database_schemas/swap_proposals.sql`
- `/SYSTEM_MAP.md`
- `/wireframes/HERO_LOOP_FLOW.md`

**Estimated Tokens:** 5,000
**Time:** 1-2 hours planning
**Priority:** 🔴 CRITICAL (Must do first)

---

### **SPRINT 1: NADA Wallet Enhancement** (8,000 tokens)
**Goal:** Make NADA system prominent and add "Use NADA" CTA

**Tasks:**
1. ✅ Enhance wallet widget in article pages
2. ✅ Add "Use NADA" primary button
3. ✅ Create "Use NADA" modal with choice cards:
   - Discovery Match (NEW)
   - Plugins & Themes (exists)
   - SWAP Boost (placeholder)
4. ✅ Update NADA balance display across site
5. ✅ Add NADA transaction history

**Components to Create/Modify:**
- `/components/NadaWalletWidget.tsx` (enhance existing)
- `/components/UseNadaModal.tsx` (NEW)
- `/components/NadaChoiceCard.tsx` (NEW)

**Backend:**
- `/supabase/functions/server/nada_routes.tsx` (enhance)

**Estimated Tokens:** 8,000
**Priority:** 🟠 HIGH (Enables discovery)

---

### **SPRINT 2: Discovery Match System** (15,000 tokens)
**Goal:** Core Hero Loop - Request Discovery Match flow

**Tasks:**
1. ✅ Database schema for discovery_matches table
2. ✅ Multi-step Discovery Match form:
   - Step 1: Who are you? (role, org, region)
   - Step 2: What are you looking for? (categories)
   - Step 3: Short description
3. ✅ NADA deduction on submission (3 NADA)
4. ✅ Success screen with confirmation
5. ✅ "My Requests" page for users
6. ✅ Email notification to admins

**Components to Create:**
- `/components/DiscoveryMatchForm.tsx` (NEW)
- `/components/DiscoveryMatchSuccess.tsx` (NEW)
- `/components/MyRequestsPage.tsx` (NEW)

**Backend Routes:**
- `POST /discovery-matches` (create request)
- `GET /my-discovery-matches` (user's requests)
- `GET /admin/discovery-matches` (admin view)

**Database:**
```sql
CREATE TABLE discovery_matches (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  role TEXT,
  organization_id UUID,
  region TEXT,
  looking_for TEXT[], -- categories
  description TEXT,
  nada_spent INTEGER DEFAULT 3,
  status TEXT DEFAULT 'new', -- new, matching, introduced, success, failed
  matched_org_ids UUID[],
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

**Estimated Tokens:** 15,000
**Priority:** 🔴 CRITICAL (Core Hero Loop)

---

### **SPRINT 3: Discovery Match Admin Dashboard** (10,000 tokens)
**Goal:** Admin tools to match users with organizations

**Tasks:**
1. ✅ Admin dashboard for Discovery Matches
2. ✅ Table view: user, role, org, region, need, status
3. ✅ Detail panel with quick links to:
   - Organization directory
   - Places
   - SWAG products
4. ✅ Status workflow: New → Matching → Introduced → Success/Failed
5. ✅ Quick match suggestions (AI/algorithm)
6. ✅ Email template for introductions

**Components to Create:**
- `/components/DiscoveryMatchAdminDashboard.tsx` (NEW)
- `/components/DiscoveryMatchDetailPanel.tsx` (NEW)
- `/components/DiscoveryMatchSuggestions.tsx` (NEW)

**Backend:**
- `PUT /admin/discovery-matches/:id/status` (update status)
- `POST /admin/discovery-matches/:id/introduce` (send intro email)
- `GET /admin/discovery-matches/:id/suggestions` (match algorithm)

**Estimated Tokens:** 10,000
**Priority:** 🟠 HIGH (Completes Hero Loop)

---

### **SPRINT 4: SWAP Shop Foundation** (20,000 tokens)
**Goal:** Second-hand barter marketplace for hemp items

**Tasks:**
1. ✅ Database schemas for swap_items and swap_proposals
2. ✅ SWAP Shop landing page with grid layout
3. ✅ Filters: category, condition, location, "hemp inside"
4. ✅ SWAP item detail page:
   - Photos, condition, story
   - Link to original SWAG product
   - "Years in use", "Heirloom hemp potential"
5. ✅ "List a SWAP Item" form
6. ✅ Connect to original products when possible

**Components to Create:**
- `/components/SwapShopLanding.tsx` (NEW)
- `/components/SwapItemCard.tsx` (NEW)
- `/components/SwapItemDetail.tsx` (NEW)
- `/components/ListSwapItemForm.tsx` (NEW)

**Database:**
```sql
CREATE TABLE swap_items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  condition TEXT, -- like_new, good, well_loved
  hemp_inside BOOLEAN DEFAULT true,
  original_product_id UUID REFERENCES products,
  original_organization_id UUID REFERENCES organizations,
  years_in_use INTEGER,
  story TEXT,
  images TEXT[],
  location TEXT,
  region TEXT,
  status TEXT DEFAULT 'available', -- available, pending, swapped
  created_at TIMESTAMP DEFAULT NOW()
)

CREATE TABLE swap_proposals (
  id UUID PRIMARY KEY,
  swap_item_id UUID REFERENCES swap_items,
  proposer_user_id UUID REFERENCES auth.users,
  offered_swap_item_ids UUID[],
  nada_offered INTEGER DEFAULT 0,
  money_offered DECIMAL(10,2) DEFAULT 0,
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected, countered
  created_at TIMESTAMP DEFAULT NOW()
)
```

**Backend Routes:**
- `GET /swap-shop` (list items)
- `POST /swap-shop/items` (create listing)
- `GET /swap-shop/items/:id` (detail)
- `PUT /swap-shop/items/:id` (update)
- `DELETE /swap-shop/items/:id` (remove)

**Estimated Tokens:** 20,000
**Priority:** 🟡 MEDIUM (New feature, high impact)

---

### **SPRINT 5: SWAP Proposal Flow (Barter RFP)** (12,000 tokens)
**Goal:** Enable swap proposals between users

**Tasks:**
1. ✅ "Propose a Swap" button on item detail
2. ✅ Multi-step swap proposal form:
   - Step 1: What are you offering? (select your items)
   - Step 2: Add NADA or money for imbalance
   - Step 3: Personal message
3. ✅ Swap inbox for item owners
4. ✅ Accept/Decline/Counter actions
5. ✅ Notification system for proposals

**Components to Create:**
- `/components/ProposeSwapModal.tsx` (NEW)
- `/components/SwapInbox.tsx` (NEW)
- `/components/SwapProposalCard.tsx` (NEW)

**Backend Routes:**
- `POST /swap-shop/proposals` (create proposal)
- `GET /swap-shop/my-proposals` (user's proposals)
- `PUT /swap-shop/proposals/:id/accept` (accept)
- `PUT /swap-shop/proposals/:id/reject` (reject)
- `PUT /swap-shop/proposals/:id/counter` (counter-offer)

**Estimated Tokens:** 12,000
**Priority:** 🟡 MEDIUM (Completes SWAP flow)

---

### **SPRINT 6: SWAP Discovery Match** (8,000 tokens)
**Goal:** Use NADA to find swap matches

**Tasks:**
1. ✅ Add "SWAP Discovery Match" to Use NADA modal
2. ✅ Form: "What hemp items are you looking for?"
3. ✅ Algorithm to suggest matching SWAP items
4. ✅ Email notifications to SWAP item owners
5. ✅ Track success rate

**Components to Create:**
- `/components/SwapDiscoveryMatchForm.tsx` (NEW)

**Backend:**
- `POST /swap-shop/discovery-match` (create request)
- `GET /swap-shop/discovery-match/suggestions` (algorithm)

**Estimated Tokens:** 8,000
**Priority:** 🟢 LOW (Enhancement)

---

### **SPRINT 7: Unified Requests Hub** (10,000 tokens)
**Goal:** Central place for all user requests

**Tasks:**
1. ✅ Requests Hub page with tabs:
   - Discovery Match (B2B intros)
   - SWAP Requests (barter RFPs)
   - Future: Material/Service RFPs
2. ✅ Filter by type, status, date
3. ✅ Quick actions: view, edit, cancel
4. ✅ Status tracking for all request types
5. ✅ Unified design language

**Components to Create:**
- `/components/RequestsHub.tsx` (NEW)
- `/components/RequestCard.tsx` (NEW)
- `/components/RequestFilters.tsx` (NEW)

**Backend:**
- `GET /requests/hub` (all user requests)
- `DELETE /requests/:type/:id` (cancel request)

**Estimated Tokens:** 10,000
**Priority:** 🟡 MEDIUM (UX improvement)

---

### **SPRINT 8: Monetization Integration** (12,000 tokens)
**Goal:** Add ethical monetization touchpoints

**Tasks:**
1. ✅ Shipping coordination fee system
2. ✅ High-value swap verification service
3. ✅ Listing boost system (NADA or small fee):
   - "Boost this SWAP item for 7 days"
   - "Feature this organization"
4. ✅ Premium membership tiers:
   - Verified trust badges
   - Better ranking in results
   - Analytics dashboard
5. ✅ Organization analytics dashboard
6. ✅ Payment integration (Stripe for fees)

**Components to Create:**
- `/components/BoostListingModal.tsx` (NEW)
- `/components/PremiumMembershipPage.tsx` (NEW)
- `/components/OrganizationAnalyticsDashboard.tsx` (NEW)
- `/components/ShippingCoordinationWidget.tsx` (NEW)

**Backend:**
- `POST /monetization/boost` (boost listing)
- `POST /monetization/verify-swap` (verification service)
- `POST /monetization/upgrade-membership` (premium)
- Stripe webhook integration

**Database:**
```sql
CREATE TABLE premium_memberships (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  tier TEXT, -- basic, verified, premium
  started_at TIMESTAMP,
  expires_at TIMESTAMP,
  stripe_subscription_id TEXT
)

CREATE TABLE boosted_listings (
  id UUID PRIMARY KEY,
  listing_type TEXT, -- swap_item, organization, product
  listing_id UUID,
  boosted_by_user_id UUID,
  nada_spent INTEGER,
  money_spent DECIMAL(10,2),
  started_at TIMESTAMP,
  expires_at TIMESTAMP
)
```

**Estimated Tokens:** 12,000
**Priority:** 🟢 LOW (Revenue generation)

---

### **SPRINT 9: SWAG ↔ SWAP Integration** (8,000 tokens)
**Goal:** Connect primary market with resale

**Tasks:**
1. ✅ Add "This can become a SWAP item" badge to SWAG products
2. ✅ "Resell on SWAP Shop" button on user's purchased items
3. ✅ Pre-fill SWAP listing from SWAG product data
4. ✅ Show "Originally from SWAG" on SWAP items
5. ✅ Track product lifecycle: SWAG → User → SWAP → New User
6. ✅ Sustainability metrics: "Total years in circulation"

**Components to Modify:**
- `/components/SwagProductDetail.tsx` (add resell button)
- `/components/UserInventory.tsx` (add resell action)

**Estimated Tokens:** 8,000
**Priority:** 🟡 MEDIUM (Circular economy)

---

### **SPRINT 10: UI/UX Polish & Visual Identity** (15,000 tokens)
**Goal:** Cohesive solarpunk design system

**Tasks:**
1. ✅ Update design tokens for Hero Loop
2. ✅ Create distinct visual styles:
   - Magazine (aurora/dark)
   - SWAG (clean, product-focused)
   - SWAP (patina, history, storytelling)
3. ✅ Glassmorphism panels for modals
4. ✅ Animated transitions for Hero Loop
5. ✅ Mobile responsive optimization
6. ✅ Loading states and micro-interactions
7. ✅ Iconography system for:
   - Discovery Match
   - SWAP proposals
   - Request types
   - Monetization touchpoints

**Components to Polish:**
- All new components from previous sprints
- `/styles/globals.css` (update tokens)
- Create `/components/ui/` components for Hero Loop

**Estimated Tokens:** 15,000
**Priority:** 🟠 HIGH (User experience)

---

## 📊 SPRINT SUMMARY

| Sprint | Name | Tokens | Priority | Dependencies |
|--------|------|--------|----------|--------------|
| 0 | Foundation & Planning | 5,000 | 🔴 CRITICAL | None |
| 1 | NADA Wallet Enhancement | 8,000 | 🟠 HIGH | Sprint 0 |
| 2 | Discovery Match System | 15,000 | 🔴 CRITICAL | Sprint 1 |
| 3 | Discovery Admin Dashboard | 10,000 | 🟠 HIGH | Sprint 2 |
| 4 | SWAP Shop Foundation | 20,000 | 🟡 MEDIUM | Sprint 0 |
| 5 | SWAP Proposal Flow | 12,000 | 🟡 MEDIUM | Sprint 4 |
| 6 | SWAP Discovery Match | 8,000 | 🟢 LOW | Sprint 2, 4 |
| 7 | Unified Requests Hub | 10,000 | 🟡 MEDIUM | Sprint 2, 5 |
| 8 | Monetization Integration | 12,000 | 🟢 LOW | Sprint 4, 5 |
| 9 | SWAG ↔ SWAP Integration | 8,000 | 🟡 MEDIUM | Sprint 4 |
| 10 | UI/UX Polish | 15,000 | 🟠 HIGH | All sprints |

**Total Estimated Tokens:** 123,000  
**Total Estimated Time:** 3-4 weeks of development

---

## 🎯 RECOMMENDED EXECUTION ORDER

### **Phase 1: Core Hero Loop** (5-7 days)
- Sprint 0 (Planning)
- Sprint 1 (NADA Wallet)
- Sprint 2 (Discovery Match)
- Sprint 3 (Admin Dashboard)

**Why:** Gets the core value loop working immediately. Users can start using NADA for real outcomes.

### **Phase 2: SWAP Market** (7-10 days)
- Sprint 4 (SWAP Foundation)
- Sprint 5 (Swap Proposals)
- Sprint 9 (SWAG ↔ SWAP Integration)

**Why:** Adds the second-hand market, creating circular economy value.

### **Phase 3: Enhancement & Polish** (5-7 days)
- Sprint 6 (SWAP Discovery)
- Sprint 7 (Requests Hub)
- Sprint 10 (UI/UX Polish)

**Why:** Improves UX and adds discoverability features.

### **Phase 4: Monetization** (3-5 days)
- Sprint 8 (Monetization)

**Why:** Adds revenue streams after core value is proven.

---

## 💡 QUICK WINS (Can Start Immediately)

1. **Update wallet widget** (2,000 tokens, 1 hour)
   - Add "Use NADA" button to article pages
   - Show NADA balance prominently

2. **Create "Use NADA" modal** (3,000 tokens, 2 hours)
   - Choice cards for Discovery Match vs Plugins
   - Simple, clear CTAs

3. **Discovery Match form** (5,000 tokens, 3 hours)
   - Multi-step form
   - NADA deduction
   - Success screen

---

## 🔄 HERO LOOP METRICS TO TRACK

Once implemented, measure:

1. **Acquisition:**
   - New users reading articles
   - Power Points earned

2. **Activation:**
   - NADA conversions
   - First Discovery Match request

3. **Retention:**
   - Repeat Discovery Match usage
   - SWAP Shop engagement

4. **Revenue:**
   - Discovery Match fees (NADA)
   - Monetization touchpoint usage

5. **Referral:**
   - Organizations discovered
   - SWAP items traded
   - User invites

---

## 📝 NEXT STEPS

**Decision Point:** Which sprint do you want to start with?

**Option A (Recommended):** Start with Phase 1 (Core Hero Loop)
- Delivers immediate value
- Creates engagement flywheel
- Foundation for everything else

**Option B:** Start with SWAP Shop (Sprint 4)
- Adds new market
- Can be built independently
- Takes longer to show value

**Option C:** Do both in parallel
- Faster overall delivery
- Requires more token budget
- Higher complexity

---

**Let me know which sprint/phase you'd like to tackle first, and I'll start building!** 🚀

**My Recommendation:** Start with **Sprint 1 (NADA Wallet Enhancement)** as a quick win, then move to **Sprint 2 (Discovery Match System)** to get the Hero Loop running. This creates immediate traction and validates the concept before building the larger SWAP marketplace.
