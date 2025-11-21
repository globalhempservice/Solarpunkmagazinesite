-- =====================================================
-- DEWII Swag Shop - Database Migration
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create swag_items table
CREATE TABLE IF NOT EXISTS swag_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  category TEXT NOT NULL CHECK (category IN ('merch', 'theme', 'badge', 'feature')),
  gradient TEXT NOT NULL,
  icon TEXT NOT NULL,
  limited BOOLEAN DEFAULT false,
  stock INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_swag_items_category ON swag_items(category);

-- Create index for active items
CREATE INDEX IF NOT EXISTS idx_swag_items_active ON swag_items(active);

-- Enable Row Level Security
ALTER TABLE swag_items ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active swag items (for public shop display)
CREATE POLICY "Anyone can view active swag items"
  ON swag_items
  FOR SELECT
  USING (active = true);

-- Policy: Admins can do everything (create, update, delete)
-- Note: You'll need to replace 'YOUR_ADMIN_USER_ID' with your actual admin user ID
-- Or use the ADMIN_USER_ID environment variable if you have a function to check it
CREATE POLICY "Admins have full access to swag items"
  ON swag_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert initial swag items (from your current hardcoded data)

-- MERCH ITEMS
INSERT INTO swag_items (id, name, description, price, category, gradient, icon, limited, stock, active)
VALUES 
  (
    'hemp-tee-black',
    'DEWII Hemp Tee',
    'Premium organic hemp t-shirt with solarpunk design',
    500,
    'merch',
    'from-emerald-500 to-teal-600',
    'Shirt',
    true,
    25,
    true
  ),
  (
    'hemp-hoodie',
    'Hemp Universe Hoodie',
    'Cozy hemp blend hoodie with embroidered logo',
    1000,
    'merch',
    'from-green-500 to-emerald-600',
    'Shirt',
    true,
    15,
    true
  );

-- THEME ITEMS
INSERT INTO swag_items (id, name, description, price, category, gradient, icon, limited, stock, active)
VALUES 
  (
    'theme-solarpunk',
    'Solarpunk Dreams',
    'Emerald and gold color scheme with organic animations',
    150,
    'theme',
    'from-emerald-500 via-green-500 to-teal-500',
    'Palette',
    false,
    NULL,
    true
  ),
  (
    'theme-midnight-hemp',
    'Midnight Hemp',
    'Dark mode theme with bioluminescent accents',
    150,
    'theme',
    'from-indigo-500 via-purple-500 to-pink-500',
    'Palette',
    false,
    NULL,
    true
  ),
  (
    'theme-golden-hour',
    'Golden Hour',
    'Warm sunset colors with ambient glow effects',
    150,
    'theme',
    'from-amber-500 via-orange-500 to-yellow-500',
    'Palette',
    false,
    NULL,
    true
  );

-- BADGE ITEMS
INSERT INTO swag_items (id, name, description, price, category, gradient, icon, limited, stock, active)
VALUES 
  (
    'badge-founder',
    'Founder Badge',
    'Exclusive badge for early community members',
    250,
    'badge',
    'from-purple-500 to-pink-600',
    'Award',
    true,
    100,
    true
  ),
  (
    'badge-hemp-pioneer',
    'Hemp Pioneer',
    'Show your dedication to the hemp movement',
    200,
    'badge',
    'from-green-500 to-emerald-600',
    'Award',
    false,
    NULL,
    true
  ),
  (
    'badge-nada-whale',
    'NADA Whale',
    'For the true NADA collectors',
    500,
    'badge',
    'from-cyan-500 to-blue-600',
    'Award',
    false,
    NULL,
    true
  );

-- FEATURE ITEMS
INSERT INTO swag_items (id, name, description, price, category, gradient, icon, limited, stock, active)
VALUES 
  (
    'feature-custom-profile',
    'Custom Profile Banner',
    'Upload your own profile banner image',
    300,
    'feature',
    'from-violet-500 to-purple-600',
    'Sparkles',
    false,
    NULL,
    true
  ),
  (
    'feature-priority-support',
    'Priority Support',
    'Get priority response on feature requests',
    400,
    'feature',
    'from-blue-500 to-cyan-600',
    'Sparkles',
    false,
    NULL,
    true
  );

-- Create function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_swag_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER swag_items_updated_at
  BEFORE UPDATE ON swag_items
  FOR EACH ROW
  EXECUTE FUNCTION update_swag_items_updated_at();

-- =====================================================
-- VERIFICATION QUERIES
-- Run these after the migration to verify success
-- =====================================================

-- Count total items
-- SELECT COUNT(*) as total_items FROM swag_items;

-- View all items by category
-- SELECT category, COUNT(*) as count FROM swag_items GROUP BY category ORDER BY category;

-- View all items
-- SELECT id, name, price, category, limited, stock, active FROM swag_items ORDER BY category, price;

-- =====================================================
-- ADMIN NOTE
-- =====================================================
-- To manage the admin policy properly, you may want to modify the 
-- "Admins have full access" policy to check against your ADMIN_USER_ID.
-- 
-- You can do this by updating the policy like this:
--
-- DROP POLICY IF EXISTS "Admins have full access to swag items" ON swag_items;
-- 
-- CREATE POLICY "Admins have full access to swag items"
--   ON swag_items
--   FOR ALL
--   USING (auth.uid()::text = current_setting('app.admin_user_id', true))
--   WITH CHECK (auth.uid()::text = current_setting('app.admin_user_id', true));
--
-- Make sure your admin endpoints already check for admin access via
-- the ADMIN_USER_ID environment variable, which they do!
-- =====================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Swag Items table created successfully!';
  RAISE NOTICE '✅ Initial items inserted!';
  RAISE NOTICE '✅ RLS policies enabled!';
  RAISE NOTICE '🎉 Migration complete! Your Swag Shop is ready!';
END $$;
