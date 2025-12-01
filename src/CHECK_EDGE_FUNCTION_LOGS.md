# 🔍 Check Edge Function Logs

## The Issue

- ✅ Database has **64 articles**
- ✅ Old site version **shows articles**
- ❌ New deployed version **shows 0 articles**

This means the query is likely **failing silently** or **columns don't exist**.

---

## 🪵 How to Check Edge Function Logs

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your DEWII project (`dhsqlszauibxintwziib`)
3. Click **"Edge Functions"** in the left sidebar
4. Click on **`make-server-053bcd80`**
5. Click the **"Logs"** tab

### Step 2: Trigger a Request
1. Open your DEWII site (or `/TEST_ARTICLES_DEBUG.html`)
2. Let it try to load articles
3. Go back to the Logs tab
4. Look for the most recent logs

### Step 3: Look for These Log Lines

The Edge Function should log:

```
📰 [PUBLIC ROUTE] GET /articles - No auth required
Fetching articles from SQL database and KV store...
Fetched X articles from SQL database
Fetched Y articles from KV store
Total articles returned: Z
```

---

## 🎯 What the Logs Will Tell Us

### Scenario 1: "Fetched 64 articles from SQL database"
**Means:** Query succeeded, articles were fetched
**Problem:** Articles are being filtered out later in the code
**Solution:** Check for `hidden` column or filtering logic

### Scenario 2: "Fetched 0 articles from SQL database"  
**Means:** Query returned empty result
**Possible Causes:**
- Query is selecting columns that don't exist (silently fails)
- RLS policy blocking (unlikely, uses service role)
- Query has wrong table name

### Scenario 3: "Error fetching articles from SQL: ..."
**Means:** Query threw an error
**Cause:** Definitely a column mismatch or schema issue
**Look for:** Error message mentioning specific column names

### Scenario 4: No logs at all
**Means:** Request never reached the Edge Function
**Cause:** Old cached version still deployed (unlikely since you redeployed)

---

## 🔍 Most Likely Culprit: Missing Columns

The new code tries to access these columns:
- `author` (probably doesn't exist in old schema)
- `author_image` (probably doesn't exist)
- `author_title` (probably doesn't exist)  
- `publish_date` (probably doesn't exist)
- `feed_title` (RSS feature - probably doesn't exist)
- `feed_url` (RSS feature - probably doesn't exist)
- `hidden` (probably doesn't exist)
- `source` (RSS feature - probably doesn't exist)
- `source_url` (RSS feature - probably doesn't exist)
- `media` (probably doesn't exist or wrong type)
- `organization_id` (NEW from multi-author system)

**Your OLD articles table probably only has:**
- `id`
- `title`
- `content`
- `excerpt`
- `category`
- `cover_image`
- `reading_time`
- `author_id`
- `views`
- `likes`
- `created_at`
- `updated_at`

---

## 🛠️ Next Steps

### Option A: Check Logs (Fastest Diagnosis)
1. Go to Edge Function Logs (instructions above)
2. Look for error messages
3. Tell me what you see

### Option B: Check Database Columns (Most Accurate)
1. Go to Supabase SQL Editor
2. Run: `/DIAGNOSE_COLUMN_MISMATCH.sql`
3. Tell me which columns are ❌ MISSING

### Option C: Quick Test Query
Run this in Supabase SQL Editor:

```sql
-- Try to query with NEW columns (will error if they don't exist)
SELECT 
  id,
  title,
  author,           -- ← Probably doesn't exist
  author_image,     -- ← Probably doesn't exist
  author_title,     -- ← Probably doesn't exist
  publish_date,     -- ← Probably doesn't exist
  source,           -- ← Probably doesn't exist
  source_url,       -- ← Probably doesn't exist
  hidden,           -- ← Probably doesn't exist
  organization_id   -- ← Might not exist
FROM articles 
LIMIT 1;
```

**If this query FAILS**, it will tell you exactly which column doesn't exist!

---

## 💡 The Fix (Once We Confirm)

If columns are missing, we'll need to either:

**Option 1: Add Missing Columns** (Safest)
```sql
ALTER TABLE articles 
  ADD COLUMN IF NOT EXISTS author TEXT,
  ADD COLUMN IF NOT EXISTS author_image TEXT,
  ADD COLUMN IF NOT EXISTS author_title TEXT,
  ADD COLUMN IF NOT EXISTS publish_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS feed_title TEXT,
  ADD COLUMN IF NOT EXISTS feed_url TEXT,
  ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::jsonb;
```

**Option 2: Update Edge Function to Only Query Existing Columns**
Modify the query to check if columns exist first, or use safer queries.

---

## 🎯 Action Required

**Please do ONE of these:**

1. **Check Edge Function Logs** and tell me what you see
2. **Run `/DIAGNOSE_COLUMN_MISMATCH.sql`** and tell me which columns are missing
3. **Run the test query above** and tell me if it errors (and which column)

Then I'll give you the exact SQL to fix it! 🚀
