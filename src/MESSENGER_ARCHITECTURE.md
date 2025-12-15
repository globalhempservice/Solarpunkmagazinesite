# 🔐 End-to-End Encrypted Messenger Architecture
## DEWII (Hemp'in Universe) - Phase 1.3

---

## 🎯 Vision

A secure, end-to-end encrypted messaging system that enables:
- **User-to-User** conversations (C2C SWAP negotiations)
- **User-to-Organization** conversations (B2C/B2B RFP discussions)
- **Discovery Match Introductions** (post-match communication)
- **Hero Loop Integration**: Discovery Match → Intro → Outcome

---

## 🔒 Security Architecture

### End-to-End Encryption (E2EE)
We will implement **Signal Protocol** principles:
- **Client-side encryption/decryption** - Messages encrypted on device before sending
- **Server has ZERO access** to message plaintext
- **Forward secrecy** - Compromising one message doesn't compromise others
- **Deniable authentication** - Can't prove who sent a message

### Key Management
```
User Registration Flow:
1. Generate identity keypair (long-term)
2. Generate signed pre-keys
3. Upload public keys to server
4. Store private keys locally (encrypted with user password)

Message Flow:
1. Sender fetches recipient's public key bundle from server
2. Sender performs X3DH key agreement
3. Sender derives shared secret
4. Message encrypted with Double Ratchet algorithm
5. Encrypted payload sent to server
6. Server routes to recipient
7. Recipient decrypts with their private key
```

### Library Choice
**Recommended**: `@privacyresearch/libsignal-protocol-typescript`
- Pure TypeScript implementation of Signal Protocol
- No native dependencies (works in browser)
- Well-maintained

**Alternative**: Roll our own with Web Crypto API
- More control but more risk
- Not recommended for v1

---

## 📊 Database Schema

### SQL Tables (Supabase)

```sql
-- ============================================================================
-- CONVERSATIONS TABLE
-- ============================================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('user_to_user', 'user_to_organization')),
  
  -- Participants (one will be null depending on type)
  user_1_id UUID REFERENCES auth.users(id),
  user_2_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES companies(id),
  
  -- Context
  discovery_request_id UUID REFERENCES discovery_requests(id), -- Optional: if from discovery match
  match_id UUID REFERENCES discovery_match_results(id), -- Optional: specific match that created this
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure valid participant configuration
  CONSTRAINT check_participants CHECK (
    (type = 'user_to_user' AND user_1_id IS NOT NULL AND user_2_id IS NOT NULL AND organization_id IS NULL) OR
    (type = 'user_to_organization' AND user_1_id IS NOT NULL AND organization_id IS NOT NULL AND user_2_id IS NULL)
  )
);

CREATE INDEX idx_conversations_user_1 ON conversations(user_1_id);
CREATE INDEX idx_conversations_user_2 ON conversations(user_2_id);
CREATE INDEX idx_conversations_org ON conversations(organization_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- ============================================================================
-- MESSAGES TABLE (stores encrypted payloads only)
-- ============================================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_user_id UUID REFERENCES auth.users(id),
  
  -- Encrypted payload (server cannot read this)
  encrypted_content TEXT NOT NULL, -- Base64 encoded encrypted message
  
  -- Signal Protocol metadata
  sender_ratchet_key TEXT, -- For Double Ratchet
  message_number INTEGER, -- Chain index
  previous_counter INTEGER, -- For message ordering
  
  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Delivery tracking (encrypted status)
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, sent_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_user_id);

-- ============================================================================
-- USER ENCRYPTION KEYS (public keys stored server-side)
-- ============================================================================
CREATE TABLE user_encryption_keys (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  
  -- Signal Protocol key bundle
  identity_public_key TEXT NOT NULL, -- Long-term identity
  signed_pre_key TEXT NOT NULL, -- Signed prekey
  signed_pre_key_signature TEXT NOT NULL,
  
  -- One-time prekeys (array of public keys)
  one_time_pre_keys JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CONVERSATION PARTICIPANTS (for multi-party expansion later)
-- ============================================================================
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  -- Participant metadata
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conv ON conversation_participants(conversation_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Users can only see conversations they're part of
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (
    user_1_id = auth.uid() OR 
    user_2_id = auth.uid() OR
    organization_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    user_1_id = auth.uid()
  );

-- Messages: users can only see messages in their conversations
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE 
        user_1_id = auth.uid() OR 
        user_2_id = auth.uid() OR
        organization_id IN (
          SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    )
  );

CREATE POLICY "Users can send messages to their conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_user_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM conversations WHERE 
        user_1_id = auth.uid() OR 
        user_2_id = auth.uid() OR
        organization_id IN (
          SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    )
  );

-- Encryption keys: public keys are readable by all, writable only by owner
ALTER TABLE user_encryption_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public keys are readable by all authenticated users" ON user_encryption_keys
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own keys" ON user_encryption_keys
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own keys" ON user_encryption_keys
  FOR UPDATE USING (user_id = auth.uid());
```

