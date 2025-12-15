# 🚀 Phase 1 Sprint 1.1 - Discovery Match Deployment Guide

**Created:** December 7, 2024  
**Sprint:** Phase 1 Sprint 1.1 - Discovery Match Foundation  
**Status:** Ready to Deploy

---

## 📋 WHAT WE BUILT

### **Database (1 file)**
- `/database_schemas/phase_1_discovery_matches.sql`
  - `discovery_requests` table
  - `discovery_match_results` table
  - `discovery_analytics` table
  - RLS policies
  - Helper functions

### **Backend (2 files)**
- `/supabase/functions/server/discovery_routes.tsx` - NEW
  - POST `/discovery/request` - Create discovery request + generate matches
  - GET `/discovery/my-requests` - List user's requests
  - GET `/discovery/matches/:requestId` - Get matched organizations
  - POST `/discovery/view-match` - Analytics
  - POST `/discovery/select-match` - Select a match
- `/supabase/functions/server/index.tsx` - UPDATED
  - Added discovery routes import
  - Mounted routes at `/make-server-053bcd80/discovery`

### **Frontend (3 files)**
- `/components/discovery/DiscoveryMatchModal.tsx` - Main modal
- `/components/discovery/DiscoveryRequestForm.tsx` - Request form
- `/components/discovery/DiscoveryMatchResults.tsx` - Results display

---

## 🗄️ STEP 1: DEPLOY DATABASE SCHEMA

### **Option A: Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `/database_schemas/phase_1_discovery_matches.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for success message: "Success. No rows returned"

### **Option B: Command Line (psql)**

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration
\i database_schemas/phase_1_discovery_matches.sql

# Verify tables were created
\dt discovery*
```

### **Verification**

Run these queries in SQL Editor to verify:

```sql
-- Check if tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'discovery%';

-- Should return:
-- discovery_requests
-- discovery_match_results
-- discovery_analytics

-- Check if functions exist
SELECT proname FROM pg_proc 
WHERE proname LIKE '%discovery%';

-- Should return:
-- mark_discovery_match_viewed
-- select_discovery_match

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'discovery%';

-- All should have rowsecurity = true
```

---

## ☁️ STEP 2: DEPLOY BACKEND (Edge Functions)

### **Deployment Method: Automatic (Git Push)**

The backend code is already in your repo. Just push to Netlify:

```bash
# Commit new files
git add supabase/functions/server/discovery_routes.tsx
git add supabase/functions/server/index.tsx
git commit -m "feat: Add Discovery Match backend (Phase 1 Sprint 1.1)"

# Push to Netlify
git push origin main
```

Netlify will automatically:
1. Build the edge function
2. Deploy to Supabase Edge Functions
3. Make it available at your endpoint

### **Verification**

After deployment (wait ~2 minutes), test the API:

```bash
# Get your auth token (from browser console after logging in)
# localStorage.getItem('supabase.auth.token')

# Test endpoint availability
curl https://[YOUR-PROJECT-ID].supabase.co/functions/v1/make-server-053bcd80/discovery/my-requests \
  -H "Authorization: Bearer [YOUR-TOKEN]"

# Should return: {"requests": []}
```

---

## 🎨 STEP 3: INTEGRATE FRONTEND

Now we need to wire up the Discovery Match modal to your app. We'll add it to the ME drawer.

### **Update MEButtonDrawer.tsx**

<function_calls>
<invoke name="read">
<parameter name="path">/components/MEButtonDrawer.tsx