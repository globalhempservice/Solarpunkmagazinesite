-- ================================================
-- FIX REMAINING 3 SECURITY DEFINER VIEWS (V2)
-- ================================================
-- Run this in your Supabase SQL Editor
-- Only fixes views if their underlying tables exist
-- ================================================

-- ================================================
-- FIX VIEWS (ONLY IF TABLES EXIST)
-- ================================================

-- Fix: top_searches_053bcd80 (if search_history_053bcd80 exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'search_history_053bcd80'
    ) THEN
        DROP VIEW IF EXISTS public.top_searches_053bcd80 CASCADE;
        
        EXECUTE 'CREATE VIEW public.top_searches_053bcd80
            WITH (security_invoker = true) AS
            SELECT 
                query,
                COUNT(*) as search_count,
                MAX(created_at) as last_searched
            FROM search_history_053bcd80
            GROUP BY query
            ORDER BY search_count DESC
            LIMIT 100';
        
        GRANT SELECT ON public.top_searches_053bcd80 TO authenticated;
        
        RAISE NOTICE 'Fixed: top_searches_053bcd80';
    ELSE
        -- Table doesn't exist, so drop the view
        DROP VIEW IF EXISTS public.top_searches_053bcd80 CASCADE;
        RAISE NOTICE 'Dropped: top_searches_053bcd80 (table does not exist)';
    END IF;
END $$;

-- Fix: swag_product_analytics_summary (if swag_products exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'swag_products'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_swag_items'
    ) THEN
        DROP VIEW IF EXISTS public.swag_product_analytics_summary CASCADE;
        
        EXECUTE 'CREATE VIEW public.swag_product_analytics_summary
            WITH (security_invoker = true) AS
            SELECT 
                sp.id,
                sp.name,
                sp.category,
                sp.price_nada,
                COUNT(DISTINCT usi.user_id) as unique_owners,
                COALESCE(SUM(usi.quantity), 0) as total_quantity_sold,
                COALESCE(SUM(usi.quantity * sp.price_nada), 0) as total_nada_revenue,
                COALESCE(AVG(usi.quantity), 0) as avg_quantity_per_user
            FROM swag_products sp
            LEFT JOIN user_swag_items usi ON sp.id = usi.swag_product_id
            GROUP BY sp.id, sp.name, sp.category, sp.price_nada';
        
        GRANT SELECT ON public.swag_product_analytics_summary TO authenticated;
        
        RAISE NOTICE 'Fixed: swag_product_analytics_summary';
    ELSE
        -- Tables don't exist, so drop the view
        DROP VIEW IF EXISTS public.swag_product_analytics_summary CASCADE;
        RAISE NOTICE 'Dropped: swag_product_analytics_summary (tables do not exist)';
    END IF;
END $$;

-- Fix: search_analytics_summary_053bcd80 (if search_history_053bcd80 exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'search_history_053bcd80'
    ) THEN
        DROP VIEW IF EXISTS public.search_analytics_summary_053bcd80 CASCADE;
        
        EXECUTE 'CREATE VIEW public.search_analytics_summary_053bcd80
            WITH (security_invoker = true) AS
            SELECT 
                DATE(created_at) as search_date,
                COUNT(*) as total_searches,
                COUNT(DISTINCT user_id) as unique_users,
                COUNT(DISTINCT query) as unique_queries
            FROM search_history_053bcd80
            GROUP BY DATE(created_at)
            ORDER BY search_date DESC';
        
        GRANT SELECT ON public.search_analytics_summary_053bcd80 TO authenticated;
        
        RAISE NOTICE 'Fixed: search_analytics_summary_053bcd80';
    ELSE
        -- Table doesn't exist, so drop the view
        DROP VIEW IF EXISTS public.search_analytics_summary_053bcd80 CASCADE;
        RAISE NOTICE 'Dropped: search_analytics_summary_053bcd80 (table does not exist)';
    END IF;
END $$;

-- ================================================
-- VERIFICATION
-- ================================================

-- Check what views still exist
DO $$
DECLARE
    view_rec RECORD;
    view_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== Remaining Views ===';
    
    FOR view_rec IN 
        SELECT viewname
        FROM pg_views
        WHERE schemaname = 'public'
        AND viewname IN (
            'top_searches_053bcd80',
            'swag_product_analytics_summary',
            'search_analytics_summary_053bcd80'
        )
    LOOP
        view_count := view_count + 1;
        RAISE NOTICE 'View exists: %', view_rec.viewname;
    END LOOP;
    
    IF view_count = 0 THEN
        RAISE NOTICE 'All 3 views have been dropped (underlying tables do not exist)';
    END IF;
END $$;

-- ================================================
-- DONE! ✅
-- ================================================
-- If the tables don't exist, the views are dropped
-- If the tables exist, the views are recreated with SECURITY INVOKER
-- Refresh Supabase dashboard to verify
-- ================================================

-- ================================================
-- EXPECTED RESULT:
-- ================================================
-- Since search_history_053bcd80 and possibly swag_products
-- don't exist, those views will be DROPPED
-- This will REMOVE the security errors!
-- Result: 4 errors → 1 error (spatial_ref_sys only)
-- ================================================
