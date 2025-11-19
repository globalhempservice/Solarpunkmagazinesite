-- =====================================================
-- QUICK CHECK: Your NADA Status
-- Run this anytime to see your current NADA state
-- =====================================================

-- Find your user ID by email
SELECT 
  '👤 Your User ID' as info,
  id as value
FROM auth.users 
WHERE email = 'your.email@example.com'  -- Replace with your email
LIMIT 1;

-- OR if you know your user ID, set it here:
-- \set USER_ID 'paste-your-user-id-here'

-- Then run the rest:

-- Your current NADA balance
SELECT 
  '💰 Current NADA Balance' as what,
  COALESCE(nada_points, 0) as amount,
  'in wallet' as where
FROM wallets 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your.email@example.com' LIMIT 1);

-- Your app points (can exchange for NADA)
SELECT 
  '⚡ App Points' as what,
  COALESCE(points, 0) as amount,
  CASE 
    WHEN points >= 50 THEN '(' || (points / 50) || ' NADA if exchanged)'
    ELSE '(need 50 for 1 NADA)'
  END as where
FROM user_progress
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your.email@example.com' LIMIT 1);

-- Market unlock status
SELECT 
  '🏪 Community Market' as what,
  CASE 
    WHEN market_unlocked THEN 'UNLOCKED ✅'
    ELSE 'LOCKED 🔒'
  END as amount,
  CASE 
    WHEN market_unlocked THEN 'Access granted'
    ELSE 'Costs 10 NADA to unlock'
  END as where
FROM user_progress
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your.email@example.com' LIMIT 1);

-- Recent NADA activity (last 5 transactions)
SELECT 
  to_char(created_at, 'MM/DD HH24:MI') as when,
  transaction_type as type,
  CASE 
    WHEN amount > 0 THEN '+' || amount::text
    ELSE amount::text
  END as change,
  balance_after as balance,
  COALESCE(
    LEFT(description, 40),
    CASE 
      WHEN transaction_type = 'exchange' THEN 
        points_exchanged::text || ' pts → ' || nada_received::text || ' NADA'
      ELSE transaction_type
    END
  ) as what_happened
FROM wallet_transactions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your.email@example.com' LIMIT 1)
ORDER BY created_at DESC
LIMIT 5;
