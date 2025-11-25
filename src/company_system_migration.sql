-- ============================================================================
-- DEWII COMPANY PAGES SYSTEM - DATABASE MIGRATION
-- Move from KV store to Supabase PostgreSQL with RLS
-- ============================================================================

-- ============================================================================
-- 1. COMPANY CATEGORIES TABLE
-- Admin-managed predefined industry categories
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'Building2',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_categories_active ON company_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_company_categories_order ON company_categories(display_order);

-- RLS Policies for Categories
ALTER TABLE company_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read active categories
CREATE POLICY "Anyone can view active categories"
  ON company_categories
  FOR SELECT
  USING (is_active = true);

-- Only admins can insert categories
CREATE POLICY "Admins can insert categories"
  ON company_categories
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kv_store_053bcd80
      WHERE key = 'admin_user_id'
      AND value::text = concat('"', auth.uid()::text, '"')
    )
  );

-- Only admins can update categories
CREATE POLICY "Admins can update categories"
  ON company_categories
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM kv_store_053bcd80
      WHERE key = 'admin_user_id'
      AND value::text = concat('"', auth.uid()::text, '"')
    )
  );

-- Only admins can delete categories
CREATE POLICY "Admins can delete categories"
  ON company_categories
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM kv_store_053bcd80
      WHERE key = 'admin_user_id'
      AND value::text = concat('"', auth.uid()::text, '"')
    )
  );

-- ============================================================================
-- 2. COMPANIES TABLE
-- Main company/organization pages
-- ============================================================================

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  website TEXT,
  logo_url TEXT,
  
  -- Classification
  category_id UUID REFERENCES company_categories(id) ON DELETE SET NULL,
  category_name TEXT, -- Denormalized for easy querying
  
  -- Location
  location TEXT,
  country TEXT,
  
  -- Company Details
  founded_year INTEGER,
  company_size TEXT, -- 'solo', '2-10', '11-50', '51-200', '201-500', '500+'
  
  -- Contact
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Social Media
  linkedin_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  
  -- Status & Type
  is_published BOOLEAN DEFAULT false,
  is_association BOOLEAN DEFAULT false, -- True for hemp associations that can issue badges
  
  -- Ownership
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Search & Analytics
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_website CHECK (website IS NULL OR website ~* '^https?://'),
  CONSTRAINT valid_year CHECK (founded_year IS NULL OR (founded_year >= 1900 AND founded_year <= EXTRACT(YEAR FROM NOW()))),
  CONSTRAINT valid_size CHECK (company_size IS NULL OR company_size IN ('solo', '2-10', '11-50', '51-200', '201-500', '500+'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_companies_category ON companies(category_id);
CREATE INDEX IF NOT EXISTS idx_companies_published ON companies(is_published);
CREATE INDEX IF NOT EXISTS idx_companies_association ON companies(is_association);
CREATE INDEX IF NOT EXISTS idx_companies_created ON companies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_companies_name_search ON companies USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_companies_desc_search ON companies USING gin(to_tsvector('english', description));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_companies_fts ON companies 
  USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(location, '')));

-- RLS Policies for Companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Anyone can view published companies
CREATE POLICY "Anyone can view published companies"
  ON companies
  FOR SELECT
  USING (is_published = true);

-- Users can view their own draft companies
CREATE POLICY "Users can view own companies"
  ON companies
  FOR SELECT
  USING (owner_id = auth.uid());

-- Admins can view all companies
CREATE POLICY "Admins can view all companies"
  ON companies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM kv_store_053bcd80
      WHERE key = 'admin_user_id'
      AND value::text = concat('"', auth.uid()::text, '"')
    )
  );

-- Authenticated users can create companies
CREATE POLICY "Authenticated users can create companies"
  ON companies
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- Users can update their own companies
CREATE POLICY "Users can update own companies"
  ON companies
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Users can delete their own companies
CREATE POLICY "Users can delete own companies"
  ON companies
  FOR DELETE
  USING (owner_id = auth.uid());

-- Admins can update any company
CREATE POLICY "Admins can update any company"
  ON companies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM kv_store_053bcd80
      WHERE key = 'admin_user_id'
      AND value::text = concat('"', auth.uid()::text, '"')
    )
  );

