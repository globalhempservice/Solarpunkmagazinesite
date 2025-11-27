-- HEMPIN SWAG PRODUCTS TABLE
-- This table stores all swag/merchandise products from hemp organizations

-- Create swag_products table
CREATE TABLE IF NOT EXISTS swag_products_053bcd80 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Product Information
  name TEXT NOT NULL,
  description TEXT,
  excerpt TEXT, -- Short description for cards
  
  -- Pricing
  price DECIMAL(10, 2), -- NULL if price varies or contact for price
  currency TEXT DEFAULT 'USD',
  
  -- Media
  primary_image_url TEXT, -- Main product image
  images TEXT[], -- Array of additional image URLs
  
  -- Inventory & Availability
  inventory INTEGER DEFAULT 0, -- Stock count, NULL for unlimited
  in_stock BOOLEAN DEFAULT true,
  
  -- Categorization
  category TEXT, -- 'apparel', 'accessories', 'seeds', 'education', 'other'
  tags TEXT[], -- For filtering and search
  
  -- External Integration
  external_shop_url TEXT, -- Shopify, Lazada, Shopee, etc.
  external_shop_platform TEXT, -- 'shopify', 'lazada', 'shopee', 'custom'
  external_product_id TEXT, -- ID from external platform
  
  -- Badge Gating (Members-Only Products)
  requires_badge BOOLEAN DEFAULT false,
  required_badge_id UUID, -- Specific badge needed (future: references badges table)
  required_association_id UUID, -- Or any badge from this association
  
  -- Status & Display
  is_active BOOLEAN DEFAULT true, -- Product is available
  is_featured BOOLEAN DEFAULT false, -- Show in featured sections
  is_published BOOLEAN DEFAULT false, -- Ready for public display
  
  -- SEO & Discovery
  slug TEXT, -- URL-friendly identifier
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID, -- User who created the product
  
  -- Constraints
  CONSTRAINT valid_price CHECK (price IS NULL OR price >= 0),
  CONSTRAINT valid_inventory CHECK (inventory IS NULL OR inventory >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_swag_products_company ON swag_products_053bcd80(company_id);
CREATE INDEX IF NOT EXISTS idx_swag_products_category ON swag_products_053bcd80(category);
CREATE INDEX IF NOT EXISTS idx_swag_products_active ON swag_products_053bcd80(is_active, is_published);
CREATE INDEX IF NOT EXISTS idx_swag_products_featured ON swag_products_053bcd80(is_featured);
CREATE INDEX IF NOT EXISTS idx_swag_products_slug ON swag_products_053bcd80(slug);
CREATE INDEX IF NOT EXISTS idx_swag_products_created ON swag_products_053bcd80(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_swag_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_swag_products_updated_at ON swag_products_053bcd80;
CREATE TRIGGER trigger_swag_products_updated_at
  BEFORE UPDATE ON swag_products_053bcd80
  FOR EACH ROW
  EXECUTE FUNCTION update_swag_products_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE swag_products_053bcd80 ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view published products" ON swag_products_053bcd80;
DROP POLICY IF EXISTS "Company owners can view their products" ON swag_products_053bcd80;
DROP POLICY IF EXISTS "Company owners can create products" ON swag_products_053bcd80;
DROP POLICY IF EXISTS "Company owners can update their products" ON swag_products_053bcd80;
DROP POLICY IF EXISTS "Company owners can delete their products" ON swag_products_053bcd80;

-- Public read access for published products
CREATE POLICY "Public can view published products"
  ON swag_products_053bcd80
  FOR SELECT
  USING (is_published = true);

-- Company owners can view all their products (published or not)
CREATE POLICY "Company owners can view their products"
  ON swag_products_053bcd80
  FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies
      WHERE owner_id = auth.uid()
    )
  );

-- Company owners can create products for their companies
CREATE POLICY "Company owners can create products"
  ON swag_products_053bcd80
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies
      WHERE owner_id = auth.uid()
    )
  );

-- Company owners can update their products
CREATE POLICY "Company owners can update their products"
  ON swag_products_053bcd80
  FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM companies
      WHERE owner_id = auth.uid()
    )
  );

-- Company owners can delete their products
CREATE POLICY "Company owners can delete their products"
  ON swag_products_053bcd80
  FOR DELETE
  USING (
    company_id IN (
      SELECT id FROM companies
      WHERE owner_id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT ON swag_products_053bcd80 TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON swag_products_053bcd80 TO authenticated;

-- Create storage bucket for swag product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('swag-images-053bcd80', 'swag-images-053bcd80', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public can view swag images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload swag images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own swag images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own swag images" ON storage.objects;

-- Storage policies for swag images
CREATE POLICY "Public can view swag images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'swag-images-053bcd80');

CREATE POLICY "Authenticated users can upload swag images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'swag-images-053bcd80' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own swag images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'swag-images-053bcd80' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own swag images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'swag-images-053bcd80' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Comments for documentation
COMMENT ON TABLE swag_products_053bcd80 IS 'Hemp organization swag/merchandise products';
COMMENT ON COLUMN swag_products_053bcd80.requires_badge IS 'If true, product is only visible/purchasable by badge holders';
COMMENT ON COLUMN swag_products_053bcd80.external_shop_url IS 'URL to external shop (Shopify, Lazada, Shopee, etc.)';
COMMENT ON COLUMN swag_products_053bcd80.is_featured IS 'Featured products shown prominently in marketplace';