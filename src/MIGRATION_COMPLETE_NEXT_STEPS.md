# ✅ MIGRATION COMPLETE - Next Steps

## 🎉 What's Been Done

### ✅ **Database Migration (COMPLETE)**
- Created `swap_likes` table (24h temp matches)
- Created `swap_deals` table (active deal management)
- Created `swap_deal_messages` table (deal logistics chat)
- Created `swap_analytics` table (event tracking)
- Added columns to `swap_items`: power_level, likes_count, proposals_count, views_count, deleted_at
- Added columns to `swap_proposals`: expires_at, proposer_item_id, proposal_type
- Added indexes, triggers, RLS policies
- Helper functions for cleanup

### ✅ **Backend Routes (COMPLETE)**
All routes now use proper relational tables instead of KV store:

#### **Items**
- `GET /swap/items` - List items (includes power_level, likes_count, etc.)
- `GET /swap/items/:id` - Get item detail (increments views_count, tracks analytics)
- `POST /swap/items` - Create item (auto-calculates power_level)
- `PUT /swap/items/:id` - Update item (recalculates power_level)
- `DELETE /swap/items/:id` - Soft delete item

#### **Likes**
- `GET /swap/likes` - Get user's liked items
- `POST /swap/likes` - Like an item (24h expiry)
- `DELETE /swap/likes/:item_id` - Unlike an item

#### **Proposals**
- `GET /swap/proposals` - Get user's proposals (incoming/outgoing)
- `POST /swap/proposals` - Create proposal (item OR service type)
- `PUT /swap/proposals/:id` - Update proposal status (accept/decline/cancel)

#### **Deals** (NEW!)
- `GET /swap/deals` - Get user's active deals
- `GET /swap/deals/:id` - Get deal details
- `PUT /swap/deals/:id` - Update deal (status, shipping, confirmations)

#### **Deal Messages** (NEW!)
- `GET /swap/deals/:id/messages` - Get deal messages timeline
- `POST /swap/deals/:id/messages` - Send deal message

---

## 🎯 What's Next - Frontend Updates

### **1. Update ProposeSWAPDealModal** (Priority 1)
**File:** `/components/swap/ProposeSWAPDealModal.tsx`

**Changes Needed:**
```tsx
// Add two-tab system
<Tabs value={proposalType} onValueChange={setProposalType}>
  <TabsList>
    <TabsTrigger value="item">📦 Trade an Item</TabsTrigger>
    <TabsTrigger value="service">🤝 Offer Skills/Help</TabsTrigger>
  </TabsList>
  
  <TabsContent value="item">
    {/* Show user's inventory - select item */}
    <ItemSelector items={myItems} onSelect={setSelectedItemId} />
  </TabsContent>
  
  <TabsContent value="service">
    {/* Free-form service offer */}
    <Input placeholder="Service title (e.g., Logo Design)" />
    <Textarea placeholder="What you'll do..." />
    <CategorySelect />
  </TabsContent>
</Tabs>
```

**API Call:**
```typescript
// Send proposal
await fetch(`${serverUrl}/swap/proposals`, {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    swap_item_id: targetItemId,
    
    // If item-to-item (tab 1)
    proposer_item_id: selectedItemId,
    proposal_type: 'item',
    
    // OR if service (tab 2)
    proposal_type: 'service',
    offer_title: 'Logo Design',
    offer_description: 'I will design...',
    offer_category: 'Design',
    offer_condition: 'One-time',
    offer_images: [],
    
    // Both
    message: 'Personal note...'
  })
});
```

---

### **2. Create SWAP Deals Inbox** (Priority 2)
**New File:** `/components/swap/SWAPDealsInbox.tsx`

**Layout:**
```tsx
<div className="swap-deals-inbox">
  {/* Tabs: Incoming / My Proposals / Active / Completed */}
  <Tabs value={activeTab}>
    <TabsList>
      <TabsTrigger value="incoming">
        📥 Incoming ({incomingCount})
      </TabsTrigger>
      <TabsTrigger value="outgoing">
        📤 My Proposals ({outgoingCount})
      </TabsTrigger>
      <TabsTrigger value="active">
        🤝 Active Deals ({activeCount})
      </TabsTrigger>
      <TabsTrigger value="completed">
        ✅ Completed ({completedCount})
      </TabsTrigger>
    </TabsList>
    
    {/* Deal cards */}
    <TabsContent value="incoming">
      {incomingProposals.map(proposal => (
        <ProposalCard 
          proposal={proposal}
          onAccept={() => acceptProposal(proposal.id)}
          onDecline={() => declineProposal(proposal.id)}
        />
      ))}
    </TabsContent>
    
    <TabsContent value="active">
      {activeDeals.map(deal => (
        <DealCard 
          deal={deal}
          onClick={() => openDealDetail(deal)}
        />
      ))}
    </TabsContent>
  </Tabs>
</div>
```

**API Calls:**
```typescript
// Get incoming proposals
const incoming = await fetch(
  `${serverUrl}/swap/proposals?type=incoming`,
  { headers: { Authorization: `Bearer ${token}` }}
).then(r => r.json());

// Get outgoing proposals
const outgoing = await fetch(
  `${serverUrl}/swap/proposals?type=outgoing`,
  { headers: { Authorization: `Bearer ${token}` }}
).then(r => r.json());

// Get active deals
const active = await fetch(
  `${serverUrl}/swap/deals?status=negotiating,shipping`,
  { headers: { Authorization: `Bearer ${token}` }}
).then(r => r.json());

// Get completed
const completed = await fetch(
  `${serverUrl}/swap/deals?status=completed`,
  { headers: { Authorization: `Bearer ${token}` }}
).then(r => r.json());
```

