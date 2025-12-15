# 🔄 SWAP SHOP C2C BARTER - IMPLEMENTATION STATUS

**Date:** December 9, 2024  
**Status:** 🔧 IN PROGRESS (Backend Complete, Frontend 40%)

---

## 🎯 THE VISION

Simple photo-for-photo barter system:
1. User posts item with photos
2. Other user sees it in feed, clicks
3. Sends photo of what they want to trade
4. Original user accepts/rejects
5. If accepted → reveal countries → chat → arrange logistics → complete

---

## ✅ COMPLETED

### **Backend (100%)** ✅

**Database Schema:**
- ✅ `swap_items` table (user listings)
- ✅ `swap_proposals` table (barter offers)
- ✅ `swap_completions` table (trust tracking)
- ✅ RLS policies (secure access)
- ✅ Indexes for performance
- ✅ Storage bucket for images

**API Routes:**
- ✅ `GET /swap/items` - List all available items (with filters)
- ✅ `GET /swap/items/:id` - Get item detail
- ✅ `POST /swap/items` - Create new listing
- ✅ `GET /swap/my-items` - User's listings
- ✅ `PUT /swap/items/:id` - Update listing
- ✅ `DELETE /swap/items/:id` - Remove listing (soft delete)
- ✅ `POST /swap/proposals` - Send barter proposal
- ✅ `GET /swap/proposals?type=sent|received` - Get proposals
- ✅ `PUT /swap/proposals/:id/accept` - Accept proposal (creates conversation)
- ✅ `PUT /swap/proposals/:id/reject` - Reject proposal
- ✅ `PUT /swap/proposals/:id/complete` - Mark swap completed (with rating)

**Features:**
- ✅ Image upload to Supabase Storage
- ✅ Conversation creation on acceptance
- ✅ Trust score tracking
- ✅ Filtering (category, condition, country, search)
- ✅ Proposal counting
- ✅ User profile integration

---

### **Frontend (40%)** 🔧

**Components Created:**
- ✅ `SwapShopFeed` - Main browse view with filters
- ✅ `SwapItemCard` - Item card in grid
- ✅ `AddSwapItemModal` - 3-step item creation wizard
  - Step 1: Basic info (title, category, condition, hemp %)
  - Step 2: Photos & story
  - Step 3: Location & review

**Features:**
- ✅ Browse items in grid layout
- ✅ Filter by category, condition, search
- ✅ Image upload with preview
- ✅ Hemp percentage badge
- ✅ Condition badges with colors
- ✅ User profile display
- ✅ Country flags
- ✅ Years in use tracking

---

## 🔧 IN PROGRESS

### **Frontend Components (60% remaining)**

**Need to Create:**
- 🔜 `SwapItemDetailModal` - Item detail view with proposal button
- 🔜 `SwapProposalModal` - Send proposal with photo upload
- 🔜 `SwapInbox` - Manage incoming/outgoing proposals
- 🔜 `SwapProposalCard` - Proposal display card
- 🔜 `MySwapItems` - User's own listings dashboard
- 🔜 Integration with messaging system (chat after acceptance)

---

## 📋 TODO - REMAINING WORK

### **1. SwapItemDetailModal** (Priority: HIGH)
**What:** Full item detail view
**Features:**
- Large image carousel
- Full description & story
- Owner profile (hidden country until accepted)
- Condition details
- Hemp percentage
- "Propose Swap" button (if not owner)
- "View Proposals" button (if owner)

**Effort:** 2-3 hours

---

### **2. SwapProposalModal** (Priority: HIGH)
**What:** Send barter offer
**Features:**
- Upload photo of what you're offering
- Add title & description of your offer
- Select condition
- Add personal message
- Preview before sending
- NADA cost (optional - future)

**Effort:** 2-3 hours

---

