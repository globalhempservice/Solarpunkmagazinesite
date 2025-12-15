# 🚀 PHASE 1 ROADMAP - December 2024

**Created:** December 7, 2024  
**Phase 0 Completion:** ✅ December 6, 2024  
**Status:** 📋 Planning

> ⚠️ **NOTE:** This is the NEW Phase 1 roadmap for the Three Rails Marketplace. Old Phase 1 references in other files refer to previous SWAG/Digital Items work which is now complete.

---

## 🎯 PHASE 1 MISSION

**Goal:** Build the complete Hero Loop that creates traction and business outcomes

**Hero Loop Flow:**
```
Read Articles → Earn Power Points → Convert to NADA → 
Discovery Match → Intro/Chat → Business Outcome (SWAP/SWAG/RFP)
```

**Success Metric:** Users can discover and connect with hemp businesses/people, leading to real transactions

---

## 📊 WHAT PHASE 0 DELIVERED

### ✅ Completed (Foundation Layer)

1. **User Profile System** - COMPLETE
   - Enhanced user_profiles table with marketplace fields
   - ProfileHeader with banner, avatar, trust score, roles
   - ProfileStats with Power Points, NADA, activity metrics
   - EditProfileModal with role/interest selection
   - MEButtonDrawer (PlayStation-style menu)
   - TrustScoreBadge system
   - RolePill components
   - Mobile-responsive, no emojis, solarpunk aesthetic

2. **Gamification Core** - COMPLETE
   - Power Points system (reading XP)
   - NADA currency (convertible from points)
   - Badges & achievements
   - Streak tracking
   - User progress tracking

3. **Content & Organizations** - COMPLETE
   - Article system with reading tracking
   - Organization profiles
   - Places with PostGIS + 3D globe
   - SWAG marketplace (external purchase flow)
   - Plugins shop (themes, badges, banners)

4. **Infrastructure** - COMPLETE
   - Supabase backend with RLS
   - Edge functions (Hono server)
   - Authentication system
   - Storage for avatars/banners

---

## 🛤️ PHASE 1 OVERVIEW: THE THREE RAILS

Phase 1 builds the **THREE RAILS** that turn DEWII from a magazine into a marketplace OS:

### **Rail 1: C2C SWAP** (Consumer-to-Consumer Barter)
- Users list hemp items they own
- Propose swaps with other users
- Chat to negotiate
- Use NADA to balance value differences
- Build trust through completed swaps

### **Rail 2: B2C/B2B SWAG** (Hemp Products Commerce)
- Organizations sell products (already exists externally)
- Discovery Match connects buyers to sellers
- B2B quote requests
- Internal checkout (future)

### **Rail 3: B2B RFP** (Professional Matching)
- Discovery Match for business connections
- Service/material requests
- Professional introductions
- Hemp industry networking

**All three rails share:**
- One user profile system (Phase 0 ✅)
- One NADA economy
- One messaging system
- One trust/reputation system
- One discovery engine

---

## 🗓️ PHASE 1 SPRINT BREAKDOWN

### **SPRINT 1.1: Discovery Match Foundation** (Week 1)
**Goal:** Users can spend NADA to get matched with relevant hemp businesses

**Database:**
- `discovery_matches` table
  - user_id, match_type, criteria (JSON), nada_cost, status
  - created_at, matched_organizations (array)
- `discovery_requests` table  
  - user_id, request_text, category, budget, location_preference
  - status (pending, matched, completed)
  - matched_org_id, intro_message

**Backend Routes:**
```
POST /make-server-053bcd80/discovery/request
  - Create discovery request
  - Deduct NADA
  - Run matching algorithm

GET /make-server-053bcd80/discovery/my-requests
  - List user's discovery requests

GET /make-server-053bcd80/discovery/matches/:requestId
  - Get matched organizations

POST /make-server-053bcd80/discovery/accept-match
  - Accept a match
  - Create chat thread
```

**Components:**
- `DiscoveryMatchModal.tsx` - Request discovery match
- `DiscoveryRequestForm.tsx` - Fill out what you're looking for
- `DiscoveryMatchResults.tsx` - See matched organizations
- `DiscoveryHistory.tsx` - View past requests

**Integration:**
- Add "Discovery Match" to ME drawer
- Add "Use NADA → Discovery Match" flow
- Update NadaWalletPanel with discovery option

**Tokens Estimated:** 12,000  
**Priority:** 🔥 CRITICAL (Core Hero Loop)

---

### **SPRINT 1.2: Basic Messaging V0.1** (Week 1-2)
**Goal:** Users can chat with matched organizations or swap partners

