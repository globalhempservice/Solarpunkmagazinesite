# ✅ CORRECTED - Sprint 1.1 Discovery Match Deployment

**Date:** December 7, 2024  
**Status:** Ready to Deploy (Fixed to use existing `companies` table)

---

## 🔧 WHAT WAS FIXED

- ❌ **Removed:** `/database_schemas/organizations_base_schema.sql` (duplicate table)
- ✅ **Updated:** All code now uses existing `companies` table
- ✅ **Updated:** Backend routes use `companies` instead of `organizations`
- ✅ **Updated:** Frontend components use `category_name` and `location` fields from companies
- ✅ **Updated:** SQL schema references `companies(id)` foreign keys

---

## 📊 DEPLOY TO SUPABASE (SQL)

### **Run this ONE file in Supabase SQL Editor:**

**File:** `/database_schemas/phase_1_discovery_matches.sql`

**What it does:**
- Creates `discovery_requests` table
- Creates `discovery_match_results` table (references `companies`)
- Creates `discovery_analytics` table
- Creates 2 helper functions
- Sets up RLS policies

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy entire contents of `/database_schemas/phase_1_discovery_matches.sql`
4. Paste and click **RUN**

**Verify it worked:**
```sql
-- Should return 3 tables
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'discovery%';

-- Should return 0 (ready to use)
SELECT COUNT(*) FROM discovery_requests;

-- Check it references companies correctly
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'discovery_match_results' 
AND tc.constraint_type = 'FOREIGN KEY';

-- Should show: organization_id → companies
```

---

## 🚀 DEPLOY TO GIT (Backend + Frontend)

### **Backend files (auto-deploy via Netlify):**
- `/supabase/functions/server/discovery_routes.tsx` ✅ Uses `companies` table
- `/supabase/functions/server/index.tsx` ✅ Routes mounted

### **Frontend files:**
- `/components/discovery/DiscoveryMatchModal.tsx` ✅
- `/components/discovery/DiscoveryRequestForm.tsx` ✅
- `/components/discovery/DiscoveryMatchResults.tsx` ✅ Uses `category_name` and `location`

### **Push to Git:**
```bash
git add database_schemas/phase_1_discovery_matches.sql
git add supabase/functions/server/discovery_routes.tsx
git add supabase/functions/server/index.tsx
git add components/discovery/

git commit -m "feat: Discovery Match system using existing companies table

- 3 new tables (discovery_requests, discovery_match_results, discovery_analytics)
- Backend API (5 routes) using companies table
- Frontend components with correct field names
- Matching algorithm V1 (category + location + keywords)
- NADA integration (10 NADA per request)
- Ready to test"

git push origin main
```

---

## 🧪 TESTING

### **Test 1: Check companies table exists**
```sql
SELECT COUNT(*) FROM companies WHERE is_published = true;
-- Should return > 0 (you need published companies for matching)
```

**If 0, create a test company:**
```sql
INSERT INTO companies (
  name,
  description,
  category_name,
  location,
  country,
  website,
  owner_id,
  is_published
) VALUES (
  'Hemp Test Co',
  'Sustainable hemp products for testing Discovery Match',
  'Textile',
  'Portland',
  'USA',
  'https://example.com',
  (SELECT id FROM auth.users LIMIT 1), -- Your user ID
  true
);
```

### **Test 2: Create discovery request**
1. Click ME → Discovery Match
2. Fill out form:
   - Text: "Looking for hemp fabric"
   - Category: Textile
   - Location: International
3. Click "Find Matches"
4. Should deduct 10 NADA
5. Should show matched companies

### **Test 3: View results**
- Should show published companies from `companies` table
- Should display `category_name` (not just `category`)
- Should display `location` and `country`
- Match score should be calculated

---

## ✅ SUCCESS CHECKLIST

- [ ] SQL migration runs without errors
- [ ] `discovery_requests`, `discovery_match_results`, `discovery_analytics` tables created
- [ ] Foreign keys reference `companies` (not `organizations`)
- [ ] Backend API responds at `/discovery/my-requests`
- [ ] Frontend modal opens from ME drawer
- [ ] Form validation works
- [ ] NADA deduction works (10 NADA)
- [ ] Matching algorithm finds published companies
- [ ] Results display with correct field names
- [ ] "Request Introduction" button works

---

## 🔍 VERIFY: Companies vs Organizations

**Your system uses:**
- ✅ `companies` table (from `company_system_migration.sql`)
- ✅ Fields: `category_name`, `location`, `is_published`, `owner_id`

**We now reference:**
- ✅ `discovery_match_results.organization_id` → `companies.id`
- ✅ Backend queries: `FROM companies WHERE is_published = true`
- ✅ Frontend displays: `category_name`, `location`, `website`

---

## 📝 WHAT'S NEXT

After Sprint 1.1 is deployed and tested:

→ **Sprint 1.2: Messaging System** (Week 1-2)
- Chat threads
- Messages table
- Link "Request Introduction" to real chat
- Real-time message polling

---

## 🎉 SUMMARY

**Problem:** Created duplicate `organizations` table  
**Solution:** Use existing `companies` table  
**Changes:**
- Deleted `organizations_base_schema.sql`
- Updated all FK references to `companies`
- Updated backend to query `companies`
- Updated frontend to use correct field names

**Result:** Discovery Match now integrates seamlessly with your existing company system! 🚀

---

**Ready to deploy! Just run the ONE SQL file, push to Git, and test!**
