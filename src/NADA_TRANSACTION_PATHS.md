# 🌊 NADA Transaction System - Complete Audit

## Overview
This document maps ALL transaction paths in the NADA wallet system and ensures every database column exists.

---

## 📊 Database Tables

### 1. `wallets` Table
Stores user NADA balances.

**Required Columns:**
- `id` - UUID, Primary Key
- `user_id` - UUID, Unique, Foreign Key to auth.users
- `nada_points` - INTEGER, Current NADA balance
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

**Indexes:**
- `idx_wallets_user_id` - Fast user lookup
- `idx_wallets_nada_points` - Leaderboard queries

---

### 2. `wallet_transactions` Table
Records ALL NADA transactions for complete audit trail.

**Required Columns:**
| Column | Type | Required | Used In | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | Yes | All | Primary Key |
| `user_id` | UUID | Yes | All | Foreign Key to auth.users |
| `transaction_type` | TEXT | Yes | All | 'exchange', 'market_unlock', 'admin_refund' |
| `amount` | INTEGER | Yes | All | NADA change (+ credit, - debit) |
| `balance_after` | INTEGER | Yes | All | NADA balance after transaction |
| `description` | TEXT | No | All | Human-readable description |
| `ip_address` | TEXT | No | All | User IP for security |
| `points_exchanged` | INTEGER | No | Exchange | App points converted to NADA |
| `nada_received` | INTEGER | No | Exchange | NADA received from exchange |
| `risk_score` | INTEGER | No | Exchange | Fraud detection score (0-100) |
| `created_at` | TIMESTAMP | Yes | All | Transaction timestamp |

**Indexes:**
- `idx_wallet_transactions_user_id` - User transaction history
- `idx_wallet_transactions_type` - Filter by type
- `idx_wallet_transactions_created_at` - Time-based queries
- `idx_wallet_transactions_user_created` - Composite for user history

---

### 3. `user_progress` Table
Tracks feature unlocks.

**New Column:**
- `market_unlocked` - BOOLEAN, Default FALSE - Community Market access

**Index:**
- `idx_user_progress_market_unlocked` - Quick unlock checks

---

## 🔄 Transaction Paths

### PATH 1: Exchange Points for NADA
**Endpoint:** `/make-server-053bcd80/exchange-points`  
**Method:** POST  
**Rate Limit:** 3 exchanges per 5 minutes, 10 per day  
**Conversion:** 50 app points = 1 NADA

**Transaction Record:**
```javascript
{
  user_id: userId,
  transaction_type: 'exchange',
  amount: nadaPointsGained,              // Positive (e.g., +2)
  balance_after: newNadaPoints,          // e.g., 12
  points_exchanged: pointsToExchange,    // e.g., 100
  nada_received: nadaPointsGained,       // e.g., 2
  ip_address: ipAddress,
  risk_score: fraudCheck.riskScore,      // 0-100
  description: `Exchanged ${pointsToExchange} points for ${nadaPointsGained} NADA`
}
```

**Database Changes:**
1. ✅ Deduct points from `user_progress.points`
2. ✅ Add NADA to `wallets.nada_points`
3. ✅ Insert transaction into `wallet_transactions`
4. ✅ Create audit log in `wallet_audit_logs`

**Security Checks:**
- Rate limiting (5min & daily)
- Fraud detection (risk scoring)
- Transaction history validation
- HMAC signature verification

---

### PATH 2: Unlock Community Market (Spend NADA)
**Endpoint:** `/make-server-053bcd80/unlock-market`  
**Method:** POST  
**Cost:** 10 NADA  
**One-time:** Cannot unlock twice

**Transaction Record:**
```javascript
{
  user_id: userId,
  transaction_type: 'market_unlock',
  amount: -10,                           // Negative (spending)
  balance_after: newNadaPoints,          // e.g., 0 (if had 10)
  description: 'Unlocked Community Market for 10 NADA',
  ip_address: ipAddress
}
```

**Database Changes:**
1. ✅ Check `user_progress.market_unlocked` is FALSE
2. ✅ Check `wallets.nada_points >= 10`
3. ✅ Deduct 10 from `wallets.nada_points`
4. ✅ Set `user_progress.market_unlocked = TRUE`
5. ✅ Insert transaction into `wallet_transactions`

**Validation:**
- User must have at least 10 NADA
- Market must not already be unlocked
- Transaction is atomic (both wallet & progress update)

---

### PATH 3: Admin Refund NADA
**Endpoint:** `/make-server-053bcd80/admin/refund-nada`  
**Method:** POST  
**Auth:** Admin only (ADMIN_USER_ID check)

**Transaction Record:**
```javascript
{
  user_id: userId,
  transaction_type: 'admin_refund',
  amount: amount,                        // Positive (refund)
  balance_after: newNadaPoints,
  description: `Admin refund: ${reason || 'Manual refund'}`,
  ip_address: ipAddress
}
```