-- ============================================================================
-- 3. COMPANY BADGES TABLE
-- Badges earned by companies (e.g., "Hemp Association Member", "Verified Supplier")
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Badge Info
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL, -- 'association_member', 'verified', 'sustainability_certified', etc.
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT DEFAULT 'Award',
  badge_color TEXT DEFAULT 'amber', -- For UI theming
  
  -- Issuing Association (if applicable)
  issued_by_association_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  issued_by_association_name TEXT,
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ, -- Some badges may expire
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate badges
  UNIQUE(company_id, badge_type, issued_by_association_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_company_badges_company ON company_badges(company_id);
CREATE INDEX IF NOT EXISTS idx_company_badges_association ON company_badges(issued_by_association_id);
CREATE INDEX IF NOT EXISTS idx_company_badges_type ON company_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_company_badges_verified ON company_badges(verified);

-- RLS Policies for Badges
ALTER TABLE company_badges ENABLE ROW LEVEL SECURITY;

-- Anyone can view verified badges
CREATE POLICY "Anyone can view verified badges"
  ON company_badges
  FOR SELECT
  USING (verified = true);

-- Company owners can view their own badges (including pending)
CREATE POLICY "Company owners can view own badges"
  ON company_badges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = company_badges.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Association owners can view badges they issued
CREATE POLICY "Associations can view badges they issued"
  ON company_badges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = company_badges.issued_by_association_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Admins can view all badges
CREATE POLICY "Admins can view all badges"
  ON company_badges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM kv_store_053bcd80
      WHERE key = 'admin_user_id'
      AND value::text = concat('"', auth.uid()::text, '"')
    )
  );

-- Only admins can directly create badges
CREATE POLICY "Admins can create badges"
  ON company_badges
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kv_store_053bcd80
      WHERE key = 'admin_user_id'
      AND value::text = concat('"', auth.uid()::text, '"')
    )
  );

-- Admins and association owners can update badges
CREATE POLICY "Admins and associations can update badges"
  ON company_badges
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM kv_store_053bcd80
      WHERE key = 'admin_user_id'
      AND value::text = concat('"', auth.uid()::text, '"')
    )
    OR
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = company_badges.issued_by_association_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Admins can delete badges
CREATE POLICY "Admins can delete badges"
  ON company_badges
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM kv_store_053bcd80
      WHERE key = 'admin_user_id'
      AND value::text = concat('"', auth.uid()::text, '"')
    )
  );

-- ============================================================================
-- 4. BADGE REQUESTS TABLE
-- Companies request badges from associations
-- ============================================================================

CREATE TABLE IF NOT EXISTS badge_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Request Info
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  association_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  
  -- Request Details
  message TEXT, -- Why they're requesting this badge
  supporting_documents_urls TEXT[], -- Array of URLs to documents
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by_user_id UUID REFERENCES auth.users(id),
  review_message TEXT,
  reviewed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Prevent duplicate pending requests
  UNIQUE(company_id, association_id, badge_type, status)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_badge_requests_company ON badge_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_badge_requests_association ON badge_requests(association_id);
CREATE INDEX IF NOT EXISTS idx_badge_requests_status ON badge_requests(status);
CREATE INDEX IF NOT EXISTS idx_badge_requests_created ON badge_requests(created_at DESC);

-- RLS Policies for Badge Requests
ALTER TABLE badge_requests ENABLE ROW LEVEL SECURITY;

-- Company owners can view their own requests
CREATE POLICY "Company owners can view own requests"
  ON badge_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = badge_requests.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Association owners can view requests to them
CREATE POLICY "Associations can view requests to them"
  ON badge_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = badge_requests.association_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
  ON badge_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM kv_store_053bcd80
      WHERE key = 'admin_user_id'
      AND value::text = concat('"', auth.uid()::text, '"')
    )
  );

-- Company owners can create requests for their companies
CREATE POLICY "Company owners can create requests"
  ON badge_requests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = badge_requests.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Association owners can update requests to them
CREATE POLICY "Associations can update requests to them"
  ON badge_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = badge_requests.association_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Admins can update any request
CREATE POLICY "Admins can update any request"
  ON badge_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM kv_store_053bcd80
      WHERE key = 'admin_user_id'
      AND value::text = concat('"', auth.uid()::text, '"')
    )
  );

