# 🏢 DEWII Company System - Database Migration Guide

## 📋 Overview

This guide will help you migrate the company management system from the KV store to proper Supabase PostgreSQL tables with Row Level Security (RLS).

---

## 🎯 What You're Getting

### **5 New Tables:**

1. **`company_categories`** - Admin-managed industry categories
2. **`companies`** - Main company/organization pages
3. **`company_badges`** - Badges earned by companies
4. **`badge_requests`** - Badge request workflow system
5. **`company_members`** - Multi-user company teams (optional)

### **Key Features:**

- ✅ Row Level Security (RLS) policies
- ✅ Full-text search on company names and descriptions
- ✅ Automatic timestamps with triggers
- ✅ Foreign key constraints for data integrity
- ✅ Indexes for fast queries
- ✅ Default seed data (9 hemp industry categories)
- ✅ Helpful views for stats and analytics

---

## 🚀 Step-by-Step Migration

### **Step 1: Access Supabase SQL Editor**

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **"New Query"**

### **Step 2: Run the Migration SQL**

1. Copy the entire contents of `/company_system_migration.sql`
2. Paste into the SQL Editor
3. Click **"Run"** or press `Ctrl/Cmd + Enter`
4. Wait for completion (should take 5-10 seconds)

### **Step 3: Verify Tables Created**

Run this query to verify:

```sql
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('company_categories', 'companies', 'company_badges', 'badge_requests', 'company_members')
ORDER BY table_name;
```

You should see:
```
company_categories    - 8 columns
companies            - 25 columns
company_badges       - 13 columns
badge_requests       - 11 columns
company_members      - 10 columns
```

### **Step 4: Verify Seed Data**

Check that default categories were created:

```sql
SELECT id, name, display_order 
FROM company_categories 
ORDER BY display_order;
```

You should see 9 categories:
- Hemp Production
- Cannabis & CBD Products
- Hemp Textiles & Fashion
- Hemp Construction & Materials
- Hemp Food & Nutrition
- Research & Education
- Sustainability & Environment
- Hemp Association
- Other

---

## 🔐 Security Features

### **Row Level Security (RLS) Policies:**

#### **Companies:**
- ✅ Anyone can view **published** companies
- ✅ Users can view their **own draft** companies
- ✅ Users can **create, edit, delete** their own companies
- ✅ Admins can view and edit **all** companies

#### **Categories:**
- ✅ Anyone can view **active** categories
- ✅ **Only admins** can create, edit, or delete categories

#### **Badges:**
- ✅ Anyone can view **verified** badges
- ✅ Company owners can view their own badges (including pending)
- ✅ Association owners can view badges they issued
- ✅ **Only admins** can directly create badges

#### **Badge Requests:**
- ✅ Company owners can view and create **their own requests**
- ✅ Association owners can view and approve **requests to them**
- ✅ Admins can view and manage **all requests**

---

## 📊 Database Schema Overview