**Database Changes:**
1. ✅ Add NADA to `wallets.nada_points`
2. ✅ Insert transaction into `wallet_transactions`

---

## 📈 NADA Tracker Features

### Admin Dashboard Tab
**Location:** Admin Dashboard → NADA Tracker Card

**Features:**
1. **4 Stats Cards:**
   - Total NADA Exchanged (all-time)
   - Total NADA Spent (all-time)
   - Market Unlocks Count
   - Unique Users with Transactions

2. **Transaction Table:**
   - Search by user, email, or description
   - Filter by type (All, Exchange, Market Unlock)
   - Shows: Date, User, Type, Amount, Balance After, Description, IP
   - Real-time refresh
   - CSV Export

3. **Refund System:**
   - Admin can refund NADA to any user
   - Requires reason/description
   - Creates audit trail

---

## 🚀 Deployment Steps

### 1. Run SQL Setup (Required)
```bash
# In Supabase SQL Editor, run:
/sql-migrations/complete-nada-system-setup.sql
```

This will:
- ✅ Create `wallets` table (if missing)
- ✅ Add `nada_points` column (if missing)
- ✅ Create `wallet_transactions` table (if missing)
- ✅ Add ALL transaction columns (idempotent)
- ✅ Add `market_unlocked` to `user_progress`
- ✅ Create all indexes
- ✅ Verify structure

### 2. Test Transaction Paths (Optional but Recommended)
```bash
# Update YOUR_USER_ID in the file, then run:
/sql-migrations/test-nada-transactions.sql
```

This will:
- Test exchange transaction insert
- Test market unlock transaction insert
- Test admin refund transaction insert
- Verify all columns exist
- Check for missing data

### 3. Deploy Supabase
```bash
# Deploy server changes
supabase functions deploy
```

### 4. Test in App
1. Go to Home → Exchange points for NADA
2. Check Admin Dashboard → NADA Tracker
3. Try unlocking Community Market
4. Verify transaction appears in tracker

---

## 🔍 Troubleshooting

### Issue: Transaction not appearing in NADA Tracker

**Check 1:** Does the transaction exist in database?
```sql
SELECT * FROM wallet_transactions 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC;
```

**Check 2:** Are all columns present?
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'wallet_transactions'
ORDER BY ordinal_position;
```

**Check 3:** Check server logs for insert errors
Look for: `WARNING: Failed to create transaction record`

**Fix:** Run `complete-nada-system-setup.sql`

---

### Issue: Market unlock deducted NADA but didn't unlock

**Symptoms:**
- NADA balance decreased by 10
- `market_unlocked` still FALSE
- Transaction may or may not be recorded

**Root Cause:**
- `market_unlocked` column didn't exist
- Transaction succeeded but progress update failed

**Fix:**
```sql
-- 1. Add the column
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS market_unlocked BOOLEAN DEFAULT FALSE;

-- 2. Check if you have a failed transaction
SELECT * FROM wallet_transactions 
WHERE user_id = 'YOUR_USER_ID' 
  AND transaction_type = 'market_unlock';

-- 3. If transaction exists but market not unlocked:
UPDATE user_progress 
SET market_unlocked = TRUE 
WHERE user_id = 'YOUR_USER_ID';

-- 4. If no transaction but NADA was deducted, refund:
-- Use admin refund endpoint or manual SQL
```

---

## 📝 Column Checklist

Before trying market unlock again, verify:

- [ ] `wallets.nada_points` exists
- [ ] `wallet_transactions` table exists
- [ ] `wallet_transactions.user_id` exists
- [ ] `wallet_transactions.transaction_type` exists
- [ ] `wallet_transactions.amount` exists
- [ ] `wallet_transactions.balance_after` exists
- [ ] `wallet_transactions.description` exists
- [ ] `wallet_transactions.ip_address` exists
- [ ] `wallet_transactions.points_exchanged` exists (nullable)
- [ ] `wallet_transactions.nada_received` exists (nullable)
- [ ] `wallet_transactions.risk_score` exists (nullable)
- [ ] `user_progress.market_unlocked` exists

**Quick Check:**
```sql
-- Run this to verify everything:
SELECT 'wallets.nada_points' as check_name, 
  EXISTS(
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wallets' AND column_name = 'nada_points'
  ) as exists
UNION ALL
SELECT 'wallet_transactions table', 
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'wallet_transactions')
UNION ALL
SELECT 'user_progress.market_unlocked',
  EXISTS(
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_progress' AND column_name = 'market_unlocked'
  );
```

---

## ✅ Ready to Go!

Once you've run `complete-nada-system-setup.sql`, all paths will work:
1. ✅ Exchange points → NADA (tracked)
2. ✅ Unlock market → Spend NADA (tracked)
3. ✅ Admin refund → Add NADA (tracked)
4. ✅ NADA Tracker → View all transactions
5. ✅ CSV Export → Download history

Every transaction will be recorded in `wallet_transactions` with full audit trail! 🌊✨