**Database:**
- `chat_threads` table
  - id, participant_1_id, participant_2_id
  - thread_type (discovery, swap, general)
  - related_entity_id (discovery_request_id, swap_proposal_id)
  - created_at, last_message_at
- `chat_messages` table
  - id, thread_id, sender_id
  - message_text, created_at
  - read (boolean)

**Backend Routes:**
```
GET /make-server-053bcd80/chats/my-threads
  - List user's chat threads

GET /make-server-053bcd80/chats/thread/:threadId
  - Get messages in thread

POST /make-server-053bcd80/chats/send
  - Send message

POST /make-server-053bcd80/chats/mark-read
  - Mark messages as read
```

**Components:**
- `ChatThreadsList.tsx` - List of conversations
- `ChatWindow.tsx` - Message thread UI
- `MessageBubble.tsx` - Individual message
- `ChatInput.tsx` - Send message input

**Features:**
- Simple text messages only (no attachments yet)
- Real-time with polling (no websockets yet)
- Unread message count badge
- Basic notification system

**Integration:**
- Add "Messages" to ME drawer
- Add message icon to BottomNavbar
- Link from discovery match results
- Link from swap proposals (Sprint 1.3)

**Tokens Estimated:** 15,000  
**Priority:** 🔥 CRITICAL (Enables intros)

---

### **SPRINT 1.3: SWAP Inventory System** (Week 2)
**Goal:** Users can list hemp items they own and mark them available for swap

**Database:**
- `swap_items` table
  - id, user_id, title, description
  - category, condition (mint, good, fair, poor)
  - original_product_id (link to SWAG product if applicable)
  - estimated_value, nada_value
  - photos (array of URLs)
  - available (boolean), created_at
- `swap_item_photos` table (optional)
  - id, swap_item_id, photo_url, order

**Backend Routes:**
```
GET /make-server-053bcd80/swap/my-items
  - List user's inventory

POST /make-server-053bcd80/swap/items
  - Create new swap item

PUT /make-server-053bcd80/swap/items/:id
  - Update item

DELETE /make-server-053bcd80/swap/items/:id
  - Delete item

GET /make-server-053bcd80/swap/browse
  - Browse available items (filters)
```

**Components:**
- `SwapInventory.tsx` - User's inventory page
- `AddSwapItemModal.tsx` - Create/edit item
- `SwapItemCard.tsx` - Display item in list
- `SwapItemDetail.tsx` - Full item details
- `SwapBrowse.tsx` - Browse available items

**Features:**
- Photo upload (Supabase Storage)
- Condition selector (visual)
- Category tagging
- Link to original SWAG product (provenance)
- Mark as available/unavailable
- Delete item

**Integration:**
- Add "My Inventory" to ProfileTabs (remove "Soon" badge)
- Add "Browse SWAP" to MARKET tab
- Link from SWAG products ("Add to my inventory")

**Tokens Estimated:** 18,000  
**Priority:** 🟠 HIGH (Enables SWAP rail)

---

### **SPRINT 1.4: SWAP Proposal System** (Week 3)
**Goal:** Users can propose swaps and negotiate with NADA balancing

**Database:**
- `swap_proposals` table
  - id, proposer_id, recipient_id
  - proposer_items (array of item IDs)
  - recipient_items (array of item IDs)
  - nada_from_proposer, nada_from_recipient
  - status (pending, countered, accepted, rejected, completed)
  - chat_thread_id
  - created_at, updated_at
- `swap_counters` table (optional for history)
  - id, proposal_id, counter_number
  - items_snapshot, nada_snapshot
  - created_by, created_at

**Backend Routes:**
```
POST /make-server-053bcd80/swap/propose
  - Create swap proposal
  - Create chat thread
  - Deduct small NADA fee (anti-spam)

GET /make-server-053bcd80/swap/my-proposals
  - List proposals (sent & received)

POST /make-server-053bcd80/swap/counter
  - Counter-propose different items/NADA

POST /make-server-053bcd80/swap/accept
  - Accept proposal
  - Mark items as swapped
  - Transfer NADA

POST /make-server-053bcd80/swap/reject
  - Reject proposal
```

**Components:**
- `ProposeSwapModal.tsx` - Select items + NADA
- `SwapProposalCard.tsx` - Display proposal
- `SwapProposalDetail.tsx` - Full proposal view
- `SwapNegotiation.tsx` - Counter-proposal UI
- `SwapCompletion.tsx` - Confirm swap complete

