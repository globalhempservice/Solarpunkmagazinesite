-- ============================================================================
-- FIX PLACES TABLE STATUS CONSTRAINT
-- ============================================================================
-- This script fixes the 'valid_status' CHECK constraint on the places table
-- to allow the correct status values: 'active', 'planned', 'closed'
-- 
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Check current constraint (for reference)
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'places'::regclass
  AND conname = 'valid_status';

-- Step 2: Drop the old constraint
ALTER TABLE places 
DROP CONSTRAINT IF EXISTS valid_status;

-- Step 3: Add the correct constraint
ALTER TABLE places
ADD CONSTRAINT valid_status 
CHECK (status IN ('active', 'planned', 'closed'));

-- Step 4: Verify the fix
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'places'::regclass
  AND conname = 'valid_status';

-- ============================================================================
-- SUCCESS! ✅
-- ============================================================================
-- The places table now accepts:
--   - 'active'  → Currently operational places
--   - 'planned' → Future/upcoming places  
--   - 'closed'  → No longer operational
-- ============================================================================
