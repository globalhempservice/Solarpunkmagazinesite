-- ============================================
-- DEWII MESSAGING DATABASE AUDIT
-- Run these queries in Supabase SQL Editor
-- ============================================

-- 1. CHECK IF CONVERSATIONS TABLE EXISTS
-- ============================================
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'conversations'
);

-- 2. VIEW CONVERSATIONS TABLE SCHEMA
-- ============================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- 3. VIEW ALL CONSTRAINTS ON CONVERSATIONS TABLE
-- ============================================
SELECT
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    CASE con.contype
        WHEN 'p' THEN 'Primary Key'
        WHEN 'u' THEN 'Unique'
        WHEN 'f' THEN 'Foreign Key'
        WHEN 'c' THEN 'Check'
    END AS constraint_description,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'conversations';

-- 4. VIEW EXISTING CONVERSATIONS
-- ============================================
SELECT 
    id,
    participant_1_id,
    participant_2_id,
    context_type,
    context_id,
    created_at,
    last_message_at
FROM conversations
ORDER BY created_at DESC
LIMIT 20;

-- 5. CHECK IF MESSAGES TABLE EXISTS
-- ============================================
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'messages'
);

-- 6. VIEW MESSAGES TABLE SCHEMA
-- ============================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 7. CHECK FOR ANY CONVERSATIONS WITH YOUR USER
-- Replace 'YOUR_USER_ID' with your actual user ID
-- ============================================
SELECT 
    c.id,
    c.participant_1_id,
    c.participant_2_id,
    c.context_type,
    c.context_id,
    c.last_message_preview,
    c.created_at
FROM conversations c
WHERE c.participant_1_id = 'YOUR_USER_ID' 
   OR c.participant_2_id = 'YOUR_USER_ID'
ORDER BY c.created_at DESC;

-- 8. CHECK USER_PROFILES TABLE
-- ============================================
SELECT 
    user_id,
    display_name,
    avatar_url,
    created_at
FROM user_profiles
LIMIT 5;

-- 9. CHECK IF THE UNIQUE CONSTRAINT EXISTS
-- This should return the unique constraint for preventing duplicate conversations
-- ============================================
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'conversations';

-- 10. TEST QUERY: Can we find a conversation with NULL context_id?
-- ============================================
SELECT 
    id,
    participant_1_id,
    participant_2_id,
    context_type,
    context_id
FROM conversations
WHERE context_id IS NULL
LIMIT 5;

-- 11. TEST QUERY: Can we find a conversation with a specific context_id?
-- ============================================
SELECT 
    id,
    participant_1_id,
    participant_2_id,
    context_type,
    context_id
FROM conversations
WHERE context_type = 'place'
  AND context_id IS NOT NULL
LIMIT 5;

-- ============================================
-- RECOMMENDED: CREATE TABLES IF THEY DON'T EXIST
-- Only run this section if the tables don't exist
-- ============================================

-- CREATE CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    context_type TEXT NOT NULL DEFAULT 'personal',
    context_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_preview TEXT,
    
    -- Ensure participants are different
    CONSTRAINT different_participants CHECK (participant_1_id != participant_2_id),
    
    -- Unique constraint: same participants + context can only have one conversation
    -- This prevents duplicate conversations
    CONSTRAINT unique_conversation UNIQUE (
        LEAST(participant_1_id, participant_2_id),
        GREATEST(participant_1_id, participant_2_id),
        context_type,
        COALESCE(context_id, '')
    )
);

-- CREATE MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    deleted BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT non_empty_content CHECK (LENGTH(TRIM(content)) > 0)
);

-- CREATE CONVERSATION_METADATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    archived BOOLEAN DEFAULT FALSE,
    muted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_conversation UNIQUE (user_id, conversation_id)
);

-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_context ON conversations(context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(recipient_id, read_at) WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_metadata_user ON conversation_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_metadata_conversation ON conversation_metadata(conversation_id);

-- CREATE TRIGGER TO UPDATE updated_at ON CONVERSATIONS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER TO UPDATE CONVERSATION ON NEW MESSAGE
-- ============================================
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET 
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100)
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_on_new_message ON messages;
CREATE TRIGGER update_conversation_on_new_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();

-- CREATE RPC FUNCTIONS
-- ============================================

-- Function to mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_as_read(conversation_uuid UUID, user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    marked_count INTEGER;
BEGIN
    UPDATE messages
    SET read_at = NOW()
    WHERE conversation_id = conversation_uuid
      AND recipient_id = user_uuid
      AND read_at IS NULL
      AND deleted = FALSE;
    
    GET DIAGNOSTICS marked_count = ROW_COUNT;
    RETURN marked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER
    INTO unread_count
    FROM messages
    WHERE recipient_id = user_uuid
      AND read_at IS NULL
      AND deleted = FALSE;
    
    RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations"
    ON conversations FOR SELECT
    USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- RLS Policies for messages
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
CREATE POLICY "Users can view their own messages"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their sent messages" ON messages;
CREATE POLICY "Users can update their sent messages"
    ON messages FOR UPDATE
    USING (auth.uid() = sender_id);

-- RLS Policies for metadata
DROP POLICY IF EXISTS "Users can view their own metadata" ON conversation_metadata;
CREATE POLICY "Users can view their own metadata"
    ON conversation_metadata FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON conversation_metadata TO authenticated;