### **company_categories**
```
id              UUID (PK)
name            TEXT (unique)
description     TEXT
icon            TEXT
display_order   INTEGER
is_active       BOOLEAN
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### **companies**
```
id                  UUID (PK)
name                TEXT
description         TEXT
website             TEXT
logo_url            TEXT
category_id         UUID (FK → company_categories)
category_name       TEXT (denormalized)
location            TEXT
country             TEXT
founded_year        INTEGER
company_size        TEXT
contact_email       TEXT
contact_phone       TEXT
linkedin_url        TEXT
twitter_url         TEXT
instagram_url       TEXT
facebook_url        TEXT
is_published        BOOLEAN
is_association      BOOLEAN
owner_id            UUID (FK → auth.users)
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
published_at        TIMESTAMPTZ
view_count          INTEGER
last_viewed_at      TIMESTAMPTZ
```

### **company_badges**
```
id                          UUID (PK)
company_id                  UUID (FK → companies)
badge_type                  TEXT
badge_name                  TEXT
badge_description           TEXT
badge_icon                  TEXT
badge_color                 TEXT
issued_by_association_id    UUID (FK → companies)
issued_by_association_name  TEXT
verified                    BOOLEAN
verification_date           TIMESTAMPTZ
expiry_date                 TIMESTAMPTZ
created_at                  TIMESTAMPTZ
updated_at                  TIMESTAMPTZ
```

### **badge_requests**
```
id                        UUID (PK)
company_id                UUID (FK → companies)
association_id            UUID (FK → companies)
badge_type                TEXT
message                   TEXT
supporting_documents_urls TEXT[]
status                    TEXT (pending/approved/rejected)
reviewed_by_user_id       UUID (FK → auth.users)
review_message            TEXT
reviewed_at               TIMESTAMPTZ
created_at                TIMESTAMPTZ
updated_at                TIMESTAMPTZ
```

### **company_members** (Optional)
```
id                    UUID (PK)
company_id            UUID (FK → companies)
user_id               UUID (FK → auth.users)
role                  TEXT (owner/admin/member)
title                 TEXT
can_edit              BOOLEAN
can_manage_badges     BOOLEAN
can_manage_members    BOOLEAN
invited_by            UUID (FK → auth.users)
joined_at             TIMESTAMPTZ
```

---

## 🔧 Automatic Features

### **Triggers:**
- ✅ `updated_at` automatically updates on changes
- ✅ `category_name` syncs when `category_id` changes
- ✅ `published_at` sets when `is_published` becomes true

### **Indexes:**
- ✅ Fast lookups by owner, category, status
- ✅ Full-text search on company names and descriptions
- ✅ Optimized for common queries

### **Constraints:**
- ✅ Valid website URLs
- ✅ Valid founded years (1900 - current year)
- ✅ Valid company sizes
- ✅ Valid badge request statuses
- ✅ Prevent duplicate badges and requests

---

## 📈 Helpful Views

### **companies_with_stats**
Get companies with badge and member counts:
```sql
SELECT * FROM companies_with_stats 
WHERE is_published = true 
ORDER BY badge_count DESC;
```

### **pending_badge_requests**
View all pending badge requests with details:
```sql
SELECT * FROM pending_badge_requests;
```

---

## 🧪 Testing Queries

### **Create a Test Category (as admin):**
```sql
INSERT INTO company_categories (name, description) 
VALUES ('Test Category', 'For testing purposes');
```

### **View All Companies:**
```sql
SELECT 
  c.name,
  c.category_name,
  c.is_published,
  c.is_association,
  COUNT(cb.id) as badge_count
FROM companies c
LEFT JOIN company_badges cb ON c.id = cb.company_id
GROUP BY c.id
ORDER BY c.created_at DESC;
```

### **View Badge Requests by Status:**
```sql
SELECT 
  status,
  COUNT(*) as count
FROM badge_requests
GROUP BY status;
```

---

## 🎯 Next Steps

After running the migration:

1. ✅ **Update Backend Routes** - Replace KV store queries with SQL queries
2. ✅ **Test Admin Dashboard** - Verify category management works
3. ✅ **Test Company Creation** - Create a test company
4. ✅ **Test Badge System** - Create a badge request workflow
5. ✅ **Migrate Existing Data** - If you have existing KV data to migrate

---

## 🔄 Data Migration (If You Have Existing KV Data)

If you already have companies in the KV store, I can help you write a migration script to move them to the new database structure.

Let me know when you're ready for this step!

---

## 🆘 Troubleshooting

### **Issue: "permission denied for table"**
**Solution:** Make sure you're running queries as the Supabase service role or through the SQL Editor.

### **Issue: "relation already exists"**
**Solution:** Tables already created. You can skip this or drop them first:
```sql
DROP TABLE IF EXISTS company_members CASCADE;
DROP TABLE IF EXISTS badge_requests CASCADE;
DROP TABLE IF EXISTS company_badges CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS company_categories CASCADE;
```

### **Issue: "column does not exist"**
**Solution:** Make sure all tables are created successfully. Re-run the migration.

---

## 📞 Support

If you encounter any issues:
1. Check the Supabase logs in the Dashboard
2. Verify RLS policies are enabled
3. Ensure your user is marked as admin in the KV store
4. Check that foreign key relationships are intact

---

**Ready to migrate? Just run the SQL file and you're good to go! 🚀**
