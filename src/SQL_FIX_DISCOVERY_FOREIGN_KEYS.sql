-- ============================================================================
-- DEWII Discovery System - Foreign Key Relationship Fixes
-- ============================================================================
-- This script diagnoses and fixes foreign key constraint issues with the
-- discovery_requests table
-- ============================================================================

-- ============================================================================
-- STEP 1: DIAGNOSTIC QUERIES
-- ============================================================================
-- Run these first to understand the current state

-- Check existing foreign key constraints on discovery_requests
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'discovery_requests';

-- Check if user_profiles has the required user_id values
SELECT 
    dr.id as request_id,
    dr.user_id,
    CASE 
        WHEN up.user_id IS NOT NULL THEN 'EXISTS'
        ELSE 'MISSING'
    END as profile_status
FROM discovery_requests dr
LEFT JOIN user_profiles up ON dr.user_id = up.user_id
WHERE up.user_id IS NULL;

-- Check auth.users vs user_profiles
SELECT 
    dr.id as request_id,
    dr.user_id,
    CASE 
        WHEN au.id IS NOT NULL THEN 'EXISTS IN AUTH'
        ELSE 'MISSING FROM AUTH'
    END as auth_status,
    CASE 
        WHEN up.user_id IS NOT NULL THEN 'EXISTS IN PROFILES'
        ELSE 'MISSING FROM PROFILES'
    END as profile_status
FROM discovery_requests dr
LEFT JOIN auth.users au ON dr.user_id = au.id
LEFT JOIN user_profiles up ON dr.user_id = up.user_id;

-- ============================================================================
-- STEP 2: DROP PROBLEMATIC FOREIGN KEY CONSTRAINTS
-- ============================================================================
-- This will remove the constraints that are causing issues

-- Drop the user_id foreign key constraint (if it exists)
ALTER TABLE discovery_requests 
DROP CONSTRAINT IF EXISTS discovery_requests_user_id_fkey;

-- Drop the selected_organization_id foreign key constraint (if it exists)
ALTER TABLE discovery_requests 
DROP CONSTRAINT IF EXISTS discovery_requests_selected_organization_id_fkey;

-- ============================================================================
-- STEP 3: RECREATE FOREIGN KEYS WITH CORRECT REFERENCES
-- ============================================================================
-- Now recreate them pointing to the correct tables

-- Foreign key to auth.users (the source of truth for user authentication)
-- This is more reliable than user_profiles since profiles might not exist yet
ALTER TABLE discovery_requests
ADD CONSTRAINT discovery_requests_user_id_fkey
FOREIGN KEY (user_id) 
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Foreign key to companies table (this one is probably fine as-is)
ALTER TABLE discovery_requests
ADD CONSTRAINT discovery_requests_selected_organization_id_fkey
FOREIGN KEY (selected_organization_id) 
REFERENCES companies(id)
ON DELETE SET NULL;

-- ============================================================================
-- STEP 4: ADD SAME FIX TO DISCOVERY_RECOMMENDATIONS TABLE
-- ============================================================================
-- The recommendations table should also reference auth.users

-- Check current constraints on discovery_recommendations
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'discovery_recommendations';

-- Drop and recreate user_id FK on discovery_recommendations if needed
ALTER TABLE discovery_recommendations 
DROP CONSTRAINT IF EXISTS discovery_recommendations_user_id_fkey;

ALTER TABLE discovery_recommendations
ADD CONSTRAINT discovery_recommendations_user_id_fkey
FOREIGN KEY (user_id) 
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Add sent_at column if it doesn't exist (for tracking when recommendations were sent)
ALTER TABLE discovery_recommendations
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ DEFAULT NULL;

-- ============================================================================
-- STEP 5: VERIFY THE FIXES
-- ============================================================================

-- Check that all constraints are now correct
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('discovery_requests', 'discovery_recommendations')
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- STEP 6: CREATE MISSING USER PROFILES (OPTIONAL)
-- ============================================================================
-- If you want to ensure all users who have discovery requests also have profiles
-- Run this to create minimal user profiles for users who don't have them yet

INSERT INTO user_profiles (user_id, display_name, created_at, updated_at)
SELECT 
    au.id,
    COALESCE(au.email, 'User ' || au.id),
    NOW(),
    NOW()
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- NOTES
-- ============================================================================
-- The key issue is that discovery_requests.user_id should reference auth.users.id
-- NOT user_profiles.user_id, because:
-- 1. auth.users is the source of truth (created during signup)
-- 2. user_profiles might not exist yet (created lazily/on first profile edit)
-- 3. Foreign keys should point to the primary source of truth
--
-- If you need to join to user_profiles in queries, use LEFT JOIN to handle
-- cases where the profile doesn't exist yet.
-- ============================================================================