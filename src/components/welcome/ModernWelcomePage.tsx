import { useState } from 'react'
import { motion } from 'motion/react'
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, HelpCircle } from 'lucide-react'
import { AuroraBackground } from './AuroraBackground'
import { BentoCard } from './BentoCard'
import { GlassAuthCard } from './GlassAuthCard'
import { SocialButton } from './SocialButton'
import { ReadEarnIcon, StreakIcon, CommunityIcon, ProgressRing } from './BentoIcons'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface ModernWelcomePageProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (email: string, password: string, name: string, acceptedTerms: boolean, marketingOptIn: boolean) => Promise<void>
  onGuestMode: () => void
}

export function ModernWelcomePage({ onLogin, onSignup, onGuestMode }: ModernWelcomePageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'initial' | 'signin' | 'signup'>('initial')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setError('Please enter your name')
          setIsLoading(false)
          return
        }
        await onSignup(email, password, name, true, false)
      } else {
        await onLogin(email, password)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    if (!email) {
      setError('Please enter your email')
      return
    }
    // For now, show signup form. In Phase 2, we'd check if email exists
    setMode('signup')
  }

  const handleSocialAuth = (provider: 'google' | 'apple' | 'github') => {
    // TODO: Implement OAuth in Phase 2
    alert(`${provider} OAuth will be configured in Phase 2. For now, use email/password.`)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AuroraBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1.2fr,1fr] gap-12 lg:gap-20 items-center">
            
            {/* LEFT COLUMN - Value Proposition */}
            <div className="space-y-12">
              {/* Logo + Wordmark */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-4"
              >
                {/* Logo circle */}
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #14B8A6, #10B981)',
                    boxShadow: '0 0 30px rgba(20, 184, 166, 0.4)',
                  }}
                >
                  <Leaf className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                
                {/* Wordmark */}
                <div>
                  <h1 
                    className="text-3xl font-black text-white tracking-tight"
                    style={{
                      textShadow: '0 0 30px rgba(16, 185, 129, 0.6)',
                    }}
                  >
                    DEWII
                  </h1>
                </div>
              </motion.div>

              {/* Hero Headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-6"
              >
                <h2 
                  className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight"
                  style={{
                    textShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  Read better.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                    Earn signals.
                  </span>
                  <br />
                  Shape the ecosystem.
                </h2>
                
                <p className="text-xl md:text-2xl text-emerald-200/80 leading-relaxed max-w-2xl">
                  DEWII turns eco-wisdom reading into streaks, achievements, and NADA rewards.
                </p>
              </motion.div>

              {/* Bento Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <BentoCard
                  index={0}
                  icon={<ReadEarnIcon className="w-6 h-6 text-emerald-400" />}
                  title="Read & Earn"
                  description="Earn NADA for every article. Build your reputation in the hemp ecosystem."
                />
                
                <BentoCard
                  index={1}
                  icon={<StreakIcon className="w-6 h-6 text-emerald-400" />}
                  title="Streaks + Achievements"
                  description="35+ unlocks, weekly quests, and community challenges to level up."
                />
                
                <BentoCard
                  index={2}
                  icon={<CommunityIcon className="w-6 h-6 text-emerald-400" />}
                  title="Community Power"
                  description="Vote on features, submit ideas, and get matched with like-minded readers."
                />
              </div>

              {/* Social Proof */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-emerald-300/60 text-sm"
              >
                Join early readers building the eco-wisdom graph.
              </motion.p>
            </div>

            {/* RIGHT COLUMN - Auth Card */}
            <div>
              <GlassAuthCard>
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white">
                      Continue to DEWII
                    </h3>
                    <p className="text-emerald-200/70 text-sm">
                      {mode === 'signup' ? 'Create your account' : 'Sign in or create an account'}
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Auth Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white text-sm font-medium">
                        Email
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
                          disabled={isLoading}
                          className="h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-emerald-200/30 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    {/* Name Field (signup only) */}
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
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
                          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-emerald-200/30 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                      </motion.div>
                    )}

                    {/* Password Field (signin/signup) */}
                    {mode !== 'initial' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
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
                            className="h-12 pl-12 pr-12 bg-white/5 border-white/10 text-white placeholder:text-emerald-200/30 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400/50 hover:text-emerald-400 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Primary CTA */}
                    <Button
                      type={mode === 'initial' ? 'button' : 'submit'}
                      onClick={mode === 'initial' ? handleContinue : undefined}
                      disabled={isLoading}
                      className="w-full h-12 rounded-full font-bold text-base shadow-lg hover:shadow-xl transition-all group"
                      style={{
                        background: 'linear-gradient(135deg, #10B981, #14B8A6)',
                      }}
                    >
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
                        <span className="flex items-center gap-2">
                          Continue
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>

                    {/* Toggle mode */}
                    {mode !== 'initial' && (
                      <button
                        type="button"
                        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                        className="text-sm text-emerald-300 hover:text-emerald-200 transition-colors"
                      >
                        {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                      </button>
                    )}
                  </form>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#0B2F27] px-3 text-emerald-200/50">or</span>
                    </div>
                  </div>

                  {/* Social Buttons */}
                  <div className="space-y-3">
                    <SocialButton
                      provider="apple"
                      onClick={() => handleSocialAuth('apple')}
                      disabled={true}
                    />
                    <SocialButton
                      provider="google"
                      onClick={() => handleSocialAuth('google')}
                      disabled={true}
                    />
                  </div>

                  {/* Footer Links */}
                  <div className="flex items-center justify-between text-sm pt-2">
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
                      <a href="#" className="underline hover:text-emerald-200/60">Terms</a>
                      {' '}&{' '}
                      <a href="#" className="underline hover:text-emerald-200/60">Privacy</a>
                    </p>
                  </div>
                </div>
              </GlassAuthCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}