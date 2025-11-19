-- =====================================================
-- STEP-BY-STEP CHECK
-- Copy each section one at a time and replace values
-- =====================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 1: Get your user ID
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Replace 'your.email@example.com' with your actual email

SELECT 
  'Your User ID →' as info,
  id as copy_this_value,
  email
FROM auth.users 
WHERE email = 'your.email@example.com'
LIMIT 1;

-- Copy the 'copy_this_value' from the result above!


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 2: Check if all tables/columns exist
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Just run this as-is (no changes needed)

SELECT 'Table/Column Check' as test_name, 
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'nada_points')
    THEN '✅ wallets.nada_points exists'
    ELSE '❌ wallets.nada_points MISSING'
  END as result
UNION ALL
SELECT 'Table/Column Check',
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'user_progress' AND column_name = 'market_unlocked')
    THEN '✅ user_progress.market_unlocked exists'
    ELSE '❌ user_progress.market_unlocked MISSING'
  END
UNION ALL
SELECT 'Table/Column Check',
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'wallet_transactions')
    THEN '✅ wallet_transactions table exists'
    ELSE '❌ wallet_transactions table MISSING'
  END;

-- If any show ❌, run complete-nada-system-setup.sql first!


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 3: Check your NADA balance
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Paste your user ID from STEP 1 below (replace PASTE_HERE)

SELECT 
  nada_points as your_nada_balance,
  CASE 
    WHEN nada_points >= 10 THEN '✅ You have enough NADA'
    ELSE '❌ Need ' || (10 - nada_points) || ' more NADA'
  END as can_unlock
FROM wallets 
WHERE user_id = 'PASTE_HERE';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 4: Check if market is already unlocked
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Paste your user ID from STEP 1 below (replace PASTE_HERE)

SELECT 
  CASE 
    WHEN market_unlocked THEN '⚠️ Market is ALREADY unlocked'
    ELSE '✅ Market is locked (ready to unlock)'
  END as market_status
FROM user_progress
WHERE user_id = 'PASTE_HERE';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 5: Check recent transactions
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Paste your user ID from STEP 1 below (replace PASTE_HERE)

SELECT 
  created_at,
  transaction_type,
  amount as nada_change,
  balance_after,
  description
FROM wallet_transactions
WHERE user_id = 'PASTE_HERE'
ORDER BY created_at DESC
LIMIT 5;

-- If this returns nothing, that's okay - means no transactions yet


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FINAL VERDICT
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Paste your user ID from STEP 1 below (replace PASTE_HERE)

SELECT 
  CASE 
    WHEN w.nada_points >= 10 
      AND NOT COALESCE(up.market_unlocked, false)
      AND EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions')
    THEN '🎉 ALL GOOD - READY TO UNLOCK MARKET!'
    
    WHEN w.nada_points < 10 
    THEN '❌ NOT READY - Need ' || (10 - w.nada_points) || ' more NADA'
    
    WHEN up.market_unlocked 
    THEN '⚠️ NOT READY - Market already unlocked'
    
    ELSE '❌ NOT READY - Database missing tables/columns'
  END as final_verdict
FROM wallets w
LEFT JOIN user_progress up ON w.user_id = up.user_id
WHERE w.user_id = 'PASTE_HERE';
