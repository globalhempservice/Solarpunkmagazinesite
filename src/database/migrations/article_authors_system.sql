-- ============================================================================
-- ARTICLE AUTHORS SYSTEM - Multi-Author Support
-- ============================================================================
-- Purpose: Enable multiple human authors per article (co-authorship)
-- Date: November 28, 2024
-- Part of: Organization Publications Enhancement
-- ============================================================================
-- Architecture:
--   - articles.author_id = system user who created it (1:1)
--   - articles.organization_id = which org published it (1:1, nullable)
--   - article_authors = multiple human co-authors (1:many)
-- ============================================================================

-- ============================================================================
-- TABLE: article_authors
-- ============================================================================
-- Stores multiple human authors for each article
-- Example: Research paper by Dr. Smith, Dr. Jones, and Dr. Lee

CREATE TABLE IF NOT EXISTS article_authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Author information (can be non-users too)
  author_name TEXT NOT NULL,
  author_title TEXT,
  author_image_url TEXT,
  author_bio TEXT,
  author_email TEXT,
  
  -- Ordering and role
  author_order INTEGER NOT NULL DEFAULT 0,
  role TEXT DEFAULT 'co-author' CHECK (role IN ('lead-author', 'co-author', 'contributor', 'editor', 'reviewer')),
  
  -- Metadata
  added_by UUID NOT NULL REFERENCES auth.users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure no duplicate authors per article
  UNIQUE(article_id, user_id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Find all authors for an article (most common query)
CREATE INDEX IF NOT EXISTS idx_article_authors_article_id 
ON article_authors(article_id, author_order);

-- Find all articles by an author
CREATE INDEX IF NOT EXISTS idx_article_authors_user_id 
ON article_authors(user_id);

-- Sort by order
CREATE INDEX IF NOT EXISTS idx_article_authors_order 
ON article_authors(article_id, author_order, role);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE article_authors ENABLE ROW LEVEL SECURITY;

-- Anyone can view article authors
CREATE POLICY "Anyone can view article authors"
  ON article_authors 
  FOR SELECT
  USING (true);

-- Article creators can add authors to their articles
CREATE POLICY "Article creators can add authors"
  ON article_authors 
  FOR INSERT
  WITH CHECK (
    article_id IN (
      SELECT id FROM articles 
      WHERE author_id = auth.uid()
    )
  );

-- Organization owners can add authors to their org's articles
CREATE POLICY "Organization owners can add authors to org articles"
  ON article_authors 
  FOR INSERT
  WITH CHECK (
    article_id IN (
      SELECT a.id FROM articles a
      JOIN companies c ON a.organization_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

-- Article creators can update/delete authors
CREATE POLICY "Article creators can manage authors"
  ON article_authors 
  FOR ALL
  USING (
    article_id IN (
      SELECT id FROM articles 
      WHERE author_id = auth.uid()
    )
  );

-- Organization owners can update/delete authors from their org's articles
CREATE POLICY "Organization owners can manage org article authors"
  ON article_authors 
  FOR ALL
  USING (
    article_id IN (
      SELECT a.id FROM articles a
      JOIN companies c ON a.organization_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_article_authors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_article_authors_updated_at 
ON article_authors;

CREATE TRIGGER trigger_update_article_authors_updated_at
  BEFORE UPDATE ON article_authors
  FOR EACH ROW
  EXECUTE FUNCTION update_article_authors_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get all authors for an article (formatted)
CREATE OR REPLACE FUNCTION get_article_authors_formatted(p_article_id UUID)
RETURNS TEXT AS $$
DECLARE
  authors_list TEXT;
BEGIN
  SELECT string_agg(author_name, ', ' ORDER BY author_order)
  INTO authors_list
  FROM article_authors
  WHERE article_id = p_article_id;
  
  RETURN COALESCE(authors_list, '');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get author count for an article
CREATE OR REPLACE FUNCTION get_article_author_count(p_article_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM article_authors 
    WHERE article_id = p_article_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is an author of an article
CREATE OR REPLACE FUNCTION is_article_author(p_article_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM article_authors 
    WHERE article_id = p_article_id 
    AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Convenient view for articles with all their authors
CREATE OR REPLACE VIEW articles_with_authors AS
SELECT 
  a.*,
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'id', aa.id,
          'user_id', aa.user_id,
          'name', aa.author_name,
          'title', aa.author_title,
          'image_url', aa.author_image_url,
          'bio', aa.author_bio,
          'email', aa.author_email,
          'order', aa.author_order,
          'role', aa.role
        ) ORDER BY aa.author_order
      )
      FROM article_authors aa
      WHERE aa.article_id = a.id
    ),
    '[]'::json
  ) AS co_authors,
  get_article_authors_formatted(a.id) AS authors_formatted,
  get_article_author_count(a.id) AS co_author_count
FROM articles a;

-- ============================================================================
-- EXAMPLE USAGE
-- ============================================================================
-- This is commented out. Uncomment to test.

/*
-- Example 1: Create an article published by an organization
INSERT INTO articles (
  title,
  content,
  excerpt,
  category,
  author_id, -- System user who created it
  organization_id, -- Organization publishing it
  publish_date
) VALUES (
  'Hemp Research Findings 2024',
  'Our comprehensive research on hemp cultivation...',
  'Research findings from our lab',
  'Research',
  'user-uuid-here'::UUID,
  'organization-uuid-here'::UUID,
  NOW()
);

-- Example 2: Add multiple co-authors to the article
INSERT INTO article_authors (article_id, author_name, author_title, author_order, role, added_by) VALUES
  ('article-uuid'::UUID, 'Dr. Jane Smith', 'Lead Researcher', 0, 'lead-author', 'user-uuid'::UUID),
  ('article-uuid'::UUID, 'Dr. John Doe', 'Senior Scientist', 1, 'co-author', 'user-uuid'::UUID),
  ('article-uuid'::UUID, 'Dr. Maria Garcia', 'Lab Director', 2, 'co-author', 'user-uuid'::UUID);

-- Example 3: Query articles with all authors
SELECT 
  title,
  authors_formatted,
  co_author_count,
  co_authors
FROM articles_with_authors
WHERE organization_id = 'org-uuid'::UUID;

-- Result: 
-- "By Dr. Jane Smith, Dr. John Doe & Dr. Maria Garcia • Published by Hemp Research Institute"
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'article_authors'
) AS table_exists;

-- Check view exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.views 
  WHERE table_name = 'articles_with_authors'
) AS view_exists;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'article_authors';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'article_authors';

-- Check policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'article_authors';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Article Authors System created successfully!';
  RAISE NOTICE '📊 Table: article_authors (multi-author support)';
  RAISE NOTICE '📇 Indexes: 3 performance indexes created';
  RAISE NOTICE '🔒 Security: 5 RLS policies enabled';
  RAISE NOTICE '⚙️  Functions: 3 helper functions created';
  RAISE NOTICE '👁️  Views: articles_with_authors view created';
  RAISE NOTICE '🎯 Ready for academic/professional publishing!';
END $$;
