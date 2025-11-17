# 🔐 DEWII Wallet Security Documentation

## Overview
This document describes the comprehensive security measures implemented for the NADA points wallet system.

---

## Security Features Implemented

### 1. **Rate Limiting** ⏱️
**Purpose:** Prevent abuse and rapid-fire exchange attempts

**Limits:**
- **5 exchanges per 5 minutes** per user
- Applies to the exchange endpoint only
- Returns HTTP 429 (Too Many Requests) when exceeded

**Implementation:**
- Queries `wallet_transactions` table for recent exchanges
- Counts exchanges within the last 5 minutes
- Returns `retryAfter` seconds in response

**User Experience:**
- Frontend shows: "⏳ Rate limit exceeded. Please wait X minutes."
- Prevents accidental rapid clicking

---

### 2. **Daily Exchange Limits** 📅
**Purpose:** Prevent excessive daily usage and potential exploitation

**Limits:**
- **10 exchanges per day** per user
- Resets at midnight UTC
- Tracks remaining exchanges

**Implementation:**
- Queries transactions since 00:00:00 UTC today
- Returns remaining exchanges in audit log
- HTTP 429 when limit reached

**User Experience:**
- Clear messaging about daily limits
- Shows remaining exchanges in logs

---

### 3. **Maximum Single Exchange** 💰
**Purpose:** Prevent large-scale point movements in single transaction

**Limits:**
- **Maximum 5,000 points** per exchange
- Equals 100 NADA points maximum per transaction
- Still allows multiple smaller exchanges

**Implementation:**
- Simple validation check before processing
- Returns 400 Bad Request if exceeded

---

### 4. **Transaction Atomicity** 🔒
**Purpose:** Ensure data consistency (all-or-nothing operations)

**How it works:**
- Points deducted from `user_progress`
- NADA points added to `wallets`
- Transaction record created in `wallet_transactions`
- If ANY step fails, entire exchange is rejected

**Benefits:**
- No partial transactions
- No lost points
- Database stays consistent

---

### 5. **Comprehensive Audit Logging** 📝
**Purpose:** Track all wallet activity for security analysis

**What's Logged:**
- ✅ Successful exchanges
- ❌ Failed exchange attempts
- 🚫 Rate limit hits
- 🚫 Daily limit hits
- ⚠️ Suspicious activity detections
- 💥 Unexpected errors

**Data Captured:**
- User ID
- Action type
- Timestamp
- IP address
- User agent (browser/device)
- Exchange amount
- Success/failure status
- Detailed reason for failures

**Storage:**
- `wallet_audit_log` table
- Automatically retained for 90 days
- Can be extended if needed

---

### 6. **Fraud Detection** 🕵️
**Purpose:** Identify and flag suspicious behavior patterns

**Risk Factors Monitored:**

| Risk Factor | Points Added | Threshold |
|------------|--------------|-----------|
| High value exchange (≥2000 points) | +20 | Suspicious at 50+ |
| Rapid successive exchanges (2+ in 1 min) | +30 | Suspicious at 50+ |
| New account (<24 hours old) | +25 | Suspicious at 50+ |
| Multiple IP addresses (>3 different IPs) | +15 | Suspicious at 50+ |

**Risk Score System:**
- 0-25: Low risk (green)
- 26-49: Medium risk (yellow) - logged but allowed
- 50+: High risk (red) - logged, currently allowed but flagged

**Actions Taken:**
- All suspicious activity logged in audit log
- Currently allows transactions but flags them
- Admin can review suspicious activity via SQL view

---

### 7. **IP & User Agent Tracking** 🌐
**Purpose:** Detect account takeovers and unauthorized access

**Tracked Information:**
- IP address of each exchange
- User agent (browser/device)
- Timestamp of activity

**Use Cases:**
- Detect unusual location changes
- Identify bot activity
- Track compromised accounts
- Investigate fraud reports

---

### 8. **Minimum Balance Protection** 💵
**Purpose:** Prevent negative balances and exploitation

**Implementation:**
- Validates user has sufficient points BEFORE exchange
- Double-checks balance calculation
- Rejects if resulting balance would be negative

---

## Database Tables

