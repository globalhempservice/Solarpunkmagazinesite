import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ArrowRight, Sparkles, Zap, ExternalLink } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { SocialButton } from './SocialButton'
import { createClient } from '../../utils/supabase/client'

interface NewPremiumWelcomePageProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (email: string, password: string, name: string, acceptedTerms: boolean, marketingOptIn: boolean) => Promise<void>
}

export function NewPremiumWelcomePage({ onLogin, onSignup }: NewPremiumWelcomePageProps) {
  const supabase = createClient()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showMarketingModal, setShowMarketingModal] = useState(false)
  
  // Refs for scroll animations
  const pillarsRef = useRef<HTMLDivElement>(null)
  const trustRef = useRef<HTMLDivElement>(null)
  const [pillarsVisible, setPillarsVisible] = useState(false)
  const [trustVisible, setTrustVisible] = useState(false)

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target === pillarsRef.current && entry.isIntersecting) {
          setPillarsVisible(true)
        }
        if (entry.target === trustRef.current && entry.isIntersecting) {
          setTrustVisible(true)
        }
      })
    }, observerOptions)

    if (pillarsRef.current) observer.observe(pillarsRef.current)
    if (trustRef.current) observer.observe(trustRef.current)

    return () => observer.disconnect()
  }, [])

  // Navbar scroll effect
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAuth = async () => {
    setError(null)
    setIsLoading(true)

    try {
      if (authMode === 'signin') {
        await onLogin(email, password)
      } else {
        if (!acceptedTerms) {
          setError('Please accept the terms and conditions')
          setIsLoading(false)
          return
        }
        await onSignup(email, password, name, acceptedTerms, marketingOptIn)
      }
      setShowAuthModal(false)
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`
        }
      })
      
      if (error) {
        setError(error.message)
      }
      // Supabase will handle the redirect
    } catch (err: any) {
      setError(err.message || 'Google login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#041F1A] via-[#0a2f28] to-[#041F1A] text-white overflow-x-hidden">
      
      {/* Floating Glass Navbar */}
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled 
          ? 'backdrop-blur-[30px] bg-[#041F1A]/95 border-b border-emerald-500/20 shadow-lg' 
          : 'backdrop-blur-[20px] bg-[#041F1A]/80 border-b border-emerald-500/10'
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <LeafIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#041F1A]" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                DEWII
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink href="#discover">Discover</NavLink>
              <NavLink href="#sell">Sell</NavLink>
              <NavLink href="#community">Community</NavLink>
            </div>

            {/* Sign In Button */}
            <Button
              onClick={() => {
                setAuthMode('signin')
                setShowAuthModal(true)
              }}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-emerald-500/50"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          
          {/* Main Headline */}
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <span className="bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
              THE GLOBAL HEMP
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              ECOSYSTEM
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            className="text-xl sm:text-2xl md:text-3xl text-emerald-100/80 mb-4 font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            For Conscious Consumers & Visionary Merchants
          </motion.p>

          {/* Description */}
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            Buy conscious products. Sell your hemp goods.
            <br className="hidden sm:block" />
            Connect with the community shaping our future.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <button
              onClick={() => {
                setAuthMode('signup')
                setShowAuthModal(true)
              }}
              className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full font-semibold text-lg shadow-xl shadow-emerald-500/40 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/60 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Open DEWII
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              {/* Ripple effect container */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>

            <button
              onClick={() => {
                document.getElementById('pillars')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-8 py-4 bg-transparent border-2 border-teal-500/50 hover:border-teal-400 hover:bg-teal-500/10 rounded-full font-semibold text-lg transition-all hover:scale-105"
            >
              Learn More
            </button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="mt-16 sm:mt-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <div className="w-6 h-10 border-2 border-emerald-500/30 rounded-full mx-auto relative">
              <motion.div
                className="w-1.5 h-1.5 bg-emerald-400 rounded-full absolute left-1/2 -translate-x-1/2 top-2"
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section id="pillars" ref={pillarsRef} className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* BUY Card */}
            <PillarCard
              icon={<BuyIcon />}
              title="Discover Hemp Products"
              description="Browse verified sustainable goods. From textiles to wellness, food to materials. Every purchase supports regenerative agriculture."
              cta="Explore Marketplace"
              gradient="from-emerald-500/10 to-teal-500/10"
              delay={0}
              visible={pillarsVisible}
              onClick={() => {
                setAuthMode('signup')
                setShowAuthModal(true)
              }}
            />

            {/* SELL Card */}
            <PillarCard
              icon={<SellIcon />}
              title="Launch Your Business"
              description="Join the global hemp marketplace. Zero listing fees. Built-in community. Start small, grow sustainably."
              cta="Start Selling"
              gradient="from-teal-500/10 to-cyan-500/10"
              delay={0.1}
              visible={pillarsVisible}
              onClick={() => {
                setAuthMode('signup')
                setShowAuthModal(true)
              }}
            />

            {/* CONNECT Card */}
            <PillarCard
              icon={<ConnectIcon />}
              title="Join the Community"
              description="Network with hemp innovators. Share knowledge. Shape the industry. B2B opportunities and collaboration."
              cta="Join Network"
              gradient="from-cyan-500/10 to-blue-500/10"
              delay={0.2}
              visible={pillarsVisible}
              onClick={() => {
                setAuthMode('signup')
                setShowAuthModal(true)
              }}
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section ref={trustRef} className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={trustVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
              Built by the Community,
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              For the Community
            </span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <TrustPillar
              icon={<VerifiedIcon />}
              title="Verified Sellers"
              description="Every merchant undergoes our onboarding process. Quality and sustainability are prerequisites."
              delay={0}
              visible={trustVisible}
            />

            <TrustPillar
              icon={<GlobalIcon />}
              title="Connect Beyond Borders"
              description="Join a worldwide network. Local markets, global community."
              delay={0.1}
              visible={trustVisible}
            />

            <TrustPillar
              icon={<TransparentIcon />}
              title="Transparent Mission"
              description="No hidden fees. No gatekeeping. We grow when the hemp economy thrives."
              delay={0.2}
              visible={trustVisible}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-emerald-500/10">
        <div className="max-w-7xl mx-auto text-center text-white/50 text-sm">
          <p>© 2025 DEWII. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuthModal(false)}
            onSwitchMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            name={name}
            setName={setName}
            acceptedTerms={acceptedTerms}
            setAcceptedTerms={setAcceptedTerms}
            marketingOptIn={marketingOptIn}
            setMarketingOptIn={setMarketingOptIn}
            isLoading={isLoading}
            error={error}
            onSubmit={handleAuth}
            onGoogleLogin={handleGoogleLogin}
            showTermsModal={showTermsModal}
            setShowTermsModal={setShowTermsModal}
            showMarketingModal={showMarketingModal}
            setShowMarketingModal={setShowMarketingModal}
          />
        )}
      </AnimatePresence>

      {/* Terms Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#041F1A]/95 to-[#0a2f28]/95 border-emerald-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Terms & Conditions
            </DialogTitle>
            <DialogDescription asChild>
              <div className="pt-4 space-y-3 text-left text-white/80">
                <div>
                  <strong className="text-white">DEWII</strong> is the magazine feed branch of{' '}
                  <span className="text-emerald-400 font-semibold">Hemp'in.org</span>, dedicated to bringing you curated content on sustainability, technology, and innovation.
                </div>
                <div>
                  By creating an account, you agree to our content guidelines and community standards that promote respectful engagement and knowledge sharing.
                </div>
                <a 
                  href="https://hempin.org/trust" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 hover:underline font-medium"
                >
                  Visit Trust Center
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button 
              onClick={() => setShowTermsModal(false)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-500"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Marketing Newsletter Modal */}
      <Dialog open={showMarketingModal} onOpenChange={setShowMarketingModal}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#041F1A]/95 to-[#0a2f28]/95 border-emerald-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-emerald-400" />
              Marketing Newsletter
            </DialogTitle>
            <DialogDescription asChild>
              <div className="pt-4 space-y-3 text-left text-white/80">
                <div>
                  Our <strong className="text-white">Marketing Newsletter</strong> is a monthly digest featuring:
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-sm">
                  <li>Featured articles and trending topics</li>
                  <li>Community highlights and achievements</li>
                  <li>Platform updates and new features</li>
                  <li>Exclusive sustainability insights</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button 
              onClick={() => setShowMarketingModal(false)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-500"
            >
              Understood
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Nav Link Component
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="relative text-white/80 hover:text-emerald-400 font-medium transition-colors group"
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-full transition-all duration-300" />
    </a>
  )
}

// Pillar Card Component
function PillarCard({ 
  icon, 
  title, 
  description, 
  cta, 
  gradient, 
  delay, 
  visible,
  onClick 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  cta: string
  gradient: string
  delay: number
  visible: boolean
  onClick: () => void
}) {
  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 50 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.34, 1.56, 0.64, 1] // Spring easing
      }}
    >
      <div className={`
        relative h-full p-8 rounded-3xl
        bg-gradient-to-br ${gradient}
        backdrop-blur-xl
        border border-emerald-500/20
        shadow-xl shadow-black/20
        transition-all duration-500
        hover:scale-105 hover:-translate-y-2
        hover:shadow-2xl hover:shadow-emerald-500/20
        hover:border-emerald-500/40
        cursor-pointer
      `}
      onClick={onClick}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-500" />
        
        {/* Inner highlight */}
        <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div className="mb-6">
            {icon}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold mb-4 text-white">
            {title}
          </h3>

          {/* Description */}
          <p className="text-white/70 mb-6 leading-relaxed">
            {description}
          </p>

          {/* CTA */}
          <div className="flex items-center gap-2 text-emerald-400 font-semibold group-hover:gap-3 transition-all">
            {cta}
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Trust Pillar Component
function TrustPillar({ 
  icon, 
  title, 
  description, 
  delay, 
  visible 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  delay: number
  visible: boolean
}) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 30 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      <div className="mb-4 flex justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-white">
        {title}
      </h3>
      <p className="text-white/60 leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}

// Auth Modal Component
function AuthModal({ 
  mode, 
  onClose, 
  onSwitchMode, 
  email, 
  setEmail, 
  password, 
  setPassword, 
  name, 
  setName,
  acceptedTerms,
  setAcceptedTerms,
  marketingOptIn,
  setMarketingOptIn,
  isLoading, 
  error, 
  onSubmit,
  onGoogleLogin,
  showTermsModal,
  setShowTermsModal,
  showMarketingModal,
  setShowMarketingModal
}: any) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#041F1A]/70 backdrop-blur-xl" />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-md bg-gradient-to-br from-[#041F1A]/90 to-[#0a2f28]/90 backdrop-blur-2xl rounded-3xl border border-emerald-500/30 shadow-2xl shadow-black/50 p-8"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Inner glow */}
        <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-white/70" />
        </button>

        {/* Content */}
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-6 text-white">
            {mode === 'signin' ? 'Welcome Back' : 'Join DEWII'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
            
            {mode === 'signup' && (
              <div>
                <Label htmlFor="name" className="text-white/80">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 bg-white/5 border-emerald-500/30 text-white"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 bg-white/5 border-emerald-500/30 text-white"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white/80">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 bg-white/5 border-emerald-500/30 text-white"
              />
            </div>

            {mode === 'signup' && (
              <>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-white/70">
                    I accept the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-emerald-400 hover:text-emerald-300 underline"
                    >
                      terms and conditions
                    </button>
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="marketing"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="marketing" className="text-sm text-white/70">
                    <button
                      type="button"
                      onClick={() => setShowMarketingModal(true)}
                      className="text-emerald-400 hover:text-emerald-300 underline"
                    >
                      Subscribe to newsletter
                    </button>
                  </label>
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-500 text-white font-semibold py-3 rounded-full shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
            >
              {isLoading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Switch mode */}
          <p className="mt-6 text-center text-sm text-white/60">
            {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
            {' '}
            <button
              onClick={onSwitchMode}
              className="text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Custom SVG Icons
function LeafIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12 2 4 4 4 12C4 16 6 20 12 22C18 20 20 16 20 12C20 4 12 2 12 2Z" fill="currentColor" opacity="0.9"/>
      <path d="M12 2V22M12 8C12 8 8 10 8 14M12 12C12 12 16 14 16 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

function BuyIcon() {
  return (
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
      <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.70711 15.2929C4.07714 15.9229 4.52331 17 5.41421 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 19C9 20.1046 8.10457 21 7 21C5.89543 21 5 20.1046 5 19C5 17.8954 5.89543 17 7 17C8.10457 17 9 17.8954 9 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function SellIcon() {
  return (
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center">
      <svg className="w-8 h-8 text-teal-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function ConnectIcon() {
  return (
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
      <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function VerifiedIcon() {
  return (
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
      <svg className="w-10 h-10 text-emerald-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12L11 14L15 10M21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3C14.3869 3 16.6761 3.94821 18.364 5.63604C20.0518 7.32387 21 9.61305 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function GlobalIcon() {
  return (
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/30 flex items-center justify-center mx-auto">
      <svg className="w-10 h-10 text-teal-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function TransparentIcon() {
  return (
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto">
      <svg className="w-10 h-10 text-cyan-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}