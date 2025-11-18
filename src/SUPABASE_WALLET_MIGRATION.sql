-- =================================================================
-- DEWII Wallet System - Database Schema Update
-- =================================================================
-- Run this SQL in your Supabase SQL Editor to add missing columns
-- to the wallet_transactions table
-- =================================================================

-- 1. Add missing columns to wallet_transactions table if they don't exist
ALTER TABLE wallet_transactions 
ADD COLUMN IF NOT EXISTS points_exchanged INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS nada_received DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'wallet_transactions'
ORDER BY ordinal_position;

-- 3. Check existing transactions to see if they have data
SELECT 
  id,
  user_id,
  transaction_type,
  amount,
  balance_after,
  points_exchanged,
  nada_received,
  ip_address,
  risk_score,
  created_at
FROM wallet_transactions
ORDER BY created_at DESC
LIMIT 10;

-- =================================================================
-- If you need to backfill data for existing transactions:
-- (Only run this if you have old transactions without the new columns)
-- =================================================================

-- Update old transactions to have proper values based on amount
-- Assuming amount = NADA received and points = amount * 50
UPDATE wallet_transactions
SET 
  nada_received = COALESCE(nada_received, amount),
  points_exchanged = COALESCE(points_exchanged, CAST(amount * 50 AS INTEGER))
WHERE 
  transaction_type = 'exchange' 
  AND (nada_received IS NULL OR nada_received = 0)
  AND amount > 0;

-- =================================================================
-- Verify the final state
-- =================================================================

-- Count total transactions
SELECT COUNT(*) as total_transactions FROM wallet_transactions;

-- Sum up all exchanges
SELECT 
  COUNT(*) as total_exchanges,
  SUM(points_exchanged) as total_points_exchanged,
  SUM(nada_received) as total_nada_generated,
  AVG(points_exchanged) as avg_points_per_exchange
FROM wallet_transactions
WHERE transaction_type = 'exchange';

-- Show recent transactions with all details
SELECT 
  id,
  user_id,
  points_exchanged,
  nada_received,
  ip_address,
  risk_score,
  created_at
FROM wallet_transactions
ORDER BY created_at DESC
LIMIT 20;
