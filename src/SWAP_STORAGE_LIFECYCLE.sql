-- ================================================
-- SWAP ITEM STORAGE LIFECYCLE MANAGEMENT
-- ================================================
-- Implements automatic cleanup and archival
-- to prevent storage bloat
-- ================================================

-- ================================================
-- 1. ADD STATUS AND EXPIRY COLUMNS
-- ================================================

-- Add status enum type
DO $$ BEGIN
    CREATE TYPE swap_item_status AS ENUM (
        'active',      -- 0-7 days, full quality, visible in feed
        'expired',     -- 7-30 days, compressed, history only
        'archived',    -- 30+ days, image deleted, metadata only
        'swapped',     -- Successfully swapped (keep image)
        'removed'      -- User deleted (delete immediately)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to swap_items
ALTER TABLE swap_items 
    ADD COLUMN IF NOT EXISTS status swap_item_status DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS original_image_size BIGINT,
    ADD COLUMN IF NOT EXISTS compressed_image_size BIGINT,
    ADD COLUMN IF NOT EXISTS image_storage_path TEXT;

-- Create index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_swap_items_status ON swap_items(status);
CREATE INDEX IF NOT EXISTS idx_swap_items_expires_at ON swap_items(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_swap_items_archived_at ON swap_items(archived_at) WHERE status = 'expired';

-- ================================================
-- 2. AUTO-SET EXPIRY ON INSERT
-- ================================================

CREATE OR REPLACE FUNCTION set_swap_item_expiry()
RETURNS TRIGGER AS $$
BEGIN
    -- Set expiry to 7 days from now if not specified
    IF NEW.expires_at IS NULL THEN
        NEW.expires_at := NOW() + INTERVAL '7 days';
    END IF;
    
    -- Set initial status if not specified
    IF NEW.status IS NULL THEN
        NEW.status := 'active';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_swap_item_expiry_trigger ON swap_items;
CREATE TRIGGER set_swap_item_expiry_trigger
    BEFORE INSERT ON swap_items
    FOR EACH ROW
    EXECUTE FUNCTION set_swap_item_expiry();

-- ================================================
-- 3. CLEANUP FUNCTION (Call via Cron/Edge Function)
-- ================================================

CREATE OR REPLACE FUNCTION cleanup_expired_swap_items()
RETURNS TABLE(
    items_expired INT,
    items_archived INT,
    storage_freed_mb NUMERIC
) AS $$
DECLARE
    v_items_expired INT := 0;
    v_items_archived INT := 0;
    v_storage_freed BIGINT := 0;
    v_item RECORD;
BEGIN
    -- ================================================
    -- STEP 1: Mark items as EXPIRED (7+ days old)
    -- ================================================
    UPDATE swap_items
    SET status = 'expired'
    WHERE status = 'active'
        AND expires_at <= NOW()
        AND NOT EXISTS (
            -- Don't expire if there's an active proposal
            SELECT 1 FROM swap_proposals 
            WHERE item_id = swap_items.id 
            AND status IN ('pending', 'accepted')
        );
    
    GET DIAGNOSTICS v_items_expired = ROW_COUNT;
    
    -- ================================================
    -- STEP 2: Archive items (30+ days old)
    -- Delete images, keep metadata
    -- ================================================
    FOR v_item IN 
        SELECT id, image_url, original_image_size, compressed_image_size
        FROM swap_items
        WHERE status = 'expired'
            AND expires_at <= NOW() - INTERVAL '23 days'  -- 7 + 23 = 30 days total
    LOOP
        -- Track storage freed
        v_storage_freed := v_storage_freed + 
            COALESCE(v_item.compressed_image_size, v_item.original_image_size, 0);
        
        -- Update record to archived
        UPDATE swap_items
        SET 
            status = 'archived',
            archived_at = NOW(),
            -- Keep URL for reference but mark it as deleted
            image_url = 'archived://' || id
        WHERE id = v_item.id;
        
        v_items_archived := v_items_archived + 1;
        
        -- TODO: Delete actual file from Supabase Storage
        -- This would be done in the Edge Function that calls this
        -- For now, just return the path that needs deletion
    END LOOP;
    
    -- ================================================
    -- STEP 3: Immediately remove user-deleted items
    -- ================================================
    FOR v_item IN 
        SELECT id, image_url, original_image_size, compressed_image_size
        FROM swap_items
        WHERE status = 'removed'
    LOOP
        v_storage_freed := v_storage_freed + 
            COALESCE(v_item.compressed_image_size, v_item.original_image_size, 0);
        
        -- Actually delete the record
        DELETE FROM swap_items WHERE id = v_item.id;
        
        v_items_archived := v_items_archived + 1;
    END LOOP;
    
    -- Return statistics
    RETURN QUERY SELECT 
        v_items_expired,
        v_items_archived,
        ROUND(v_storage_freed / 1024.0 / 1024.0, 2); -- Convert to MB
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 4. GET ITEMS THAT NEED IMAGE DELETION
-- ================================================

CREATE OR REPLACE FUNCTION get_images_to_delete()
RETURNS TABLE(
    item_id UUID,
    image_url TEXT,
    storage_path TEXT,
    status swap_item_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        id,
        swap_items.image_url,
        image_storage_path,
        swap_items.status
    FROM swap_items
    WHERE swap_items.status IN ('archived', 'removed')
        AND swap_items.image_url NOT LIKE 'archived://%'
        AND swap_items.image_url IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 5. MARK IMAGE AS DELETED (after Storage deletion)
-- ================================================

CREATE OR REPLACE FUNCTION mark_image_deleted(p_item_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE swap_items
    SET image_url = 'archived://' || id
    WHERE id = p_item_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 6. ANALYTICS: Storage Usage
-- ================================================

CREATE OR REPLACE VIEW swap_storage_analytics AS
SELECT 
    status,
    COUNT(*) as item_count,
    ROUND(SUM(COALESCE(compressed_image_size, original_image_size, 0))::NUMERIC / 1024 / 1024, 2) as storage_mb,
    ROUND(AVG(COALESCE(compressed_image_size, original_image_size, 0))::NUMERIC / 1024, 2) as avg_size_kb,
    MIN(created_at) as oldest_item,
    MAX(created_at) as newest_item
FROM swap_items
GROUP BY status
ORDER BY 
    CASE status
        WHEN 'active' THEN 1
        WHEN 'swapped' THEN 2
        WHEN 'expired' THEN 3
        WHEN 'archived' THEN 4
        WHEN 'removed' THEN 5
    END;

-- ================================================
-- 7. USER-FACING VIEWS (filtered by status)
-- ================================================

-- Active items only (main feed)
CREATE OR REPLACE VIEW swap_items_active AS
SELECT * FROM swap_items
WHERE status = 'active'
    AND expires_at > NOW()
ORDER BY created_at DESC;

-- User's items with all statuses
CREATE OR REPLACE VIEW swap_items_with_status AS
SELECT 
    si.*,
    up.display_name as user_display_name,
    up.avatar_url as user_avatar,
    CASE 
        WHEN si.status = 'active' AND si.expires_at <= NOW() + INTERVAL '24 hours' THEN 'expiring_soon'
        WHEN si.status = 'active' AND si.expires_at <= NOW() + INTERVAL '1 hour' THEN 'expiring_now'
        ELSE si.status::text
    END as display_status,
    CASE 
        WHEN si.status = 'active' THEN si.expires_at - NOW()
        ELSE NULL
    END as time_remaining
FROM swap_items si
LEFT JOIN user_progress up ON si.user_id = up.user_id;

-- ================================================
-- 8. GRANT PERMISSIONS
-- ================================================

GRANT SELECT ON swap_storage_analytics TO authenticated;
GRANT SELECT ON swap_items_active TO authenticated;
GRANT SELECT ON swap_items_with_status TO authenticated;

-- ================================================
-- 9. UPDATE EXISTING RLS POLICIES
-- ================================================

-- Update the view policy to only show active items by default
DROP POLICY IF EXISTS "Anyone can view active swap items" ON swap_items;
CREATE POLICY "Anyone can view active swap items"
    ON swap_items FOR SELECT
    USING (
        status = 'active' 
        OR user_id = auth.uid()  -- Users can see their own items in any status
    );

-- ================================================
-- 10. MANUAL CLEANUP COMMANDS (for testing)
-- ================================================

-- Run cleanup manually
-- SELECT * FROM cleanup_expired_swap_items();

-- View storage analytics
-- SELECT * FROM swap_storage_analytics;

-- Get images that need deletion
-- SELECT * FROM get_images_to_delete();

-- Mark specific image as deleted (after manual deletion)
-- SELECT mark_image_deleted('item-uuid-here');

-- ================================================
-- 11. CONFIGURATION TABLE (optional)
-- ================================================

CREATE TABLE IF NOT EXISTS swap_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default config
INSERT INTO swap_config (key, value) VALUES
    ('expiry_days', '7'::jsonb),
    ('archive_days', '30'::jsonb),
    ('max_image_size_mb', '5'::jsonb),
    ('compress_after_days', '7'::jsonb),
    ('auto_cleanup_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ================================================
-- DONE! 🎉
-- ================================================
-- Next: Create Edge Function for automatic cleanup
-- See /supabase/functions/server/swap-cleanup.ts
-- ================================================

-- ================================================
-- MIGRATION SUMMARY
-- ================================================
-- ✅ Added status enum (active/expired/archived/swapped/removed)
-- ✅ Added expires_at timestamp (defaults to 7 days)
-- ✅ Added archived_at timestamp
-- ✅ Added image size tracking columns
-- ✅ Created cleanup function
-- ✅ Created storage analytics view
-- ✅ Created filtered views for active items
-- ✅ Updated RLS policies
-- ✅ Added configuration table
-- ================================================
