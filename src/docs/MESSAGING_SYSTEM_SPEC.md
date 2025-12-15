# DEWII Messaging System - Technical Specification

## 📋 Overview

The DEWII messaging system enables direct communication between users, companies, and matched entities within the Hemp'in Universe platform. This document outlines the architecture, technology stack, and implementation strategy for building a robust, real-time messaging feature.

---

## 🎯 Feature Requirements

### User Experience (UX)
- **Header Integration**: Message icon positioned in the header, left of NADA/points display
- **Slide-in Panel**: Messages panel slides in from the right, taking full screen space between header and bottom nav
- **Always Accessible**: Available across all views in the app
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Real-time Updates**: Live message delivery and read receipts
- **Notification Badge**: Unread message count displayed on header icon

### Core Features
1. **Conversation List**: View all active conversations with search/filter
2. **Message Threads**: 1-on-1 conversations with full history
3. **Real-time Delivery**: Instant message sending/receiving
4. **Read Receipts**: Track read/unread status
5. **Typing Indicators**: See when other user is typing (optional for v1)
6. **Rich Content**: Support text, links, and emojis
7. **Message Actions**: Delete, archive conversations
8. **User Context**: Show user avatar, name, and online status
9. **Integration Points**: Launch conversations from Discovery Matches, User Profiles, Company Profiles

---

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
├─────────────────────────────────────────────────────────────┤
│  MessageIcon (Header) → MessagePanel (Slide-in)              │
│  ├── ConversationList                                        │
│  ├── MessageThread                                           │
│  ├── MessageInput                                            │
│  └── MessageNotifications                                    │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE REALTIME                         │
│              (WebSocket Subscriptions)                       │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                          │
│                  (Hono Edge Function)                        │
├─────────────────────────────────────────────────────────────┤
│  Message Routes:                                             │
│  ├── POST   /messages/send                                   │
│  ├── GET    /messages/conversations                          │
│  ├── GET    /messages/thread/:conversationId                 │
│  ├── POST   /messages/mark-read/:messageId                   │
│  ├── POST   /messages/conversation/archive                   │
│  └── DELETE /messages/:messageId                             │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATA STORAGE                              │
│                 (Supabase PostgreSQL)                        │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                     │
│  ├── conversations (id, participants, metadata)              │
│  ├── messages (id, conversation_id, content, timestamps)    │
│  └── conversation_metadata (archiving, muting per-user)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend Technologies

#### 1. **React State Management**
- **useState/useReducer**: Local component state
- **useEffect**: Side effects, subscriptions
- **Context API**: Share message state globally (optional)

#### 2. **Real-time Communication**
```typescript
import { createClient } from '@supabase/supabase-js'

// Supabase Realtime - Built-in WebSocket support
// Subscribe to message channels for live updates
```

**Why Supabase Realtime?**
- ✅ Already integrated in our stack
- ✅ Native WebSocket support
- ✅ Channel-based subscriptions
- ✅ Automatic reconnection
- ✅ No additional libraries needed
- ✅ Scales automatically

#### 3. **UI Libraries**
- **Motion (Framer Motion)**: Smooth slide-in animations
- **Lucide React**: Message icons (MessageCircle, Send, X, Search)
- **Custom Components**: No heavy chat libraries (keep bundle small)

**Why NOT use pre-built chat libraries?**
- ❌ Stream Chat, SendBird, etc. are overkill and expensive
- ❌ Add unnecessary bundle size
- ❌ Harder to customize for our aesthetic
- ✅ Our custom UI matches Hemp'in design system perfectly

#### 4. **Date/Time Formatting**
```typescript
// Use built-in Intl API (no library needed)
new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
```

---

### Backend Technologies

#### 1. **Hono Web Server**
- Fast, lightweight edge function framework
- Already integrated in `/supabase/functions/server/index.tsx`
- RESTful API endpoints for message operations

#### 2. **Supabase Auth**
- User authentication and authorization
- Access token validation
- User ID extraction from JWT

#### 3. **Supabase PostgreSQL Database**
- Relational database for messages and conversations
- Full SQL query support with indexes
- Native support for complex queries, joins, and aggregations
- Row Level Security (RLS) for data access control

**Database Schema:**

```typescript
// TypeScript interfaces matching database tables

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message_at: string | null;
  last_message_preview: string | null;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  deleted: boolean;
}

interface ConversationMetadata {
  id: string;
  conversation_id: string;
  user_id: string;
  archived: boolean;
  muted: boolean;
}
```

