# 🚀 Deploy Article-Organization-Authors System

## ✅ What's Been Completed

### 1. Database Schema ✅
- **File:** `/database/migrations/article_authors_system.sql`
- Creates `article_authors` table for multi-author support
- Creates `articles_with_authors` view
- Helper functions and RLS policies

### 2. Backend API Routes ✅
- **File:** `/supabase/functions/server/article_organization_routes.tsx`
- 7 new routes for managing articles, organizations, and co-authors
- Integrated into main server: `/supabase/functions/server/index.tsx`

### 3. Frontend - Publications Tab ✅
- **File:** `/components/OrganizationPublicationsTab.tsx`
- Updated to use new API endpoints
- Displays co-authors
- Publish/unpublish articles under organization

### 4. Updated Article Routes ✅
- Article creation now supports `organizationId`
- Article updates support organization changes
- Permission checks for org owners

## 📋 Deployment Steps (In Order)

### Step 1: Run Database Migration

1. Open **Supabase Dashboard** → SQL Editor
2. Copy contents of `/database/migrations/article_authors_system.sql`
3. Click **Run**
4. Verify success messages appear

**Verification:**
```sql
-- Should return true
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'article_authors'
) AS table_exists;

-- Should show organization_id column
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'articles' AND column_name = 'organization_id';
```

### Step 2: Deploy Edge Functions

1. Open **Supabase Dashboard** → Edge Functions
2. Find **make-server-053bcd80** function
3. Click **Deploy** button
4. Wait for deployment to complete (~30 seconds)

**Verification:**
```bash
# Test new route
curl https://YOUR-PROJECT.supabase.co/functions/v1/make-server-053bcd80/user/organizations \
  -H "Authorization: Bearer YOUR-TOKEN"
```

### Step 3: Test in Browser

1. **Refresh DEWII application** (hard refresh: Ctrl+Shift+R)
2. Navigate to **Company Manager** → Select a company
3. Click **Publications Tab**
4. Try "Link Article" button

**Expected:**
- ✅ Publications tab loads without errors
- ✅ Can link personal articles to organization
- ✅ Co-authors display if present
- ✅ Can remove articles from organization

## ❌ Known Limitations (TODO Later)

### ArticleEditor Component NOT Updated Yet
The article creation form (`/components/ArticleEditor.tsx`) still needs:
- [ ] Organization selector dropdown
- [ ] Co-authors manager UI
- [ ] Integration with new endpoints

**Workaround for now:**
Users can create personal articles, then publish them to organizations via the Publications Tab.

### Reading Points Error (Separate Issue)
The "Failed to start reading session" error is unrelated to this system. It's from the article security read token system. This needs separate investigation.

## 🧪 Testing Script

Run this in browser console to test the new system:

```javascript
// Test 1: Get user's organizations
const serverUrl = 'https://YOUR-PROJECT.supabase.co/functions/v1/make-server-053bcd80'
const token = 'YOUR-ACCESS-TOKEN'

fetch(`${serverUrl}/user/organizations`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('✅ Organizations:', d))

// Test 2: Get organization's articles
const orgId = 'YOUR-ORG-ID'
fetch(`${serverUrl}/organizations/${orgId}/articles`)
.then(r => r.json())
.then(d => console.log('✅ Org Articles:', d))

// Test 3: Create article with organization
fetch(`${serverUrl}/articles/with-organization`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Test Article',
    content: 'Test content for multi-author system',
    category: 'Research',
    organizationId: orgId,
    coAuthors: [
      { name: 'Dr. Test', title: 'Researcher', order: 0, role: 'lead-author' }
    ]
  })
})
.then(r => r.json())
.then(d => console.log('✅ Created:', d))
```

## 📊 Database Structure Quick Reference

```
articles
├── id (uuid)
├── title (text)
├── content (text)
├── author_id (uuid) ────→ auth.users (system creator)
├── organization_id (uuid) ─→ companies (publisher)
└── ...

article_authors (NEW)
├── id (uuid)
├── article_id (uuid) ────→ articles
├── user_id (uuid) ───────→ auth.users (optional)
├── author_name (text)
├── author_title (text)
├── author_order (int) ───→ 0 = first author, 1 = second, etc.
└── role (text) ──────────→ lead-author, co-author, contributor
```

## 🔥 Quick Fixes if Something Breaks

### Edge Functions won't deploy
```bash
# Check function logs
supabase functions logs make-server-053bcd80

# Common issue: syntax errors
# Fix file, then redeploy via dashboard
```

### Publications Tab shows errors
```javascript
// Check browser console
// Look for API endpoint errors
// Verify organization ID exists
```

### Articles don't appear
```sql
-- Check if organization_id is set
SELECT id, title, organization_id FROM articles LIMIT 10;

-- Update an article to have org
UPDATE articles 
SET organization_id = 'your-org-id' 
WHERE id = 'article-id';
```

## 📞 Support

If you encounter issues:

1. **Check Browser Console** - Look for red errors
2. **Check Supabase Logs** - Edge Functions → Logs
3. **Verify Database** - SQL Editor → Run verification queries
4. **Test API Directly** - Use curl or Postman to isolate issues

---

## ✨ Success Criteria

After deployment, you should be able to:

✅ View organization's published articles in Publications Tab
✅ See co-authors displayed for articles
✅ Publish personal articles under your organization
✅ Remove articles from organization (makes them personal again)
✅ Only org owners can publish articles

❌ Create articles with org directly from editor (needs ArticleEditor update)
❌ Add co-authors during article creation (needs ArticleEditor update)

---

**Ready to Deploy?** Start with Step 1 (Database Migration) →