---

### **3. Create Deal Detail Modal** (Priority 3)
**New File:** `/components/swap/DealDetailModal.tsx`

**Layout:**
```tsx
<Dialog>
  <DialogContent className="max-w-3xl">
    {/* Header: Item pair + status */}
    <div className="deal-header">
      <ItemPairDisplay 
        item1={deal.my_item}
        item2={deal.their_item}
      />
      <DealStatusBadge status={deal.status} />
    </div>
    
    {/* Two tabs: Logistics + Chat */}
    <Tabs value={activeTab}>
      <TabsList>
        <TabsTrigger value="logistics">
          📦 Logistics
          {deal.unread_count > 0 && <Badge>{deal.unread_count}</Badge>}
        </TabsTrigger>
        <TabsTrigger value="chat">
          💬 Chat with {deal.other_user.display_name}
        </TabsTrigger>
      </TabsList>
      
      {/* Logistics Timeline */}
      <TabsContent value="logistics">
        <DealMessagesTimeline messages={dealMessages} />
        
        {/* Action Buttons */}
        {!deal.user1_shipped && deal.is_user1 && (
          <Button onClick={markShipped}>Mark as Shipped</Button>
        )}
        {deal.user2_shipped && !deal.user1_confirmed && deal.is_user1 && (
          <Button onClick={confirmReceipt}>Confirm Receipt</Button>
        )}
        
        {/* Send logistics message */}
        <Input 
          placeholder="Add tracking number or update..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendLogisticsMessage();
          }}
        />
      </TabsContent>
      
      {/* General Chat (uses existing messages table) */}
      <TabsContent value="chat">
        <GeneralChatView conversationId={deal.conversation_id} />
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>
```

**API Calls:**
```typescript
// Get deal messages (logistics)
const messages = await fetch(
  `${serverUrl}/swap/deals/${dealId}/messages`,
  { headers: { Authorization: `Bearer ${token}` }}
).then(r => r.json());

// Send logistics message
await fetch(`${serverUrl}/swap/deals/${dealId}/messages`, {
  method: 'POST',
  headers: { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Tracking: USPS123456',
    message_type: 'shipping'
  })
});

// Mark shipped
await fetch(`${serverUrl}/swap/deals/${dealId}`, {
  method: 'PUT',
  headers: { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user1_shipped: true // or user2_shipped
  })
});

// Confirm receipt
await fetch(`${serverUrl}/swap/deals/${dealId}`, {
  method: 'PUT',
  headers: { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user1_confirmed: true // or user2_confirmed
  })
});
```

---

### **4. Update Existing Components**

#### **SwapItemCard.tsx**
**Add:**
```tsx
// Show power level stars
<div className="power-level">
  {Array.from({length: item.power_level}).map((_, i) => (
    <Star key={i} className="fill-hemp-green" />
  ))}
</div>

// Show likes count
<div className="stats">
  <Heart className="size-4" />
  <span>{item.likes_count}</span>
</div>
```

#### **SwapItemDetailModal.tsx**
**Add:**
```tsx
// Like button
<Button 
  onClick={toggleLike}
  variant={isLiked ? "default" : "outline"}
>
  <Heart className={isLiked ? "fill-current" : ""} />
  {isLiked ? 'Liked' : 'Like'}
</Button>

// Show expiry timer if liked
{isLiked && (
  <p className="text-sm text-muted-foreground">
    ⏰ {timeUntilExpiry} to propose
  </p>
)}
```

---

### **5. Real-time Subscriptions**

#### **Subscribe to Deal Updates**
```typescript
// In DealDetailModal
useEffect(() => {
  const channel = supabase
    .channel(`deal:${dealId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'swap_deal_messages',
      filter: `deal_id=eq.${dealId}`
    }, (payload) => {
      // New message arrived
      setMessages(prev => [...prev, payload.new]);
    })
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'swap_deals',
      filter: `id=eq.${dealId}`
    }, (payload) => {
      // Deal status updated
      setDeal(payload.new);
    })
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [dealId]);
```

#### **Subscribe to New Proposals**
```typescript
// In SWAPDealsInbox
useEffect(() => {
  const channel = supabase
    .channel('my-proposals')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'swap_proposals',
      filter: `swap_item.user_id=eq.${userId}` // Incoming
    }, () => {
      refetchProposals();
    })
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [userId]);
```

---

## 📋 Implementation Checklist

### **Phase 1: Core Updates**
- [ ] Update ProposeSWAPDealModal with two-tab system
- [ ] Test proposal creation (item vs service)
- [ ] Update SwapItemCard to show power_level stars
- [ ] Update SwapItemDetailModal with like button

### **Phase 2: Inbox**
- [ ] Create SWAPDealsInbox component
- [ ] Create ProposalCard component
- [ ] Create DealCard component
- [ ] Test incoming/outgoing proposals display

### **Phase 3: Deal Management**
- [ ] Create DealDetailModal component
- [ ] Create DealMessagesTimeline component
- [ ] Integrate general chat tab
- [ ] Add shipping/confirmation actions

### **Phase 4: Real-time**
- [ ] Add real-time subscriptions to DealDetailModal
- [ ] Add real-time subscriptions to SWAPDealsInbox
- [ ] Test live updates

### **Phase 5: Polish**
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success toasts
- [ ] Add expiry timers UI
- [ ] Add power level animations
- [ ] Add badge notifications

---

## 🚀 Ready to Build!

**Backend is ready.** Now let's update the frontend!

What would you like me to build first?
1. ✅ ProposeSWAPDealModal (two-tab system)
2. ✅ SWAPDealsInbox
3. ✅ DealDetailModal
4. ✅ Update existing components

**Let me know which to start with!** 🎯
