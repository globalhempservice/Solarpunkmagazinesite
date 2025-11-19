-- ============================================
-- DEWII SECURITY TABLES SETUP
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run
-- ============================================

-- 1. CREATE READ SESSION TOKENS TABLE
-- Used for secure article read verification
CREATE TABLE IF NOT EXISTS public.read_session_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  article_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  device_fingerprint TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_read_session_tokens_user_id ON public.read_session_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_read_session_tokens_article_id ON public.read_session_tokens(article_id);
CREATE INDEX IF NOT EXISTS idx_read_session_tokens_token ON public.read_session_tokens(session_token);
CREATE INDEX IF NOT EXISTS idx_read_session_tokens_expires ON public.read_session_tokens(expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.read_session_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Service role can do everything
CREATE POLICY "Service role has full access to read_session_tokens"
  ON public.read_session_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can only read their own tokens
CREATE POLICY "Users can view their own session tokens"
  ON public.read_session_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.read_session_tokens IS 'Stores secure session tokens for article read verification to prevent API abuse';

-- ============================================

-- 2. CREATE WALLET AUDIT LOGS TABLE
-- Used for fraud detection and security monitoring
CREATE TABLE IF NOT EXISTS public.wallet_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  amount INTEGER,
  before_balance INTEGER,
  after_balance INTEGER,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  device_fingerprint TEXT,
  request_signature TEXT,
  behavioral_score DECIMAL,
  risk_flags TEXT[],
  article_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_audit_user_id ON public.wallet_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_audit_created_at ON public.wallet_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_audit_success ON public.wallet_audit_logs(success);
CREATE INDEX IF NOT EXISTS idx_wallet_audit_action ON public.wallet_audit_logs(action);

-- Enable RLS
ALTER TABLE public.wallet_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Service role can do everything
CREATE POLICY "Service role has full access to wallet_audit_logs"
  ON public.wallet_audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admin users can view all logs (update ADMIN_USER_ID with your admin UUID)
CREATE POLICY "Admin can view all audit logs"
  ON public.wallet_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email LIKE '%admin%' 
      -- Replace with: auth.uid() = 'your-admin-user-id'::uuid
    )
  );

-- Users can only view their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON public.wallet_audit_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.wallet_audit_logs IS 'Audit trail for all wallet operations including fraud detection metadata';

-- ============================================

-- 3. GRANT PERMISSIONS
-- Ensure service role can access these tables
GRANT ALL ON public.read_session_tokens TO service_role;
GRANT ALL ON public.wallet_audit_logs TO service_role;

-- Authenticated users get select only (RLS policies control the rest)
GRANT SELECT ON public.read_session_tokens TO authenticated;
GRANT SELECT ON public.wallet_audit_logs TO authenticated;

-- ============================================

-- 4. VERIFY TABLES WERE CREATED
SELECT 
  tablename, 
  schemaname,
  tableowner
FROM pg_tables 
WHERE tablename IN ('read_session_tokens', 'wallet_audit_logs')
ORDER BY tablename;

-- ============================================
-- SUCCESS! 
-- Your security tables are now ready.
-- The monitoring bot should now show green for Security Systems.
-- ============================================
