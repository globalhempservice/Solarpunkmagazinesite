# 🏢 Company System - SQL Quick Reference

## 🔍 Common Queries

### **Categories**

```sql
-- Get all active categories
SELECT * FROM company_categories 
WHERE is_active = true 
ORDER BY display_order;

-- Create new category (admin only)
INSERT INTO company_categories (name, description, icon, display_order)
VALUES ('New Category', 'Description here', 'Icon', 10);

-- Update category
UPDATE company_categories 
SET name = 'Updated Name', description = 'New description'
WHERE id = 'category-uuid';

-- Delete category (will fail if companies use it)
DELETE FROM company_categories WHERE id = 'category-uuid';
```

---

### **Companies**

```sql
-- Get all published companies
SELECT * FROM companies 
WHERE is_published = true 
ORDER BY created_at DESC;

-- Get company with badge count
SELECT 
  c.*,
  COUNT(cb.id) as badge_count
FROM companies c
LEFT JOIN company_badges cb ON c.id = cb.company_id
WHERE c.id = 'company-uuid'
GROUP BY c.id;

-- Get user's companies
SELECT * FROM companies 
WHERE owner_id = 'user-uuid'
ORDER BY created_at DESC;

-- Get all associations
SELECT * FROM companies 
WHERE is_association = true 
AND is_published = true;

-- Full-text search companies
SELECT * FROM companies
WHERE to_tsvector('english', name || ' ' || description) 
  @@ plainto_tsquery('english', 'hemp cbd');

-- Get companies by category
SELECT c.* FROM companies c
JOIN company_categories cc ON c.category_id = cc.id
WHERE cc.name = 'Hemp Production'
AND c.is_published = true;

-- Create company
INSERT INTO companies (
  name, description, category_id, owner_id, is_published
) VALUES (
  'My Hemp Company',
  'We produce high-quality hemp products',
  'category-uuid',
  'user-uuid',
  false
);

-- Publish company
UPDATE companies 
SET is_published = true 
WHERE id = 'company-uuid';

-- Increment view count
UPDATE companies 
SET view_count = view_count + 1,
    last_viewed_at = NOW()
WHERE id = 'company-uuid';
```

---

### **Badges**

```sql
-- Get company's badges
SELECT * FROM company_badges 
WHERE company_id = 'company-uuid'
AND verified = true
ORDER BY verification_date DESC;

-- Get all verified badges with company info
SELECT 
  cb.*,
  c.name as company_name,
  a.name as association_name
FROM company_badges cb
JOIN companies c ON cb.company_id = c.id
LEFT JOIN companies a ON cb.issued_by_association_id = a.id
WHERE cb.verified = true;

-- Create badge (admin only)
INSERT INTO company_badges (
  company_id,
  badge_type,
  badge_name,
  badge_description,
  issued_by_association_id,
  issued_by_association_name,
  verified
) VALUES (
  'company-uuid',
  'association_member',
  'Hemp Association Member',
  'Verified member of the National Hemp Association',
  'association-uuid',
  'National Hemp Association',
  true
);

-- Verify badge
UPDATE company_badges 
SET verified = true,
    verification_date = NOW()
WHERE id = 'badge-uuid';
```

---

### **Badge Requests**

```sql
-- Get pending requests for association
SELECT 
  br.*,
  c.name as company_name,
  c.description as company_description
FROM badge_requests br
JOIN companies c ON br.company_id = c.id
WHERE br.association_id = 'association-uuid'
AND br.status = 'pending'
ORDER BY br.created_at ASC;

-- Get company's requests
SELECT 
  br.*,
  a.name as association_name
FROM badge_requests br
JOIN companies a ON br.association_id = a.id
WHERE br.company_id = 'company-uuid'
ORDER BY br.created_at DESC;

-- Create badge request
INSERT INTO badge_requests (
  company_id,
  association_id,
  badge_type,
  message
) VALUES (
  'company-uuid',
  'association-uuid',
  'association_member',
  'We would like to become verified members...'
);

-- Approve request
UPDATE badge_requests 
SET status = 'approved',
    reviewed_by_user_id = 'reviewer-uuid',
    review_message = 'Approved! Welcome to the association.',
    reviewed_at = NOW()
WHERE id = 'request-uuid';

-- Reject request
UPDATE badge_requests 
SET status = 'rejected',
    reviewed_by_user_id = 'reviewer-uuid',
    review_message = 'Please provide more documentation.',
    reviewed_at = NOW()
WHERE id = 'request-uuid';
```

---

### **Company Members** (Optional)

```sql
-- Get company's team members
SELECT 
  cm.*,
  au.email
FROM company_members cm
JOIN auth.users au ON cm.user_id = au.id
WHERE cm.company_id = 'company-uuid'
ORDER BY 
  CASE cm.role 
    WHEN 'owner' THEN 1
    WHEN 'admin' THEN 2
    ELSE 3
  END;

-- Add member to company
INSERT INTO company_members (
  company_id,
  user_id,
  role,
  title,
  can_edit,
  invited_by
) VALUES (
  'company-uuid',
  'new-member-uuid',
  'member',
  'Marketing Manager',
  false,
  'inviter-uuid'
);

-- Get all companies a user belongs to
SELECT 
  c.*,
  cm.role,
  cm.title
FROM company_members cm
JOIN companies c ON cm.company_id = c.id
WHERE cm.user_id = 'user-uuid';
```

