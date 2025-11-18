// Advanced Security Module for Article Reading
// Implements multiple layers of defense beyond authentication

import { createClient } from 'npm:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ============================================
// 1. READ SESSION TOKENS
// ============================================
// Generate a one-time token when article is opened
// Must be used when marking as read to prove they opened it
const readSessions = new Map<string, { userId: string, articleId: string, timestamp: number, scrollDepth: number }>()

export function generateReadToken(userId: string, articleId: string): string {
  const token = crypto.randomUUID()
  readSessions.set(token, {
    userId,
    articleId,
    timestamp: Date.now(),
    scrollDepth: 0
  })
  
  // Auto-expire after 30 minutes
  setTimeout(() => {
    readSessions.delete(token)
  }, 30 * 60 * 1000)
  
  return token
}

export function validateReadToken(token: string, userId: string, articleId: string, scrollDepth: number): boolean {
  const session = readSessions.get(token)
  
  if (!session) {
    console.log('⚠️ SECURITY: Invalid read token')
    return false
  }
  
  if (session.userId !== userId || session.articleId !== articleId) {
    console.log('⚠️ SECURITY: Token mismatch. Expected:', session, 'Got:', { userId, articleId })
    return false
  }
  
  // Update scroll depth
  session.scrollDepth = Math.max(session.scrollDepth, scrollDepth)
  
  // Token must be at least 3 seconds old
  const age = Date.now() - session.timestamp
  if (age < 3000) {
    console.log('⚠️ SECURITY: Token too fresh. Age:', age)
    return false
  }
  
  // Must have scrolled at least 30% of article
  if (scrollDepth < 30) {
    console.log('⚠️ SECURITY: Insufficient scroll depth:', scrollDepth)
    return false
  }
  
  // Delete token after use (one-time use)
  readSessions.delete(token)
  
  return true
}

// ============================================
// 2. HMAC REQUEST SIGNING
// ============================================
// Sign sensitive requests to prevent tampering
const SECRET_KEY = Deno.env.get('HMAC_SECRET') || 'your-secret-key-change-in-production'

export async function signRequest(data: any): Promise<string> {
  const encoder = new TextEncoder()
  const dataString = JSON.stringify(data)
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(dataString)
  )
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifySignature(data: any, signature: string): Promise<boolean> {
  const expectedSignature = await signRequest(data)
  return signature === expectedSignature
}

// ============================================
// 3. IP-BASED RATE LIMITING
// ============================================
const ipRateLimits = new Map<string, { count: number, resetTime: number }>()

