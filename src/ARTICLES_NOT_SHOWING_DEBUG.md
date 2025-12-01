# 🔍 DEWII Articles Not Showing - Debug Guide

## 🎯 The Issue

After implementing the **multi-author article system** with organization publishing, articles are no longer showing up in the magazine.

---

## ✅ What We Fixed

### Problem 1: 401 Unauthorized Errors ✅ SOLVED
- **Cause:** Old Edge Function code was cached on Supabase
- **Old System:** `/articles` route required authentication
- **New System:** `/articles` route is PUBLIC (no auth required)
- **Fix:** Redeployed Edge Function with `supabase functions deploy make-server-053bcd80`

---

## 🔍 Current Diagnosis

### The API is Working, But No Articles Are Returned

Based on the code review:

1. **✅ API Deployment:** Edge Function is deployed correctly
2. **✅ Route is Public:** No authentication required
3. **✅ Server Uses SERVICE_ROLE_KEY:** Bypasses Row Level Security
4. **❌ Zero Articles Returned:** Database appears empty

---

## 🧐 Possible Root Causes

### Theory 1: Database is Actually Empty 🎯 MOST LIKELY
**Hypothesis:** The `articles` table in Supabase has NO rows

**Why this could happen:**
- Previous articles were in KV store only (not SQL database)
- Database was cleared/reset during testing
- Wrong Supabase project is connected
- Articles were never migrated to SQL

**How to verify:**
1. Go to Supabase Dashboard → Table Editor
2. Click on `articles` table
3. Check if any rows exist
4. If 0 rows → **This is the issue!**

**Solution:**
- Need to create articles (either manually or import from KV store)
- Or restore from backup if available

---

### Theory 2: "hidden" Column is Filtering Everything
**Hypothesis:** The `hidden` column exists and is set to `true` for all articles

**Code that filters hidden articles:**
```typescript
// Line 514 in /supabase/functions/server/index.tsx
hidden: article.hidden || false

// Line 552 - KV articles filter
article && article.id && article.isPublished !== false && !article.hidden
```

**How to verify:**
```sql
-- In Supabase SQL Editor
SELECT id, title, hidden 
FROM articles 
WHERE hidden = true;

-- Check if "hidden" column even exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name = 'hidden';
```

**Solution if hidden=true:**
```sql
-- Reset all articles to visible
UPDATE articles SET hidden = false;

-- Or if column doesn't exist, add it
ALTER TABLE articles ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false;
```

---

### Theory 3: RLS Policies Blocking Access
**Hypothesis:** Row Level Security is blocking the query

**Current RLS Policy:**
```sql
CREATE POLICY "Articles are viewable by everyone"
  ON public.articles FOR SELECT
  USING (true);
```

**BUT:** Server uses `SUPABASE_SERVICE_ROLE_KEY` which **bypasses RLS**

**Probability:** ⬇️ LOW (service role should bypass RLS)

**How to verify:**
```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'articles';

-- List all policies
SELECT * FROM pg_policies WHERE tablename = 'articles';
```

---

### Theory 4: Schema Migration Broke the Table
**Hypothesis:** The `organization_publications.sql` migration altered the articles table in a breaking way

**Changes made in migration:**
```sql
-- Added organization_id column
ALTER TABLE articles ADD COLUMN organization_id UUID REFERENCES companies(id);
CREATE INDEX idx_articles_organization ON articles(organization_id);
```

