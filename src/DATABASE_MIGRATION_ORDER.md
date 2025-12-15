# 🗄️ Database Migration Order - Sprint 1.1

**IMPORTANT:** Run SQL migrations in this exact order to avoid dependency errors!

---

## ✅ MIGRATION ORDER

### **Step 1: Organizations Table** (REQUIRED FIRST)

**File:** `/database_schemas/organizations_base_schema.sql`

**Why first:** Discovery Match depends on this table

**What it creates:**
- `organizations` table (base table for all marketplace features)
- `organization_interests` table (tags for matching)
- RLS policies
- Search function
- 8 test organizations (for testing Discovery Match)

**Run in Supabase SQL Editor:**
1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy entire contents of `/database_schemas/organizations_base_schema.sql`
4. Paste and click **RUN**

**Verify:**
```sql
-- Should return 8
SELECT COUNT(*) FROM organizations WHERE is_verified = true;

-- Should show test orgs
SELECT name, category, city FROM organizations ORDER BY name;
```

---

### **Step 2: Discovery Match Tables** (AFTER organizations)

**File:** `/database_schemas/phase_1_discovery_matches.sql`

**Depends on:** `organizations` table (from Step 1)

**What it creates:**
- `discovery_requests` table
- `discovery_match_results` table (has FK to organizations)
- `discovery_analytics` table
- Helper functions
- RLS policies

**Run in Supabase SQL Editor:**
1. Click "New Query" (new tab)
2. Copy entire contents of `/database_schemas/phase_1_discovery_matches.sql`
3. Paste and click **RUN**

**Verify:**
```sql
-- Should return 3 tables
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'discovery%';

-- Should show: discovery_requests, discovery_match_results, discovery_analytics

-- Should return 0 (no errors)
SELECT COUNT(*) FROM discovery_requests;
```

---

## 🎯 QUICK REFERENCE

**Correct order:**
```
1. organizations_base_schema.sql  ← FIRST
2. phase_1_discovery_matches.sql  ← SECOND
```

**Why this order:**
- `discovery_match_results` has a foreign key to `organizations(id)`
- SQL will fail if `organizations` table doesn't exist yet

---

## ✅ VERIFICATION CHECKLIST

After running both migrations:

```sql
-- Check all tables exist (should return 5)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'organizations',
  'organization_interests',
  'discovery_requests',
  'discovery_match_results',
  'discovery_analytics'
);

-- Check test data exists (should return 8)
SELECT COUNT(*) FROM organizations WHERE is_verified = true;

-- Check functions exist (should return 2+)
SELECT proname FROM pg_proc 
WHERE proname IN ('search_organizations', 'mark_discovery_match_viewed', 'select_discovery_match');
```

All checks should pass! ✅

---

## 🐛 TROUBLESHOOTING

### Error: "relation organizations does not exist"

**Cause:** Ran phase_1_discovery_matches.sql BEFORE organizations_base_schema.sql

**Fix:**
```sql
-- Drop discovery tables (if they exist)
DROP TABLE IF EXISTS discovery_analytics CASCADE;
DROP TABLE IF EXISTS discovery_match_results CASCADE;
DROP TABLE IF EXISTS discovery_requests CASCADE;

-- Now run in correct order:
-- 1. organizations_base_schema.sql
-- 2. phase_1_discovery_matches.sql
```

### Error: "duplicate key value violates unique constraint"

**Cause:** Running migrations twice

**Fix:**
```sql
-- Migrations use "CREATE TABLE IF NOT EXISTS" and "ON CONFLICT DO NOTHING"
-- So re-running is safe, just ignore this error
```

---

## 📋 SUMMARY

**2 SQL files to run in order:**

1. ✅ `/database_schemas/organizations_base_schema.sql` FIRST
2. ✅ `/database_schemas/phase_1_discovery_matches.sql` SECOND

**Result:**
- 5 tables created
- 8 test organizations
- Full RLS security
- Ready for Discovery Match! 🚀

---

**After migrations complete, continue with backend deployment in `/SPRINT_1.1_QUICK_START.md`**
