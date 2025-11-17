// Wallet Security & Fraud Detection Module
// Handles rate limiting, daily limits, and suspicious activity detection

interface RateLimitCheck {
  allowed: boolean
  reason?: string
  retryAfter?: number
}

interface DailyLimitCheck {
  allowed: boolean
  remaining: number
  reason?: string
}

interface FraudCheck {
  suspicious: boolean
  reasons: string[]
  riskScore: number
}

// Rate limiting: Max 5 exchanges per 5 minutes
export async function checkRateLimit(
  supabase: any,
  userId: string
): Promise<RateLimitCheck> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  
  console.log('🔒 RATE LIMIT CHECK:', { userId, fiveMinutesAgo })
  
  const { data: recentTransactions, error } = await supabase
    .from('wallet_transactions')
    .select('id')
    .eq('user_id', userId)
    .eq('transaction_type', 'exchange')
    .gte('created_at', fiveMinutesAgo)
  
  if (error) {
    console.log('WARNING: Failed to check rate limit:', error)
    return { allowed: true } // Fail open to not block legitimate users
  }
  
  const count = recentTransactions?.length || 0
  
  console.log('🔒 RATE LIMIT: Found', count, 'recent exchanges (limit is 5)')
  
  if (count >= 5) {
    return {
      allowed: false,
      reason: 'Rate limit exceeded. Maximum 5 exchanges per 5 minutes.',
      retryAfter: 300 // 5 minutes in seconds
    }
  }
  
  return { allowed: true }
}

// Daily limit: Max 10 exchanges per day
export async function checkDailyLimit(
  supabase: any,
  userId: string
): Promise<DailyLimitCheck> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStart = today.toISOString()
  
  console.log('🔒 DAILY LIMIT CHECK:', { userId, todayStart })
  
  const { data: todayTransactions, error } = await supabase
    .from('wallet_transactions')
    .select('id')
    .eq('user_id', userId)
    .eq('transaction_type', 'exchange')
    .gte('created_at', todayStart)
  
  if (error) {
    console.log('WARNING: Failed to check daily limit:', error)
    return { allowed: true, remaining: 10 } // Fail open
  }
  
  const count = todayTransactions?.length || 0
  const remaining = 10 - count
  
  console.log('🔒 DAILY LIMIT: Found', count, 'exchanges today (limit is 10), remaining:', remaining)
  
  if (count >= 10) {
    return {
      allowed: false,
      remaining: 0,
      reason: 'Daily exchange limit reached. Maximum 10 exchanges per day.'
    }
  }
  
  return { allowed: true, remaining }
}

// Maximum single exchange: 5000 points at once
export function checkExchangeAmount(pointsToExchange: number): { allowed: boolean; reason?: string } {
  const MAX_SINGLE_EXCHANGE = 5000
  
  if (pointsToExchange > MAX_SINGLE_EXCHANGE) {
    return {
      allowed: false,
      reason: `Maximum single exchange is ${MAX_SINGLE_EXCHANGE} points.`
    }
  }
  
  return { allowed: true }
}

// Fraud detection: Check for suspicious patterns
export async function checkFraudPatterns(
  supabase: any,
  userId: string,
  pointsToExchange: number,
  ipAddress?: string,
  userAgent?: string
): Promise<FraudCheck> {
  const reasons: string[] = []
  let riskScore = 0
  
  // Check 1: Unusual exchange amount (>2000 points is high)
  if (pointsToExchange >= 2000) {
    reasons.push('High value exchange')
    riskScore += 20
  }
  
  // Check 2: Multiple exchanges in short succession
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
  const { data: veryRecentTx } = await supabase
    .from('wallet_transactions')
    .select('id')
    .eq('user_id', userId)
    .eq('transaction_type', 'exchange')
    .gte('created_at', oneMinuteAgo)
  
  if ((veryRecentTx?.length || 0) >= 2) {
    reasons.push('Rapid successive exchanges')
    riskScore += 30
  }
  
  // Check 3: Account age (new accounts are higher risk)
  const { data: userProgress } = await supabase
    .from('user_progress')
    .select('created_at')
    .eq('user_id', userId)
    .single()
  
  if (userProgress?.created_at) {
    const accountAge = Date.now() - new Date(userProgress.created_at).getTime()
    const oneDayInMs = 24 * 60 * 60 * 1000
    
    if (accountAge < oneDayInMs) {
      reasons.push('New account (less than 24 hours old)')
      riskScore += 25
    }
  }
  
  // Check 4: Different IP address pattern (would need IP tracking)
  if (ipAddress) {
    const { data: recentTxWithIp } = await supabase
      .from('wallet_audit_log')
      .select('ip_address')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (recentTxWithIp && recentTxWithIp.length > 0) {
      const uniqueIps = new Set(recentTxWithIp.map((tx: any) => tx.ip_address))
      if (uniqueIps.size > 3) {
        reasons.push('Multiple IP addresses detected')
        riskScore += 15
      }
    }
  }
  
  return {
    suspicious: riskScore >= 50,
    reasons,
    riskScore
  }
}

// Create audit log entry
export async function createAuditLog(
  supabase: any,
  userId: string,
  action: string,
  details: any,
  ipAddress?: string,
  userAgent?: string,
  success: boolean = true
): Promise<void> {
  try {
    await supabase
      .from('wallet_audit_log')
      .insert([{
        user_id: userId,
        action,
        details,
        ip_address: ipAddress,
        user_agent: userAgent,
        success,
        timestamp: new Date().toISOString()
      }])
  } catch (error) {
    console.log('WARNING: Failed to create audit log:', error)
    // Don't throw - audit logging shouldn't break main flow
  }
}

// Validate minimum points after exchange (prevent going into negative)
export function validateMinimumBalance(
  currentPoints: number,
  pointsToExchange: number
): { allowed: boolean; reason?: string } {
  const remainingPoints = currentPoints - pointsToExchange
  
  if (remainingPoints < 0) {
    return {
      allowed: false,
      reason: 'Insufficient points for exchange.'
    }
  }
  
  return { allowed: true }
}