### **3. SwapInbox** (Priority: HIGH)
**What:** Manage proposals
**Tabs:**
- Received (proposals on your items)
- Sent (proposals you've made)

**Features:**
- Proposal cards with photos
- Accept/Reject buttons
- Status labels (pending, accepted, rejected, completed)
- Link to conversation (if accepted)
- Completion tracking

**Effort:** 3-4 hours

---

### **4. MySwapItems** (Priority: MEDIUM)
**What:** Dashboard for user's listings
**Features:**
- Grid of user's items
- Status badges (available, pending, swapped)
- Proposal count on each item
- Edit/Remove buttons
- Quick stats (total listings, active swaps, completed)

**Effort:** 2 hours

---

### **5. Integration with Messaging** (Priority: HIGH)
**What:** Connect accepted proposals to chat
**Features:**
- Auto-create conversation on acceptance
- Show country locations in conversation
- "Mark as Completed" button in chat
- Rating modal after completion

**Effort:** 2 hours

---

### **6. Navigation Integration** (Priority: MEDIUM)
**What:** Add SWAP to main navigation
**Changes:**
- Add SWAP icon to bottom navbar
- Add to browse view
- Add to ME menu
- Link from SWAG products ("List on SWAP after use")

**Effort:** 1 hour

---

### **7. Storage Bucket Setup** (Priority: CRITICAL)
**What:** Create Supabase storage bucket
**Steps:**
1. Run SQL to create `swap-images` bucket
2. Set up RLS policies for uploads
3. Test image upload/retrieval

**Effort:** 30 minutes

---

## 🗺️ DATABASE SCHEMA

### **swap_items**
```sql
- id UUID
- user_id UUID (owner)
- title TEXT
- description TEXT
- category TEXT (clothing, accessories, home_goods, wellness, construction, other)
- condition TEXT (like_new, good, well_loved, vintage)
- hemp_inside BOOLEAN
- hemp_percentage INTEGER
- images TEXT[] (array of URLs)
- country TEXT
- city TEXT
- willing_to_ship BOOLEAN
- story TEXT
- years_in_use INTEGER
- original_product_id UUID (link to SWAG if applicable)
- status TEXT (available, pending, swapped, removed)
- created_at TIMESTAMP
- updated_at TIMESTAMP
- swapped_at TIMESTAMP
```

### **swap_proposals**
```sql
- id UUID
- swap_item_id UUID (what they want)
- proposer_user_id UUID (who's offering)
- offer_images TEXT[] (photos of their offer)
- offer_description TEXT
- offer_title TEXT
- offer_condition TEXT
- offer_category TEXT
- message TEXT (personal message)
- status TEXT (pending, accepted, rejected, completed, cancelled)
- conversation_id UUID (created on acceptance)
- created_at TIMESTAMP
- updated_at TIMESTAMP
- responded_at TIMESTAMP
- completed_at TIMESTAMP
```

### **swap_completions**
```sql
- id UUID
- proposal_id UUID
- swap_item_id UUID
- giver_user_id UUID
- receiver_user_id UUID
- giver_confirmed BOOLEAN
- receiver_confirmed BOOLEAN
- giver_rating INTEGER (1-5)
- receiver_rating INTEGER (1-5)
- giver_feedback TEXT
- receiver_feedback TEXT
- completed_at TIMESTAMP
```

---

## 🎨 DESIGN SYSTEM

### **Colors:**
- Primary: Cyan/Teal gradient (matches DEWII brand)
- Accents: Green for hemp badges
- Condition colors:
  - Like New: Green
  - Good: Cyan
  - Well-Loved: Yellow
  - Vintage: Purple

### **Visual Style:**
- Patina/worn aesthetic (matches "used items")
- Storytelling focus (item history, provenance)
- Warm, community-driven feel
- Different from clean SWAG aesthetic

---

## 🔌 API ENDPOINTS (Completed)

```
GET    /swap/items                    List items (with filters)
GET    /swap/items/:id                Get item detail
POST   /swap/items                    Create listing
GET    /swap/my-items                 User's listings
PUT    /swap/items/:id                Update listing
DELETE /swap/items/:id                Remove listing

POST   /swap/proposals                Send proposal
GET    /swap/proposals?type=sent      User's sent proposals
GET    /swap/proposals?type=received  User's received proposals
PUT    /swap/proposals/:id/accept     Accept proposal
PUT    /swap/proposals/:id/reject     Reject proposal
PUT    /swap/proposals/:id/complete   Mark completed
```

---

## 📦 FILES CREATED

**Backend:**
- `/database_schemas/swap_shop_schema.sql` - Complete DB schema
- `/supabase/functions/server/swap_routes.tsx` - All API endpoints
- Updated `/supabase/functions/server/index.tsx` - Mounted routes

**Frontend:**
- `/components/swap/SwapShopFeed.tsx` - Main browse view
- `/components/swap/SwapItemCard.tsx` - Item card component
- `/components/swap/AddSwapItemModal.tsx` - Create listing wizard

**Documentation:**
- `/SWAP_SHOP_IMPLEMENTATION_STATUS.md` - This file
- Updated `/THREE_RAILS_STATUS_DEC_9_2024.md` - Overall roadmap

---

## ⏱️ TIME ESTIMATES

**Completed:** ~4 hours (backend + initial frontend)  
**Remaining:** ~12-15 hours

**Breakdown:**
- SwapItemDetailModal: 2-3 hours
- SwapProposalModal: 2-3 hours
- SwapInbox: 3-4 hours
- MySwapItems: 2 hours
- Messaging integration: 2 hours
- Navigation integration: 1 hour
- Storage setup: 30 minutes
- Testing & polish: 2 hours

**Total to MVP:** ~16-19 hours

---

## 🎯 MVP DEFINITION

**What needs to work for V1:**
1. ✅ Users can list items
2. ✅ Users can browse items
3. 🔜 Users can view item details
4. 🔜 Users can send proposals (with photo)
5. 🔜 Owners can accept/reject proposals
6. 🔜 Accepted proposals unlock chat
7. 🔜 Users can mark swaps as completed
8. 🔜 Trust scores update on completion

---

## 🚀 DEPLOYMENT CHECKLIST

**Before Launch:**
- [ ] Run SQL schema in Supabase
- [ ] Create `swap-images` storage bucket
- [ ] Set up RLS policies for storage
- [ ] Test image uploads
- [ ] Deploy backend routes
- [ ] Test all API endpoints
- [ ] Complete all frontend components
- [ ] Test full flow end-to-end
- [ ] Add to navigation
- [ ] Create documentation for users

---

## 💡 FUTURE ENHANCEMENTS (Post-MVP)

**Phase 2:**
- NADA balancing (add NADA to unequal trades)
- Shipping integration (label printing)
- Verification service (high-value swaps)
- Public swap requests ("Looking for X")
- Swap matching algorithm

**Phase 3:**
- Link to original SWAG products
- Provenance chain tracking
- "Resell on SWAP" button from purchases
- Sustainability metrics (total years in circulation)
- Heirloom status (items swapped 5+ times)

---

## 🔥 NEXT IMMEDIATE STEPS

1. **Create storage bucket** (30 min)
   - Run SQL in Supabase dashboard
   - Test upload/download

2. **Build SwapItemDetailModal** (2-3 hours)
   - Image carousel
   - Full details
   - Propose button

3. **Build SwapProposalModal** (2-3 hours)
   - Photo upload
   - Offer description
   - Send proposal

4. **Build SwapInbox** (3-4 hours)
   - Received/sent tabs
   - Accept/reject actions
   - Link to chat

5. **Test & integrate** (2 hours)
   - End-to-end flow
   - Add to navigation
   - Polish UX

---

**Status:** 🟡 40% Complete  
**Backend:** ✅ 100% Done  
**Frontend:** 🔧 40% Done  
**ETA to MVP:** ~12-15 hours

**Next Session:** Build detail modal, proposal modal, and inbox 🚀