---

## 🔧 API Routes

### `/make-server-053bcd80/messenger/keys` (POST)
**Purpose**: Upload user's public key bundle
**Auth**: Required
**Body**:
```json
{
  "identityPublicKey": "base64...",
  "signedPreKey": "base64...",
  "signedPreKeySignature": "base64...",
  "oneTimePreKeys": ["base64...", "base64..."]
}
```

### `/make-server-053bcd80/messenger/keys/:userId` (GET)
**Purpose**: Fetch recipient's public key bundle for encryption
**Auth**: Required
**Response**:
```json
{
  "identityPublicKey": "base64...",
  "signedPreKey": "base64...",
  "signedPreKeySignature": "base64...",
  "oneTimePreKey": "base64..." // consumes one from pool
}
```

### `/make-server-053bcd80/messenger/conversations` (GET)
**Purpose**: Get all conversations for current user
**Auth**: Required
**Response**:
```json
{
  "conversations": [
    {
      "id": "uuid",
      "type": "user_to_user",
      "otherUser": { "userId": "uuid", "displayName": "...", "avatarUrl": "..." },
      "lastMessageAt": "2024-12-08T...",
      "unreadCount": 3
    }
  ]
}
```

### `/make-server-053bcd80/messenger/conversations` (POST)
**Purpose**: Create new conversation
**Auth**: Required
**Body**:
```json
{
  "type": "user_to_user",
  "otherUserId": "uuid" | "organizationId": "uuid",
  "discoveryRequestId": "uuid", // optional
  "matchId": "uuid" // optional
}
```

### `/make-server-053bcd80/messenger/conversations/:id/messages` (GET)
**Purpose**: Get messages in a conversation
**Auth**: Required
**Response**:
```json
{
  "messages": [
    {
      "id": "uuid",
      "senderUserId": "uuid",
      "encryptedContent": "base64...",
      "senderRatchetKey": "base64...",
      "messageNumber": 5,
      "sentAt": "2024-12-08T...",
      "deliveredAt": "2024-12-08T...",
      "readAt": null
    }
  ]
}
```

### `/make-server-053bcd80/messenger/conversations/:id/messages` (POST)
**Purpose**: Send encrypted message
**Auth**: Required
**Body**:
```json
{
  "encryptedContent": "base64...",
  "senderRatchetKey": "base64...",
  "messageNumber": 6,
  "previousCounter": 5
}
```

### `/make-server-053bcd80/messenger/messages/:id/read` (POST)
**Purpose**: Mark message as read
**Auth**: Required

---

## 🎨 Frontend Components

### `/components/messenger/MessengerApp.tsx`
Main messenger container with conversation list + chat view

### `/components/messenger/ConversationList.tsx`
Sidebar showing all conversations, sorted by last message

### `/components/messenger/ChatView.tsx`
Message thread for selected conversation

### `/components/messenger/MessageBubble.tsx`
Individual message component with decryption

### `/components/messenger/ComposeMessage.tsx`
Text input with encryption before send

### `/components/messenger/EncryptionProvider.tsx`
React Context for encryption/decryption functions

### `/utils/encryption/signal.ts`
Signal Protocol wrapper functions

---

## 📱 User Experience Flow

### 1️⃣ **First-Time Setup** (Key Generation)
```
User registers account
  ↓
Prompt: "Secure your messages"
  ↓
Generate keypair (client-side)
  ↓
Encrypt private key with user password
  ↓
Store private key in localStorage (encrypted)
  ↓
Upload public keys to server
  ↓
✅ Ready to message!
```

