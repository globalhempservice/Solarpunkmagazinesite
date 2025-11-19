-- =====================================================
-- PRE-MARKET-UNLOCK VERIFICATION
-- Run this BEFORE attempting to unlock market
-- Replace YOUR_USER_ID with your actual user ID
-- =====================================================

\echo '🔍 NADA System Verification Starting...'
\echo ''

-- =====================================================
-- 1. CHECK ALL REQUIRED COLUMNS EXIST
-- =====================================================

\echo '📋 Checking required columns...'
\echo ''

-- Wallets table
SELECT 
  'wallets.nada_points' as column_check,
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'wallets' AND column_name = 'nada_points'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING - Run complete-nada-system-setup.sql'
  END as status;

-- User progress market_unlocked
SELECT 
  'user_progress.market_unlocked' as column_check,
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_progress' AND column_name = 'market_unlocked'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING - Run complete-nada-system-setup.sql'
  END as status;

-- Wallet transactions table
SELECT 
  'wallet_transactions table' as column_check,
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'wallet_transactions'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING - Run complete-nada-system-setup.sql'
  END as status;

-- Check wallet_transactions has all required columns
WITH required_columns AS (
  SELECT unnest(ARRAY[
    'user_id', 'transaction_type', 'amount', 'balance_after', 
    'description', 'ip_address', 'points_exchanged', 
    'nada_received', 'risk_score', 'created_at'
  ]) as col_name
),
existing_columns AS (
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_name = 'wallet_transactions'
)
SELECT 
  'wallet_transactions.' || rc.col_name as column_check,
  CASE 
    WHEN ec.column_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING - Run complete-nada-system-setup.sql'
  END as status
FROM required_columns rc
LEFT JOIN existing_columns ec ON rc.col_name = ec.column_name
ORDER BY rc.col_name;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- =====================================================
-- 2. CHECK YOUR CURRENT STATE
-- =====================================================

\echo '👤 Your Current State:'
\echo ''

-- Replace with your user ID
\set USER_ID 'YOUR_USER_ID_HERE'

-- Your wallet balance
SELECT 
  '💰 NADA Balance' as info,
  COALESCE(nada_points, 0) as value,
  CASE 
    WHEN nada_points >= 10 THEN '✅ Sufficient for market unlock'
    ELSE '❌ Need more NADA (requires 10)'
  END as status
FROM wallets 
WHERE user_id = :'USER_ID';

-- Market unlock status
SELECT 
  '🏪 Market Status' as info,
  CASE 
    WHEN market_unlocked THEN 'Already unlocked'
    ELSE 'Locked (can unlock)'
  END as value,
  CASE 
    WHEN market_unlocked THEN '⚠️  Already unlocked - cannot unlock again'
    ELSE '✅ Ready to unlock'
  END as status
FROM user_progress
WHERE user_id = :'USER_ID';

-- Your app points
SELECT 
  '⚡ App Points' as info,
  COALESCE(points, 0) as value,
  CASE 
    WHEN points >= 50 THEN '✅ Can exchange for more NADA'
    ELSE 'Need more points'
  END as status
FROM user_progress
WHERE user_id = :'USER_ID';

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- =====================================================
-- 3. CHECK TRANSACTION HISTORY
-- =====================================================

\echo '📊 Your Transaction History (Last 5):'
\echo ''

SELECT 
  to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') as when,
  transaction_type as type,
  amount as nada_change,
  balance_after as balance,
  COALESCE(description, 
    CASE 
      WHEN transaction_type = 'exchange' THEN 
        'Exchange: ' || COALESCE(points_exchanged::text, '?') || ' pts → ' || 
        COALESCE(nada_received::text, '?') || ' NADA'
      ELSE ''
    END
  ) as description
FROM wallet_transactions
WHERE user_id = :'USER_ID'
ORDER BY created_at DESC
LIMIT 5;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- =====================================================
-- 4. FINAL GO/NO-GO DECISION
-- =====================================================

\echo '🎯 Market Unlock Ready Check:'
\echo ''

WITH checks AS (
  SELECT 
    -- Check 1: Has enough NADA
    CASE WHEN w.nada_points >= 10 THEN 1 ELSE 0 END as has_nada,
    
    -- Check 2: Market not already unlocked
    CASE WHEN NOT COALESCE(up.market_unlocked, false) THEN 1 ELSE 0 END as not_unlocked,
    
    -- Check 3: market_unlocked column exists
    CASE WHEN EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_progress' AND column_name = 'market_unlocked'
    ) THEN 1 ELSE 0 END as column_exists,
    
    -- Check 4: wallet_transactions table exists
    CASE WHEN EXISTS(
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'wallet_transactions'
    ) THEN 1 ELSE 0 END as table_exists,
    
    w.nada_points,
    COALESCE(up.market_unlocked, false) as is_unlocked
    
  FROM wallets w
  LEFT JOIN user_progress up ON w.user_id = up.user_id
  WHERE w.user_id = :'USER_ID'
)
SELECT 
  '✓ Sufficient NADA (>=10)' as check_name,
  CASE WHEN has_nada = 1 THEN '✅ PASS (' || nada_points || ' NADA)' 
       ELSE '❌ FAIL (only ' || nada_points || ' NADA)' END as result
FROM checks
UNION ALL
SELECT 
  '✓ Market not unlocked',
  CASE WHEN not_unlocked = 1 THEN '✅ PASS' 
       ELSE '❌ FAIL (already unlocked)' END
FROM checks
UNION ALL
SELECT 
  '✓ market_unlocked column exists',
  CASE WHEN column_exists = 1 THEN '✅ PASS' 
       ELSE '❌ FAIL (run SQL setup)' END
FROM checks
UNION ALL
SELECT 
  '✓ wallet_transactions table exists',
  CASE WHEN table_exists = 1 THEN '✅ PASS' 
       ELSE '❌ FAIL (run SQL setup)' END
FROM checks;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Final verdict
WITH checks AS (
  SELECT 
    CASE WHEN w.nada_points >= 10 THEN 1 ELSE 0 END as has_nada,
    CASE WHEN NOT COALESCE(up.market_unlocked, false) THEN 1 ELSE 0 END as not_unlocked,
    CASE WHEN EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_progress' AND column_name = 'market_unlocked'
    ) THEN 1 ELSE 0 END as column_exists,
    CASE WHEN EXISTS(
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'wallet_transactions'
    ) THEN 1 ELSE 0 END as table_exists
  FROM wallets w
  LEFT JOIN user_progress up ON w.user_id = up.user_id
  WHERE w.user_id = :'USER_ID'
)
SELECT 
  CASE 
    WHEN has_nada + not_unlocked + column_exists + table_exists = 4 THEN 
      '🎉 ALL CHECKS PASSED - READY TO UNLOCK MARKET! 🎉'
    ELSE 
      '⚠️  SOME CHECKS FAILED - DO NOT UNLOCK YET ⚠️'
  END as final_verdict
FROM checks;

\echo ''
\echo '💡 Next Steps:'
\echo '  - If all checks passed: Go ahead and unlock the market!'
\echo '  - If any checks failed: Run complete-nada-system-setup.sql first'
\echo ''
