-- ============================================================================
-- COMPANY BADGES TABLE - Add Missing Columns for New Badge System
-- ============================================================================

-- Add evidence_url column for badge requests
ALTER TABLE company_badges 
ADD COLUMN IF NOT EXISTS evidence_url TEXT;

-- Add verification_notes for admin reviews
ALTER TABLE company_badges 
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Add verified_by to track who verified
ALTER TABLE company_badges 
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add verified_at (already exists as verification_date, but let's add for consistency)
ALTER TABLE company_badges 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Add notes column for internal notes
ALTER TABLE company_badges 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index on evidence_url for faster queries
CREATE INDEX IF NOT EXISTS idx_company_badges_evidence ON company_badges(evidence_url);

-- Create index on verified_by
CREATE INDEX IF NOT EXISTS idx_company_badges_verified_by ON company_badges(verified_by);

COMMENT ON COLUMN company_badges.evidence_url IS 'URL to evidence/documentation for badge verification (certificates, licenses, etc.)';
COMMENT ON COLUMN company_badges.verification_notes IS 'Admin notes from badge verification process';
COMMENT ON COLUMN company_badges.verified_by IS 'User ID of admin who verified the badge';
COMMENT ON COLUMN company_badges.verified_at IS 'Timestamp when badge was verified';
COMMENT ON COLUMN company_badges.notes IS 'Internal notes about the badge request';
