# 🚀 Quick Security Setup Guide

## Step 1: Run SQL in Supabase

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the entire contents of `/SECURITY_SETUP.sql`
3. Click **"Run"**
4. Wait for confirmation ✅

This creates:
- `wallet_audit_log` table
- Indexes for performance
- Row Level Security policies
- Admin monitoring views
- Cleanup function

---

## Step 2: Verify Tables Created

Go to **Table Editor** and verify you see:

✅ `wallets` (created earlier)
✅ `wallet_transactions` (created earlier)  
✅ `wallet_audit_log` (NEW - just created)

---

## Step 3: Deploy Backend

The backend code has been updated with all security features.

**What's New:**
- ✅ Rate limiting (5 per 5 min)
- ✅ Daily limits (10 per day)
- ✅ Maximum exchange (5000 points)
- ✅ Fraud detection
- ✅ Audit logging
- ✅ IP tracking

Just **deploy/restart** your Netlify functions and it's live!

---

## Step 4: Test Security Features

### Test 1: Normal Exchange ✅
1. Go to wallet
2. Exchange 250 points
3. Should succeed
4. Check Supabase `wallet_audit_log` table - should see "exchange_success"

### Test 2: Rate Limiting ⏱️
1. Make 5 exchanges quickly
2. 6th attempt should show: "⏳ Rate limit exceeded..."
3. Check `wallet_audit_log` - should see "rate_limit_hit"

### Test 3: Check Audit Log 📝
```sql
-- Run in Supabase SQL Editor
SELECT 
  action,
  success,
  details,
  ip_address,
  timestamp
FROM wallet_audit_log
ORDER BY timestamp DESC
LIMIT 20;
```

You should see all exchanges logged!

---

## Step 5: Monitor Security (Optional)

### View Suspicious Activity
```sql
SELECT * FROM suspicious_wallet_activity;
```

### Check Failed Attempts Today
```sql
SELECT 
  user_id,
  action,
  details,
  timestamp
FROM wallet_audit_log
WHERE success = false
AND timestamp > CURRENT_DATE
ORDER BY timestamp DESC;
```

### Exchange Statistics
```sql
SELECT 
  COUNT(*) as total_exchanges,
  SUM((details->>'nadaPointsGained')::numeric) as total_nada_earned,
  COUNT(DISTINCT user_id) as unique_users
FROM wallet_audit_log
WHERE action = 'exchange_success'
AND timestamp > NOW() - INTERVAL '7 days';
```

---

## ✅ You're All Set!

Your wallet system now has:
- 🔒 **Bank-grade security**
- 📝 **Full audit trail**  
- 🕵️ **Fraud detection**
- ⏱️ **Rate limiting**
- 💰 **Daily limits**
- 🌐 **IP tracking**

## What Users Will See

### Normal Exchange:
✅ "🎉 Exchanged successfully! You got 5 NADA points!"

### Rate Limited:
⏳ "Rate limit exceeded. Please wait 3 minutes."

### Daily Limit:
⏳ "Daily exchange limit reached. Maximum 10 exchanges per day."

### Too Much at Once:
💰 "Maximum single exchange is 5000 points."

---

## Need Help?

- Review `/SECURITY_DOCUMENTATION.md` for detailed info
- Check Supabase logs for errors
- Query `wallet_audit_log` for debugging
- All security checks log to console

**Happy securing! 🔐**