-- Company owners can delete their own pending requests
CREATE POLICY "Company owners can delete own pending requests"
  ON badge_requests
  FOR DELETE
  USING (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = badge_requests.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. COMPANY MEMBERS TABLE (Optional - for multi-user companies)
-- Allow companies to have multiple team members
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member'
  title TEXT, -- Job title
  
  -- Permissions
  can_edit BOOLEAN DEFAULT false,
  can_manage_badges BOOLEAN DEFAULT false,
  can_manage_members BOOLEAN DEFAULT false,
  
  -- Metadata
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate memberships
  UNIQUE(company_id, user_id),
  
  CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'member'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_company_members_company ON company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user ON company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_members_role ON company_members(role);

-- RLS Policies for Company Members
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- Anyone can view members of published companies
CREATE POLICY "Anyone can view members of published companies"
  ON company_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = company_members.company_id
      AND companies.is_published = true
    )
  );

-- Users can view members of their companies
CREATE POLICY "Users can view members of their companies"
  ON company_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = company_members.company_id
      AND cm.user_id = auth.uid()
    )
  );

-- Company owners and admins can add members
CREATE POLICY "Company owners and admins can add members"
  ON company_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_members
      WHERE company_members.company_id = company_members.company_id
      AND company_members.user_id = auth.uid()
      AND (company_members.role IN ('owner', 'admin') OR company_members.can_manage_members = true)
    )
    OR
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = company_members.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_company_categories_updated_at
  BEFORE UPDATE ON company_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_badges_updated_at
  BEFORE UPDATE ON company_badges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_badge_requests_updated_at
  BEFORE UPDATE ON badge_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to sync category_name when category_id changes
CREATE OR REPLACE FUNCTION sync_company_category_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category_id IS NOT NULL THEN
    SELECT name INTO NEW.category_name
    FROM company_categories
    WHERE id = NEW.category_id;
  ELSE
    NEW.category_name := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_company_category_name_trigger
  BEFORE INSERT OR UPDATE OF category_id ON companies
  FOR EACH ROW
  EXECUTE FUNCTION sync_company_category_name();

-- Function to set published_at when is_published becomes true
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = true AND (OLD.is_published = false OR OLD.is_published IS NULL) THEN
    NEW.published_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_published_at_trigger
  BEFORE UPDATE OF is_published ON companies
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();

-- ============================================================================
-- 7. SEED DEFAULT CATEGORIES
-- ============================================================================

INSERT INTO company_categories (name, description, icon, display_order) VALUES
  ('Hemp Production', 'Industrial hemp farming and cultivation', 'Leaf', 1),
  ('Cannabis & CBD Products', 'CBD products, cannabis derivatives, and wellness products', 'Pill', 2),
  ('Hemp Textiles & Fashion', 'Hemp fabrics, clothing, and fashion accessories', 'Shirt', 3),
  ('Hemp Construction & Materials', 'Hempcrete, building materials, and construction products', 'Building2', 4),
  ('Hemp Food & Nutrition', 'Hemp seeds, protein, oil, and nutritional products', 'Apple', 5),
  ('Research & Education', 'Academic research, educational institutions, and training', 'GraduationCap', 6),
  ('Sustainability & Environment', 'Environmental initiatives and sustainable practices', 'Trees', 7),
  ('Hemp Association', 'Industry associations and non-profit organizations', 'Users', 8),
  ('Other', 'Other hemp-related businesses and services', 'Tag', 99)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 8. HELPFUL VIEWS (Optional)
-- ============================================================================

-- View for companies with badge counts
CREATE OR REPLACE VIEW companies_with_stats AS
SELECT 
  c.*,
  COUNT(DISTINCT cb.id) as badge_count,
  COUNT(DISTINCT cb.id) FILTER (WHERE cb.verified = true) as verified_badge_count,
  COUNT(DISTINCT cm.user_id) as member_count
FROM companies c
LEFT JOIN company_badges cb ON c.id = cb.company_id
LEFT JOIN company_members cm ON c.id = cm.company_id
GROUP BY c.id;

-- View for pending badge requests (for associations)
CREATE OR REPLACE VIEW pending_badge_requests AS
SELECT 
  br.*,
  c.name as company_name,
  c.owner_id as company_owner_id,
  a.name as association_name,
  a.owner_id as association_owner_id
FROM badge_requests br
JOIN companies c ON br.company_id = c.id
JOIN companies a ON br.association_id = a.id
WHERE br.status = 'pending'
ORDER BY br.created_at ASC;

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================

-- Verify tables were created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('company_categories', 'companies', 'company_badges', 'badge_requests', 'company_members')
ORDER BY table_name;