**Features:**
- Multi-item selection
- NADA balancing calculator
- Visual comparison (your items vs their items)
- Counter-proposal flow
- Mark as completed (both parties confirm)
- Trust score increase on completion
- Anti-spam NADA fee (10 NADA to propose)

**Integration:**
- Add "Swap Proposals" tab to Profile
- Link from SwapItemDetail ("Propose Swap")
- Notifications for new proposals
- Chat integration for negotiation

**Tokens Estimated:** 20,000  
**Priority:** 🟠 HIGH (Completes SWAP rail)

---

### **SPRINT 1.5: Discovery Match Algorithm V1** (Week 3-4)
**Goal:** Smart matching based on user interests, location, and organization profiles

**Backend Logic:**
```typescript
// Matching algorithm
function matchDiscoveryRequest(request) {
  // Factors:
  // 1. User interests vs org categories
  // 2. User location vs org locations
  // 3. Request text keywords vs org descriptions
  // 4. Organization trust score
  // 5. Organization activity level
  
  // Return top 3-5 matches with scores
}
```

**Database:**
- Add `discovery_match_scores` table (optional analytics)
  - request_id, org_id, score, factors (JSON)
  - selected (boolean)

**Enhancements:**
- Keyword extraction from request text
- Location radius matching (PostGIS)
- Interest category matching
- Org ranking by trust/activity
- Personalization based on user history

**Components:**
- `MatchScoreIndicator.tsx` - Show match %
- `WhyThisMatch.tsx` - Explain matching factors
- Update `DiscoveryMatchResults.tsx` with scores

**Tokens Estimated:** 10,000  
**Priority:** 🟡 MEDIUM (Improves quality)

---

### **SPRINT 1.6: UI Polish & Mobile Optimization** (Week 4)
**Goal:** All Phase 1 features work perfectly on mobile

**Tasks:**
- Test all flows on mobile devices
- Fix responsive issues
- Add loading states
- Add error handling
- Add empty states
- Add onboarding tooltips
- Add success animations
- Optimize images
- Test offline behavior
- Fix accessibility issues

**Components:**
- Update all Phase 1 components for mobile
- Add skeleton loaders
- Add error boundaries
- Add retry mechanisms

**Tokens Estimated:** 8,000  
**Priority:** 🟡 MEDIUM (Quality)

---

## 📊 PHASE 1 SUMMARY TABLE

| Sprint | Focus | Tokens | Priority | Duration |
|--------|-------|--------|----------|----------|
| 1.1 | Discovery Match | 12,000 | 🔥 Critical | Week 1 |
| 1.2 | Messaging V0.1 | 15,000 | 🔥 Critical | Week 1-2 |
| 1.3 | SWAP Inventory | 18,000 | 🟠 High | Week 2 |
| 1.4 | SWAP Proposals | 20,000 | 🟠 High | Week 3 |
| 1.5 | Match Algorithm | 10,000 | 🟡 Medium | Week 3-4 |
| 1.6 | Polish & Mobile | 8,000 | 🟡 Medium | Week 4 |
| **TOTAL** | **Full Hero Loop** | **83,000** | - | **4 weeks** |

---

## 🎯 PHASE 1 SUCCESS CRITERIA

Phase 1 is complete when:

### **Core Functionality:**
- [x] Users can request Discovery Match by spending NADA
- [x] System matches users with relevant organizations
- [x] Users can message matched organizations
- [x] Users can list items in their SWAP inventory
- [x] Users can propose swaps with other users
- [x] Users can negotiate via chat
- [x] Users can complete swaps (both confirm)
- [x] Trust scores increase on completed swaps
- [x] All features work on mobile

### **Hero Loop Complete:**
```
✅ Read Articles (exists)
  ↓
✅ Earn Power Points (exists)
  ↓
✅ Convert to NADA (exists)
  ↓
✅ Discovery Match (NEW - Sprint 1.1)
  ↓
✅ Chat/Intro (NEW - Sprint 1.2)
  ↓
✅ SWAP Transaction (NEW - Sprint 1.3 + 1.4)
  ↓
✅ Trust Score Increase (NEW)
  ↓
🔄 Read More Articles (repeat loop)
```

### **Three Rails Operational:**
- [x] **C2C SWAP** - Inventory + Proposals + Chat working
- [x] **B2C/B2B SWAG** - Discovery Match connects buyers to sellers
- [x] **B2B RFP** - Discovery Match for professional intros

### **Quality Bars:**
- [x] No major bugs
- [x] Mobile responsive
- [x] Loading states everywhere
- [x] Error handling robust
- [x] Matches solarpunk aesthetic
- [x] NO EMOJIS anywhere
- [x] Security: RLS policies on all new tables

