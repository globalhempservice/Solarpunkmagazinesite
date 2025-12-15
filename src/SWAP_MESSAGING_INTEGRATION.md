# 💬 SWAP Messaging Integration Guide

## ✅ Your Existing Messaging System

### **messages table** (All-in-one messaging)
```sql
✅ conversation_id - Groups messages together
✅ topic - Subject line
✅ sender_id, recipient_id - Participants
✅ extension - Message type/category (flexible!)
✅ content - Message body
✅ payload (JSONB) - Flexible metadata
✅ event - System events
✅ read_at - Read tracking
✅ private, deleted - Flags
```

**This is perfect for integration!** 🎯

---

## 🎯 Integration Strategy: Dual-Channel System

### **Channel 1: General Chat (Existing messages table)**
```
Use for: Free-form conversation between users
├─ Initial contact
├─ Negotiations
├─ Getting to know each other
└─ General Q&A

How to use:
├─ topic = "SWAP: [Item Title]"
├─ extension = "swap_general"
├─ payload = { proposal_id, item_id, swap_item_id }
└─ Use existing conversation_id from swap_proposals
```

### **Channel 2: Deal Logistics (New swap_deal_messages)**
```
Use for: Structured deal management after acceptance
├─ Shipping confirmations
├─ Tracking numbers
├─ System notifications
├─ Status updates
└─ Deal timeline

How to use:
├─ Linked to swap_deals.id
├─ message_type (text/system/shipping/image/location)
├─ Auto-generated system messages
└─ Separate timeline from general chat
```

---

## 🔄 Complete Message Flow

### **Step 1: User Likes Item**
```sql
-- Insert into swap_likes
INSERT INTO swap_likes (user_id, item_id)
VALUES ('bob_id', 'item_123');

-- No messaging yet - just saved for later
```

### **Step 2: User Sends Proposal**
```sql
-- Create proposal
INSERT INTO swap_proposals (
  swap_item_id, 
  proposer_user_id,
  proposer_item_id,        -- If item-to-item
  offer_description,       -- If service offer
  proposal_type,           -- 'item' or 'service'
  message,
  conversation_id          -- Generate UUID
) VALUES (...);

-- Create initial general chat message
INSERT INTO messages (
  conversation_id,         -- Same as swap_proposals.conversation_id
  topic,                   -- "SWAP: Hemp Jacket"
  sender_id,               -- Bob
  recipient_id,            -- Alice
  extension,               -- "swap_general"
  content,                 -- "Hi! I'd love to trade for your hemp jacket..."
  payload                  -- { "proposal_id": "xyz", "item_id": "123" }
) VALUES (...);
```

### **Step 3: General Chat (Before Acceptance)**
```sql
-- Alice replies
INSERT INTO messages (
  conversation_id,         -- Same conversation_id
  topic,                   -- "SWAP: Hemp Jacket"
  sender_id,               -- Alice
  recipient_id,            -- Bob
  extension,               -- "swap_general"
  content,                 -- "Sure! Is your camera in good condition?"
  payload                  -- { "proposal_id": "xyz" }
) VALUES (...);

-- Bob replies
INSERT INTO messages (
  conversation_id,
  topic,
  sender_id,               -- Bob
  recipient_id,            -- Alice
  extension,               -- "swap_general"
  content,                 -- "Yes! Used only a few times. Here's more pics..."
  payload                  -- { "proposal_id": "xyz" }
) VALUES (...);

-- Continue general chat via existing messages table...
```

### **Step 4: Proposal Accepted → Deal Created**
```sql
-- Update proposal status
UPDATE swap_proposals 
SET status = 'accepted', responded_at = NOW()
WHERE id = 'proposal_xyz';

-- Create swap_deals entry
INSERT INTO swap_deals (
  proposal_id,
  user1_id,                -- Alice (item owner)
  user2_id,                -- Bob (proposer)
  item1_id,                -- Alice's item
  item2_id,                -- Bob's item (if item-to-item)
  conversation_id,         -- Link to general chat
  status                   -- 'negotiating'
) VALUES (...);

-- Send system message to deal logistics channel
INSERT INTO swap_deal_messages (
  deal_id,
  sender_id,               -- NULL (system message)
  message,                 -- "Deal created! Time to arrange logistics."
  message_type             -- 'system'
) VALUES (...);

-- ALSO send notification to general chat
INSERT INTO messages (
  conversation_id,
  topic,
  sender_id,               -- Alice
  recipient_id,            -- Bob
  extension,               -- "swap_system"
  content,                 -- "✅ Proposal accepted! Let's arrange shipping."
  event,                   -- "proposal_accepted"
  payload                  -- { "deal_id": "deal_123", "proposal_id": "xyz" }
) VALUES (...);
```

