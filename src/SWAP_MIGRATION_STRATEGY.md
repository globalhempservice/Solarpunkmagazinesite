# 🔄 SWAP System Migration Strategy

## Overview
Migrating from KV store to proper relational tables for better tracking, queries, and contextual deal discussions.

---

## 📊 Current State vs New Architecture

### **BEFORE (KV Store)**
```
┌─────────────────────────────────────┐
│ kv_store_053bcd80                   │
├─────────────────────────────────────┤
│ swap_likes:{user_id}    → JSON[]    │
│ swap_proposals:{user_id} → JSON[]   │
└─────────────────────────────────────┘
```

**Problems:**
- ❌ No proper relationships
- ❌ Hard to query efficiently
- ❌ No message threading
- ❌ No analytics tracking
- ❌ Difficult to track deal states
- ❌ Manual expiry management

---

### **AFTER (Relational Tables)**
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  swap_items  │────▶│  swap_likes  │     │ swap_analytics│
│              │     │              │     │              │
│ - id         │     │ - item_id    │     │ - event_type │
│ - user_id    │     │ - user_id    │     │ - metadata   │
│ - title      │     │ - expires_at │     └──────────────┘
│ - status     │     └──────────────┘
│ - power_level│              │
└──────────────┘              │
       │                      ▼
       │              ┌──────────────┐
       └─────────────▶│swap_proposals│
                      │              │
                      │ - sender_id  │
                      │ - receiver_id│
                      │ - status     │
                      └──────────────┘
                             │
                             │ (when accepted)
                             ▼
                      ┌──────────────┐     ┌──────────────────┐
                      │  swap_deals  │────▶│swap_deal_messages│
                      │              │     │                  │
                      │ - user1_id   │     │ - message        │
                      │ - user2_id   │     │ - sender_id      │
                      │ - status     │     │ - read_by_other  │
                      │ - unread_cnt │     │ - created_at     │
                      └──────────────┘     └──────────────────┘
```

**Benefits:**
- ✅ Proper foreign keys & relationships
- ✅ Efficient queries with indexes
- ✅ Message threading per deal
- ✅ Auto-expiry with triggers
- ✅ Analytics tracking
- ✅ RLS security policies
- ✅ Real-time updates support

---

## 🗄️ New Tables Overview

| Table | Purpose | Key Features |
|-------|---------|--------------|
| **swap_items** | Core item listing | Power levels, hemp info, soft delete |
| **swap_likes** | 24h temp matches | Auto-expiry, proposal tracking |
| **swap_proposals** | Swap proposals | 48h expiry, status tracking |
| **swap_deals** | Accepted proposals | Message threading, confirmation tracking |
| **swap_deal_messages** | Chat per deal | Read receipts, system messages |
| **swap_analytics** | User behavior | Event tracking, metadata |

---

## 🔄 What Needs to Change in Backend

### **1. Update `/supabase/functions/server/swap_routes.tsx`**

#### **Likes Routes - BEFORE:**
```typescript
// GET /swap-likes - From KV store
const { data: kvData } = await supabase
  .from('kv_store_053bcd80')
  .select('value')
  .eq('key', `swap_likes:${userId}`)
  .single();

const likes = kvData?.value ? JSON.parse(kvData.value) : [];
```

#### **Likes Routes - AFTER:**
```typescript
// GET /swap-likes - From swap_likes table
const { data: likes } = await supabase
  .from('swap_likes')
  .select(`
    *,
    item:swap_items(
      *,
      user_profile:user_profiles(*)
    )
  `)
  .eq('user_id', userId)
  .gt('expires_at', new Date().toISOString())
  .order('created_at', { ascending: false });
```

---

#### **Proposals Routes - BEFORE:**
```typescript
// GET /swap-proposals - From KV store
const { data: kvData } = await supabase
  .from('kv_store_053bcd80')
  .select('value')
  .eq('key', `swap_proposals:${userId}`)
  .single();

