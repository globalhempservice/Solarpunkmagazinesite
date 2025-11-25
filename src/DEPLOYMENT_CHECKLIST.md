# 📋 DEWII Server Deployment Checklist

Complete this checklist to deploy your server and fix "Failed to fetch" errors.

---

## Pre-Deployment Checks

### ☐ Step 1: Verify You Have Supabase CLI

**Test:**
```bash
supabase --version
```

**Expected:** Shows version number like `1.x.x`

**If not installed:**
```bash
npm install -g supabase
```

---

### ☐ Step 2: Link to Your Project

**Test:**
```bash
supabase link --project-ref dhsqlszauibxintwziib
```

**Expected:** "Linked to project dhsqlszauibxintwziib"

**If prompted for password:** Use your Supabase account password

---

### ☐ Step 3: Verify Server Files Exist

**Test:**
```bash
ls -la supabase/functions/server/
```

**Expected:** Should see these files:
- `index.tsx` ✅
- `kv_store.tsx` ✅
- `wallet_security.tsx` ✅
- `article_security.tsx` ✅
- `rss_parser.tsx` ✅

**If files are missing:** You're in the wrong directory. Navigate to your project root.

---

### ☐ Step 4: Set Environment Variables in Dashboard

**Go to:** https://supabase.com/dashboard/project/dhsqlszauibxintwziib/settings/functions

**Add these if they don't exist:**

1. **SUPABASE_URL**
   - Value: `https://dhsqlszauibxintwziib.supabase.co`

2. **SUPABASE_ANON_KEY**
   - Go to: https://supabase.com/dashboard/project/dhsqlszauibxintwziib/settings/api
   - Copy "anon public" key
   - Paste as value

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Same page as above
   - Copy "service_role" key (⚠️ KEEP SECRET!)
   - Paste as value

4. **ADMIN_USER_ID**
   - Your user ID (UUID format like: `abc123-def456-...`)
   - Find it by logging into your app and checking console logs
   - Or go to: https://supabase.com/dashboard/project/dhsqlszauibxintwziib/auth/users
   - Copy your user's ID

**Click "Save" after adding each variable**

---

## Deployment

### ☐ Step 5: Deploy the Function

```bash
supabase functions deploy make-server-053bcd80
```

**Expected output:**
```
Deploying function make-server-053bcd80
✓ Function deployed successfully
Function URL: https://dhsqlszauibxintwziib.supabase.co/functions/v1/make-server-053bcd80
```

**If you get errors:**

**Error: "No such file or directory"**
→ You're not in the project root. Run `cd /path/to/your/project`

**Error: "Not linked to any project"**
→ Run `supabase link --project-ref dhsqlszauibxintwziib`

**Error: "Authentication required"**
→ Run `supabase login` and follow prompts

---

### ☐ Step 6: Verify Deployment

**Test 1: Check Dashboard**
1. Go to: https://supabase.com/dashboard/project/dhsqlszauibxintwziib/functions
2. You should see `make-server-053bcd80` with a green "Active" status
3. Click it and check the "Logs" tab for any errors

**Test 2: Test Health Endpoint**
```bash
curl https://dhsqlszauibxintwziib.supabase.co/functions/v1/make-server-053bcd80/health
```

**Expected:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-24T...",
  "service": "DEWII Magazine Server",
  "version": "1.0.0"
}
```

**If you get an error:**
- Check the function logs in dashboard
- Verify all environment variables are set
- Make sure function shows as "Active"

---

### ☐ Step 7: Test in Browser

**Option A: Use Test Tool**
1. Open your DEWII app
2. Navigate to: `/TEST_SERVER_CONNECTION.html`
3. Click "Run All Tests"
4. All should be green ✅

**Option B: Open Health Endpoint**
1. Open in browser: https://dhsqlszauibxintwziib.supabase.co/functions/v1/make-server-053bcd80/health
2. Should see JSON response (not an error page)

---

### ☐ Step 8: Test Your App

1. Open your DEWII app
2. **Hard refresh:** Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
3. Open DevTools (F12) → Console tab
4. Should see NO "Failed to fetch" errors
5. Articles should load on home page
6. Profile should load on Me page

---

## Troubleshooting

### Issue: Function deploys but immediately crashes

**Check logs:**
```bash
supabase functions logs make-server-053bcd80 --follow
```

**Common causes:**
1. Missing environment variable
   - Fix: Add it in dashboard, then redeploy

2. Syntax error in code
   - Check logs for line number
   - Fix the error, then redeploy

3. Import error
   - Check if all files are present
   - Verify import paths are correct

---

### Issue: Still getting "Failed to fetch" after deployment

**Steps:**
1. Verify function is active (green) in dashboard
2. Test health endpoint - does it return JSON?
3. Hard refresh browser with cache clear
4. Check browser console for CORS errors
5. Try in incognito/private mode
6. Check if your network/firewall is blocking Supabase

---

### Issue: "Environment variable not found" in logs

**Fix:**
1. Go to: https://supabase.com/dashboard/project/dhsqlszauibxintwziib/settings/functions
2. Add the missing variable
3. **Important:** Click Save
4. **Important:** Redeploy the function:
   ```bash
   supabase functions deploy make-server-053bcd80
   ```

---

### Issue: 401 Unauthorized errors

**Possible causes:**
1. `SUPABASE_ANON_KEY` is wrong
   - Get correct key from API settings
   - Update in dashboard
   - Redeploy

2. User session expired
   - Log out and log back in
   - Clear browser cache

3. `ADMIN_USER_ID` doesn't match your ID
   - Get your real user ID from auth dashboard
   - Update the env var
   - Redeploy

---

## Success Criteria

✅ **Deployment Successful If:**
- Function shows as "Active" (green) in dashboard
- Health endpoint returns JSON (not error)
- No errors in function logs
- App loads without "Failed to fetch" errors
- Can view articles on home page
- Can view profile on Me page
- Settings save successfully

---

## Quick Command Reference

```bash
# Deploy function
supabase functions deploy make-server-053bcd80

# Watch logs in real-time
supabase functions logs make-server-053bcd80 --follow

# Test health endpoint
curl https://dhsqlszauibxintwziib.supabase.co/functions/v1/make-server-053bcd80/health

# Check local status
supabase status
```

---

## Need More Help?

If you're still stuck after completing this checklist, provide:

1. **Deployment command output**
2. **Function logs** (from dashboard or CLI)
3. **Health endpoint response**
4. **Browser console errors** (with full stack trace)
5. **Screenshot of environment variables** (hide sensitive values)

This will help debug the specific issue! 🔍
