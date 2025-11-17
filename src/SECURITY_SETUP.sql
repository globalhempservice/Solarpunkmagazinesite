-- ============================================
-- WALLET SECURITY TABLES
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create wallet_audit_log table for security tracking
CREATE TABLE IF NOT EXISTS wallet_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'exchange_attempt', 'exchange_success', 'exchange_failed', 'rate_limit_hit', etc.
  details JSONB, -- Store additional context (amount, reason, etc.)
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_audit_log_user_id ON wallet_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_audit_log_timestamp ON wallet_audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_audit_log_action ON wallet_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_wallet_audit_log_success ON wallet_audit_log(success);

-- 3. Enable Row Level Security
ALTER TABLE wallet_audit_log ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON wallet_audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert (server-side only)
-- This prevents users from faking audit logs
-- No INSERT policy needed - server uses service role

-- 5. Create function to clean old audit logs (optional - for data retention)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  -- Delete audit logs older than 90 days
  DELETE FROM wallet_audit_log
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Add index on wallet_transactions for security checks
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_created 
  ON wallet_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type 
  ON wallet_transactions(transaction_type);

-- ============================================
-- OPTIONAL: Create a view for admins to monitor suspicious activity
-- ============================================
CREATE OR REPLACE VIEW suspicious_wallet_activity AS
SELECT 
  w.user_id,
  p.nickname,
  COUNT(*) as failed_attempts,
  MAX(w.timestamp) as last_attempt,
  jsonb_agg(w.details) as attempt_details
FROM wallet_audit_log w
JOIN user_progress p ON w.user_id = p.user_id
WHERE w.success = false
  AND w.timestamp > NOW() - INTERVAL '24 hours'
GROUP BY w.user_id, p.nickname
HAVING COUNT(*) >= 3
ORDER BY failed_attempts DESC;

-- Grant access to authenticated users to view their own data
GRANT SELECT ON suspicious_wallet_activity TO authenticated;

COMMENT ON TABLE wallet_audit_log IS 'Security audit log for all wallet operations including failed attempts';
COMMENT ON VIEW suspicious_wallet_activity IS 'View showing users with multiple failed exchange attempts in the last 24 hours';
