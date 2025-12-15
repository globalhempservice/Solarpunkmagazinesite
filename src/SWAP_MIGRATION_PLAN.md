# 🔄 SWAP Safe Migration Plan

## ✅ Your Existing Schema (Preserved!)

### **swap_items** (53 rows - ALL SAFE!)
```
✅ id, user_id, title, description, category, condition
✅ hemp_inside, hemp_percentage, images[]
✅ country, city, willing_to_ship, story, years_in_use
✅ original_product_id (link to SWAG products)
✅ status, created_at, updated_at, swapped_at
✅ latitude, longitude (for geo-location)
```

### **swap_proposals** (0 rows)
```
✅ id, swap_item_id, proposer_user_id
✅ offer_images[], offer_description, offer_title, offer_condition, offer_category
✅ message, status, conversation_id
✅ created_at, updated_at, responded_at, completed_at
```
**Your Model:** User sees item → proposes what they'll offer (free-form)

### **swap_completions** (0 rows)
```
✅ id, proposal_id, swap_item_id
✅ giver_user_id, receiver_user_id
✅ giver_confirmed, receiver_confirmed
✅ giver_rating, receiver_rating
✅ giver_feedback, receiver_feedback
✅ completed_at, created_at
```
**Purpose:** Post-swap ratings and feedback

---

## 🎯 SWAP Proposal Philosophy (Hybrid Model)

### **The Human Approach:**
```
PRIMARY PATH (Encouraged):
└─ User selects item from inventory → Item-to-item matching

SECONDARY PATH (Inclusive):
└─ User proposes skills/services/help/time → Keeps doors open for those without items
```

**Why Both?**
- ✅ **Item matching** - Preferred for physical goods exchange
- ✅ **Skills/services** - Inclusive for newcomers, time banking, service exchange
- ✅ **NADA philosophy** - Not everything valuable can be photographed!

### **How It Works:**
1. User sees item they want
2. **Option A:** "Trade one of my items" → Select from inventory (guided flow)
3. **Option B:** "Offer my skills/help" → Free-form description (fallback)

Both create `swap_proposals`, but:
- Option A: Has `proposer_item_id` filled
- Option B: Has `offer_description` filled (skills, time, services)

---

## 🆕 What the Migration Adds

### **1. New Columns to Existing Tables**

#### **swap_items** gets:
- `power_level` INTEGER (1-10) - Gamification stars
- `likes_count` INTEGER - How many likes
- `proposals_count` INTEGER - How many proposals received
- `views_count` INTEGER - Track views
- `last_boosted_at` TIMESTAMPTZ - Last time item was boosted
- `deleted_at` TIMESTAMPTZ - Soft delete (preserve data)

#### **swap_proposals** gets:
- `expires_at` TIMESTAMPTZ - 48-hour expiry timer
- `proposer_item_id` UUID - Optional: if proposer offers item from their inventory

---

### **2. New Tables**

#### **swap_likes** (24-hour temporary matches)
```sql
- id, user_id, item_id
- liked_at, expires_at (24 hours)
- proposal_sent (boolean)
- proposal_id (link to proposal if sent)
```
**Purpose:** User swipes right → 24h to send proposal

#### **swap_deals** (Active swap management)
```sql
- id, proposal_id (unique)
- user1_id, user2_id, item1_id, item2_id
- status (negotiating/shipping/completed/disputed/cancelled)
- user1_confirmed, user2_confirmed
- user1_shipped, user2_shipped
- conversation_id (link to your existing conversation system!)
- last_message_at, unread_count_user1, unread_count_user2
```
**Purpose:** Manage active swaps after proposal accepted

#### **swap_deal_messages** (Contextual chat per deal)
```sql
- id, deal_id, sender_id
- message, message_type (text/system/shipping/image/location)
- images[], read_by_other, read_at
```
**Purpose:** Deal-specific messaging (separate from general conversations)

#### **swap_analytics** (Event tracking - Optional)
```sql
- id, user_id, item_id
- event_type (view/like/propose/accept/complete)
- metadata (JSONB)
```
**Purpose:** Track user behavior for insights

---

## 🎯 What This Enables

### **Current Flow (What you have):**
```
1. User creates item
2. Other user sees item
3. Other user sends proposal (free-form offer)
4. Item owner accepts/declines
5. If accepted → conversation_id created
6. After swap → swap_completions for ratings
```

