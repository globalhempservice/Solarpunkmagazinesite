-- ============================================================================
-- ORGANIZATION-PLACE RELATIONSHIPS TABLE
-- ============================================================================
-- This table creates a many-to-many relationship between organizations and places
-- allowing companies to claim various types of relationships with physical locations

-- Create the junction table
CREATE TABLE IF NOT EXISTS organization_place_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign keys
  organization_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  
  -- Relationship metadata
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'owns',              -- Organization owns this place
    'distributed_at',    -- Products distributed at this location
    'supplies_from',     -- Organization sources supplies from this place
    'manufactures_at',   -- Organization manufactures at this facility
    'partner',           -- Business partner location
    'customer',          -- This place is a customer
    'supplier',          -- This place supplies to organization
    'retail_outlet',     -- Retail store/outlet for organization
    'warehouse',         -- Storage/warehouse facility
    'office'             -- Corporate/administrative office
  )),
  
  -- Verification & status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate relationships
  UNIQUE(organization_id, place_id, relationship_type)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_org_place_rel_org 
  ON organization_place_relationships(organization_id);

CREATE INDEX IF NOT EXISTS idx_org_place_rel_place 
  ON organization_place_relationships(place_id);

CREATE INDEX IF NOT EXISTS idx_org_place_rel_type 
  ON organization_place_relationships(relationship_type);

CREATE INDEX IF NOT EXISTS idx_org_place_rel_status 
  ON organization_place_relationships(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE organization_place_relationships ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view verified relationships
CREATE POLICY "Anyone can view verified relationships"
  ON organization_place_relationships
  FOR SELECT
  USING (status = 'verified');

-- Policy 2: Organization members can view their own relationships (any status)
CREATE POLICY "Organization members can view their relationships"
  ON organization_place_relationships
  FOR SELECT
  USING (
    organization_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

-- Policy 3: Organization admins can create relationships
CREATE POLICY "Organization admins can create relationships"
  ON organization_place_relationships
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin')
    )
  );

-- Policy 4: Organization admins can update their relationships
CREATE POLICY "Organization admins can update relationships"
  ON organization_place_relationships
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin')
    )
  );

-- Policy 5: Organization admins can delete their relationships
CREATE POLICY "Organization admins can delete relationships"
  ON organization_place_relationships
  FOR DELETE
  USING (
    organization_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_organization_place_relationships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_organization_place_relationships_updated_at
  BEFORE UPDATE ON organization_place_relationships
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_place_relationships_updated_at();

-- ============================================================================
-- HELPFUL QUERIES FOR TESTING
-- ============================================================================

-- View all relationships for an organization
-- SELECT opr.*, p.name as place_name, p.type as place_type, p.city, p.country
-- FROM organization_place_relationships opr
-- JOIN places p ON opr.place_id = p.id
-- WHERE opr.organization_id = 'YOUR_ORG_ID'
-- ORDER BY opr.created_at DESC;

-- View all organizations connected to a place
-- SELECT opr.*, c.name as company_name, c.industry
-- FROM organization_place_relationships opr
-- JOIN companies c ON opr.organization_id = c.id
-- WHERE opr.place_id = 'YOUR_PLACE_ID'
--   AND opr.status = 'verified'
-- ORDER BY opr.created_at DESC;

-- Count relationships by type
-- SELECT relationship_type, COUNT(*) as count
-- FROM organization_place_relationships
-- WHERE status = 'verified'
-- GROUP BY relationship_type
-- ORDER BY count DESC;
