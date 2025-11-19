-- Emergency refund script - Refund 10 NADA to user
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID

-- Step 1: Check current NADA balance
SELECT user_id, nada_points 
FROM wallets 
WHERE user_id = 'YOUR_USER_ID_HERE';

-- Step 2: Add 10 NADA back to wallet
UPDATE wallets 
SET nada_points = nada_points + 10
WHERE user_id = 'YOUR_USER_ID_HERE';

-- Step 3: Create refund transaction record
INSERT INTO wallet_transactions (
  user_id,
  transaction_type,
  amount,
  balance_after,
  description,
  ip_address
)
SELECT 
  'YOUR_USER_ID_HERE',
  'admin_refund',
  10,
  nada_points,
  'Admin refund - Market unlock column missing during initial transaction',
  'admin-console'
FROM wallets
WHERE user_id = 'YOUR_USER_ID_HERE';

-- Step 4: Verify the refund
SELECT user_id, nada_points 
FROM wallets 
WHERE user_id = 'YOUR_USER_ID_HERE';

-- Step 5: Check transaction history
SELECT *
FROM wallet_transactions
WHERE user_id = 'YOUR_USER_ID_HERE'
ORDER BY created_at DESC
LIMIT 5;
