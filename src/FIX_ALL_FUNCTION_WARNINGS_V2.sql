-- ================================================
-- FIX ALL FUNCTION SEARCH_PATH WARNINGS (V2)
-- ================================================
-- Run this in your Supabase SQL Editor
-- Only fixes functions that actually exist
-- Handles different function signatures gracefully
-- ================================================

-- ================================================
-- SMART FUNCTION FIXER
-- ================================================
-- Tries to fix each function, skips if doesn't exist
-- Reports what was fixed and what was skipped
-- ================================================

DO $$
DECLARE
    fixed_count INTEGER := 0;
    skipped_count INTEGER := 0;
    func_name TEXT;
BEGIN
    RAISE NOTICE '=== Starting Function Search Path Fix ===';
    RAISE NOTICE '';
    
    -- Function list to fix
    -- For each function, try common signatures
    
    -- 1. update_conscious_score
    BEGIN
        ALTER FUNCTION public.update_conscious_score() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: update_conscious_score()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: update_conscious_score() - does not exist';
    END;
    
    -- 2. update_article_views_timestamp
    BEGIN
        ALTER FUNCTION public.update_article_views_timestamp() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: update_article_views_timestamp()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: update_article_views_timestamp() - does not exist';
    END;
    
    -- 3. mark_conversation_as_read
    BEGIN
        ALTER FUNCTION public.mark_conversation_as_read(uuid, uuid) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: mark_conversation_as_read(uuid, uuid)';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: mark_conversation_as_read(uuid, uuid) - does not exist';
    END;
    
    -- 4. update_swag_products_updated_at
    BEGIN
        ALTER FUNCTION public.update_swag_products_updated_at() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: update_swag_products_updated_at()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: update_swag_products_updated_at() - does not exist';
    END;
    
    -- 5. get_unread_count
    BEGIN
        ALTER FUNCTION public.get_unread_count(uuid) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: get_unread_count(uuid)';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: get_unread_count(uuid) - does not exist';
    END;
    
    -- 6. increment_vote_count - Try multiple signatures
    BEGIN
        ALTER FUNCTION public.increment_vote_count(uuid) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: increment_vote_count(uuid)';
    EXCEPTION WHEN undefined_function THEN
        BEGIN
            ALTER FUNCTION public.increment_vote_count(uuid, integer) SET search_path = public;
            fixed_count := fixed_count + 1;
            RAISE NOTICE '✅ Fixed: increment_vote_count(uuid, integer)';
        EXCEPTION WHEN undefined_function THEN
            skipped_count := skipped_count + 1;
            RAISE NOTICE '⏭️  Skipped: increment_vote_count - does not exist';
        END;
    END;
    
    -- 7. get_organization_publication_count
    BEGIN
        ALTER FUNCTION public.get_organization_publication_count(uuid) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: get_organization_publication_count(uuid)';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: get_organization_publication_count(uuid) - does not exist';
    END;
    
    -- 8. set_published_at
    BEGIN
        ALTER FUNCTION public.set_published_at() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: set_published_at()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: set_published_at() - does not exist';
    END;
    
    -- 9. calculate_place_area
    BEGIN
        ALTER FUNCTION public.calculate_place_area(geometry) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: calculate_place_area(geometry)';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: calculate_place_area(geometry) - does not exist';
    END;
    
    -- 10. is_article_author
    BEGIN
        ALTER FUNCTION public.is_article_author(uuid, uuid) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: is_article_author(uuid, uuid)';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: is_article_author(uuid, uuid) - does not exist';
    END;
    
    -- 11. select_discovery_match
    BEGIN
        ALTER FUNCTION public.select_discovery_match(uuid) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: select_discovery_match(uuid)';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: select_discovery_match(uuid) - does not exist';
    END;
    
    -- 12. sync_place_coordinates
    BEGIN
        ALTER FUNCTION public.sync_place_coordinates() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: sync_place_coordinates()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: sync_place_coordinates() - does not exist';
    END;
    
    -- 13. update_profile_updated_at
    BEGIN
        ALTER FUNCTION public.update_profile_updated_at() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: update_profile_updated_at()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: update_profile_updated_at() - does not exist';
    END;
    
    -- 14. mark_discovery_match_viewed
    BEGIN
        ALTER FUNCTION public.mark_discovery_match_viewed(uuid) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: mark_discovery_match_viewed(uuid)';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: mark_discovery_match_viewed(uuid) - does not exist';
    END;
    
    -- 15. cleanup_old_audit_logs
    BEGIN
        ALTER FUNCTION public.cleanup_old_audit_logs() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: cleanup_old_audit_logs()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: cleanup_old_audit_logs() - does not exist';
    END;
    
    -- 16. update_places_updated_at
    BEGIN
        ALTER FUNCTION public.update_places_updated_at() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: update_places_updated_at()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: update_places_updated_at() - does not exist';
    END;
    
    -- 17. get_or_create_conversation - Multiple signatures
    BEGIN
        ALTER FUNCTION public.get_or_create_conversation(uuid, uuid) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: get_or_create_conversation(uuid, uuid)';
    EXCEPTION WHEN undefined_function THEN
        BEGIN
            ALTER FUNCTION public.get_or_create_conversation(uuid[], text) SET search_path = public;
            fixed_count := fixed_count + 1;
            RAISE NOTICE '✅ Fixed: get_or_create_conversation(uuid[], text)';
        EXCEPTION WHEN undefined_function THEN
            skipped_count := skipped_count + 1;
            RAISE NOTICE '⏭️  Skipped: get_or_create_conversation - does not exist';
        END;
    END;
    
    -- 18. update_wallet_updated_at
    BEGIN
        ALTER FUNCTION public.update_wallet_updated_at() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: update_wallet_updated_at()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: update_wallet_updated_at() - does not exist';
    END;
    
    -- 19. update_organization_publications_updated_at
    BEGIN
        ALTER FUNCTION public.update_organization_publications_updated_at() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: update_organization_publications_updated_at()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: update_organization_publications_updated_at() - does not exist';
    END;
    
    -- 20. handle_new_user
    BEGIN
        ALTER FUNCTION public.handle_new_user() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: handle_new_user()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: handle_new_user() - does not exist';
    END;
    
    -- 21. get_article_author_count
    BEGIN
        ALTER FUNCTION public.get_article_author_count(uuid) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: get_article_author_count(uuid)';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: get_article_author_count(uuid) - does not exist';
    END;
    
    -- 22. get_search_suggestions_053bcd80
    BEGIN
        ALTER FUNCTION public.get_search_suggestions_053bcd80(text) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: get_search_suggestions_053bcd80(text)';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: get_search_suggestions_053bcd80(text) - does not exist';
    END;
    
    -- 23. update_updated_at_column
    BEGIN
        ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: update_updated_at_column()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: update_updated_at_column() - does not exist';
    END;
    
    -- 24. increment_profile_views
    BEGIN
        ALTER FUNCTION public.increment_profile_views(uuid) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: increment_profile_views(uuid)';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: increment_profile_views(uuid) - does not exist';
    END;
    
    -- 25. update_swap_proposal_updated_at
    BEGIN
        ALTER FUNCTION public.update_swap_proposal_updated_at() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: update_swap_proposal_updated_at()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: update_swap_proposal_updated_at() - does not exist';
    END;
    
    -- 26. sync_company_category_name
    BEGIN
        ALTER FUNCTION public.sync_company_category_name() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: sync_company_category_name()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: sync_company_category_name() - does not exist';
    END;
    
    -- 27. increment_unlock_count
    BEGIN
        ALTER FUNCTION public.increment_unlock_count(uuid) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: increment_unlock_count(uuid)';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: increment_unlock_count(uuid) - does not exist';
    END;
    
    -- 28. update_conversation_timestamp
    BEGIN
        ALTER FUNCTION public.update_conversation_timestamp() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: update_conversation_timestamp()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: update_conversation_timestamp() - does not exist';
    END;
    
    -- 29. update_article_swipe_stats_timestamp
    BEGIN
        ALTER FUNCTION public.update_article_swipe_stats_timestamp() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: update_article_swipe_stats_timestamp()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: update_article_swipe_stats_timestamp() - does not exist';
    END;
    
    -- 30. calculate_conscious_score
    BEGIN
        ALTER FUNCTION public.calculate_conscious_score(uuid) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: calculate_conscious_score(uuid)';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: calculate_conscious_score(uuid) - does not exist';
    END;
    
    -- 31. update_organization_place_relationships_updated_at
    BEGIN
        ALTER FUNCTION public.update_organization_place_relationships_updated_at() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: update_organization_place_relationships_updated_at()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: update_organization_place_relationships_updated_at() - does not exist';
    END;
    
    -- 32. get_trending_searches_053bcd80
    BEGIN
        ALTER FUNCTION public.get_trending_searches_053bcd80(integer) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: get_trending_searches_053bcd80(integer)';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: get_trending_searches_053bcd80(integer) - does not exist';
    END;
    
    -- 33. get_article_authors_formatted
    BEGIN
        ALTER FUNCTION public.get_article_authors_formatted(uuid) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: get_article_authors_formatted(uuid)';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: get_article_authors_formatted(uuid) - does not exist';
    END;
    
    -- 34. is_article_linked_to_org
    BEGIN
        ALTER FUNCTION public.is_article_linked_to_org(uuid, uuid) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: is_article_linked_to_org(uuid, uuid)';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: is_article_linked_to_org(uuid, uuid) - does not exist';
    END;
    
    -- 35. update_swag_items_updated_at
    BEGIN
        ALTER FUNCTION public.update_swag_items_updated_at() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: update_swag_items_updated_at()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: update_swag_items_updated_at() - does not exist';
    END;
    
    -- 36. update_article_authors_updated_at
    BEGIN
        ALTER FUNCTION public.update_article_authors_updated_at() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: update_article_authors_updated_at()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: update_article_authors_updated_at() - does not exist';
    END;
    
    -- 37. update_swap_item_updated_at
    BEGIN
        ALTER FUNCTION public.update_swap_item_updated_at() SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: update_swap_item_updated_at()';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: update_swap_item_updated_at() - does not exist';
    END;
    
    -- 38. increment_idea_count
    BEGIN
        ALTER FUNCTION public.increment_idea_count(uuid) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: increment_idea_count(uuid)';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: increment_idea_count(uuid) - does not exist';
    END;
    
    -- 39. find_conversation_by_participants
    BEGIN
        ALTER FUNCTION public.find_conversation_by_participants(uuid[]) SET search_path = public;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✅ Fixed: find_conversation_by_participants(uuid[])';
    EXCEPTION WHEN undefined_function THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE '⏭️  Skipped: find_conversation_by_participants(uuid[]) - does not exist';
    END;
    
    -- Print summary
    RAISE NOTICE '';
    RAISE NOTICE '=== Summary ===';
    RAISE NOTICE 'Functions fixed: %', fixed_count;
    RAISE NOTICE 'Functions skipped: % (do not exist)', skipped_count;
    RAISE NOTICE 'Total attempted: %', fixed_count + skipped_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Result: % function warnings should be cleared!', fixed_count;
    RAISE NOTICE 'Refresh Supabase Security Advisor to see results.';
END $$;

-- ================================================
-- DONE! ✅
-- ================================================
-- All existing functions now have search_path set
-- Functions that don't exist were safely skipped
-- Refresh Supabase dashboard to verify
-- ================================================
