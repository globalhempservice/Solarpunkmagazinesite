-- ================================================
-- FIX LAST 10 FUNCTION WARNINGS (AUTO-DISCOVER)
-- ================================================
-- Run this in your Supabase SQL Editor
-- Automatically discovers function signatures and fixes them
-- ================================================

DO $$
DECLARE
    func_rec RECORD;
    fixed_count INTEGER := 0;
    func_signature TEXT;
BEGIN
    RAISE NOTICE '=== Auto-Discovering and Fixing Remaining Functions ===';
    RAISE NOTICE '';
    
    -- Get all functions in public schema that match our list
    FOR func_rec IN 
        SELECT 
            p.proname as func_name,
            p.oid as func_oid,
            pg_get_function_identity_arguments(p.oid) as args,
            pg_get_functiondef(p.oid) as func_def
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname IN (
            'increment_vote_count',
            'calculate_place_area',
            'select_discovery_match',
            'get_search_suggestions_053bcd80',
            'increment_unlock_count',
            'get_or_create_conversation',
            'calculate_conscious_score',
            'get_trending_searches_053bcd80',
            'increment_idea_count',
            'find_conversation_by_participants'
        )
        ORDER BY p.proname
    LOOP
        BEGIN
            -- Build the ALTER FUNCTION command
            func_signature := 'public.' || func_rec.func_name;
            IF func_rec.args IS NOT NULL AND func_rec.args != '' THEN
                func_signature := func_signature || '(' || func_rec.args || ')';
            ELSE
                func_signature := func_signature || '()';
            END IF;
            
            -- Execute the ALTER FUNCTION
            EXECUTE 'ALTER FUNCTION ' || func_signature || ' SET search_path = public';
            
            fixed_count := fixed_count + 1;
            RAISE NOTICE '✅ Fixed: %', func_signature;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Failed: % - Error: %', func_signature, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== Summary ===';
    RAISE NOTICE 'Functions fixed: %', fixed_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Expected result: 12 warnings → 2 warnings (PostGIS + Auth)';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Remaining actions:';
    RAISE NOTICE '  1. ✅ Ignore PostGIS warning (safe for Places/Globe)';
    RAISE NOTICE '  2. ⚙️  Enable Auth password protection in dashboard';
    RAISE NOTICE '';
    RAISE NOTICE 'Refresh Supabase Security Advisor to verify!';
END $$;

-- ================================================
-- LIST ALL REMAINING FUNCTIONS WITH SIGNATURES
-- ================================================
-- This helps you see what was fixed
-- ================================================

SELECT 
    p.proname as "Function Name",
    pg_get_function_identity_arguments(p.oid) as "Arguments",
    'public.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' as "Full Signature"
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'increment_vote_count',
    'calculate_place_area',
    'select_discovery_match',
    'get_search_suggestions_053bcd80',
    'increment_unlock_count',
    'get_or_create_conversation',
    'calculate_conscious_score',
    'get_trending_searches_053bcd80',
    'increment_idea_count',
    'find_conversation_by_participants'
)
ORDER BY p.proname;

-- ================================================
-- DONE! ✅
-- ================================================
-- All 10 remaining functions should now be fixed
-- Result: 12 warnings → 2 warnings
-- Remaining:
--   1. PostGIS (safe to ignore - needed for Globe)
--   2. Auth password protection (fix in dashboard)
-- ================================================