### **Step 5: Dual Channel After Acceptance**

#### **General Chat (continues in messages table)**
```sql
-- Users can still chat freely
INSERT INTO messages (
  conversation_id,
  sender_id, recipient_id,
  extension,               -- "swap_general"
  content                  -- "Thanks! Looking forward to this!"
) VALUES (...);
```

#### **Deal Logistics (swap_deal_messages)**
```sql
-- Bob marks shipped
UPDATE swap_deals SET user2_shipped = TRUE WHERE id = 'deal_123';

-- System message
INSERT INTO swap_deal_messages (
  deal_id, sender_id, message, message_type
) VALUES (
  'deal_123', NULL, 
  '📦 Bob marked item as shipped', 
  'system'
);

-- Bob adds tracking info
INSERT INTO swap_deal_messages (
  deal_id, sender_id, message, message_type
) VALUES (
  'deal_123', 'bob_id',
  'Tracking: USPS 1234567890',
  'shipping'
);

-- Alice confirms receipt
UPDATE swap_deals SET user1_confirmed = TRUE WHERE id = 'deal_123';

INSERT INTO swap_deal_messages (
  deal_id, sender_id, message, message_type
) VALUES (
  'deal_123', NULL,
  '✅ Alice confirmed receipt',
  'system'
);
```

---

## 🎨 SWAP Inbox UI Layout

```tsx
<SWAPInbox>
  {/* Active Deals List */}
  {deals.map(deal => (
    <DealCard onClick={() => openDealDetail(deal)}>
      <ItemPair>
        <ItemCard item={deal.item1} />
        <SwapIcon />
        <ItemCard item={deal.item2} />
      </ItemPair>
      <DealStatus status={deal.status} />
      <UnreadBadge count={deal.unread_count} />
    </DealCard>
  ))}
</SWAPInbox>

{/* Deal Detail Modal */}
<DealDetailModal>
  <Header>
    <ItemPair />
    <DealStatusBadge />
  </Header>
  
  {/* TWO TABS */}
  <Tabs>
    <Tab value="logistics">Deal Logistics 📦</Tab>
    <Tab value="chat">Chat with {otherUser.name} 💬</Tab>
  </Tabs>
  
  {/* Tab 1: Deal Logistics (swap_deal_messages) */}
  {activeTab === 'logistics' && (
    <>
      <Timeline>
        {dealMessages.map(msg => (
          <TimelineItem type={msg.message_type}>
            {msg.message_type === 'system' ? (
              <SystemMessage>{msg.message}</SystemMessage>
            ) : (
              <UserMessage user={msg.sender} message={msg.message} />
            )}
          </TimelineItem>
        ))}
      </Timeline>
      
      {/* Action Buttons */}
      {!deal.user1_shipped && (
        <Button onClick={markShipped}>
          Mark as Shipped 📦
        </Button>
      )}
      
      {deal.user2_shipped && !deal.user1_confirmed && (
        <Button onClick={confirmReceipt}>
          Confirm Receipt ✅
        </Button>
      )}
      
      {/* Quick Actions */}
      <Input placeholder="Add tracking number..." />
      <Button>Send Shipping Update</Button>
    </>
  )}
  
  {/* Tab 2: General Chat (existing messages table) */}
  {activeTab === 'chat' && (
    <>
      <MessagesScroll>
        {generalMessages.map(msg => (
          <MessageBubble
            sender={msg.sender_id}
            content={msg.content}
            timestamp={msg.created_at}
            isSystem={msg.extension === 'swap_system'}
          />
        ))}
      </MessagesScroll>
      
      <MessageInput
        onSend={(content) => sendGeneralMessage(content)}
        placeholder="Message..."
      />
    </>
  )}
</DealDetailModal>
```

---

## 📊 Database Queries for SWAP Inbox

### **Get My Active Deals**
```sql
SELECT 
  d.*,
  si1.title as item1_title,
  si1.images as item1_images,
  si2.title as item2_title,
  si2.images as item2_images,
  u1.username as user1_name,
  u2.username as user2_name,
  (
    SELECT COUNT(*) FROM swap_deal_messages 
    WHERE deal_id = d.id 
      AND read_by_other = FALSE
      AND sender_id != $1
  ) as unread_count
FROM swap_deals d
LEFT JOIN swap_items si1 ON d.item1_id = si1.id
LEFT JOIN swap_items si2 ON d.item2_id = si2.id
LEFT JOIN auth.users u1 ON d.user1_id = u1.id
LEFT JOIN auth.users u2 ON d.user2_id = u2.id
WHERE $1 IN (d.user1_id, d.user2_id)
  AND d.status != 'completed'
ORDER BY d.updated_at DESC;
```

