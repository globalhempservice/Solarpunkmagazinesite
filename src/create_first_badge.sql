-- ============================================
-- CREATE FIRST ASSOCIATION BADGE
-- ============================================
-- Run this in Supabase SQL Editor
-- Company ID: 00ca05c2-3c0b-421d-a7a3-2f4c5629b8db
-- ============================================

-- Step 1: Make sure your company is marked as an association
UPDATE companies 
SET is_association = true 
WHERE id = '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db';

-- Step 2: Create your first association badge
INSERT INTO company_badges (
  id,
  company_id,
  badge_type,
  badge_name,
  badge_description,
  badge_icon,
  badge_color,
  issued_by_association_id,
  issued_by_association_name,
  verified,
  verification_date,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db', -- Your company ID
  'founding-member', -- Badge type (used for product gating)
  'Founding Member', -- Display name
  'Charter member of the Hemp Alliance. Exclusive access to founding member products and benefits.', -- Description
  'Crown', -- Icon (Crown, Shield, Star, Award, Zap, etc.)
  '#9333ea', -- Purple color
  '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db', -- Issued by your company
  (SELECT name FROM companies WHERE id = '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db'), -- Your company name
  true, -- Verified
  NOW(), -- Verification date
  NOW(),
  NOW()
);

-- Step 3: Verify the badge was created
SELECT 
  b.badge_name,
  b.badge_type,
  b.badge_description,
  b.verified,
  c.name as company_name,
  c.is_association
FROM company_badges b
JOIN companies c ON b.company_id = c.id
WHERE b.company_id = '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db';

-- ============================================
-- ADDITIONAL BADGE EXAMPLES
-- ============================================
-- Uncomment and modify these to create more badges

/*
-- Premium Member Badge
INSERT INTO company_badges (
  id, company_id, badge_type, badge_name, badge_description,
  badge_icon, badge_color, issued_by_association_id, issued_by_association_name,
  verified, verification_date, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db',
  'premium-member',
  'Premium Member',
  'Premium tier membership with full access to exclusive products and events.',
  'Star',
  '#3b82f6', -- Blue
  '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db',
  (SELECT name FROM companies WHERE id = '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db'),
  true, NOW(), NOW(), NOW()
);
*/

/*
-- Verified Partner Badge
INSERT INTO company_badges (
  id, company_id, badge_type, badge_name, badge_description,
  badge_icon, badge_color, issued_by_association_id, issued_by_association_name,
  verified, verification_date, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db',
  'verified-partner',
  'Verified Partner',
  'Verified business partner with full accreditation and compliance.',
  'Shield',
  '#10b981', -- Emerald
  '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db',
  (SELECT name FROM companies WHERE id = '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db'),
  true, NOW(), NOW(), NOW()
);
*/

/*
-- Certified Grower Badge
INSERT INTO company_badges (
  id, company_id, badge_type, badge_name, badge_description,
  badge_icon, badge_color, issued_by_association_id, issued_by_association_name,
  verified, verification_date, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db',
  'certified-grower',
  'Certified Grower',
  'Certified hemp grower meeting all industry standards and regulations.',
  'Leaf',
  '#059669', -- Emerald dark
  '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db',
  (SELECT name FROM companies WHERE id = '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db'),
  true, NOW(), NOW(), NOW()
);
*/

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- View all badges for your company
-- SELECT * FROM company_badges WHERE company_id = '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db';

-- View all companies marked as associations
-- SELECT id, name, is_association FROM companies WHERE is_association = true;

-- View all verified badges across all companies
-- SELECT 
--   c.name as company_name,
--   b.badge_name,
--   b.badge_type,
--   b.issued_by_association_name,
--   b.verification_date
-- FROM company_badges b
-- JOIN companies c ON b.company_id = c.id
-- WHERE b.verified = true
-- ORDER BY b.verification_date DESC;
