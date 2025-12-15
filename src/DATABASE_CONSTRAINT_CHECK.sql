-- ============================================
-- CHECK IF UNIQUE CONSTRAINT EXISTS
-- Run this in Supabase SQL Editor
-- ============================================

-- Check all constraints on conversations table
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

-- ============================================
-- IF NO UNIQUE CONSTRAINT EXISTS, RUN THIS:
-- ============================================

-- This will prevent duplicate conversations
ALTER TABLE conversations
ADD CONSTRAINT unique_conversation UNIQUE (
    LEAST(participant_1_id, participant_2_id),
    GREATEST(participant_1_id, participant_2_id),
    context_type,
    COALESCE(context_id, '')
);

-- ============================================
-- VERIFY IT WAS CREATED:
-- ============================================
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'conversations'
  AND con.conname = 'unique_conversation';