### 2️⃣ **Starting a Conversation from Discovery Match**
```
Admin creates match
  ↓
User views match in Discovery tab
  ↓
User clicks "Send Message"
  ↓
System creates conversation with context:
  - discovery_request_id
  - match_id
  - type (user or organization)
  ↓
User composes first message
  ↓
Message encrypted client-side
  ↓
Sent to server (encrypted)
  ↓
Recipient gets notification
  ↓
Recipient decrypts and reads
```

### 3️⃣ **Ongoing Conversation**
```
User opens Messenger tab
  ↓
Loads conversation list
  ↓
Selects conversation
  ↓
Fetches encrypted messages
  ↓
Decrypts all messages client-side
  ↓
Displays in chat interface
  ↓
User types new message
  ↓
Encrypted before send
  ↓
Server routes to recipient
  ↓
Real-time update via Supabase Realtime
```

---

## 🚀 Implementation Phases

### **Phase 1.3.1: Database & Backend** (Week 1)
- [ ] Create SQL tables (conversations, messages, encryption_keys)
- [ ] Implement RLS policies
- [ ] Create messenger API routes
- [ ] Set up Supabase Realtime subscriptions

### **Phase 1.3.2: Encryption Layer** (Week 2)
- [ ] Install Signal Protocol library
- [ ] Implement key generation
- [ ] Implement key exchange (X3DH)
- [ ] Implement Double Ratchet encryption/decryption
- [ ] Create encryption utility functions

### **Phase 1.3.3: Frontend Components** (Week 3)
- [ ] Build ConversationList component
- [ ] Build ChatView component
- [ ] Build MessageBubble component
- [ ] Build ComposeMessage component
- [ ] Integrate with EncryptionProvider

### **Phase 1.3.4: Discovery Integration** (Week 4)
- [ ] Add "Send Message" button to discovery matches
- [ ] Auto-create conversation on first message
- [ ] Link conversations to discovery context
- [ ] Update Hero Loop metrics

### **Phase 1.3.5: Polish & Security Audit** (Week 5)
- [ ] Real-time message delivery
- [ ] Read receipts (encrypted)
- [ ] Typing indicators
- [ ] Message search (client-side only)
- [ ] Security audit & penetration testing

---

## 🔐 Security Considerations

### What Server KNOWS:
- ✅ Who is messaging whom (conversation metadata)
- ✅ When messages are sent (timestamps)
- ✅ Message count and size

### What Server CANNOT Know:
- ❌ Message content (encrypted)
- ❌ Message subject/topic
- ❌ Attachments content (would be encrypted too)

### Attack Vectors to Mitigate:
1. **Man-in-the-Middle**: Mitigated by key verification (QR codes, safety numbers)
2. **Server Compromise**: Server has no access to message plaintext
3. **Client Compromise**: Private keys encrypted with user password
4. **Replay Attacks**: Mitigated by message counters and Double Ratchet
5. **Metadata Leakage**: Consider adding noise traffic later

---

## 💡 Future Enhancements (Phase 2+)

- **Group Chats**: Extend to multi-party conversations
- **Voice/Video Calls**: WebRTC with E2EE
- **File Sharing**: Encrypt files before upload
- **Disappearing Messages**: Auto-delete after X time
- **Message Reactions**: Encrypted emoji reactions
- **Safety Numbers**: Display key fingerprints for verification
- **Key Backup**: Encrypted cloud backup of private keys
- **Multi-Device**: Sync across devices with separate device keys

---

## 📝 Notes

- **GDPR Compliance**: Since server cannot read messages, we cannot moderate content. Consider:
  - User reporting system
  - Client-side content filters (optional)
  - Clear terms of service

- **Performance**: 
  - Encrypt/decrypt on Web Workers to avoid blocking UI
  - Cache decrypted messages in memory (not localStorage)
  - Lazy load old messages

- **Backup Strategy**:
  - Server has encrypted message history
  - User can export encrypted backup
  - Loss of private key = loss of message history (by design)

---

**Status**: 📋 Architecture Complete - Ready for Implementation
**Next Step**: Run SQL migrations and begin Phase 1.3.1