---

## 🔗 INTEGRATION POINTS

### **With Existing Systems:**

**User Profile (Phase 0):**
- Discovery requests linked to user_id
- SWAP inventory linked to user_id
- Chat threads linked to user_id
- Trust score updates on swap completion
- Roles/interests used in matching

**NADA Economy:**
- Discovery Match costs NADA
- SWAP proposals cost small NADA fee (anti-spam)
- NADA can balance unequal swaps
- Completed swaps earn NADA reward
- All NADA transactions logged

**Organizations:**
- Discovery Match returns organizations
- Chat threads can be user-to-org
- SWAG products can be added to SWAP inventory
- Organizations can receive match requests

**Gamification:**
- Complete swap = XP + badge progress
- First swap = achievement unlock
- 10 swaps = "Swapper" badge
- Discovery Match used = achievement
- Active chatter = engagement points

---

## 📁 NEW FILES TO CREATE

### **Database Schemas:**
```
/database_schemas/phase_1_discovery_matches.sql
/database_schemas/phase_1_chat_system.sql
/database_schemas/phase_1_swap_inventory.sql
/database_schemas/phase_1_swap_proposals.sql
```

### **Backend Routes:**
```
/supabase/functions/server/discovery_routes.tsx
/supabase/functions/server/chat_routes.tsx
/supabase/functions/server/swap_routes.tsx
```

### **Components:**
```
/components/discovery/DiscoveryMatchModal.tsx
/components/discovery/DiscoveryRequestForm.tsx
/components/discovery/DiscoveryMatchResults.tsx
/components/discovery/DiscoveryHistory.tsx

/components/chat/ChatThreadsList.tsx
/components/chat/ChatWindow.tsx
/components/chat/MessageBubble.tsx
/components/chat/ChatInput.tsx

/components/swap/SwapInventory.tsx
/components/swap/AddSwapItemModal.tsx
/components/swap/SwapItemCard.tsx
/components/swap/SwapItemDetail.tsx
/components/swap/SwapBrowse.tsx
/components/swap/ProposeSwapModal.tsx
/components/swap/SwapProposalCard.tsx
/components/swap/SwapProposalDetail.tsx
/components/swap/SwapNegotiation.tsx
/components/swap/SwapCompletion.tsx
```

### **Documentation:**
```
/PHASE_1_SPRINT_1.1_DISCOVERY.md
/PHASE_1_SPRINT_1.2_MESSAGING.md
/PHASE_1_SPRINT_1.3_INVENTORY.md
/PHASE_1_SPRINT_1.4_PROPOSALS.md
/PHASE_1_QUICK_START.md
/PHASE_1_TESTING_GUIDE.md
```

---

## 🎨 DESIGN GUIDELINES

All Phase 1 features must follow:

### **Visual:**
- ✅ Solarpunk futuristic comic aesthetic
- ✅ Hemp'in canonical color system
- ✅ NO EMOJIS (custom SVG icons only)
- ✅ Country flags as styled pills
- ✅ Gradient backgrounds with shine effects
- ✅ Smooth animations (Motion React)
- ✅ Backdrop blur effects

### **UX:**
- ✅ Mobile-first design
- ✅ Touch-friendly hit targets (min 44px)
- ✅ Loading states with skeletons
- ✅ Error states with retry buttons
- ✅ Empty states with helpful CTAs
- ✅ Success animations on completions
- ✅ Optimistic UI updates

### **Accessibility:**
- ✅ Proper heading hierarchy
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Color contrast (WCAG AA)
- ✅ Screen reader support

---

## 🚨 RISKS & MITIGATION

### **Risk 1: Messaging complexity**
- **Mitigation:** Start with simple polling, no websockets
- **Fallback:** Use chat thread list + manual refresh

### **Risk 2: Matching algorithm too simple**
- **Mitigation:** V1 is basic keyword/interest matching
- **Future:** ML-based matching in Phase 2

### **Risk 3: SWAP abuse (spam proposals)**
- **Mitigation:** Small NADA fee to propose (10 NADA)
- **Mitigation:** Trust score requirements
- **Mitigation:** Report/block features

### **Risk 4: NADA economy imbalance**
- **Mitigation:** Track all sources/sinks
- **Mitigation:** Adjust costs based on usage
- **Mitigation:** Add NADA sinks (boosts, fees)