**Why PostgreSQL Tables over KV Store?**
- ✅ **SQL Power**: Complex queries, filtering, sorting, pagination
- ✅ **Performance**: Database indexes on conversation_id, user_id, timestamps
- ✅ **Data Integrity**: Foreign keys, NOT NULL constraints, unique constraints
- ✅ **Real-time Support**: Supabase Realtime works natively with Postgres changes
- ✅ **Relationships**: JOIN with user_profiles, auth.users for enriched data
- ✅ **Debugging**: Direct SQL queries in Supabase Dashboard
- ✅ **Scalability**: Proven for messaging at scale
- ✅ **Future-Proof**: Easy to add search indexes, full-text search, etc.

---

## 🔐 Security & Authorization

### Message Access Control

```typescript
// Server-side validation using database queries
async function validateMessageAccess(supabase, userId: string, conversationId: string) {
  const { data: conversation, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
    .single();
  
  // User must be a participant in the conversation
  if (!conversation || error) {
    throw new Error('Unauthorized');
  }
  
  return conversation;
}
```

### Key Security Rules
1. **Authentication Required**: All endpoints require valid JWT access token
2. **Row Level Security (RLS)**: Postgres RLS policies enforce access at database level
3. **Participant Validation**: Users can only access their own conversations (enforced by RLS)
4. **Message Ownership**: Users can only delete their own messages
5. **Rate Limiting**: Consider implementing rate limits for spam prevention (future)
6. **Content Moderation**: Store message content (no profanity filter in v1, but plan for v2)

---

## 🔄 Real-time Message Flow

### Sending a Message

```typescript
// 1. User types message and clicks send
// 2. Frontend calls API
POST /messages/send
{
  recipientId: "user-456",
  content: "Hello! I saw your discovery match..."
}

// 3. Backend processes:
//    - Validates auth
//    - Creates/finds conversation in database
//    - Inserts message into messages table
//    - Updates conversation metadata
//    - Database triggers Supabase Realtime event automatically

// 4. Recipient's client receives via Supabase Realtime subscription
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `recipient_id=eq.${userId}`
  }, (payload) => {
    // Update UI instantly
    addMessageToThread(payload.new)
  })
  .subscribe()
```

### Real-time Subscription Pattern

```typescript
// Subscribe to database changes for messages where user is recipient
const messagesChannel = supabase
  .channel('user-messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `recipient_id=eq.${userId}`
  }, handleNewMessage)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'messages',
    filter: `sender_id=eq.${userId}`
  }, handleMessageRead)
  .subscribe();

// Cleanup on unmount
return () => {
  messagesChannel.unsubscribe();
};
```

---

## 📡 API Endpoints

### 1. Send Message
```
POST /make-server-053bcd80/messages/send
Authorization: Bearer {accessToken}

Body:
{
  recipientId: string,
  content: string
}

Response:
{
  message: {
    id: string,
    conversationId: string,
    content: string,
    createdAt: string,
    ...
  },
  conversation: {...}
}
```

### 2. Get Conversations List
```
GET /make-server-053bcd80/messages/conversations
Authorization: Bearer {accessToken}

Query Parameters:
- includeArchived: boolean (default: false)

Response:
{
  conversations: [
    {
      id: string,
      otherParticipant: {
        id: string,
        displayName: string,
        avatarUrl: string
      },
      lastMessage: string,
      lastMessageAt: string,
      unreadCount: number,
      ...
    }
  ]
}
```

### 3. Get Message Thread
```
GET /make-server-053bcd80/messages/thread/:conversationId
Authorization: Bearer {accessToken}

Query Parameters:
- limit: number (default: 50)
- before: string (messageId for pagination)

Response:
{
  messages: [
    {
      id: string,
      senderId: string,
      content: string,
      createdAt: string,
      readAt: string | null
    }
  ],
  hasMore: boolean
}
```

### 4. Mark Messages as Read
```
POST /make-server-053bcd80/messages/mark-read/:conversationId
Authorization: Bearer {accessToken}

Response:
{
  success: true,
  markedCount: number
}
```

### 5. Archive Conversation
```
POST /make-server-053bcd80/messages/conversation/:conversationId/archive
Authorization: Bearer {accessToken}

Response:
{
  success: true
}
```

### 6. Delete Message
```
DELETE /make-server-053bcd80/messages/:messageId
Authorization: Bearer {accessToken}

Response:
{
  success: true
}
```

---

## 🎨 UI Components

### Component Hierarchy

```
MessageSystem/
├── MessageIcon.tsx              # Header icon with notification badge
├── MessagePanel.tsx             # Slide-in container
│   ├── ConversationList.tsx     # List of all conversations
│   │   ├── ConversationItem.tsx # Individual conversation preview
│   │   └── SearchBar.tsx        # Search conversations
│   ├── MessageThread.tsx        # Active conversation view
│   │   ├── MessageBubble.tsx    # Individual message
│   │   ├── MessageInput.tsx     # Text input + send button
│   │   └── ThreadHeader.tsx     # Conversation header with back button
│   └── EmptyState.tsx           # No conversations yet
```

### Key UI Features

