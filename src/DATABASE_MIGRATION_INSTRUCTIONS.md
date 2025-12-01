# 🗄️ DATABASE MIGRATION INSTRUCTIONS

**IMPORTANT:** Run these migrations BEFORE testing the purchase flow!

---

## 🚨 QUICK START

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**

---

### Step 2: Run Migration 003 (Analytics Table)

**Copy and paste this entire file:**
📄 `/supabase/migrations/003_purchase_analytics.sql`

**What it does:**
- Creates `swag_purchase_analytics_053bcd80` table
- Adds indexes for performance
- Sets up Row Level Security (RLS)
- Creates analytics summary view

**Expected result:**
```
Success. No rows returned.
```

**Verify it worked:**
```sql
-- Run this to check:
SELECT COUNT(*) FROM swag_purchase_analytics_053bcd80;
-- Should return: 0 (empty table, ready to use)
```

---

### Step 3: Run Migration 004 (Provenance Schema)

**Copy and paste this entire file:**
📄 `/supabase/migrations/004_product_provenance.sql`

**What it does:**
- Adds 14 new columns to `swag_products_053bcd80` table
- Creates conscious score calculation function
- Adds auto-calculation trigger
- Creates indexes for filtering

**Expected result:**
```
Success. No rows returned.
```

**Verify it worked:**
```sql
-- Run this to check:
SELECT 
  hemp_source,
  certifications,
  conscious_score,
  provenance_verified
FROM swag_products_053bcd80
LIMIT 1;
-- Should return: Row with new columns (values will be NULL if not set)
```

---

## 🧪 TEST THE MIGRATIONS

### Quick Test: Insert Sample Product with Provenance

```sql
-- Update an existing product (replace YOUR_PRODUCT_ID with real ID)
UPDATE swag_products_053bcd80
SET 
  hemp_source = 'Test Hemp Farm, Colorado',
  hemp_source_country = 'USA',
  certifications = ARRAY['USDA Organic', 'Regenerative'],
  carbon_footprint = -2.5,
  processing_method = 'mechanical',
  fair_trade_verified = true,
  provenance_verified = true
WHERE id = 'YOUR_PRODUCT_ID';

-- Check if conscious_score was auto-calculated
SELECT 
  name,
  hemp_source,
  certifications,
  conscious_score,
  conscious_score_breakdown
FROM swag_products_053bcd80
WHERE id = 'YOUR_PRODUCT_ID';

-- Expected: conscious_score should be a number (likely 90+)
```

---

## 🔍 VERIFY EVERYTHING WORKED

Run this comprehensive check:

```sql
-- 1. Check analytics table exists
SELECT 'Analytics table exists' AS status, COUNT(*) AS row_count 
FROM swag_purchase_analytics_053bcd80;

-- 2. Check analytics view exists
SELECT 'Analytics view exists' AS status, COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_name = 'swag_product_analytics_summary';

-- 3. Check provenance columns added
SELECT 'Provenance columns added' AS status, COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_name = 'swag_products_053bcd80'
  AND (
    column_name LIKE 'hemp_%' OR 
    column_name LIKE 'conscious_%' OR
    column_name LIKE 'provenance_%' OR
    column_name = 'certifications' OR
    column_name = 'fair_trade_verified'
  );
-- Should return: 14 or more columns

-- 4. Check trigger exists
SELECT 'Trigger exists' AS status, tgname AS trigger_name
FROM pg_trigger
WHERE tgname = 'trigger_update_conscious_score';

-- 5. Check function exists
SELECT 'Function exists' AS status, proname AS function_name
FROM pg_proc
WHERE proname = 'calculate_conscious_score';
```

**Expected Results:**
- ✅ Analytics table: 0 rows
- ✅ Analytics view: 7+ columns
- ✅ Provenance columns: 14+ columns
- ✅ Trigger: trigger_update_conscious_score
- ✅ Function: calculate_conscious_score

---

## ❌ ROLLBACK (If Needed)

If something goes wrong, you can rollback:

### Rollback Migration 004 (Provenance)
```sql
-- Remove columns
ALTER TABLE swag_products_053bcd80
  DROP COLUMN IF EXISTS hemp_source,
  DROP COLUMN IF EXISTS hemp_source_country,
  DROP COLUMN IF EXISTS hemp_source_location,
  DROP COLUMN IF EXISTS certifications,
  DROP COLUMN IF EXISTS processing_method,
  DROP COLUMN IF EXISTS fair_trade_verified,
  DROP COLUMN IF EXISTS carbon_footprint,
  DROP COLUMN IF EXISTS water_usage,
  DROP COLUMN IF EXISTS pesticide_free,
  DROP COLUMN IF EXISTS provenance_verified,
  DROP COLUMN IF EXISTS provenance_verified_at,
  DROP COLUMN IF EXISTS provenance_verified_by,
  DROP COLUMN IF EXISTS provenance_notes,
  DROP COLUMN IF EXISTS provenance_docs,
  DROP COLUMN IF EXISTS conscious_score,
  DROP COLUMN IF EXISTS conscious_score_breakdown,
  DROP COLUMN IF EXISTS supply_chain_data;

-- Remove trigger
DROP TRIGGER IF EXISTS trigger_update_conscious_score ON swag_products_053bcd80;

-- Remove function
DROP FUNCTION IF EXISTS calculate_conscious_score;
DROP FUNCTION IF EXISTS update_conscious_score;
```

### Rollback Migration 003 (Analytics)
```sql
-- Remove view
DROP VIEW IF EXISTS swag_product_analytics_summary;

-- Remove table
DROP TABLE IF EXISTS swag_purchase_analytics_053bcd80 CASCADE;
```

---

## 🎯 NEXT STEPS

After migrations are complete:

1. ✅ Verify all checks passed above
2. ✅ Add test data to a product (see TEST THE MIGRATIONS section)
3. ✅ Check conscious score calculated automatically
4. ✅ Proceed to testing guide: `/SWAG_PURCHASE_TESTING_GUIDE.md`

---

## 🆘 TROUBLESHOOTING

### Error: "relation already exists"
**Solution:** Migration already ran. Check if tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%053bcd80%';
```

### Error: "column already exists"
**Solution:** Some columns already added. Check which columns exist:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'swag_products_053bcd80'
  AND column_name LIKE 'hemp_%';
```

### Conscious Score Not Calculating
**Solution:** Trigger may not have fired. Force recalculation:
```sql
UPDATE swag_products_053bcd80 
SET updated_at = NOW() 
WHERE hemp_source IS NOT NULL OR certifications IS NOT NULL;
```

---

**Migrations ready! 🚀 Proceed to testing.**