### **Risk 5: Mobile performance**
- **Mitigation:** Sprint 1.6 dedicated to mobile
- **Mitigation:** Image optimization
- **Mitigation:** Lazy loading
- **Mitigation:** Code splitting

---

## 📈 METRICS TO TRACK

### **Hero Loop Metrics:**
- Discovery Match requests per week
- Match acceptance rate
- Intro messages sent
- Swaps proposed per week
- Swaps completed per week
- Time from match to first message
- Time from proposal to completion

### **Engagement Metrics:**
- Active chatters (users who sent message in last 7 days)
- SWAP inventory items listed
- SWAP browse sessions
- Average items per user inventory
- Repeat swap rate (users who swap 2+ times)

### **Economy Metrics:**
- NADA spent on Discovery Match
- NADA spent on SWAP proposals
- NADA used in swap balancing
- Total NADA in circulation
- NADA balance distribution

### **Quality Metrics:**
- Match satisfaction (survey)
- Completed swap rating
- Trust score distribution
- Report/block rate (abuse)

---

## 🎯 WHAT'S NOT IN PHASE 1

These are explicitly OUT of scope for Phase 1:

❌ **Not in Phase 1:**
- Websocket real-time chat (using polling instead)
- Photo messages (text only)
- Voice/video calls
- Internal SWAG checkout (still external)
- B2B quote request system (basic discovery only)
- Advanced matching ML algorithms
- SWAP shipping integration
- SWAP insurance
- Payment processing
- Review/rating system
- User blocking/reporting (basic version only)
- Push notifications (email only)
- SWAP analytics dashboard

✅ **These come in Phase 2**

---

## 🚀 AFTER PHASE 1

When Phase 1 is complete, we'll have:

### **A Working Marketplace:**
- Users discover hemp businesses via NADA-powered matching
- Users chat with organizations to discuss products/services
- Users list, swap, and trade hemp items peer-to-peer
- Trust scores increase with activity
- NADA flows through the economy
- All three rails operational

### **The Hero Loop is LIVE:**
```
Read → Earn → Spend → Discover → Connect → Transact → Trust ↑ → Read More
```

### **Ready for Phase 2:**
- Advanced matching algorithms
- Real-time websockets
- B2B RFP system
- Internal checkout
- Shipping integration
- Review system
- Analytics dashboards
- Mobile apps
- Marketing campaigns

---

## ✅ CHECKLIST TO START PHASE 1

Before starting Sprint 1.1:

- [x] Phase 0 complete (user profiles working)
- [ ] Phase 0 fully tested on mobile
- [ ] All Phase 0 bugs fixed
- [ ] User feedback on Phase 0 collected
- [ ] NADA economy balanced (sources = sinks)
- [ ] Database backup created
- [ ] Sprint 1.1 schema reviewed
- [ ] Sprint 1.1 routes planned
- [ ] Sprint 1.1 components designed
- [ ] Token budget confirmed (~83k for full Phase 1)

---

## 📚 RELATED DOCUMENTS

**Current Phase:**
- `/PHASE_0_COMPLETE.md` - What we just finished
- `/PHASE_0_INTEGRATION_GUIDE.md` - How Phase 0 was integrated

**Vision & Architecture:**
- `/THREE_RAILS_MARKETPLACE_VISION.md` - Overall vision
- `/HERO_LOOP_DEVELOPMENT_PLAN.md` - Hero Loop details
- `/THREE_RAILS_ARCHITECTURE_DIAGRAM.md` - System map

**Old Phase 1 References (Different Scope):**
- `/PHASE_1_TOKEN_1.1_COMPLETE.md` - Old SWAG database work
- `/PHASE_1_COMPLETION_SUMMARY.md` - Old SWAG external purchase flow
- `/SWAG_SHOP_ROADMAP.md` - Old shop features (Phase 1.1, 1.2, etc.)
  
  ⚠️ These old "Phase 1" docs refer to SWAG marketplace features, NOT the Three Rails Hero Loop

---

## 🎉 SUMMARY

**Phase 1 Mission:**  
Build the complete Hero Loop so reading articles leads to real business connections and transactions.

**Phase 1 Output:**  
Three operational marketplace rails (SWAP, SWAG, RFP) all powered by NADA and connected by messaging.

**Phase 1 Timeline:**  
4 weeks, 6 sprints, ~83,000 tokens

**Phase 1 Success:**  
When a user can read an article, earn NADA, discover a hemp company, chat with them, and complete a swap or purchase.

---

**Let's build the marketplace that extends the lifetime of every hemp product!** 🌿✨

**Phase 1 → Three Rails → Hero Loop → Traction** 🚀