#### MessageIcon (Header)
```tsx
<button className="relative">
  <MessageCircle size={24} />
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E8FF00] text-black rounded-full text-xs">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</button>
```

#### MessagePanel Animation
```tsx
<motion.div
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
  className="fixed top-[64px] right-0 bottom-[80px] w-full bg-[#0A0F1E] z-40"
>
  {/* Content */}
</motion.div>
```

---

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure (Sprint 1)
- ✅ Backend API endpoints (send, conversations, thread)
- ✅ Database schema implementation (PostgreSQL tables)
- ✅ Authentication & authorization
- ✅ Basic UI components (MessagePanel, ConversationList)

### Phase 2: Real-time Features (Sprint 2)
- ✅ Supabase Realtime subscriptions
- ✅ Live message delivery
- ✅ Unread count updates
- ✅ Read receipts

### Phase 3: Polish & Integration (Sprint 3)
- ✅ Integration with Discovery Matches
- ✅ Integration with User Profiles
- ✅ Message animations and transitions
- ✅ Search and filter conversations
- ✅ Archive/delete functionality

### Phase 4: Advanced Features (Future)
- ⏳ Typing indicators
- ⏳ File/image attachments
- ⏳ Message reactions
- ⏳ Group conversations (3+ participants)
- ⏳ Voice messages
- ⏳ Message forwarding

---

## 📊 Performance Considerations

### Optimization Strategies

1. **Pagination**: Load messages in chunks (50 at a time)
2. **Lazy Loading**: Only subscribe to active conversation's real-time updates
3. **Debouncing**: Debounce typing indicators to reduce broadcasts
4. **Caching**: Cache conversation list in React state, refresh on new messages
5. **Virtual Scrolling**: For very long message threads (optional)

### Expected Performance
- **Message Send Latency**: < 100ms (server processing)
- **Real-time Delivery**: < 500ms (WebSocket propagation)
- **Conversation List Load**: < 200ms (database query with indexes)
- **Thread Load**: < 300ms (50 messages with pagination)

---

## 🧪 Testing Strategy

### Unit Tests
- Message sending logic
- Conversation creation/finding
- Read status updates
- Authorization checks

### Integration Tests
- End-to-end message flow
- Real-time subscriptions
- Multiple users in conversation
- Unread count accuracy

### Manual Testing Checklist
- [ ] Send message between two users
- [ ] Receive message in real-time
- [ ] Unread badge updates correctly
- [ ] Mark as read works
- [ ] Archive conversation hides it
- [ ] Delete message removes it
- [ ] Slide-in animation smooth
- [ ] Works on mobile viewport

---

## 🔮 Future Enhancements

### v2 Features (Post-MVP)
1. **Group Messaging**: Support 3+ participants
2. **Rich Media**: Image/file uploads via Supabase Storage
3. **Push Notifications**: Browser/mobile push for new messages
4. **Message Search**: Full-text search across all messages
5. **Encryption**: End-to-end encryption for sensitive conversations
6. **Message Reactions**: Emoji reactions like Slack
7. **Message Threading**: Reply to specific messages
8. **AI Integration**: Smart replies, translation, content moderation

### Scalability Considerations
- **Message Archival**: Move old messages to cold storage after 90 days
- **Rate Limiting**: Implement per-user message limits
- **Spam Detection**: Auto-detect and flag spam messages
- **Load Balancing**: Edge functions auto-scale, but monitor performance

---

## 📝 Summary

### Why This Approach?

✅ **Native Integration**: Uses existing Supabase infrastructure
✅ **Real-time First**: WebSocket-based, instant delivery
✅ **Scalable**: Edge functions and KV store scale automatically
✅ **Secure**: JWT-based auth, participant validation
✅ **Cost-Effective**: No third-party services, no per-message pricing
✅ **Customizable**: Full control over UI/UX to match brand
✅ **Future-Proof**: Can add advanced features incrementally

### Estimated Development Time
- **Backend API**: 2-3 hours
- **Frontend Components**: 3-4 hours
- **Real-time Integration**: 2-3 hours
- **Testing & Polish**: 2 hours
- **Total**: ~10-12 hours (full v1 implementation)

---

## 🎯 Ready to Build?

This specification provides a complete blueprint for implementing the DEWII messaging system. The architecture leverages our existing Supabase infrastructure (PostgreSQL Database + Realtime) while avoiding heavy dependencies and third-party services.

**Database Setup**: Execute the SQL migration file `/docs/messaging_schema.sql` in your Supabase SQL Editor to create all necessary tables, indexes, RLS policies, and triggers.

**Next Step**: After confirming the database schema is created successfully, begin implementation with Phase 1 (Core Infrastructure), starting with backend API endpoints.

---

*Document Version: 1.0*  
*Last Updated: December 8, 2025*  
*Author: DEWII Development Team*