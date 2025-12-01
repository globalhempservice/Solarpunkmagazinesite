# 🔄 EDGE FUNCTION CACHE ISSUE - REQUIRES REDEPLOYMENT

## ❌ Problem

You're seeing these errors:
```
❌ Failed to fetch publications: 401 {"code":401,"message":"Missing authorization header"}
❌ Failed to fetch user articles: 500 {"error":"Failed to fetch articles","details":"column articles.published_at does not exist"}
```

## ✅ Root Cause

**The code has been fixed, but Supabase Edge Functions are CACHED!**

The old version of the server code is still running. All our fixes are correct:
- ✅ Changed `published_at` → `publish_date` (4 places fixed)
- ✅ TypeScript interfaces updated
- ✅ All queries verified

## 🚀 SOLUTION: Redeploy Edge Functions

### Option 1: Force Redeploy via Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]

2. **Navigate to Edge Functions**
   - Click "Edge Functions" in the left sidebar
   - Find the `make-server-053bcd80` function

3. **Redeploy**
   - Click on the function
   - Click "Deploy" or "Redeploy"
   - Wait for deployment to complete (~30-60 seconds)

### Option 2: Supabase CLI (If you have it installed)

```bash
# In your project directory
supabase functions deploy make-server-053bcd80
```

### Option 3: Wait for Auto-Refresh (Not Recommended)

- Edge Functions *may* refresh automatically after ~5-15 minutes
- But manual redeploy is faster and more reliable

---

## 🧪 HOW TO VERIFY IT'S FIXED

After redeployment, open your browser console and you should see:

### ✅ Success Output
```
📰 Fetching publications from: https://[project].supabase.co/functions/v1/make-server-053bcd80/companies/[id]/publications
✅ Publications fetched: []

📝 Fetching user articles from: https://[project].supabase.co/functions/v1/make-server-053bcd80/users/[id]/articles
✅ User articles fetched: [{ id: '...', title: '...' }, ...]
```

### ❌ Still Cached (Need to Redeploy)
```
❌ Failed to fetch publications: 401 ...
❌ Failed to fetch user articles: 500 ...
```

---

## 📋 CHECKLIST

- [ ] Redeploy Edge Function via Dashboard OR CLI
- [ ] Hard refresh your browser (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] Check console for success messages
- [ ] Try opening Publications tab
- [ ] Try linking an article

---

## 🔍 WHAT WE FIXED (Verification)

### Backend Queries Fixed

#### 1. GET /companies/:id/publications
**File:** `/supabase/functions/server/company_routes.tsx:1158`
```typescript
// ✅ FIXED
article:articles(
  ...,
  publish_date,  // Was: published_at
  ...
)
```

#### 2. POST /companies/:id/publications (Link Article)
**File:** `/supabase/functions/server/company_routes.tsx:1253`
```typescript
// ✅ FIXED
article:articles(
  ...,
  publish_date,  // Was: published_at
  ...
)
```

#### 3. PATCH /companies/:id/publications/:pubId (Update)
**File:** `/supabase/functions/server/company_routes.tsx:1378`
```typescript
// ✅ FIXED
article:articles(
  ...,
  publish_date,  // Was: published_at
  ...
)
```

#### 4. GET /users/:id/articles (User Articles)
**File:** `/supabase/functions/server/company_routes.tsx:1418`
```typescript
// ✅ FIXED
.select('id, title, created_at, publish_date, ...')
// Was: published_at
```

### Frontend TypeScript Fixed

**File:** `/components/OrganizationPublicationsTab.tsx:21-51`
```typescript
// ✅ FIXED
interface Publication {
  article: {
    publish_date: string | null  // Was: published_at
  }
}

interface UserArticle {
  publish_date: string | null  // Was: published_at
}
```

---

## ⚠️ IF STILL NOT WORKING AFTER REDEPLOY

1. **Check Server Logs**
   - Supabase Dashboard → Edge Functions → Logs
   - Look for the specific error messages

2. **Verify Environment Variables**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT current_setting('request.jwt.claims', true);
   ```

3. **Check Your Articles Table Schema**
   ```sql
   -- Verify the column name
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'articles' 
   AND column_name LIKE '%publish%';
   ```

   Should return: `publish_date` (NOT `published_at`)

4. **Test a Simple Query**
   ```sql
   -- This should work
   SELECT id, title, publish_date
   FROM articles
   LIMIT 1;
   ```

---

## 💡 WHY DID THIS HAPPEN?

**Supabase Edge Functions use aggressive caching for performance:**

1. Code is compiled and cached on first deploy
2. Subsequent code changes don't automatically update the running function
3. Manual redeploy is required to pick up changes
4. This is by design for production stability

**Think of it like deploying to production** - you need to explicitly deploy changes, they don't just "happen" automatically.

---

## 🎯 EXPECTED TIMELINE

| Step | Time | Status |
|------|------|--------|
| Code Fixes Applied | ✅ Done | Complete |
| Redeploy Edge Function | ⏳ 30-60s | **← YOU ARE HERE** |
| Cache Clears | ⏳ 10-30s | After redeploy |
| Test Publications Tab | ⏳ 5s | After cache clears |
| ✅ WORKING! | 🎉 | After tests pass |

---

## 🚨 IMPORTANT

**Don't modify the code further until you redeploy!**

All fixes are already in place. The ONLY thing needed is redeployment. If you change code before redeploying, you won't know if the original fixes worked.

---

## 📞 AFTER REDEPLOYMENT

Once you've redeployed, reply with:
1. ✅ Console output (any new errors?)
2. ✅ Can you see the Publications tab?
3. ✅ Does the "Link Article" button appear?
4. ✅ Any new error messages?

---

**TL;DR: The code is fixed. Redeploy the Edge Function. Everything will work.** 🚀
