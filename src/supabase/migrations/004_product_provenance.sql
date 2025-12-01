-- HEMP PROVENANCE FIELDS FOR SWAG PRODUCTS
-- Adds transparency and sustainability tracking to products
-- Enables conscious consumption scoring and verification

-- Add provenance fields to swag_products table
ALTER TABLE swag_products_053bcd80
  ADD COLUMN IF NOT EXISTS hemp_source TEXT, -- Farm name or region (e.g., "Green Valley Hemp Co., Colorado")
  ADD COLUMN IF NOT EXISTS hemp_source_country TEXT, -- Country of origin (e.g., "USA", "Canada", "Netherlands")
  ADD COLUMN IF NOT EXISTS hemp_source_location TEXT, -- GPS coordinates or detailed location
  
  -- Certifications & Verification
  ADD COLUMN IF NOT EXISTS certifications TEXT[], -- e.g., ['USDA Organic', 'Regenerative Certified', 'Fair Trade']
  ADD COLUMN IF NOT EXISTS processing_method TEXT, -- e.g., 'mechanical', 'chemical-free', 'traditional'
  ADD COLUMN IF NOT EXISTS fair_trade_verified BOOLEAN DEFAULT false,
  
  -- Environmental Impact
  ADD COLUMN IF NOT EXISTS carbon_footprint DECIMAL(10, 2), -- kg CO2 equivalent (negative = carbon negative!)
  ADD COLUMN IF NOT EXISTS water_usage INTEGER, -- Liters of water used vs conventional
  ADD COLUMN IF NOT EXISTS pesticide_free BOOLEAN DEFAULT true, -- Hemp is naturally pest-resistant
  
  -- Provenance Verification
  ADD COLUMN IF NOT EXISTS provenance_verified BOOLEAN DEFAULT false, -- Admin verified
  ADD COLUMN IF NOT EXISTS provenance_verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS provenance_verified_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS provenance_notes TEXT, -- Internal notes about verification
  ADD COLUMN IF NOT EXISTS provenance_docs TEXT[], -- URLs to certificates, lab reports, etc.
  
  -- Conscious Score (calculated 0-100)
  ADD COLUMN IF NOT EXISTS conscious_score INTEGER,
  ADD COLUMN IF NOT EXISTS conscious_score_breakdown JSONB, -- Details: {material: 100, labor: 90, shipping: 85, packaging: 95}
  
  -- Supply Chain Transparency (Phase 2 - for future)
  ADD COLUMN IF NOT EXISTS supply_chain_data JSONB; -- Full timeline: farm → processor → manufacturer

-- Create index for verified products (for filtering in marketplace)
CREATE INDEX IF NOT EXISTS idx_swag_products_verified 
  ON swag_products_053bcd80(provenance_verified) 
  WHERE provenance_verified = true;

-- Create index for high conscious score products
CREATE INDEX IF NOT EXISTS idx_swag_products_conscious_score 
  ON swag_products_053bcd80(conscious_score DESC) 
  WHERE conscious_score >= 80;

-- Create index for certifications (for filtering)
CREATE INDEX IF NOT EXISTS idx_swag_products_certifications 
  ON swag_products_053bcd80 USING GIN(certifications);

-- Add constraints
ALTER TABLE swag_products_053bcd80
  ADD CONSTRAINT valid_conscious_score CHECK (
    conscious_score IS NULL OR (conscious_score >= 0 AND conscious_score <= 100)
  );

-- Create a function to calculate conscious score automatically
CREATE OR REPLACE FUNCTION calculate_conscious_score(
  p_certifications TEXT[],
  p_carbon_footprint DECIMAL,
  p_fair_trade_verified BOOLEAN,
  p_processing_method TEXT,
  p_provenance_verified BOOLEAN
) RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  material_score INTEGER := 60; -- Base score for using hemp
  labor_score INTEGER := 50; -- Base labor score
  environmental_score INTEGER := 60; -- Base environmental score
  transparency_score INTEGER := 0;