---

## 📊 Analytics Queries

### **Dashboard Stats**

```sql
-- Overall stats
SELECT 
  COUNT(*) as total_companies,
  COUNT(*) FILTER (WHERE is_published = true) as published_companies,
  COUNT(*) FILTER (WHERE is_published = false) as draft_companies,
  COUNT(*) FILTER (WHERE is_association = true) as associations,
  COUNT(DISTINCT category_id) as categories_used
FROM companies;

-- Badge stats
SELECT 
  COUNT(*) as total_badges,
  COUNT(*) FILTER (WHERE verified = true) as verified_badges,
  COUNT(DISTINCT company_id) as companies_with_badges
FROM company_badges;

-- Request stats
SELECT 
  status,
  COUNT(*) as count
FROM badge_requests
GROUP BY status;
```

---

### **Top Companies**

```sql
-- Most viewed companies
SELECT name, view_count, last_viewed_at
FROM companies
WHERE is_published = true
ORDER BY view_count DESC
LIMIT 10;

-- Companies with most badges
SELECT 
  c.name,
  COUNT(cb.id) as badge_count
FROM companies c
LEFT JOIN company_badges cb ON c.id = cb.company_id
WHERE c.is_published = true
GROUP BY c.id, c.name
ORDER BY badge_count DESC
LIMIT 10;

-- Newest companies
SELECT name, created_at, category_name
FROM companies
WHERE is_published = true
ORDER BY created_at DESC
LIMIT 10;
```

---

### **Category Analytics**

```sql
-- Companies per category
SELECT 
  cc.name as category,
  COUNT(c.id) as company_count
FROM company_categories cc
LEFT JOIN companies c ON cc.id = c.category_id AND c.is_published = true
GROUP BY cc.id, cc.name
ORDER BY company_count DESC;

-- Most popular categories
SELECT 
  category_name,
  COUNT(*) as count
FROM companies
WHERE is_published = true
GROUP BY category_name
ORDER BY count DESC;
```

---

## 🔐 Admin Queries

### **User Company Management**

```sql
-- Get all companies by a specific user
SELECT 
  c.*,
  COUNT(cb.id) as badge_count
FROM companies c
LEFT JOIN company_badges cb ON c.id = cb.company_id
WHERE c.owner_id = 'user-uuid'
GROUP BY c.id
ORDER BY c.created_at DESC;

-- Find companies without categories
SELECT * FROM companies 
WHERE category_id IS NULL;

-- Find inactive associations
SELECT * FROM companies
WHERE is_association = true
AND is_published = false;
```

---

### **Cleanup Queries**

```sql
-- Remove expired badges
DELETE FROM company_badges
WHERE expiry_date < NOW();

-- Find old pending requests (30+ days)
SELECT * FROM badge_requests
WHERE status = 'pending'
AND created_at < NOW() - INTERVAL '30 days';

-- Companies with no activity (never viewed)
SELECT * FROM companies
WHERE is_published = true
AND (view_count = 0 OR view_count IS NULL);
```

---

## 🔄 Batch Operations

### **Bulk Approve Requests**

```sql
-- Approve all pending requests from a specific company
UPDATE badge_requests
SET status = 'approved',
    reviewed_at = NOW(),
    reviewed_by_user_id = 'admin-uuid'
WHERE company_id = 'company-uuid'
AND status = 'pending';
```

---

### **Bulk Badge Operations**

```sql
-- Verify all unverified badges from an association
UPDATE company_badges
SET verified = true,
    verification_date = NOW()
WHERE issued_by_association_id = 'association-uuid'
AND verified = false;
```

---

## 🧪 Testing Data

```sql
-- Insert test category
INSERT INTO company_categories (name, description, icon)
VALUES ('Test Category', 'For testing', 'TestTube')
RETURNING *;

-- Insert test company
INSERT INTO companies (
  name, description, category_id, owner_id, is_published
)
VALUES (
  'Test Hemp Co.',
  'A test hemp company for development',
  (SELECT id FROM company_categories WHERE name = 'Hemp Production'),
  'your-user-uuid',
  true
)
RETURNING *;

-- Clean up test data
DELETE FROM companies WHERE name LIKE 'Test%';
DELETE FROM company_categories WHERE name LIKE 'Test%';
```

---

## 🎯 Performance Tips

1. **Use indexes** - Already created for common queries
2. **Use EXPLAIN ANALYZE** - Check query performance
3. **Avoid SELECT *** - Select only needed columns
4. **Use prepared statements** - In your backend code
5. **Batch operations** - Use bulk inserts/updates when possible

---

## 📝 Notes

- All UUIDs should be generated by PostgreSQL (`gen_random_uuid()`)
- Timestamps use `TIMESTAMPTZ` for timezone awareness
- RLS policies enforce security at the database level
- Triggers automatically maintain `updated_at` fields
- Foreign keys ensure referential integrity

---

**Happy querying! 🚀**
