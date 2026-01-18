import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, HelpCircle, CheckCircle2, AlertCircle, Sparkles, Zap, Users, BookOpen, MapPin, Package, MessageCircle, Globe, ShoppingBag, Target, Flame, Trophy, TrendingUp, Shield, Coins, ChevronLeft, ChevronRight } from 'lucide-react'
import { AuroraBackground } from './AuroraBackground'
import { PremiumBentoCard } from './PremiumBentoCard'
import { StickyAuthCard } from './StickyAuthCard'
import { HeroFocalElement } from './HeroFocalElement'
import { SocialButton } from './SocialButton'
import { MobileBottomSheet } from './MobileBottomSheet'
import { ReadEarnIcon, StreakIcon, CommunityIcon, ProgressRing } from './BentoIcons'
import { AutoCarousel } from './AutoCarousel'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { projectId, publicAnonKey } from '../../utils/supabase/info'

interface PremiumWelcomePageProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (email: string, password: string, name: string, acceptedTerms: boolean, marketingOptIn: boolean) => Promise<void>
  onGuestMode: () => void
}

type AuthState = 'initial' | 'email-entered' | 'signin' | 'signup' | 'magic-link-sent' | 'passkey-available'
type ErrorType = 'invalid-email' | 'network-error' | 'auth-error' | null

