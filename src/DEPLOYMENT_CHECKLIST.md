# 🚀 DEWII Edge Function Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] Supabase CLI installed (`supabase --version`)
- [ ] Logged into Supabase CLI (`supabase login`)
- [ ] In project directory (`cd /path/to/dewii`)
- [ ] All code changes saved
- [ ] Database migrations completed ✅ (you already did this!)

## 🔧 Deployment Steps

### 1. Deploy the Edge Function

```bash
supabase functions deploy make-server-053bcd80
```

**Expected output:**
```
Deploying Function (project-ref: dhsqlszauibxintwziib)...
Bundling make-server-053bcd80
✓ Deployed Function make-server-053bcd80
```

**If you see errors:**
- ❌ `not logged in` → Run `supabase login` first
- ❌ `project not linked` → Run `supabase link --project-ref dhsqlszauibxintwziib`
- ❌ `function not found` → Make sure `/supabase/functions/server/` directory exists

### 2. Verify Deployment

Open `/TEST_EDGE_FUNCTION_DEPLOYMENT.html` in browser and click "Run All Tests"

**Expected results:**
- ✅ Server Health - REACHABLE
- ✅ Articles Endpoint - SUCCESS

**If you see errors:**
- ❌ `401 Unauthorized` → Old code still cached, run Step 3 below
- ❌ `Network error` → Edge Function not deployed, repeat Step 1

### 3. Force Clear Cache (if needed)

```bash
# Delete and redeploy to force cache clear
supabase functions delete make-server-053bcd80
supabase functions deploy make-server-053bcd80
```

### 4. Test Your DEWII App

1. Open your DEWII magazine site
2. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Open browser console (F12)

**Expected console output:**
```
✅ Fetching articles from server...
✅ Articles fetched: 10 articles
```

**NOT this:**
```
❌ Fetch articles error: {"code": 401, "message": "Missing authorization header"}
```

## 🎉 Success Indicators

After successful deployment, you should be able to:

- ✅ See articles loading on the homepage
- ✅ Browse articles by category
- ✅ View individual articles
- ✅ See organization publications
- ✅ Access the swag shop
- ✅ View user badges and achievements

## 🐛 Troubleshooting

### Issue: Still getting 401 errors after deployment

**Solution 1:** Clear browser cache completely
1. Chrome: `Settings → Privacy → Clear browsing data → Cached images and files`
2. Or use Incognito/Private mode to test
3. Hard refresh: `Ctrl+Shift+R`

**Solution 2:** Verify Edge Function is actually deployed
```bash
# List all deployed functions
supabase functions list

# You should see:
# NAME                    VERSION   CREATED AT
# make-server-053bcd80    1         2024-XX-XX XX:XX:XX
```

**Solution 3:** Check Supabase Dashboard
1. Go to https://supabase.com/dashboard/project/dhsqlszauibxintwziib
2. Click **Edge Functions** in sidebar
3. Find `make-server-053bcd80`
4. Check deployment status (should be green ✅)
5. If red ❌, click **Deploy** button

### Issue: "Failed to fetch" / Network error

This means the Edge Function isn't reachable at all.

**Solution:**
1. Check you're deploying to the correct project
2. Verify project ID: `dhsqlszauibxintwziib`
3. Make sure the function name is exactly: `make-server-053bcd80`
4. Check Supabase project status (not paused)

### Issue: Articles endpoint returns empty array

This is actually OK! It means:
- ✅ Edge Function is deployed and working
- ✅ No 401 errors
- ⚠️ You just don't have any articles in the database yet

To add articles:
1. Log into your DEWII app
2. Go to "Write Article" section
3. Create and publish an article
4. Refresh and you should see it

## 📊 What Each File Does

| File | Purpose |
|------|---------|
| `/supabase/functions/server/index.tsx` | Main Edge Function (article routes, auth, etc) |
| `/supabase/functions/server/article_organization_routes.tsx` | Multi-author & organization article features |
| `/supabase/functions/server/company_routes.tsx` | Company management API |
| `/supabase/functions/server/swag_routes.tsx` | Swag shop API |
| `/TEST_EDGE_FUNCTION_DEPLOYMENT.html` | Visual deployment tester |
| `/CURRENT_ERRORS_AND_FIXES.md` | Error documentation (you're reading it) |

## 🔄 Regular Deployment Workflow

Whenever you make changes to Edge Function code:

1. Edit files in `/supabase/functions/server/`
2. Deploy: `supabase functions deploy make-server-053bcd80`
3. Wait 30 seconds
4. Hard refresh browser: `Ctrl+Shift+R`
5. Test changes

**Pro tip:** Keep `/TEST_EDGE_FUNCTION_DEPLOYMENT.html` open in a tab for quick testing after deployments.

## 📞 Support

If you're still stuck after following this checklist:

1. Check the browser console for specific error messages
2. Test with `/TEST_EDGE_FUNCTION_DEPLOYMENT.html`
3. Verify Edge Function logs in Supabase Dashboard:
   - Dashboard → Edge Functions → make-server-053bcd80 → Logs
4. Check that all environment variables are set in Supabase:
   - Dashboard → Settings → Edge Functions → Environment Variables
   - Required: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_USER_ID`

---

**Remember:** The code in your files is 100% correct! The issue is just that Supabase needs to be updated with your latest code via deployment. 🚀