const proposals = kvData?.value ? JSON.parse(kvData.value) : [];
```

#### **Proposals Routes - AFTER:**
```typescript
// GET /swap-proposals - From swap_proposals table
const { data: proposals } = await supabase
  .from('swap_proposals')
  .select(`
    *,
    sender:auth.users!sender_id(id, email),
    receiver:auth.users!receiver_id(id, email),
    sender_item:swap_items!sender_item_id(*),
    receiver_item:swap_items!receiver_item_id(*)
  `)
  .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
  .order('created_at', { ascending: false });
```

---

### **2. New Routes to Add**

#### **Deals Routes** (NEW!)
```typescript
// GET /swap-deals - Get user's active deals
swap.get('/make-server-053bcd80/swap-deals', async (c) => {
  const user = await getUserFromAuth(c.req.header('Authorization'));
  
  const { data: deals } = await supabase
    .from('my_active_swap_deals')
    .select('*')
    .order('updated_at', { ascending: false });
    
  return c.json({ deals });
});

// GET /swap-deals/:id - Get deal details
swap.get('/make-server-053bcd80/swap-deals/:id', async (c) => {
  const dealId = c.req.param('id');
  // ... fetch deal with items and user profiles
});

// PUT /swap-deals/:id - Update deal status
swap.put('/make-server-053bcd80/swap-deals/:id', async (c) => {
  // Update status, confirmations, shipping status
});
```

#### **Deal Messages Routes** (NEW!)
```typescript
// GET /swap-deals/:dealId/messages - Get messages for a deal
swap.get('/make-server-053bcd80/swap-deals/:dealId/messages', async (c) => {
  const dealId = c.req.param('dealId');
  
  const { data: messages } = await supabase
    .from('swap_deal_messages')
    .select(`
      *,
      sender:auth.users!sender_id(id, email),
      sender_profile:user_profiles!sender_id(*)
    `)
    .eq('deal_id', dealId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });
    
  return c.json({ messages });
});

// POST /swap-deals/:dealId/messages - Send message
swap.post('/make-server-053bcd80/swap-deals/:dealId/messages', async (c) => {
  const user = await getUserFromAuth(c.req.header('Authorization'));
  const dealId = c.req.param('dealId');
  const { message, message_type, images } = await c.req.json();
  
  const { data, error } = await supabase
    .from('swap_deal_messages')
    .insert({
      deal_id: dealId,
      sender_id: user.id,
      message,
      message_type: message_type || 'text',
      images: images || []
    })
    .select()
    .single();
    
  return c.json({ message: data });
});