### **Enhanced Flow (After migration):**
```
1. User creates item (gets power_level based on completeness)
2. Other user browses → likes item (saved to swap_likes, 24h timer)
3. Other user has 24h to:
   - Send free-form proposal (current system)
   - OR select item from their inventory (new option)
4. Item owner accepts/declines
5. If accepted → swap_deals entry created
   - Links to conversation_id
   - Tracks shipping status
   - Tracks confirmations
6. Deal messaging via swap_deal_messages (contextual)
7. After swap → swap_completions for ratings
```

---

## 🔧 Backend Route Changes Needed

### **New Routes to Add:**

```typescript
// LIKES
GET    /swap/likes?user_id=xxx           // Get my likes
POST   /swap/likes                        // Like an item
DELETE /swap/likes/:itemId                // Unlike

// DEALS (after proposal accepted)
GET    /swap/deals                        // My active deals
GET    /swap/deals/:id                    // Deal details
PUT    /swap/deals/:id                    // Update status/confirmations

// DEAL MESSAGES
GET    /swap/deals/:id/messages           // Get messages
POST   /swap/deals/:id/messages           // Send message
PUT    /swap/deals/:id/messages/mark-read // Mark as read
```

### **Routes to Update:**

```typescript
// UPDATE: Include new fields
GET    /swap/items                        // Add power_level, likes_count, etc.
GET    /swap/items/:id                    // Add likes_count, views_count

// UPDATE: Check expires_at
GET    /swap/proposals                    // Filter expired proposals
```

---

## ⚙️ Configuration Notes

### **Keep Your Proposal Model:**
Your free-form proposal system (offer_description, offer_title, etc.) is **PRESERVED**!

The new `proposer_item_id` field is **OPTIONAL** - allows hybrid approach:
- User can still send free-form offers ✅
- OR user can select from their inventory (new option) ✅

### **conversation_id Integration:**
You already have `conversation_id` in `swap_proposals`. The migration:
- Adds `conversation_id` to `swap_deals` too
- Creates separate `swap_deal_messages` for deal-specific chat
- You can keep both systems or consolidate later

### **Question for You:**
Do you have a `conversations` or `messages` table already? 
- If YES → We'll integrate with it
- If NO → We'll use `swap_deal_messages` only

---

## 🚀 Migration Steps

### **Step 1: Backup (Recommended)**
```sql
-- In Supabase SQL Editor
SELECT * FROM swap_items;        -- Export to CSV
SELECT * FROM swap_proposals;    -- Export to CSV
SELECT * FROM swap_completions;  -- Export to CSV
```

### **Step 2: Run Migration**
```bash
1. Open Supabase Dashboard → SQL Editor
2. Copy /SWAP_SAFE_MIGRATION.sql
3. Paste and click "Run"
4. See success message with data counts
```

### **Step 3: Verify**
```sql
-- Check new columns exist
SELECT power_level, likes_count FROM swap_items LIMIT 1;

-- Check new tables exist
SELECT COUNT(*) FROM swap_likes;
SELECT COUNT(*) FROM swap_deals;
```

### **Step 4: I Update Backend**
Once you run the SQL, I'll:
1. ✅ Update swap_routes.tsx with new endpoints
2. ✅ Update frontend components
3. ✅ Add real-time subscriptions
4. ✅ Create SWAP deals inbox UI

---

## 🎮 Features After Migration

### **Immediate:**
- ✅ Power levels (1-10 stars) for items
- ✅ Like tracking (24h expiry)
- ✅ Proposal expiry (48h timer)
- ✅ Auto-increment counters
- ✅ Soft delete (preserve data)

### **After Backend Update:**
- ✅ SWAP Deals Inbox (manage active swaps)
- ✅ Deal-specific messaging
- ✅ Shipping status tracking
- ✅ Confirmation workflow
- ✅ Analytics dashboard

---

## ✅ Safety Guarantees

1. ✅ **Zero data loss** - All 53 items preserved
2. ✅ **Backward compatible** - Old code still works
3. ✅ **Additive only** - Only adds columns/tables, never removes
4. ✅ **IF NOT EXISTS** - Safe to run multiple times
5. ✅ **RLS enabled** - Security policies active

---

## 📋 Checklist

- [ ] Backup existing data (optional but recommended)
- [ ] Run `/SWAP_SAFE_MIGRATION.sql` in Supabase
- [ ] Verify new columns with `SELECT power_level FROM swap_items LIMIT 1`
- [ ] Verify new tables with `SELECT COUNT(*) FROM swap_likes`
- [ ] Let me know when done → I'll update backend routes
- [ ] Test full flow

---

## 🔥 Ready?

**Just run the SQL and let me know!** Your data is 100% safe. 🎯✨

The migration is **additive only** - it adds new functionality without breaking anything existing. All your 53 items will remain intact, and your current proposal flow will continue to work exactly as before!