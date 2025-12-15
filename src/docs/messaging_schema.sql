-- ============================================
-- DEWII Messaging System - Database Schema
-- ============================================
-- Execute this SQL in your Supabase SQL Editor
-- Last Updated: December 8, 2025
-- ============================================

-- --------------------------------------------
-- 1. CREATE TABLES
-- --------------------------------------------

-- Conversations table: Stores 1-on-1 conversation metadata
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  participant_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  
  -- Ensure a user can't have a conversation with themselves
  CONSTRAINT different_participants CHECK (participant_1_id != participant_2_id)
);

-- Create unique index to ensure two users can only have one conversation together
-- This handles both (user1, user2) and (user2, user1) as the same conversation
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_conversation_participants 
  ON conversations(
    LEAST(participant_1_id, participant_2_id),
    GREATEST(participant_1_id, participant_2_id)
  );

-- Messages table: Stores individual messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Ensure message content is not empty
  CONSTRAINT content_not_empty CHECK (LENGTH(TRIM(content)) > 0),
  
  -- Ensure sender and recipient are different
  CONSTRAINT different_users CHECK (sender_id != recipient_id)
);

-- Conversation metadata: Per-user settings for conversations (archive, mute, etc.)
CREATE TABLE IF NOT EXISTS conversation_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  muted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Each user can only have one metadata record per conversation
  CONSTRAINT unique_user_conversation UNIQUE(user_id, conversation_id)
);

-- --------------------------------------------
-- 2. CREATE INDEXES FOR PERFORMANCE
-- --------------------------------------------

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC NULLS LAST);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(recipient_id, read_at) WHERE read_at IS NULL AND deleted = FALSE;

-- Conversation metadata indexes
CREATE INDEX IF NOT EXISTS idx_conversation_metadata_user ON conversation_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_metadata_conversation ON conversation_metadata(conversation_id);

-- --------------------------------------------
-- 3. CREATE FUNCTIONS & TRIGGERS
-- --------------------------------------------

-- Function: Update conversation's last_message_at when new message is inserted
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Automatically update conversation when message is sent
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON messages;
CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at for conversations
DROP TRIGGER IF EXISTS trigger_conversations_updated_at ON conversations;
CREATE TRIGGER trigger_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at for conversation_metadata
DROP TRIGGER IF EXISTS trigger_conversation_metadata_updated_at ON conversation_metadata;
CREATE TRIGGER trigger_conversation_metadata_updated_at
  BEFORE UPDATE ON conversation_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_metadata ENABLE ROW LEVEL SECURITY;

-- Conversations RLS Policies
-- Users can view conversations they're part of
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT
  USING (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
  );

-- Users can create conversations (insert is typically done by server with service role)
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT
  WITH CHECK (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
  );

-- Users can update conversations they're part of (limited fields)
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
CREATE POLICY "Users can update their conversations" ON conversations
  FOR UPDATE
  USING (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
  );

-- Messages RLS Policies
-- Users can view messages in their conversations
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT
  USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

-- Users can send messages (insert)
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
  );

-- Users can update their own messages (e.g., mark as deleted, mark as read)
DROP POLICY IF EXISTS "Users can update their messages" ON messages;
CREATE POLICY "Users can update their messages" ON messages
  FOR UPDATE
  USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

-- Users can soft-delete their own messages
DROP POLICY IF EXISTS "Users can delete their messages" ON messages;
CREATE POLICY "Users can delete their messages" ON messages
  FOR DELETE
  USING (
    auth.uid() = sender_id
  );

-- Conversation Metadata RLS Policies
-- Users can view their own metadata
DROP POLICY IF EXISTS "Users can view their conversation metadata" ON conversation_metadata;
CREATE POLICY "Users can view their conversation metadata" ON conversation_metadata
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Users can insert their own metadata
DROP POLICY IF EXISTS "Users can create their conversation metadata" ON conversation_metadata;
CREATE POLICY "Users can create their conversation metadata" ON conversation_metadata
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Users can update their own metadata
DROP POLICY IF EXISTS "Users can update their conversation metadata" ON conversation_metadata;
CREATE POLICY "Users can update their conversation metadata" ON conversation_metadata
  FOR UPDATE
  USING (
    auth.uid() = user_id
  );

-- Users can delete their own metadata
DROP POLICY IF EXISTS "Users can delete their conversation metadata" ON conversation_metadata;
CREATE POLICY "Users can delete their conversation metadata" ON conversation_metadata
  FOR DELETE
  USING (
    auth.uid() = user_id
  );

-- --------------------------------------------
-- 5. ENABLE REALTIME
-- --------------------------------------------

-- Enable Realtime for tables
-- This allows frontend to subscribe to database changes
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_metadata;

-- --------------------------------------------
-- 6. CREATE HELPER FUNCTIONS (OPTIONAL)
-- --------------------------------------------

-- Function: Get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM messages
  WHERE recipient_id = user_uuid
    AND read_at IS NULL
    AND deleted = FALSE;
$$ LANGUAGE SQL STABLE;

-- Function: Get or create conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  user1_id UUID,
  user2_id UUID
)
RETURNS UUID AS $$
DECLARE
  conversation_uuid UUID;
BEGIN
  -- Try to find existing conversation
  SELECT id INTO conversation_uuid
  FROM conversations
  WHERE (participant_1_id = user1_id AND participant_2_id = user2_id)
     OR (participant_1_id = user2_id AND participant_2_id = user1_id)
  LIMIT 1;
  
  -- If not found, create new conversation
  IF conversation_uuid IS NULL THEN
    INSERT INTO conversations (participant_1_id, participant_2_id)
    VALUES (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))
    RETURNING id INTO conversation_uuid;
  END IF;
  
  RETURN conversation_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function: Mark all messages in a conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_as_read(
  conversation_uuid UUID,
  user_uuid UUID
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE messages
  SET read_at = NOW()
  WHERE conversation_id = conversation_uuid
    AND recipient_id = user_uuid
    AND read_at IS NULL
    AND deleted = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- 7. GRANT PERMISSIONS
-- --------------------------------------------

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_metadata TO authenticated;

-- Grant usage on sequences (for UUID generation, though we use gen_random_uuid())
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- --------------------------------------------
-- 8. VERIFICATION QUERIES
-- --------------------------------------------

-- After running this migration, verify with these queries:

-- Check tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('conversations', 'messages', 'conversation_metadata');

-- Check indexes
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('conversations', 'messages', 'conversation_metadata');

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('conversations', 'messages', 'conversation_metadata');

-- Check Realtime is enabled
-- SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- ============================================
-- END OF MIGRATION
-- ============================================

-- SUCCESS! 🎉
-- Your messaging system database schema is now ready.
-- 
-- Next steps:
-- 1. Verify all tables were created successfully
-- 2. Test RLS policies by querying as an authenticated user
-- 3. Implement backend API endpoints in Hono server
-- 4. Build frontend components and real-time subscriptions
-- 
-- For questions or issues, refer to:
-- - /docs/MESSAGING_SYSTEM_SPEC.md
-- - Supabase Realtime docs: https://supabase.com/docs/guides/realtime
-- ============================================