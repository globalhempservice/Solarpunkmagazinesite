-- ============================================================================
-- ORGANIZATION PUBLICATIONS - DATABASE SCHEMA
-- ============================================================================
-- Purpose: Enable organizations to link articles and showcase their content
-- Date: November 28, 2024
-- Part of: Organization Tabs Implementation (Publications Tab)
-- ============================================================================

-- ============================================================================
-- TABLE: organization_publications
-- ============================================================================
-- Stores the relationship between organizations and articles
-- Supports multiple roles: author, co-author, sponsor, featured

CREATE TABLE IF NOT EXISTS organization_publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('author', 'co-author', 'sponsor', 'featured')),
  added_by UUID NOT NULL REFERENCES auth.users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  display_order INTEGER DEFAULT 0,
  notes TEXT,
  
  -- Ensure an article can only be linked once per organization
  UNIQUE(organization_id, article_id),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Optimize common queries

-- Find all publications for an organization (most common query)
CREATE INDEX IF NOT EXISTS idx_org_publications_org_id 
ON organization_publications(organization_id);

-- Find which organizations published a specific article
CREATE INDEX IF NOT EXISTS idx_org_publications_article_id 
ON organization_publications(article_id);

-- Filter by approval status
CREATE INDEX IF NOT EXISTS idx_org_publications_approved 
ON organization_publications(is_approved);

-- Sort by display order and date
CREATE INDEX IF NOT EXISTS idx_org_publications_order 
ON organization_publications(organization_id, display_order, added_at DESC);

-- Find publications by role
CREATE INDEX IF NOT EXISTS idx_org_publications_role 
ON organization_publications(role);

-- Find publications added by a specific user
CREATE INDEX IF NOT EXISTS idx_org_publications_added_by 
ON organization_publications(added_by);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Control who can view, insert, update, and delete publication links

-- Enable RLS
ALTER TABLE organization_publications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICY 1: Public can view approved publications
-- ============================================================================
CREATE POLICY "Anyone can view approved publications"
  ON organization_publications 
  FOR SELECT
  USING (is_approved = true);

-- ============================================================================
-- POLICY 2: Organization owners can view all their publications
-- ============================================================================
-- This allows owners to see pending/unapproved publications
CREATE POLICY "Organization owners can view all publications"
  ON organization_publications 
  FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM companies 
      WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- POLICY 3: Organization members can view all publications (future-proof)
-- ============================================================================
-- When we implement the Members tab, this will allow members to see publications
CREATE POLICY "Organization members can view all publications"
  ON organization_publications 
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE id = organization_publications.organization_id
      AND (
        owner_id = auth.uid()
        -- Future: OR auth.uid() = ANY(members)
      )
    )
  );

-- ============================================================================
-- POLICY 4: Organization owners can link articles (INSERT)
-- ============================================================================
CREATE POLICY "Organization owners can link articles"
  ON organization_publications 
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id FROM companies 
      WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- POLICY 5: Organization owners can update publication metadata
-- ============================================================================
CREATE POLICY "Organization owners can update publications"
  ON organization_publications 
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT id FROM companies 
      WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- POLICY 6: Organization owners can unlink articles (DELETE)
-- ============================================================================
CREATE POLICY "Organization owners can delete publications"
  ON organization_publications 
  FOR DELETE
  USING (
    organization_id IN (
      SELECT id FROM companies 
      WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- POLICY 7: Admins can manage all publications
-- ============================================================================
-- Allow DEWII admins to moderate publications if needed
CREATE POLICY "Admins can manage all publications"
  ON organization_publications 
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- OPTIONAL: Add organization_id to articles table
-- ============================================================================
-- This allows direct linking of articles to organizations at creation time
-- (Alternative to the junction table approach)

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' 
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE articles ADD COLUMN organization_id UUID REFERENCES companies(id);
    CREATE INDEX idx_articles_organization ON articles(organization_id);
    
    -- Add comment
    COMMENT ON COLUMN articles.organization_id IS 'Primary organization authoring this article (optional)';
  END IF;
END $$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Auto-update the updated_at timestamp

CREATE OR REPLACE FUNCTION update_organization_publications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_organization_publications_updated_at 
ON organization_publications;

CREATE TRIGGER trigger_update_organization_publications_updated_at
  BEFORE UPDATE ON organization_publications
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_publications_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get publication count for an organization
CREATE OR REPLACE FUNCTION get_organization_publication_count(org_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM organization_publications 
    WHERE organization_id = org_id 
    AND is_approved = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if article is already linked to organization
CREATE OR REPLACE FUNCTION is_article_linked_to_org(
  p_article_id UUID, 
  p_org_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM organization_publications 
    WHERE article_id = p_article_id 
    AND organization_id = p_org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SAMPLE DATA (for testing - comment out in production)
-- ============================================================================
-- This is commented out by default. Uncomment to insert test data.

/*
-- Example: Link an article to an organization
INSERT INTO organization_publications (
  organization_id,
  article_id,
  role,
  added_by,
  is_approved,
  approved_by,
  approved_at,
  notes
) VALUES (
  'your-organization-id-here'::UUID,
  'your-article-id-here'::UUID,
  'author',
  'your-user-id-here'::UUID,
  true,
  'your-user-id-here'::UUID,
  NOW(),
  'This article was authored by our organization'
);
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the migration succeeded

-- Check table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'organization_publications'
) AS table_exists;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'organization_publications';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'organization_publications';

-- Check policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'organization_publications';

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- Uncomment and run this section to completely remove the publications system

/*
-- Drop triggers
DROP TRIGGER IF EXISTS trigger_update_organization_publications_updated_at 
ON organization_publications;

-- Drop functions
DROP FUNCTION IF EXISTS update_organization_publications_updated_at();
DROP FUNCTION IF EXISTS get_organization_publication_count(UUID);
DROP FUNCTION IF EXISTS is_article_linked_to_org(UUID, UUID);

-- Drop table (this will also drop indexes and policies)
DROP TABLE IF EXISTS organization_publications CASCADE;

-- Remove organization_id from articles (if added)
ALTER TABLE articles DROP COLUMN IF EXISTS organization_id;
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ Organization Publications schema created successfully!';
  RAISE NOTICE '📊 Table: organization_publications';
  RAISE NOTICE '📇 Indexes: 6 performance indexes created';
  RAISE NOTICE '🔒 Security: 7 RLS policies enabled';
  RAISE NOTICE '⚙️  Functions: 3 helper functions created';
  RAISE NOTICE '🎯 Ready to use!';
END $$;
