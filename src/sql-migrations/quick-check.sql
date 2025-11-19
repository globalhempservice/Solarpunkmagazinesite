-- =====================================================
-- QUICK CHECK - Supabase Compatible
-- Just the essentials - copy/paste friendly
-- =====================================================

-- Step 1: Find your user ID (replace with your email)
SELECT 
  'Your User ID:' as info,
  id as user_id,
  email
FROM auth.users 
WHERE email = 'your.email@example.com'  -- ⚠️ REPLACE THIS WITH YOUR EMAIL
LIMIT 1;

-- Copy the user_id from above and paste it below in all the 'PASTE_USER_ID_HERE' spots


-- Step 2: Check all required columns exist
SELECT 
  'Column Check' as test,
  column_name,
  CASE 
    WHEN table_name = 'wallets' AND column_name = 'nada_points' THEN '✅'
    WHEN table_name = 'user_progress' AND column_name = 'market_unlocked' THEN '✅'
    WHEN table_name = 'wallet_transactions' THEN '✅'
    ELSE '❌'
  END as status
FROM information_schema.columns
WHERE 
  (table_name = 'wallets' AND column_name = 'nada_points')
  OR (table_name = 'user_progress' AND column_name = 'market_unlocked')
  OR (table_name = 'wallet_transactions' AND column_name IN ('user_id', 'amount', 'balance_after', 'description'));


-- Step 3: Your current NADA balance
SELECT 
  '💰 Your NADA' as what,
  nada_points as amount,
  CASE WHEN nada_points >= 10 THEN '✅ Can unlock market' ELSE '❌ Need more' END as status
FROM wallets 
WHERE user_id = 'PASTE_USER_ID_HERE';  -- ⚠️ PASTE YOUR USER ID


-- Step 4: Market unlock status
SELECT 
  '🏪 Market Status' as what,
  CASE WHEN market_unlocked THEN '✅ Already unlocked' ELSE '🔒 Locked (can unlock)' END as status,
  CASE WHEN market_unlocked THEN 'No action needed' ELSE 'Ready to unlock for 10 NADA' END as action
FROM user_progress
WHERE user_id = 'PASTE_USER_ID_HERE';  -- ⚠️ PASTE YOUR USER ID


-- Step 5: Recent transactions
SELECT 
  'Recent Transactions' as info,
  to_char(created_at, 'MM/DD HH24:MI') as when,
  transaction_type as type,
  amount as nada_change,
  balance_after as balance
FROM wallet_transactions
WHERE user_id = 'PASTE_USER_ID_HERE'  -- ⚠️ PASTE YOUR USER ID
ORDER BY created_at DESC
LIMIT 5;


-- Step 6: Final GO/NO-GO
SELECT 
  CASE 
    WHEN w.nada_points >= 10 
      AND NOT COALESCE(up.market_unlocked, false)
      AND EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'user_progress' AND column_name = 'market_unlocked')
    THEN '🎉 READY TO UNLOCK MARKET!'
    WHEN w.nada_points < 10 THEN '❌ Need more NADA (have ' || w.nada_points || ', need 10)'
    WHEN up.market_unlocked THEN '⚠️ Market already unlocked'
    ELSE '❌ Database not ready - run complete-nada-system-setup.sql'
  END as verdict
FROM wallets w
LEFT JOIN user_progress up ON w.user_id = up.user_id
WHERE w.user_id = 'PASTE_USER_ID_HERE';  -- ⚠️ PASTE YOUR USER ID