### `wallets`
Stores user NADA point balances
```sql
- id (UUID)
- user_id (UUID) → Links to auth.users
- nada_points (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### `wallet_transactions`
Records all exchange transactions
```sql
- id (UUID)
- user_id (UUID)
- transaction_type (TEXT) → 'exchange', 'purchase', 'reward'
- amount (INTEGER) → NADA points gained/spent
- balance_after (INTEGER)
- description (TEXT)
- created_at (TIMESTAMP)
```

### `wallet_audit_log`
Security audit trail
```sql
- id (UUID)
- user_id (UUID)
- action (TEXT) → 'exchange_success', 'rate_limit_hit', etc.
- details (JSONB) → Additional context
- ip_address (TEXT)
- user_agent (TEXT)
- success (BOOLEAN)
- timestamp (TIMESTAMP)
```

---

## Admin Monitoring

### Suspicious Activity View
```sql
SELECT * FROM suspicious_wallet_activity;
```

Shows users with:
- 3+ failed attempts in last 24 hours
- Includes user ID, nickname, attempt details

### Recent Exchanges Query
```sql
SELECT 
  u.nickname,
  w.nada_points,
  COUNT(t.id) as total_exchanges,
  SUM(t.amount) as total_nada_earned
FROM wallets w
JOIN user_progress u ON w.user_id = u.user_id
JOIN wallet_transactions t ON w.user_id = t.user_id
WHERE t.created_at > NOW() - INTERVAL '7 days'
GROUP BY u.nickname, w.nada_points
ORDER BY total_nada_earned DESC;
```

### Audit Log Review
```sql
SELECT 
  action,
  COUNT(*) as occurrences,
  COUNT(CASE WHEN success = false THEN 1 END) as failures
FROM wallet_audit_log
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY action
ORDER BY occurrences DESC;
```

---

## Security Best Practices

### ✅ Implemented
- [x] Rate limiting
- [x] Daily limits
- [x] Comprehensive audit logging
- [x] Fraud detection
- [x] IP tracking
- [x] User agent tracking
- [x] Minimum balance validation
- [x] Transaction atomicity
- [x] Input validation
- [x] Authentication required

### 🔮 Future Enhancements
- [ ] Email notifications for suspicious activity
- [ ] Two-factor authentication for large exchanges
- [ ] Automated account freezing on high-risk activity
- [ ] Machine learning fraud detection
- [ ] Geolocation-based restrictions
- [ ] Withdrawal verification (when spending is added)
- [ ] Real-time security dashboard
- [ ] Webhook notifications for admins

---

## Error Messages

### User-Friendly Messages
- ✅ "Invalid exchange amount. Must be a multiple of 50."
- ✅ "Not enough points"
- ⏳ "Rate limit exceeded. Maximum 5 exchanges per 5 minutes."
- ⏳ "Daily exchange limit reached. Maximum 10 exchanges per day."
- 💰 "Maximum single exchange is 5000 points."

### Admin/Log Messages
- Detailed error context
- Stack traces for unexpected errors
- Full audit trail with IP/User Agent

---

## Testing Security Features

### Test Rate Limiting
1. Make 5 exchanges within 5 minutes
2. 6th attempt should fail with rate limit error
3. Wait 5 minutes, should work again

### Test Daily Limit
1. Make 10 exchanges in one day
2. 11th attempt should fail with daily limit error
3. Wait until next day (UTC), should reset

### Test Maximum Exchange
1. Try to exchange 5001 points
2. Should fail with max exchange error

### Test Fraud Detection
1. Create new account
2. Make high-value exchange (2000+ points)
3. Check audit log for suspicious activity flag

---

## Maintenance

### Audit Log Cleanup
Runs automatically via database function:
```sql
SELECT cleanup_old_audit_logs();
```
- Deletes logs older than 90 days
- Can be scheduled via pg_cron or manually

### Monitoring Queries
Check system health daily:
```sql
-- Failed exchanges in last 24 hours
SELECT COUNT(*) FROM wallet_audit_log 
WHERE success = false 
AND timestamp > NOW() - INTERVAL '24 hours';

-- Suspicious activity count
SELECT COUNT(*) FROM suspicious_wallet_activity;
```

---

## Security Incident Response

### If Suspicious Activity Detected:
1. Review `wallet_audit_log` for user
2. Check `wallet_transactions` for pattern
3. Verify IP addresses and locations
4. Check user agent changes
5. Review account age and activity
6. Consider temporary account freeze if necessary

### If Rate Limit Abuse:
1. Already handled automatically
2. Review logs for patterns
3. Consider increasing limits if legitimate use

### If Fraud Confirmed:
1. Review all transactions
2. Calculate total NADA gained fraudulently
3. Adjust wallet balance
4. Consider account suspension
5. Document incident in separate log

---

## Contact & Support

For security concerns or questions:
- Check audit logs first
- Review this documentation
- Contact system administrator
- Report critical issues immediately

**Remember:** Security is an ongoing process. Regular monitoring and updates are essential!
