-- =====================================================
-- COMPLETE NADA SYSTEM SETUP
-- Ensures all tables and columns exist for NADA tracking
-- =====================================================

-- =====================================================
-- 1. WALLETS TABLE
-- =====================================================

-- Create wallets table if it doesn't exist
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  nada_points INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add nada_points column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wallets' AND column_name = 'nada_points'
  ) THEN
    ALTER TABLE wallets ADD COLUMN nada_points INTEGER DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- Create index on nada_points for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_wallets_nada_points ON wallets(nada_points DESC);


-- =====================================================
-- 2. WALLET_TRANSACTIONS TABLE
-- =====================================================

-- Create wallet_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  ip_address TEXT,
  points_exchanged INTEGER,
  nada_received INTEGER,
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT wallet_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add all columns if they don't exist (idempotent)
DO $$ 
BEGIN
  -- user_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wallet_transactions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE wallet_transactions ADD COLUMN user_id UUID NOT NULL;
  END IF;

  -- transaction_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wallet_transactions' AND column_name = 'transaction_type'
  ) THEN
    ALTER TABLE wallet_transactions ADD COLUMN transaction_type TEXT NOT NULL;
  END IF;

  -- amount
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wallet_transactions' AND column_name = 'amount'
  ) THEN
    ALTER TABLE wallet_transactions ADD COLUMN amount INTEGER NOT NULL;
  END IF;

  -- balance_after
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wallet_transactions' AND column_name = 'balance_after'
  ) THEN
    ALTER TABLE wallet_transactions ADD COLUMN balance_after INTEGER NOT NULL;
  END IF;

  -- description (nullable)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wallet_transactions' AND column_name = 'description'
  ) THEN
    ALTER TABLE wallet_transactions ADD COLUMN description TEXT;
  END IF;

  -- ip_address (nullable)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wallet_transactions' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE wallet_transactions ADD COLUMN ip_address TEXT;
  END IF;

  -- points_exchanged (nullable, for exchange transactions)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wallet_transactions' AND column_name = 'points_exchanged'
  ) THEN
    ALTER TABLE wallet_transactions ADD COLUMN points_exchanged INTEGER;
  END IF;

  -- nada_received (nullable, for exchange transactions)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wallet_transactions' AND column_name = 'nada_received'
  ) THEN
    ALTER TABLE wallet_transactions ADD COLUMN nada_received INTEGER;
  END IF;

  -- risk_score (nullable, for security tracking)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wallet_transactions' AND column_name = 'risk_score'
  ) THEN
    ALTER TABLE wallet_transactions ADD COLUMN risk_score INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_created ON wallet_transactions(user_id, created_at DESC);


-- =====================================================
-- 3. USER_PROGRESS TABLE - Add market_unlocked column
-- =====================================================

-- Add market_unlocked column to user_progress table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_progress' AND column_name = 'market_unlocked'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN market_unlocked BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create index for market_unlocked queries
CREATE INDEX IF NOT EXISTS idx_user_progress_market_unlocked ON user_progress(market_unlocked);


-- =====================================================
-- 4. VERIFICATION QUERIES
-- =====================================================

-- Check wallets table structure
SELECT 
  'wallets' as table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'wallets'
ORDER BY ordinal_position;

-- Check wallet_transactions table structure
SELECT 
  'wallet_transactions' as table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'wallet_transactions'
ORDER BY ordinal_position;

-- Check user_progress market_unlocked column
SELECT 
  'user_progress' as table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_progress' AND column_name = 'market_unlocked';

-- Show indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('wallets', 'wallet_transactions', 'user_progress')
  AND schemaname = 'public'
ORDER BY tablename, indexname;


-- =====================================================
-- 5. TRANSACTION TYPE REFERENCE
-- =====================================================

-- For documentation: Transaction types we support
COMMENT ON TABLE wallet_transactions IS 'Tracks all NADA wallet transactions';
COMMENT ON COLUMN wallet_transactions.transaction_type IS 'Types: exchange, market_unlock, admin_refund';
COMMENT ON COLUMN wallet_transactions.amount IS 'NADA amount (positive for credit, negative for debit)';
COMMENT ON COLUMN wallet_transactions.points_exchanged IS 'Used for exchange type: app points converted';
COMMENT ON COLUMN wallet_transactions.nada_received IS 'Used for exchange type: NADA points received';
COMMENT ON COLUMN wallet_transactions.description IS 'Used for market_unlock and admin_refund types';
COMMENT ON COLUMN wallet_transactions.risk_score IS 'Security risk score (0-100)';
