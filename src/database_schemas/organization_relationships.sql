-- ============================================================================
-- ORGANIZATION-TO-ORGANIZATION RELATIONSHIPS TABLE
-- ============================================================================
-- This table stores relationships between organizations (HQ/subsidiary, 
-- supplier/client, partnerships, etc.) for supply chain mapping and 
-- corporate hierarchies on the Hemp Atlas globe.
-- ============================================================================

-- Drop existing table if you want to recreate (CAUTION: deletes all data)
-- DROP TABLE IF EXISTS organization_relationships CASCADE;

-- Create the organization_relationships table
CREATE TABLE IF NOT EXISTS organization_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source organization (the one creating the relationship)
  organization_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Target organization (the one being connected to)
  related_organization_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Type of relationship
  relationship_type TEXT NOT NULL CHECK (
    relationship_type IN (
      'headquarter_of',
      'subsidiary_of',
      'parent_company',
      'supplies_to',
      'client_of',
      'partner',
      'distributor_for',
      'manufacturer_for',
      'retailer_for',
      'investor_in',
      'owns'
    )
  ),
  
  -- Status for admin verification
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'verified', 'rejected')
  ),
  
  -- Optional notes/description
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: Can't relate an org to itself
  CONSTRAINT no_self_relationship CHECK (organization_id != related_organization_id),
  
  -- Constraint: Unique relationship (can't create duplicate type between same orgs)
  CONSTRAINT unique_org_relationship UNIQUE (organization_id, related_organization_id, relationship_type)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for finding all relationships of a specific organization
CREATE INDEX IF NOT EXISTS idx_org_relationships_org_id 
  ON organization_relationships(organization_id);

-- Index for finding all relationships TO a specific organization
CREATE INDEX IF NOT EXISTS idx_org_relationships_related_org_id 
  ON organization_relationships(related_organization_id);

-- Index for filtering by status (admin view)
CREATE INDEX IF NOT EXISTS idx_org_relationships_status 
  ON organization_relationships(status);

-- Index for filtering by relationship type
CREATE INDEX IF NOT EXISTS idx_org_relationships_type 
  ON organization_relationships(relationship_type);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_org_relationships_status_created 
  ON organization_relationships(status, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE organization_relationships ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view verified relationships (for public map)
CREATE POLICY "Anyone can view verified relationships"
  ON organization_relationships
  FOR SELECT
  USING (status = 'verified');

-- Policy 2: Authenticated users can view their own org's relationships (any status)
CREATE POLICY "Users can view their own org relationships"
  ON organization_relationships
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT owner_id FROM companies WHERE id = organization_id
      UNION
      SELECT user_id FROM company_members WHERE company_id = organization_id
    )
    OR
    auth.uid() IN (
      SELECT owner_id FROM companies WHERE id = related_organization_id
      UNION
      SELECT user_id FROM company_members WHERE company_id = related_organization_id
    )
  );

-- Policy 3: Organization owners/admins can create relationships
CREATE POLICY "Org owners/admins can create relationships"
  ON organization_relationships
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM companies WHERE id = organization_id
      UNION
      SELECT cm.user_id 
      FROM company_members cm 
      WHERE cm.company_id = organization_id 
      AND cm.role IN ('owner', 'admin')
    )
  );

-- Policy 4: Organization owners/admins can update their own relationships
CREATE POLICY "Org owners/admins can update relationships"
  ON organization_relationships
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT owner_id FROM companies WHERE id = organization_id
      UNION
      SELECT cm.user_id 
      FROM company_members cm 
      WHERE cm.company_id = organization_id 
      AND cm.role IN ('owner', 'admin')
    )
  );

-- Policy 5: Organization owners/admins can delete their own relationships
CREATE POLICY "Org owners/admins can delete relationships"
  ON organization_relationships
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT owner_id FROM companies WHERE id = organization_id
      UNION
      SELECT cm.user_id 
      FROM company_members cm 
      WHERE cm.company_id = organization_id 
      AND cm.role IN ('owner', 'admin')
    )
  );

-- Policy 6: Admins can view all relationships
CREATE POLICY "Admins can view all relationships"
  ON organization_relationships
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
    OR
    auth.uid() = 'YOUR_ADMIN_USER_ID_HERE'::uuid
  );

-- Policy 7: Admins can update any relationship (for verification)
CREATE POLICY "Admins can update any relationship"
  ON organization_relationships
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
    OR
    auth.uid() = 'YOUR_ADMIN_USER_ID_HERE'::uuid
  );

-- ============================================================================
-- TRIGGER FOR UPDATING updated_at TIMESTAMP
-- ============================================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to organization_relationships table
DROP TRIGGER IF EXISTS update_organization_relationships_updated_at ON organization_relationships;
CREATE TRIGGER update_organization_relationships_updated_at
  BEFORE UPDATE ON organization_relationships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================================================

-- You can insert sample relationships here if you want to test the system
-- Make sure to replace the UUIDs with actual company IDs from your database

/*
-- Example: Insert sample relationships
INSERT INTO organization_relationships (organization_id, related_organization_id, relationship_type, status, notes)
VALUES
  -- Hemp Corp supplies to Green Valley Store
  ('company-uuid-1', 'company-uuid-2', 'supplies_to', 'verified', 'Main supplier of organic hemp products'),
  
  -- Eco Hemp is subsidiary of Hemp Corp
  ('company-uuid-1', 'company-uuid-3', 'subsidiary_of', 'verified', 'Acquired in 2020'),
  
  -- Green Farms partners with Hemp Processors
  ('company-uuid-4', 'company-uuid-5', 'partner', 'pending', 'Joint processing agreement');
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'organization_relationships'
ORDER BY ordinal_position;

-- Check constraints
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'organization_relationships'::regclass;

-- Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'organization_relationships';

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'organization_relationships';

-- Count relationships by status
SELECT 
  status,
  COUNT(*) as count
FROM organization_relationships
GROUP BY status
ORDER BY status;

-- Count relationships by type
SELECT 
  relationship_type,
  COUNT(*) as count
FROM organization_relationships
GROUP BY relationship_type
ORDER BY count DESC;

-- ============================================================================
-- CLEANUP QUERIES (USE WITH CAUTION)
-- ============================================================================

-- Delete all test data
-- DELETE FROM organization_relationships WHERE notes LIKE '%test%';

-- Reset auto-increment (not applicable for UUID, but included for reference)
-- ALTER SEQUENCE organization_relationships_id_seq RESTART WITH 1;

-- ============================================================================
-- GRANT PERMISSIONS (if needed)
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_relationships TO authenticated;
GRANT SELECT ON organization_relationships TO anon;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

SELECT 'Organization Relationships table created successfully! ✅' AS status;
