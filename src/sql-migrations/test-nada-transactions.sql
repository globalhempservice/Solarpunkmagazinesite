-- =====================================================
-- TEST NADA TRANSACTIONS - ALL PATHS
-- Run this after complete-nada-system-setup.sql
-- Replace YOUR_USER_ID with your actual user ID
-- =====================================================

-- Set your user ID here
-- Get it from: SELECT id, email FROM auth.users WHERE email = 'your.email@example.com';
\set USER_ID 'YOUR_USER_ID_HERE'

-- =====================================================
-- PRE-TEST: Check Current State
-- =====================================================

-- Your current wallet balance
SELECT 
  user_id,
  nada_points as current_nada,
  created_at,
  updated_at
FROM wallets 
WHERE user_id = :'USER_ID';

-- Your current progress (including market_unlocked)
SELECT 
  user_id,
  points as app_points,
  total_articles_read,
  market_unlocked
FROM user_progress
WHERE user_id = :'USER_ID';

-- Your transaction history
SELECT 
  id,
  transaction_type,
  amount,
  balance_after,
  description,
  points_exchanged,
  nada_received,
  risk_score,
  created_at
FROM wallet_transactions
WHERE user_id = :'USER_ID'
ORDER BY created_at DESC
LIMIT 10;


-- =====================================================
-- TEST 1: Exchange Transaction
-- =====================================================
-- This simulates what happens when you exchange 50 points for 1 NADA
-- Fields used:
--   - user_id
--   - transaction_type: 'exchange'
--   - amount: (positive, NADA gained)
--   - balance_after
--   - points_exchanged
--   - nada_received
--   - ip_address
--   - risk_score
--   - description

INSERT INTO wallet_transactions (
  user_id,
  transaction_type,
  amount,
  balance_after,
  points_exchanged,
  nada_received,
  ip_address,
  risk_score,
  description
) VALUES (
  :'USER_ID',
  'exchange',
  1,  -- 1 NADA gained
  (SELECT nada_points + 1 FROM wallets WHERE user_id = :'USER_ID'),
  50,  -- 50 points exchanged
  1,   -- 1 NADA received
  'test-script',
  0,   -- no risk
  'TEST: Exchanged 50 points for 1 NADA'
);


-- =====================================================
-- TEST 2: Market Unlock Transaction
-- =====================================================
-- This simulates what happens when you spend 10 NADA to unlock market
-- Fields used:
--   - user_id
--   - transaction_type: 'market_unlock'
--   - amount: (negative, NADA spent)
--   - balance_after
--   - description
--   - ip_address

INSERT INTO wallet_transactions (
  user_id,
  transaction_type,
  amount,
  balance_after,
  description,
  ip_address
) VALUES (
  :'USER_ID',
  'market_unlock',
  -10,  -- 10 NADA spent
  (SELECT nada_points - 10 FROM wallets WHERE user_id = :'USER_ID'),
  'TEST: Unlocked Community Market for 10 NADA',
  'test-script'
);


-- =====================================================
-- TEST 3: Admin Refund Transaction
-- =====================================================
-- This simulates what happens when admin refunds NADA
-- Fields used:
--   - user_id
--   - transaction_type: 'admin_refund'
--   - amount: (positive, NADA refunded)
--   - balance_after
--   - description
--   - ip_address

INSERT INTO wallet_transactions (
  user_id,
  transaction_type,
  amount,
  balance_after,
  description,
  ip_address
) VALUES (
  :'USER_ID',
  'admin_refund',
  10,  -- 10 NADA refunded
  (SELECT nada_points + 10 FROM wallets WHERE user_id = :'USER_ID'),
  'TEST: Admin refund - Testing transaction system',
  'test-script'
);


-- =====================================================
-- POST-TEST: Verify All Transactions Were Recorded
-- =====================================================

-- Check all transactions from this test
SELECT 
  id,
  transaction_type,
  amount,
  balance_after,
  description,
  points_exchanged,
  nada_received,
  risk_score,
  ip_address,
  created_at
FROM wallet_transactions
WHERE user_id = :'USER_ID'
  AND ip_address = 'test-script'
ORDER BY created_at DESC;

-- Verify transaction counts by type
SELECT 
  transaction_type,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM wallet_transactions
WHERE user_id = :'USER_ID'
GROUP BY transaction_type
ORDER BY transaction_type;

-- Check for any missing columns (should return empty)
SELECT 
  id,
  transaction_type,
  CASE 
    WHEN user_id IS NULL THEN 'Missing user_id'
    WHEN amount IS NULL THEN 'Missing amount'
    WHEN balance_after IS NULL THEN 'Missing balance_after'
    WHEN transaction_type = 'exchange' AND points_exchanged IS NULL THEN 'Missing points_exchanged'
    WHEN transaction_type = 'exchange' AND nada_received IS NULL THEN 'Missing nada_received'
    ELSE 'OK'
  END as validation_status
FROM wallet_transactions
WHERE user_id = :'USER_ID'
  AND CASE 
    WHEN user_id IS NULL THEN TRUE
    WHEN amount IS NULL THEN TRUE
    WHEN balance_after IS NULL THEN TRUE
    WHEN transaction_type = 'exchange' AND points_exchanged IS NULL THEN TRUE
    WHEN transaction_type = 'exchange' AND nada_received IS NULL THEN TRUE
    ELSE FALSE
  END;


-- =====================================================
-- CLEANUP (Optional - only if you want to remove test data)
-- =====================================================

-- UNCOMMENT BELOW TO DELETE TEST TRANSACTIONS
-- DELETE FROM wallet_transactions 
-- WHERE user_id = :'USER_ID' 
--   AND ip_address = 'test-script';


-- =====================================================
-- REAL TRANSACTION CHECK
-- =====================================================
-- Check if your real failed transaction is recorded

SELECT 
  id,
  transaction_type,
  amount,
  balance_after,
  description,
  created_at,
  ip_address
FROM wallet_transactions
WHERE user_id = :'USER_ID'
  AND transaction_type = 'market_unlock'
  AND amount = -10
ORDER BY created_at DESC
LIMIT 5;