export function checkIpRateLimit(ip: string, maxRequests: number = 20, windowMs: number = 60000): boolean {
  const now = Date.now()
  const limit = ipRateLimits.get(ip)
  
  if (!limit || now > limit.resetTime) {
    // New window
    ipRateLimits.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (limit.count >= maxRequests) {
    console.log('⚠️ SECURITY: IP rate limit exceeded for:', ip)
    return false
  }
  
  limit.count++
  return true
}

// ============================================
// 4. BEHAVIORAL ANALYSIS
// ============================================
interface ReadingBehavior {
  userId: string
  articleId: string
  timeSpent: number
  scrollDepth: number
  scrollEvents: number
  mouseMovements: number
  focusTime: number
  timestamp: number
}

export async function analyzeBehavior(behavior: ReadingBehavior): Promise<{ legitimate: boolean, suspicionScore: number, reasons: string[] }> {
  const reasons: string[] = []
  let suspicionScore = 0
  
  // Check 1: Time spent (should be at least 3 seconds)
  if (behavior.timeSpent < 3000) {
    suspicionScore += 30
    reasons.push(`Time too short: ${behavior.timeSpent}ms`)
  }
  
  // Check 2: Scroll depth (should reach at least 30%)
  if (behavior.scrollDepth < 30) {
    suspicionScore += 25
    reasons.push(`Low scroll depth: ${behavior.scrollDepth}%`)
  }
  
  // Check 3: Scroll events (bots often don't scroll or scroll instantly)
  if (behavior.scrollEvents < 2) {
    suspicionScore += 20
    reasons.push(`Few scroll events: ${behavior.scrollEvents}`)
  }
  
  // Check 4: Mouse movements (bots often have no mouse activity)
  if (behavior.mouseMovements < 5) {
    suspicionScore += 15
    reasons.push(`Low mouse activity: ${behavior.mouseMovements}`)
  }
  
  // Check 5: Focus time (tab should be focused most of the time)
  const focusRatio = behavior.focusTime / behavior.timeSpent
  if (focusRatio < 0.5) {
    suspicionScore += 10
    reasons.push(`Low focus ratio: ${(focusRatio * 100).toFixed(1)}%`)
  }
  
  // Check 6: Get user's recent reading history
  const { data: recentReads } = await supabase
    .from('read_articles')
    .select('created_at')
    .eq('user_id', behavior.userId)
    .gte('created_at', new Date(Date.now() - 60000).toISOString())
  
  if (recentReads && recentReads.length >= 5) {
    suspicionScore += 40
    reasons.push(`Too many recent reads: ${recentReads.length} in last minute`)
  }
  
  const legitimate = suspicionScore < 50
  
  if (!legitimate) {
    console.log('⚠️ SECURITY: Suspicious reading behavior detected')
    console.log('Suspicion score:', suspicionScore)
    console.log('Reasons:', reasons)
  }
  
  return { legitimate, suspicionScore, reasons }
}

// ============================================
// 5. DEVICE FINGERPRINTING
// ============================================
const knownFingerprints = new Map<string, { userId: string, lastSeen: number, readCount: number }>()

export function trackDeviceFingerprint(fingerprint: string, userId: string): { legitimate: boolean, reason?: string } {
  const known = knownFingerprints.get(fingerprint)
  const now = Date.now()
  
  if (!known) {
    // New device
    knownFingerprints.set(fingerprint, { userId, lastSeen: now, readCount: 1 })
    return { legitimate: true }
  }
  
  // Check if same user
  if (known.userId !== userId) {
    console.log('⚠️ SECURITY: Fingerprint used by multiple users')
    return { legitimate: false, reason: 'Device fingerprint collision detected' }
  }
  
  // Check read count in last minute
  const timeSinceLastSeen = now - known.lastSeen
  if (timeSinceLastSeen < 60000 && known.readCount >= 10) {
    console.log('⚠️ SECURITY: Too many reads from same device')
    return { legitimate: false, reason: 'Too many reads from this device' }
  }
  
  // Reset count if more than 1 minute has passed
  if (timeSinceLastSeen > 60000) {
    known.readCount = 1
  } else {
    known.readCount++
  }
  
  known.lastSeen = now
  
  return { legitimate: true }
}

// ============================================
// 6. AUDIT LOGGING
// ============================================
export async function logSecurityEvent(event: {
  type: 'read_attempt' | 'read_blocked' | 'suspicious_activity' | 'token_invalid'
  userId: string
  articleId?: string
  ip?: string
  fingerprint?: string
  reason?: string
  metadata?: any
}) {
  try {
    await supabase
      .from('security_audit_log')
      .insert([{
        event_type: event.type,
        user_id: event.userId,
        article_id: event.articleId,
        ip_address: event.ip,
        device_fingerprint: event.fingerprint,
        reason: event.reason,
        metadata: event.metadata,
        created_at: new Date().toISOString()
      }])
    
    console.log('📝 Security event logged:', event.type)
  } catch (error) {
    // If table doesn't exist yet, just log to console
    console.log('📝 Security event (log failed):', event.type, event.reason)
  }
}

// ============================================
// 7. COMPREHENSIVE SECURITY CHECK
// ============================================
export async function performSecurityCheck(params: {
  userId: string
  articleId: string
  readToken: string
  scrollDepth: number
  behavior: ReadingBehavior
  ip: string
  fingerprint: string
}): Promise<{ allowed: boolean, reason?: string, suspicionScore: number }> {
  
  // Check 1: IP Rate Limit
  if (!checkIpRateLimit(params.ip)) {
    await logSecurityEvent({
      type: 'read_blocked',
      userId: params.userId,
      articleId: params.articleId,
      ip: params.ip,
      reason: 'IP rate limit exceeded'
    })
    return { allowed: false, reason: 'Too many requests from your IP address', suspicionScore: 100 }
  }
  
  // Check 2: Read Token
  if (!validateReadToken(params.readToken, params.userId, params.articleId, params.scrollDepth)) {
    await logSecurityEvent({
      type: 'read_blocked',
      userId: params.userId,
      articleId: params.articleId,
      reason: 'Invalid read token'
    })
    return { allowed: false, reason: 'Invalid read session', suspicionScore: 100 }
  }
  
  // Check 3: Device Fingerprint
  const fingerprintCheck = trackDeviceFingerprint(params.fingerprint, params.userId)
  if (!fingerprintCheck.legitimate) {
    await logSecurityEvent({
      type: 'read_blocked',
      userId: params.userId,
      articleId: params.articleId,
      fingerprint: params.fingerprint,
      reason: fingerprintCheck.reason
    })
    return { allowed: false, reason: fingerprintCheck.reason, suspicionScore: 100 }
  }
  
  // Check 4: Behavioral Analysis
  const behaviorAnalysis = await analyzeBehavior(params.behavior)
  if (!behaviorAnalysis.legitimate) {
    await logSecurityEvent({
      type: 'suspicious_activity',
      userId: params.userId,
      articleId: params.articleId,
      reason: 'Suspicious reading behavior',
      metadata: { suspicionScore: behaviorAnalysis.suspicionScore, reasons: behaviorAnalysis.reasons }
    })
    return { 
      allowed: false, 
      reason: `Suspicious reading behavior detected: ${behaviorAnalysis.reasons.join(', ')}`,
      suspicionScore: behaviorAnalysis.suspicionScore
    }
  }
  
  // All checks passed
  await logSecurityEvent({
    type: 'read_attempt',
    userId: params.userId,
    articleId: params.articleId,
    ip: params.ip,
    metadata: { suspicionScore: behaviorAnalysis.suspicionScore }
  })
  
  return { allowed: true, suspicionScore: behaviorAnalysis.suspicionScore }
}