// PUT /swap-deals/:dealId/messages/mark-read - Mark messages as read
swap.put('/make-server-053bcd80/swap-deals/:dealId/messages/mark-read', async (c) => {
  const user = await getUserFromAuth(c.req.header('Authorization'));
  const dealId = c.req.param('dealId');
  
  // Mark all unread messages as read
  await supabase
    .from('swap_deal_messages')
    .update({ read_by_other: true, read_at: new Date().toISOString() })
    .eq('deal_id', dealId)
    .neq('sender_id', user.id)
    .eq('read_by_other', false);
    
  // Reset unread count
  const { data: deal } = await supabase
    .from('swap_deals')
    .select('user1_id, user2_id')
    .eq('id', dealId)
    .single();
    
  if (deal) {
    const isUser1 = deal.user1_id === user.id;
    await supabase
      .from('swap_deals')
      .update({ 
        [isUser1 ? 'unread_count_user1' : 'unread_count_user2']: 0 
      })
      .eq('id', dealId);
  }
  
  return c.json({ success: true });
});
```

---

## 🎯 Migration Steps

### **Step 1: Run SQL Schema** ✅
```bash
# Go to Supabase Dashboard → SQL Editor
# Copy/paste contents of SWAP_DATABASE_COMPLETE_SCHEMA.sql
# Click "Run"
```

### **Step 2: Update Backend Routes**
Update `/supabase/functions/server/swap_routes.tsx`:
1. ✅ Replace KV store queries with table queries
2. ✅ Add new deal routes
3. ✅ Add new message routes
4. ✅ Update response formats
5. ✅ Add proper error handling

### **Step 3: Update Frontend Components**
1. ✅ Update `MyInventory.tsx` to use new response format
2. ✅ Add `SwapDeals.tsx` component for deal inbox
3. ✅ Add `SwapDealChat.tsx` component for messaging
4. ✅ Update proposal flow to create proposals in table
5. ✅ Add real-time subscriptions for messages

### **Step 4: Test & Verify**
- ✅ Create items
- ✅ Like items
- ✅ Send proposals
- ✅ Accept proposals (should auto-create deal)
- ✅ Send messages in deal
- ✅ Confirm completion

---

## 🔥 Key Backend Changes Summary

### **Files to Update:**
1. `/supabase/functions/server/swap_routes.tsx` - Main changes
2. `/components/swap/MyInventory.tsx` - Frontend updates
3. `/components/swap/ProposeSwapModal.tsx` - Update proposal creation
4. **NEW:** `/components/swap/SwapDealsInbox.tsx` - Deal management
5. **NEW:** `/components/swap/SwapDealChat.tsx` - Message interface

### **Routes to Change:**
| Route | Before | After |
|-------|--------|-------|
| GET /swap-likes | KV store | `swap_likes` table |
| POST /swap-likes | KV upsert | `INSERT INTO swap_likes` |
| DELETE /swap-likes/:id | KV update | `DELETE FROM swap_likes` |
| GET /swap-proposals | KV store | `swap_proposals` table |
| POST /swap-proposals | KV upsert | `INSERT INTO swap_proposals` |
| PUT /swap-proposals/:id | KV update | `UPDATE swap_proposals` |

### **Routes to Add:**
| Route | Purpose |
|-------|---------|
| GET /swap-deals | List user's active deals |
| GET /swap-deals/:id | Get deal details |
| PUT /swap-deals/:id | Update deal status |
| GET /swap-deals/:id/messages | Get messages |
| POST /swap-deals/:id/messages | Send message |
| PUT /swap-deals/:id/messages/mark-read | Mark as read |

---

## 🚀 Benefits After Migration

### **Database Level:**
- ✅ Foreign key constraints ensure data integrity
- ✅ Indexes speed up queries by 10-100x
- ✅ RLS policies enforce security
- ✅ Triggers auto-update counters
- ✅ Views simplify complex queries

### **Application Level:**
- ✅ Real-time message updates via Supabase Realtime
- ✅ Contextual discussions per deal
- ✅ Read receipts and unread counts
- ✅ Better user experience
- ✅ Analytics for future features

### **Developer Experience:**
- ✅ Type-safe queries
- ✅ Easier debugging
- ✅ Better testing
- ✅ Simpler code

---

## 📋 Checklist

### Database Setup:
- [ ] Run `SWAP_DATABASE_COMPLETE_SCHEMA.sql` in Supabase
- [ ] Verify all 6 tables created
- [ ] Verify RLS policies enabled
- [ ] Test cleanup functions

### Backend Update:
- [ ] Update likes routes (KV → table)
- [ ] Update proposals routes (KV → table)
- [ ] Add deals routes
- [ ] Add messages routes
- [ ] Add error handling
- [ ] Test all endpoints

### Frontend Update:
- [ ] Update MyInventory component
- [ ] Create SwapDealsInbox component
- [ ] Create SwapDealChat component
- [ ] Add real-time subscriptions
- [ ] Update ProposeSwapModal
- [ ] Test full flow

---

## 🎮 Ready to Deploy!

Once SQL is run, I'll update all backend routes and frontend components to use the new relational architecture. This will give you:
- 🔥 Full deal management system
- 💬 Contextual messaging per swap
- 📊 Analytics tracking
- ⚡ Real-time updates
- 🔐 Secure RLS policies

**Let's build the ultimate SWAP marketplace!** 🚀