export function PremiumWelcomePage({ onLogin, onSignup }: PremiumWelcomePageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authState, setAuthState] = useState<AuthState>('initial')
  const [errorType, setErrorType] = useState<ErrorType>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Feature Cards for Horizontal Carousel
  const featureCards = [
    {
      title: "MAG - Editorial Feed",
      description: "Premium hemp articles in infinite nebula feed with aurora gradients",
      icon: BookOpen,
      gradient: "from-purple-600 via-indigo-600 to-purple-700",
      stats: "+12 NADA per read",
    },
    {
      title: "SWIPE - Quick Discovery",
      description: "Tinder-style swiping. Right for save, left to skip hemp content",
      icon: Zap,
      gradient: "from-amber-500 via-orange-500 to-red-500",
      stats: "Unlock at 500 NADA",
    },
    {
      title: "PLACES - Hemp Map",
      description: "Global directory of hemp businesses, farms, and shops near you",
      icon: MapPin,
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      stats: "1000+ locations",
    },
    {
      title: "SWAP - Barter Items",
      description: "C2C marketplace for trading hemp products peer-to-peer",
      icon: Package,
      gradient: "from-cyan-600 via-teal-600 to-cyan-700",
      stats: "Zero fees",
    },
    {
      title: "FORUM - Hemp Agora",
      description: "Civic discussions. Debate policy, share grows, connect with experts",
      icon: MessageCircle,
      gradient: "from-slate-600 via-gray-700 to-slate-800",
      stats: "Real-time threads",
    },
    {
      title: "GLOBE - World News",
      description: "Breaking hemp news from every country. Real-time global updates",
      icon: Globe,
      gradient: "from-emerald-600 via-teal-600 to-green-700",
      stats: "24/7 news stream",
    },
    {
      title: "SWAG - Merch Store",
      description: "Official hemp organization merchandise. Buy with NADA points",
      icon: ShoppingBag,
      gradient: "from-emerald-500 via-teal-500 to-green-600",
      stats: "100+ products",
    },
    {
      title: "HUNT - Terpene Quest",
      description: "Gamified terpene education through interactive challenges",
      icon: Target,
      gradient: "from-violet-600 via-purple-600 to-fuchsia-700",
      stats: "50+ terpenes",
    },
    {
      title: "Daily Streaks",
      description: "Read daily to build streaks. Unlock multipliers and bonuses",
      icon: Flame,
      gradient: "from-orange-500 via-red-500 to-rose-600",
      stats: "3x at 30 days",
    },
    {
      title: "Achievements",
      description: "35+ unlockable badges from Week Warrior to Speed Reader",
      icon: Trophy,
      gradient: "from-yellow-500 via-amber-500 to-orange-600",
      stats: "35+ badges",
    },
    {
      title: "Community Voting",
      description: "Vote on features and decisions. Your voice shapes the platform",
      icon: TrendingUp,
      gradient: "from-cyan-500 via-blue-500 to-indigo-600",
      stats: "Democratic power",
    },
    {
      title: "Reader Matching",
      description: "AI matches you with readers. Start conversations, collaborate",
      icon: Users,
      gradient: "from-teal-500 via-emerald-500 to-green-600",
      stats: "Smart AI matching",
    },
    {
      title: "Hemp Provenance",
      description: "Track origins, certifications, carbon footprint. Verified chains",
      icon: Shield,
      gradient: "from-green-600 via-emerald-600 to-teal-700",
      stats: "Blockchain verified",
    },
    {
      title: "Wallet & Points",
      description: "Earn NADA for every action. Spend on features and merch",
      icon: Coins,
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
      stats: "∞ earning potential",
    }
  ]

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleContinue = async () => {
    setErrorType(null)
    setErrorMessage(null)

    if (!email) {
      setErrorType('invalid-email')
      setErrorMessage('Please enter your email')
      return
    }

    if (!validateEmail(email)) {
      setErrorType('invalid-email')
      setErrorMessage('Please enter a valid email address')
      return
    }

    // Check if email exists in the database
    setIsLoading(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/auth/check-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to check email')
      }

      const { exists } = await response.json()
      
      console.log(`🔍 Email check for "${email}": ${exists ? 'Existing user' : 'New user'}`)
      
      // Route to appropriate flow
      if (exists) {
        setAuthState('signin') // Existing user - ask for password
      } else {
        setAuthState('signup') // New user - ask for name and password
      }
    } catch (error: any) {
      console.error('Error checking email:', error)
      setErrorType('network-error')
      setErrorMessage('Unable to check email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorType(null)
    setErrorMessage(null)
    setIsLoading(true)

    try {
      if (authState === 'signup') {
        if (!name.trim()) {
          setErrorType('auth-error')
          setErrorMessage('Please enter your name')
          setIsLoading(false)
          return
        }
        if (!password || password.length < 6) {
          setErrorType('auth-error')
          setErrorMessage('Password must be at least 6 characters')
          setIsLoading(false)
          return
        }
        await onSignup(email, password, name, true, false)
      } else if (authState === 'signin') {
        if (!password) {
          setErrorType('auth-error')
          setErrorMessage('Please enter your password')
          setIsLoading(false)
          return
        }
        await onLogin(email, password)
      }
    } catch (err: any) {
      setErrorType('network-error')
      setErrorMessage(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = () => {
    // Future: Implement magic link
    setAuthState('magic-link-sent')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AuroraBackground />

      {/* Desktop & Mobile Content */}
      <div className="relative z-10 min-h-screen pb-32 lg:pb-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-12">
          <div className="grid lg:grid-cols-[1.3fr,1fr] gap-6 sm:gap-8 lg:gap-20">
            
            {/* LEFT COLUMN - Value Proposition (Scrollable) */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-12 lg:pr-8">
              {/* Logo + Wordmark */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-2 sm:gap-3"
              >
                <div 
                  className="w-9 h-9 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #14B8A6, #10B981)',
                    boxShadow: '0 0 30px rgba(20, 184, 166, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Leaf className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" strokeWidth={2.5} />
                </div>
                
                <div>
                  <h1 
                    className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-none"
                    style={{
                      textShadow: '0 0 30px rgba(16, 185, 129, 0.6)',
                    }}
                  >
                    DEWII
                  </h1>
                </div>
              </motion.div>

              {/* Hero Section with Focal Element */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative space-y-3 sm:space-y-4 lg:space-y-6"
              >
                <HeroFocalElement />
                
                <div className="relative z-10">
                  <h2 
                    className="text-[26px] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-[1.15] tracking-tight mb-3 sm:mb-4 lg:mb-6"
                    style={{
                      textShadow: '0 2px 40px rgba(16, 185, 129, 0.4)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Participate to unlock.
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                      Earn to win.
                    </span>
                    <br />
                    Shape the world.
                  </h2>
                  
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-emerald-200/80 leading-relaxed max-w-2xl mb-2 sm:mb-3 lg:mb-4">
                    DEWII turns eco-wisdom reading into streaks, achievements, and NADA rewards.
                  </p>
                  
                  {/* Clarification pill */}
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="text-emerald-200/90">
                      Signals = NADA points
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Premium Bento Grid - Auto-Scroll Carousel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <AutoCarousel cards={featureCards} autoScrollInterval={4000} />
              </motion.div>

              {/* Trust Line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-2 lg:gap-3 text-xs lg:text-sm text-emerald-300/50"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-emerald-400/50" />
                  <span>Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-emerald-400/50" />
                  <span>No spam</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-emerald-400/50" />
                  <span>Email for sign-in only</span>
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN - Sticky Auth Card */}
            <div className="hidden lg:block">
              <StickyAuthCard>
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white">
                      {authState === 'magic-link-sent' ? 'Check your inbox' : 'Continue to DEWII'}
                    </h3>
                    <p className="text-emerald-200/70 text-sm">
                      {authState === 'initial' && 'Sign in or create an account'}
                      {authState === 'signup' && 'Create your account'}
                      {authState === 'signin' && 'Welcome back!'}
                      {authState === 'magic-link-sent' && 'We sent you a sign-in link'}
                    </p>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence mode="wait">
                    {errorType && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div 
                          className="p-4 rounded-xl flex items-start gap-3"
                          style={{
                            background: errorType === 'network-error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                            border: errorType === 'network-error' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(251, 191, 36, 0.3)',
                          }}
                        >
                          <AlertCircle className={`w-5 h-5 flex-shrink-0 ${errorType === 'network-error' ? 'text-red-400' : 'text-yellow-400'}`} />
                          <div className="flex-1">
                            <p className={`text-sm ${errorType === 'network-error' ? 'text-red-200' : 'text-yellow-200'}`}>
                              {errorMessage}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success State - Magic Link Sent */}
                  {authState === 'magic-link-sent' ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <div 
                        className="p-6 rounded-xl text-center space-y-3"
                        style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                        <div>
                          <p className="text-white font-medium mb-1">Sign-in link sent!</p>
                          <p className="text-emerald-200/70 text-sm">
                            Check your inbox at <span className="font-medium text-emerald-300">{email}</span>
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setAuthState('initial')}
                        className="text-sm text-emerald-300 hover:text-emerald-200 transition-colors mx-auto block"
                      >
                        Use a different email
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Email Field */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white text-sm font-medium flex items-center justify-between">
                          <span>Email</span>
                          {authState === 'initial' && (
                            <span className="text-xs text-emerald-400/70">Required</span>
                          )}
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400/50" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            disabled={isLoading || authState !== 'initial'}
                            className="h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-emerald-200/30 rounded-xl transition-all duration-200"
                            style={{
                              boxShadow: errorType === 'invalid-email' 
                                ? '0 0 0 2px rgba(239, 68, 68, 0.3)' 
                                : 'none',
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#10B981'
                              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)'
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                              e.target.style.boxShadow = 'none'
                            }}
                          />
                        </div>
                        {authState === 'initial' && (
                          <p className="text-xs text-emerald-200/50">
                            We'll check if you have an account
                          </p>
                        )}
                      </div>

                      {/* Name Field (signup only) */}
                      <AnimatePresence>
                        {authState === 'signup' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="name" className="text-white text-sm font-medium">
                              Name
                            </Label>
                            <Input
                              id="name"
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Your name"
                              required
                              disabled={isLoading}
                              className="h-12 bg-white/5 border-white/10 text-white placeholder:text-emerald-200/30 rounded-xl"
                              onFocus={(e) => {
                                e.target.style.borderColor = '#10B981'
                                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)'
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                                e.target.style.boxShadow = 'none'
                              }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Password Field (signin/signup) */}
                      <AnimatePresence>
                        {(authState === 'signin' || authState === 'signup') && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="password" className="text-white text-sm font-medium">
                              Password
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400/50" />
                              <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                                className="h-12 pl-12 pr-12 bg-white/5 border-white/10 text-white placeholder:text-emerald-200/30 rounded-xl"
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#10B981'
                                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)'
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                                  e.target.style.boxShadow = 'none'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400/50 hover:text-emerald-400 transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                            {authState === 'signup' && (
                              <p className="text-xs text-emerald-200/50">
                                Must be at least 6 characters
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Primary CTA */}
                      <Button
                        type={authState === 'initial' ? 'button' : 'submit'}
                        onClick={authState === 'initial' ? handleContinue : undefined}
                        disabled={isLoading}
                        className="w-full h-12 rounded-full font-bold text-base shadow-lg hover:shadow-xl transition-all group relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, #10B981, #14B8A6)',
                          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                        }}
                      >
                        {/* Hover glow */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent)',
                          }}
                        />
                        
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <motion.div
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 relative z-10">
                            Continue
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        )}
                      </Button>

                      {/* Toggle mode */}
                      {(authState === 'signin' || authState === 'signup') && (
                        <button
                          type="button"
                          onClick={() => setAuthState(authState === 'signin' ? 'signup' : 'signin')}
                          className="text-sm text-emerald-300 hover:text-emerald-200 transition-colors"
                        >
                          {authState === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                      )}
                    </form>
                  )}

                  {/* Divider */}
                  {authState !== 'magic-link-sent' && (
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#0B2F27] px-3 text-emerald-200/50">or</span>
                      </div>
                    </div>
                  )}

                  {/* Social Buttons */}
                  {authState !== 'magic-link-sent' && (
                    <div className="space-y-3">
                      <div className="relative">
                        <SocialButton
                          provider="apple"
                          onClick={() => alert('Apple OAuth will be configured in Phase 2')}
                          disabled={true}
                        />
                        {/* Recommended pill */}
                        <span 
                          className="absolute -top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                          style={{
                            background: 'linear-gradient(135deg, #10B981, #14B8A6)',
                            color: 'white',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                          }}
                        >
                          Recommended
                        </span>
                      </div>
                      <SocialButton
                        provider="google"
                        onClick={() => alert('Google OAuth will be configured in Phase 2')}
                        disabled={true}
                      />
                    </div>
                  )}

                  {/* Footer Links */}
                  <div className="flex items-center justify-center text-sm pt-2">
                    <button className="text-emerald-300/70 hover:text-emerald-200 transition-colors flex items-center gap-1">
                      <HelpCircle className="w-4 h-4" />
                      Need help?
                    </button>
                  </div>

                  {/* Privacy Microcopy */}
                  <div className="space-y-2 pt-2">
                    <p className="text-xs text-emerald-200/50 text-center leading-relaxed">
                      No spam. Email used only for sign-in.
                    </p>
                    <p className="text-xs text-emerald-200/40 text-center leading-relaxed">
                      By continuing you agree to our{' '}
                      <a href="#" className="underline hover:text-emerald-200/60 transition-colors">Terms</a>
                      {' '}&{' '}
                      <a href="#" className="underline hover:text-emerald-200/60 transition-colors">Privacy</a>
                    </p>
                  </div>
                </div>
              </StickyAuthCard>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet - Only visible on mobile */}
      <MobileBottomSheet
        email={email}
        password={password}
        name={name}
        showPassword={showPassword}
        isLoading={isLoading}
        authState={authState}
        errorType={errorType}
        errorMessage={errorMessage}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onNameChange={setName}
        onTogglePassword={() => setShowPassword(!showPassword)}
        onContinue={handleContinue}
        onSubmit={handleSubmit}
        onToggleMode={() => setAuthState(authState === 'signin' ? 'signup' : 'signin')}
      />
    </div>
  )
}