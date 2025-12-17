# 🚀 Server Deployment Instructions

## The Issue
You're getting this error:
```
Error fetching articles: TypeError: Failed to fetch
🚨 SERVER NOT DEPLOYED OR UNREACHABLE
```

This means your backend server code exists but **hasn't been deployed to Supabase yet**.

---

## ✅ Solution: Deploy Your Server

### **Option 1: Deploy via Supabase CLI (Recommended)**

#### Prerequisites:
1. Install Supabase CLI if you haven't:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project (if not already linked):
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

#### Deploy the Server:
```bash
supabase functions deploy make-server-053bcd80
```

This will:
- ✅ Upload your server code to Supabase
- ✅ Make it accessible at the URL your app is trying to reach
- ✅ Enable all your backend routes (articles, discovery, swap, etc.)

---

### **Option 2: Deploy via Supabase Dashboard (Web UI)**

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Edge Functions**
   - Click "Edge Functions" in the left sidebar
   - Or go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/functions

3. **Deploy the Function**
   - Click on "make-server-053bcd80" (if it exists)
   - OR click "New Function" and create it
   - Upload the files from `/supabase/functions/server/`
   - Click "Deploy"

---

## 🔍 Verify Deployment

After deploying, you can verify it's working:

### Test the health endpoint:
```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-053bcd80/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.6.1",
  "timestamp": "2024-12-17T..."
}
```

### Test the articles endpoint:
```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-053bcd80/articles
```

Expected response:
```json
{
  "articles": [...],
  "total": 42,
  "page": 1
}
```

---

## 📝 Your Server Details

**Function Name:** `make-server-053bcd80`

**Server Version:** `1.6.1`

**Routes Available:**
- `/make-server-053bcd80/health` - Health check
- `/make-server-053bcd80/articles` - Get articles (public)
- `/make-server-053bcd80/articles/:id` - Get single article
- `/make-server-053bcd80/my-articles` - User's articles (auth required)
- `/make-server-053bcd80/discovery/*` - Discovery Match system
- `/make-server-053bcd80/swap/*` - SWAP Shop (C2C barter)
- `/make-server-053bcd80/swag/*` - SWAG products
- `/make-server-053bcd80/places/*` - Places directory
- `/make-server-053bcd80/companies/*` - Company profiles
- `/make-server-053bcd80/admin/*` - Admin routes
- And many more...

**Files to Deploy:**
All files in `/supabase/functions/server/`:
- `index.tsx` (main server file)
- `kv_store.tsx` (key-value store)
- `article_security.tsx`
- `wallet_security.tsx`
- `discovery_routes.tsx`
- `swap_routes.tsx`
- `swag_routes.tsx`
- `places_routes.tsx`
- `company_routes.tsx`
- `admin_discovery_routes.tsx`
- `admin_swag_routes.tsx`
- `article_organization_routes.tsx`
- `messaging_routes.tsx`
- `org_relationship_routes.tsx`
- `search_analytics_routes.tsx`
- `rss_parser.tsx`
- `google_maps_parser.tsx`
- `swap-cleanup.ts`

---

## 🔧 Troubleshooting

### If deployment fails:

**Check your Supabase project ID:**
```bash
supabase projects list
```

**Check your function logs:**
```bash
supabase functions logs make-server-053bcd80
```

**Re-link your project:**
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

**Check environment variables:**
The following should be set automatically:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `ADMIN_USER_ID`

---

## ⚡ Quick Deploy (One Command)

If you have Supabase CLI installed and linked:

```bash
supabase functions deploy make-server-053bcd80
```

That's it! Your server will be live in seconds. 🚀

---

## 📞 Need Help?

If deployment still fails:
1. Check the function logs in Supabase Dashboard
2. Verify your project is linked: `supabase status`
3. Make sure you're logged in: `supabase login`
4. Try deploying from the Supabase Dashboard instead of CLI

Once deployed, refresh your app and all the "Failed to fetch" errors should disappear! ✨