### **Get Deal Messages (Logistics Timeline)**
```sql
SELECT 
  dm.*,
  u.username as sender_name,
  u.avatar_url as sender_avatar
FROM swap_deal_messages dm
LEFT JOIN auth.users u ON dm.sender_id = u.id
WHERE dm.deal_id = $1
  AND dm.deleted_at IS NULL
ORDER BY dm.created_at ASC;
```

### **Get General Chat Messages**
```sql
SELECT 
  m.*,
  u.username as sender_name,
  u.avatar_url as sender_avatar
FROM messages m
LEFT JOIN auth.users u ON m.sender_id = u.id
WHERE m.conversation_id = $1
  AND m.deleted = FALSE
  AND m.extension IN ('swap_general', 'swap_system')
ORDER BY m.created_at ASC;
```

### **Send General Chat Message**
```sql
INSERT INTO messages (
  conversation_id,
  topic,
  sender_id,
  recipient_id,
  extension,
  content,
  payload
) VALUES (
  $1,                      -- conversation_id from swap_deals
  $2,                      -- topic (e.g., "SWAP: Hemp Jacket")
  $3,                      -- current user id
  $4,                      -- other user id
  'swap_general',
  $5,                      -- message content
  jsonb_build_object(
    'deal_id', $6,
    'proposal_id', $7
  )
) RETURNING *;
```

### **Send Deal Logistics Message**
```sql
INSERT INTO swap_deal_messages (
  deal_id,
  sender_id,
  message,
  message_type
) VALUES (
  $1,                      -- deal_id
  $2,                      -- sender_id (or NULL for system)
  $3,                      -- message
  $4                       -- 'text', 'system', 'shipping', etc.
) RETURNING *;

-- Update deal last_message_at
UPDATE swap_deals 
SET last_message_at = NOW(),
    unread_count_user1 = CASE WHEN $2 = user2_id THEN unread_count_user1 + 1 ELSE unread_count_user1 END,
    unread_count_user2 = CASE WHEN $2 = user1_id THEN unread_count_user2 + 1 ELSE unread_count_user2 END
WHERE id = $1;
```

---

## 🎯 Key Benefits of Dual-Channel System

| Feature | General Chat (messages) | Deal Logistics (swap_deal_messages) |
|---------|------------------------|-------------------------------------|
| **Purpose** | Get to know each other | Track deal progress |
| **Before Deal** | ✅ Yes (proposal chat) | ❌ No (created after acceptance) |
| **After Deal** | ✅ Yes (continue friendship) | ✅ Yes (shipping, confirmations) |
| **System Messages** | ⚠️ Mixed with user messages | ✅ Clear timeline |
| **Retention** | ✅ Keep forever | ⚠️ Can archive after 30 days |
| **Search** | ✅ Full text search | ✅ Structured queries |

---

## 🔔 Real-time Subscriptions

### **Subscribe to Deal Updates**
```typescript
// Listen for deal logistics messages
supabase
  .channel(`deal:${dealId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'swap_deal_messages',
    filter: `deal_id=eq.${dealId}`
  }, (payload) => {
    // New logistics message
    addMessageToTimeline(payload.new);
  })
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'swap_deals',
    filter: `id=eq.${dealId}`
  }, (payload) => {
    // Deal status changed
    updateDealStatus(payload.new);
  })
  .subscribe();
```

### **Subscribe to General Chat**
```typescript
// Listen for general messages
supabase
  .channel(`conversation:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    // New general message
    addMessageToChat(payload.new);
  })
  .subscribe();
```

---

## ✅ Summary

### **What We're Building:**
1. ✅ Use existing `messages` table for general SWAP chat
2. ✅ Create new `swap_deal_messages` for deal logistics
3. ✅ Link both via `swap_deals.conversation_id`
4. ✅ SWAP Inbox shows both channels in one UI
5. ✅ Users can switch between chat and logistics

### **Why It's Perfect:**
- ✅ Reuses your existing messaging infrastructure
- ✅ Keeps deal logistics structured and trackable
- ✅ Separates social chat from transaction logistics
- ✅ Clean data model for analytics
- ✅ Users get both casual chat AND deal management

---

## 🚀 Ready to Build!

**Next Steps:**
1. ✅ Run `/SWAP_SAFE_MIGRATION.sql` (creates swap_deal_messages table)
2. ✅ I'll create backend routes for both channels
3. ✅ I'll build SWAP Inbox UI with dual tabs
4. ✅ Test the full flow!

**Your 53 items are safe, and we're ready to enhance with dual-channel messaging!** 🎯✨
