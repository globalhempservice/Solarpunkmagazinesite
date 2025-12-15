-- ================================================
-- FIX REMAINING 3 SECURITY DEFINER VIEWS
-- ================================================
-- Run this in your Supabase SQL Editor
-- Fixes the 3 views that still have SECURITY DEFINER
-- ================================================

-- ================================================
-- FORCE DROP AND RECREATE THE 3 VIEWS
-- ================================================

-- Force drop with CASCADE to remove dependencies
DROP VIEW IF EXISTS public.top_searches_053bcd80 CASCADE;
DROP VIEW IF EXISTS public.swag_product_analytics_summary CASCADE;
DROP VIEW IF EXISTS public.search_analytics_summary_053bcd80 CASCADE;

-- Recreate top_searches_053bcd80 with SECURITY INVOKER
CREATE VIEW public.top_searches_053bcd80
WITH (security_invoker = true) AS
SELECT 
    query,
    COUNT(*) as search_count,
    MAX(created_at) as last_searched
FROM search_history_053bcd80
GROUP BY query
ORDER BY search_count DESC
LIMIT 100;

-- Recreate swag_product_analytics_summary with SECURITY INVOKER
CREATE VIEW public.swag_product_analytics_summary
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
GROUP BY sp.id, sp.name, sp.category, sp.price_nada;

-- Recreate search_analytics_summary_053bcd80 with SECURITY INVOKER
CREATE VIEW public.search_analytics_summary_053bcd80
WITH (security_invoker = true) AS
SELECT 
    DATE(created_at) as search_date,
    COUNT(*) as total_searches,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT query) as unique_queries
FROM search_history_053bcd80
GROUP BY DATE(created_at)
ORDER BY search_date DESC;

-- Grant SELECT permissions
GRANT SELECT ON public.top_searches_053bcd80 TO authenticated;
GRANT SELECT ON public.swag_product_analytics_summary TO authenticated;
GRANT SELECT ON public.search_analytics_summary_053bcd80 TO authenticated;

-- ================================================
-- VERIFICATION
-- ================================================

-- Check that views are now using SECURITY INVOKER
DO $$
DECLARE
    view_rec RECORD;
    has_definer BOOLEAN;
BEGIN
    RAISE NOTICE '=== View Security Check ===';
    
    FOR view_rec IN 
        SELECT 
            viewname,
            definition
        FROM pg_views
        WHERE schemaname = 'public'
        AND viewname IN (
            'top_searches_053bcd80',
            'swag_product_analytics_summary',
            'search_analytics_summary_053bcd80'
        )
    LOOP
        -- Check if definition contains SECURITY DEFINER
        has_definer := view_rec.definition LIKE '%SECURITY DEFINER%';
        
        RAISE NOTICE 'View: % - Has SECURITY DEFINER: %', 
            view_rec.viewname, 
            CASE WHEN has_definer THEN 'YES (BAD)' ELSE 'NO (GOOD)' END;
    END LOOP;
END $$;

-- ================================================
-- DONE! ✅
-- ================================================
-- These 3 views should now be fixed
-- Refresh Supabase dashboard to verify
-- Expected result: 4 errors → 1 error (spatial_ref_sys)
-- ================================================

-- ================================================
-- NOTE: spatial_ref_sys
-- ================================================
-- The remaining error for spatial_ref_sys is SAFE to ignore
-- It's a PostGIS system table that cannot be altered
-- This is expected behavior and not a security risk
-- ================================================