BEGIN
  -- Material Score (max 100)
  material_score := 60; -- Hemp base
  IF 'USDA Organic' = ANY(p_certifications) THEN
    material_score := material_score + 20;
  END IF;
  IF 'Regenerative' = ANY(p_certifications) THEN
    material_score := material_score + 20;
  END IF;
  material_score := LEAST(material_score, 100);
  
  -- Labor Score (max 100)
  labor_score := 50;
  IF p_fair_trade_verified THEN
    labor_score := labor_score + 40;
  END IF;
  IF p_provenance_verified THEN
    labor_score := labor_score + 10;
  END IF;
  labor_score := LEAST(labor_score, 100);
  
  -- Environmental Score (max 100)
  environmental_score := 60; -- Hemp is naturally good
  IF p_carbon_footprint IS NOT NULL AND p_carbon_footprint < 0 THEN
    environmental_score := environmental_score + 30; -- Carbon negative bonus!
  END IF;
  IF p_processing_method = 'mechanical' OR p_processing_method = 'chemical-free' THEN
    environmental_score := environmental_score + 10;
  END IF;
  environmental_score := LEAST(environmental_score, 100);
  
  -- Transparency Score (max 100)
  IF p_provenance_verified THEN
    transparency_score := 100;
  ELSE
    transparency_score := 30; -- Some transparency by being on DEWII
  END IF;
  
  -- Overall Score (average of all categories)
  score := (material_score + labor_score + environmental_score + transparency_score) / 4;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to auto-calculate conscious score when product is updated
CREATE OR REPLACE FUNCTION update_conscious_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Only calculate if we have provenance data
  IF NEW.hemp_source IS NOT NULL OR NEW.certifications IS NOT NULL THEN
    NEW.conscious_score := calculate_conscious_score(
      NEW.certifications,
      NEW.carbon_footprint,
      NEW.fair_trade_verified,
      NEW.processing_method,
      NEW.provenance_verified
    );
    
    -- Store breakdown for transparency
    NEW.conscious_score_breakdown := jsonb_build_object(
      'material', CASE 
        WHEN 'USDA Organic' = ANY(NEW.certifications) AND 'Regenerative' = ANY(NEW.certifications) THEN 100
        WHEN 'USDA Organic' = ANY(NEW.certifications) OR 'Regenerative' = ANY(NEW.certifications) THEN 80
        ELSE 60
      END,
      'labor', CASE 
        WHEN NEW.fair_trade_verified AND NEW.provenance_verified THEN 100
        WHEN NEW.fair_trade_verified THEN 90
        ELSE 50
      END,
      'environmental', CASE
        WHEN NEW.carbon_footprint < 0 AND (NEW.processing_method = 'mechanical' OR NEW.processing_method = 'chemical-free') THEN 100
        WHEN NEW.carbon_footprint < 0 OR (NEW.processing_method = 'mechanical' OR NEW.processing_method = 'chemical-free') THEN 85
        ELSE 60
      END,
      'transparency', CASE
        WHEN NEW.provenance_verified THEN 100
        ELSE 30
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_update_conscious_score ON swag_products_053bcd80;
CREATE TRIGGER trigger_update_conscious_score
  BEFORE INSERT OR UPDATE ON swag_products_053bcd80
  FOR EACH ROW
  EXECUTE FUNCTION update_conscious_score();

-- Comments for documentation
COMMENT ON COLUMN swag_products_053bcd80.hemp_source IS 'Farm or region where hemp was grown (e.g., "Green Valley Hemp Co., Colorado")';
COMMENT ON COLUMN swag_products_053bcd80.certifications IS 'Array of certification badges (USDA Organic, Regenerative, Fair Trade, etc.)';
COMMENT ON COLUMN swag_products_053bcd80.carbon_footprint IS 'Carbon footprint in kg CO2 equivalent. Negative values mean carbon negative!';
COMMENT ON COLUMN swag_products_053bcd80.conscious_score IS 'Sustainability score 0-100, auto-calculated from provenance data';
COMMENT ON COLUMN swag_products_053bcd80.provenance_verified IS 'Admin has verified the provenance claims with documentation';
COMMENT ON COLUMN swag_products_053bcd80.supply_chain_data IS 'Full supply chain timeline from farm to customer (Phase 2 feature)';