**This SHOULD NOT break existing articles** (it's an optional column)

**Probability:** ⬇️ LOW

---

### Theory 5: Wrong Database Connection
**Hypothesis:** Code is connecting to wrong Supabase project or database

**How to verify:**
```typescript
// Check PROJECT_ID in code
const projectId = 'dhsqlszauibxintwziib'

// Environment variables in Edge Function
SUPABASE_URL = https://dhsqlszauibxintwziib.supabase.co
```

**Solution:**
- Verify `SUPABASE_URL` environment variable in Edge Function
- Ensure it matches your actual project

---

## 🛠️ Debugging Steps (In Order)

### Step 1: Use the Debug Tool ⭐ START HERE
```
Open: /TEST_ARTICLES_DEBUG.html in your browser
Click: "Test Articles API"
```

This will tell you:
- ✅ If API is working
- ✅ How many articles exist
- ✅ What data is being returned

---

### Step 2: Check Supabase Table
1. Go to https://supabase.com/dashboard
2. Select your DEWII project (`dhsqlszauibxintwziib`)
3. Click **"Table Editor"** in sidebar
4. Click **"articles"** table
5. **Count the rows**

**If 0 rows:**
→ Database is empty! Articles need to be created/imported

**If rows exist:**
→ Continue to Step 3

---

### Step 3: Check Article Columns
In Supabase SQL Editor, run:

```sql
-- See first 5 articles with all columns
SELECT * FROM articles LIMIT 5;

-- Check for "hidden" column
SELECT id, title, hidden 
FROM articles 
LIMIT 10;

-- Count visible vs hidden
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE hidden = true) as hidden_count,
  COUNT(*) FILTER (WHERE hidden = false OR hidden IS NULL) as visible_count
FROM articles;
```

---

### Step 4: Check KV Store Articles
The old system might have articles in KV store:

```typescript
// In Edge Function logs, check for:
console.log('Fetched', kvArticles?.length || 0, 'articles from KV store')
```

**Articles are stored as:**
- Key pattern: `article_{id}`
- Keys in KV store: `kv_store_053bcd80` table

**To check:**
```sql
-- See all KV keys for articles
SELECT key FROM kv_store_053bcd80 
WHERE key LIKE 'article_%';

-- Count article keys
SELECT COUNT(*) FROM kv_store_053bcd80 
WHERE key LIKE 'article_%';
```

---

### Step 5: Check Edge Function Logs
1. Supabase Dashboard → Edge Functions
2. Click `make-server-053bcd80`
3. Click **"Logs"** tab
4. Look for:
```
📰 [PUBLIC ROUTE] GET /articles - No auth required
Fetching articles from SQL database and KV store...
Fetched X articles from SQL database
Fetched Y articles from KV store
Total articles returned: Z
```

This tells you exactly where articles are coming from!

---

## 💡 Most Likely Solutions

### Solution 1: Database is Empty → Create Test Articles ⭐

**Via Supabase Dashboard:**
1. Table Editor → articles → Insert Row
2. Fill in:
   - `title`: "Test Article"
   - `content`: "This is a test article content."
   - `category`: "Eco Innovation"
   - `author_id`: (copy a UUID from `auth.users` table)

**Via SQL:**
```sql
-- Insert a test article
INSERT INTO articles (title, content, excerpt, category, author_id)
VALUES (
  'Hemp Revolution: A New Era Begins',
  'This is the full article content about the hemp revolution...',
  'Discover how hemp is changing the world',
  'Eco Innovation',
  (SELECT id FROM auth.users LIMIT 1) -- Use first user
);

-- Insert multiple test articles
INSERT INTO articles (title, content, excerpt, category, author_id)
SELECT 
  'Sample Article ' || i,
  'Content for article ' || i,
  'Excerpt for article ' || i,
  CASE 
    WHEN i % 3 = 0 THEN 'Eco Innovation'
    WHEN i % 3 = 1 THEN 'Culture'
    ELSE 'Business'
  END,
  (SELECT id FROM auth.users LIMIT 1)
FROM generate_series(1, 10) as i;
```

---

### Solution 2: Unhide Articles
```sql
-- Make all articles visible
UPDATE articles SET hidden = false;

-- Or add hidden column if missing
ALTER TABLE articles ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false;
UPDATE articles SET hidden = false WHERE hidden IS NULL;
```

---

### Solution 3: Migrate KV Articles to SQL
If articles exist in KV store but not SQL:

**Check KV articles:**
```sql
SELECT key, value 
FROM kv_store_053bcd80 
WHERE key LIKE 'article_%' 
LIMIT 5;
```

**Then create a migration script** (ask me if needed!)

---

## 📊 Expected vs Actual Behavior

### Expected Behavior ✅
```json
GET /articles
Response: {
  "articles": [
    {
      "id": "uuid-here",
      "title": "Article Title",
      "content": "...",
      "category": "Eco Innovation",
      "author": "Author Name",
      ...
    }
  ]
}
```

### Actual Behavior ❌
```json
GET /articles
Response: {
  "articles": []
}
```

**This means:** API works, but source is empty

---

## 🎯 Action Items (DO THIS NOW)

1. ✅ **Open `/TEST_ARTICLES_DEBUG.html`** - See what API returns
2. ✅ **Check Supabase Table Editor** - Count rows in `articles` table
3. ✅ **Run SQL query:** `SELECT COUNT(*) FROM articles;`
4. ✅ **Check Edge Function logs** - See SQL vs KV article counts

**Report back with:**
- Number of rows in `articles` table
- Number of keys in KV store with pattern `article_*`
- What `/TEST_ARTICLES_DEBUG.html` shows

Then we'll know exactly what the issue is! 🎯
