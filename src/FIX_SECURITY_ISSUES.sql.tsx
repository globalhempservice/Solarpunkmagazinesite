-- ================================================
-- SECURITY ADVISOR FIXES
-- ================================================
-- Run this in your Supabase SQL Editor
-- ================================================

-- ================================================
-- 1. ENABLE RLS ON TABLES
-- ================================================

-- Enable RLS on articles table (has policies but RLS not enabled)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_swag_items table
ALTER TABLE public.user_swag_items ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for user_swag_items if they don't exist
DO $$ 
BEGIN
    -- Policy for viewing own items
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_swag_items' 
        AND policyname = 'Users can view their own swag items'
    ) THEN
        CREATE POLICY "Users can view their own swag items"
            ON public.user_swag_items FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    -- Policy for inserting own items
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_swag_items' 
        AND policyname = 'Users can insert their own swag items'
    ) THEN
        CREATE POLICY "Users can insert their own swag items"
            ON public.user_swag_items FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Policy for updating own items
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_swag_items' 
        AND policyname = 'Users can update their own swag items'
    ) THEN
        CREATE POLICY "Users can update their own swag items"
            ON public.user_swag_items FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    -- Policy for deleting own items
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_swag_items' 
        AND policyname = 'Users can delete their own swag items'
    ) THEN
        CREATE POLICY "Users can delete their own swag items"
            ON public.user_swag_items FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Enable RLS on spatial_ref_sys (PostGIS system table - make it read-only)
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read spatial_ref_sys (it's reference data)
DROP POLICY IF EXISTS "spatial_ref_sys_read_all" ON public.spatial_ref_sys;
CREATE POLICY "spatial_ref_sys_read_all"
    ON public.spatial_ref_sys FOR SELECT
    USING (true);

-- ================================================
-- 2. FIX SECURITY DEFINER VIEWS
-- ================================================

-- Drop and recreate views without SECURITY DEFINER
-- (Use SECURITY INVOKER instead for safer execution)

-- Fix: pending_badge_requests
DROP VIEW IF EXISTS public.pending_badge_requests CASCADE;
CREATE OR REPLACE VIEW public.pending_badge_requests
WITH (security_invoker = true) AS
SELECT * FROM badge_requests WHERE status = 'pending';

-- Fix: companies_with_stats
DROP VIEW IF EXISTS public.companies_with_stats CASCADE;
CREATE OR REPLACE VIEW public.companies_with_stats
WITH (security_invoker = true) AS
SELECT 
    c.*,
    COUNT(DISTINCT u.id) as employee_count,
    COUNT(DISTINCT a.id) as article_count
FROM companies c
LEFT JOIN user_progress u ON c.id = u.company_id
LEFT JOIN articles a ON c.id = a.company_id
GROUP BY c.id;

-- Fix: articles_with_authors
DROP VIEW IF EXISTS public.articles_with_authors CASCADE;
CREATE OR REPLACE VIEW public.articles_with_authors
WITH (security_invoker = true) AS
SELECT 
    a.*,
    up.display_name as author_name,
    up.avatar_url as author_avatar,
    up.role as author_role
FROM articles a
LEFT JOIN user_progress up ON a.author_user_id = up.user_id;

-- Fix: top_searches_053bcd80
DROP VIEW IF EXISTS public.top_searches_053bcd80 CASCADE;
CREATE OR REPLACE VIEW public.top_searches_053bcd80
WITH (security_invoker = true) AS
SELECT 
    query,
    COUNT(*) as search_count,
    MAX(created_at) as last_searched
FROM search_history_053bcd80
GROUP BY query
ORDER BY search_count DESC
LIMIT 100;

-- Fix: swag_product_analytics_summary
DROP VIEW IF EXISTS public.swag_product_analytics_summary CASCADE;
CREATE OR REPLACE VIEW public.swag_product_analytics_summary
WITH (security_invoker = true) AS
SELECT 
    sp.id,
    sp.name,
    sp.category,
    sp.price_nada,
    COUNT(DISTINCT usi.user_id) as unique_owners,
    SUM(usi.quantity) as total_quantity_sold,
    SUM(usi.quantity * sp.price_nada) as total_nada_revenue,
    AVG(usi.quantity) as avg_quantity_per_user
FROM swag_products sp
LEFT JOIN user_swag_items usi ON sp.id = usi.swag_product_id
GROUP BY sp.id, sp.name, sp.category, sp.price_nada;

-- Fix: search_analytics_summary_053bcd80
DROP VIEW IF EXISTS public.search_analytics_summary_053bcd80 CASCADE;
CREATE OR REPLACE VIEW public.search_analytics_summary_053bcd80
WITH (security_invoker = true) AS
SELECT 
    DATE(created_at) as search_date,
    COUNT(*) as total_searches,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT query) as unique_queries
FROM search_history_053bcd80
GROUP BY DATE(created_at)
ORDER BY search_date DESC;

-- ================================================
-- 3. GRANT APPROPRIATE PERMISSIONS
-- ================================================

-- Grant SELECT on views to authenticated users
GRANT SELECT ON public.pending_badge_requests TO authenticated;
GRANT SELECT ON public.companies_with_stats TO authenticated;
GRANT SELECT ON public.articles_with_authors TO authenticated;
GRANT SELECT ON public.top_searches_053bcd80 TO authenticated;
GRANT SELECT ON public.swag_product_analytics_summary TO authenticated;
GRANT SELECT ON public.search_analytics_summary_053bcd80 TO authenticated;

-- Grant SELECT on spatial_ref_sys to everyone (it's reference data)
GRANT SELECT ON public.spatial_ref_sys TO anon;
GRANT SELECT ON public.spatial_ref_sys TO authenticated;

-- ================================================
-- 4. VERIFICATION QUERIES
-- ================================================

-- Check RLS status for all tables
DO $$
DECLARE
    tbl RECORD;
BEGIN
    RAISE NOTICE '=== RLS Status Check ===';
    FOR tbl IN 
        SELECT 
            schemaname,
            tablename,
            rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        RAISE NOTICE 'Table: %.% - RLS: %', tbl.schemaname, tbl.tablename, 
            CASE WHEN tbl.rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END;
    END LOOP;
END $$;

-- Check view security settings
DO $$
DECLARE
    v RECORD;
BEGIN
    RAISE NOTICE '=== View Security Check ===';
    FOR v IN 
        SELECT 
            schemaname,
            viewname
        FROM pg_views
        WHERE schemaname = 'public'
        ORDER BY viewname
    LOOP
        RAISE NOTICE 'View: %.%', v.schemaname, v.viewname;
    END LOOP;
END $$;

-- ================================================
-- DONE! Security issues fixed 🎉
-- ================================================
-- Refresh your Supabase dashboard to see the results
-- The Security Advisor should now show fewer errors
-- ================================================
