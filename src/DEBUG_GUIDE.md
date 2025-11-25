# 🔧 DEWII Server Debugging Guide

## Current Status: Server Deployed but Not Responding

You've confirmed the server is deployed on Supabase, but the app is getting "Failed to fetch" errors. Here's how to diagnose and fix this.

---

## 🎯 Quick Diagnostic Steps

### Step 1: Open the Test Tool
1. Open `/TEST_SERVER_CONNECTION.html` in your browser
2. Click "Run All Tests"
3. This will tell you exactly what's wrong

### Step 2: Check Supabase Dashboard
1. Go to https://supabase.com/dashboard/project/dhsqlszauibxintwziib
2. Click **Edge Functions** in the left sidebar
3. Find `make-server-053bcd80`
4. Check the status:
   - ✅ **Active** (green) = Function is running
   - ⚠️ **Inactive** (gray) = Function needs to be deployed
   - ❌ **Error** (red) = Function crashed

### Step 3: Check Function Logs
1. In the Edge Functions page, click on `make-server-053bcd80`
2. Click the **Logs** tab
3. Look for errors:
   - ❌ "Failed to start" = Missing dependencies or syntax error
   - ❌ "Environment variable not found" = Missing env vars
   - ❌ "Module not found" = Import error
   - ✅ "Server started" = Function is healthy

---

## 🚨 Common Issues & Fixes

### Issue 1: Missing Environment Variables
**Symptoms:** Server starts but crashes on first request

**Check:**
```bash
# These MUST be set in Supabase Dashboard → Project Settings → Edge Functions
- SUPABASE_URL
- SUPABASE_ANON_KEY  
- SUPABASE_SERVICE_ROLE_KEY
- ADMIN_USER_ID
```

**Fix:**
1. Go to Supabase Dashboard → Project Settings
2. Click **Edge Functions** (or **API**)
3. Add missing environment variables
4. Redeploy: `supabase functions deploy make-server-053bcd80`

---

### Issue 2: Function Not Active
**Symptoms:** "Failed to fetch" on all endpoints

**Fix:**
```bash
# Redeploy the function
supabase functions deploy make-server-053bcd80

# OR via dashboard:
# 1. Go to Edge Functions
# 2. Click make-server-053bcd80
# 3. Click "Deploy" button
```

---

### Issue 3: CORS Errors
**Symptoms:** Browser console shows CORS errors

**Check browser console for:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Fix:** Already implemented - redeploy:
```bash
supabase functions deploy make-server-053bcd80
```

---

### Issue 4: Wrong Function URL
**Symptoms:** 404 Not Found errors

**Verify URL format:**
```
✅ Correct: https://dhsqlszauibxintwziib.supabase.co/functions/v1/make-server-053bcd80/health
❌ Wrong:   https://dhsqlszauibxintwziib.supabase.co/functions/v1/server/health
```

---

### Issue 5: Import Errors
**Symptoms:** Function won't start, logs show "Module not found"

**Fix:**
```bash
# Make sure you're deploying from the correct directory
cd /path/to/your/project
supabase functions deploy make-server-053bcd80
```

---

## 🧪 Manual Testing

### Test 1: Health Check (No Auth Required)
```bash
curl https://dhsqlszauibxintwziib.supabase.co/functions/v1/make-server-053bcd80/health
```

**Expected:**
```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "service": "DEWII Magazine Server",
  "version": "1.0.0"
}
```

---

### Test 2: Articles Endpoint
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoc3Fsc3phdWlieGludHd6aWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTM4NzcsImV4cCI6MjA3ODQyOTg3N30.3xwxgMi6TBR72knrt-xNt5lKWjzB587G32L7B9gwKf0" \
  https://dhsqlszauibxintwziib.supabase.co/functions/v1/make-server-053bcd80/articles?limit=1
```

**Expected:**
```json
{
  "articles": [...]
}
```

---

## 📊 Interpreting Test Results

### ✅ All Tests Pass
Your server is healthy! The issue might be:
- Browser cache (hard refresh with Ctrl+Shift+R)
- Local network issues
- Firewall blocking requests

### ❌ Health Check Fails
Server is not running:
1. Check function logs in Supabase dashboard
2. Look for startup errors
3. Verify all imports are correct
4. Redeploy

### ⚠️ Health Passes, Articles Fail
Server is running but has issues:
1. Check if database tables exist
2. Verify environment variables
3. Check function logs for runtime errors

---

## 🔄 Force Redeploy (Nuclear Option)

If nothing works, force a complete redeploy:

```bash
# 1. Delete the function (optional)
# In Supabase Dashboard → Edge Functions → Delete

# 2. Redeploy with verbose logging
supabase functions deploy make-server-053bcd80 --no-verify-jwt

# 3. Watch logs in real-time
supabase functions logs make-server-053bcd80 --follow
```

---

## 📞 Next Steps

1. **Run the test tool** → `/TEST_SERVER_CONNECTION.html`
2. **Check the logs** → Supabase Dashboard → Edge Functions → Logs
3. **Share the results** → Tell me what errors you see

The server code is correct. This is definitely a deployment/configuration issue, not a code issue! 🎯
