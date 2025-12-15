-- ================================================
-- ADD GEOLOCATION SUPPORT TO SWAP ITEMS
-- ================================================
-- This adds latitude/longitude for globe visualization
-- Run this BEFORE populating items
-- ================================================

-- Add geolocation columns
ALTER TABLE swap_items 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create spatial index for performance
CREATE INDEX IF NOT EXISTS idx_swap_items_geolocation 
ON swap_items(latitude, longitude);

-- Add comment
COMMENT ON COLUMN swap_items.latitude IS 'Latitude for globe visualization (-90 to 90)';
COMMENT ON COLUMN swap_items.longitude IS 'Longitude for globe visualization (-180 to 180)';

-- ================================================
-- SUCCESS
-- ================================================
SELECT 'Geolocation columns added successfully!' AS status;
