import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { BrandLogo } from './BrandLogo'
import { 
  BookOpen, 
  Zap, 
  Unlock, 
  Sparkles, 
  Flame, 
  Trophy,
  ShoppingBag,
  Palette,
  Star,
  Users,
  TrendingUp,
  Heart,
  Target,
  Gift,
  LogIn,
  Coins,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { AuthModal } from './AuthModal'
import { motion } from 'motion/react'

interface LandingPageProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (email: string, password: string, name: string, acceptedTerms: boolean, marketingOptIn: boolean) => Promise<void>
}

type Theme = 'light' | 'dark' | 'hempin'

type BonusType = 'thunder' | 'nada'

interface Bonus {
  id: number
  type: BonusType
  x: number
  y: number
}

export function LandingPage({ onLogin, onSignup }: LandingPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login')
  const [theme, setTheme] = useState<Theme>('light')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSliding, setIsSliding] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [clickedCard, setClickedCard] = useState<number | null>(null)
  const [bonuses, setBonuses] = useState<Bonus[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const bonusIdRef = useRef(0)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme && ['light', 'dark', 'hempin'].includes(savedTheme)) {
      applyTheme(savedTheme)
    } else {
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark')
      }
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    // Remove all theme classes
    document.documentElement.classList.remove('dark', 'hempin')
    
    // Apply new theme class
    if (newTheme !== 'light') {
      document.documentElement.classList.add(newTheme)
    }
  }

  const cycleTheme = () => {
    const themeOrder: Theme[] = ['light', 'dark', 'hempin']
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    applyTheme(themeOrder[nextIndex])
    
    // Trigger animation
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 600)
  }

  // Get theme colors for the glow effect
  const getThemeGlow = () => {
    switch(theme) {
      case 'light': return 'from-sky-400 to-blue-500'
      case 'dark': return 'from-emerald-400 to-teal-500'
      case 'hempin': return 'from-amber-400 to-orange-500'
      default: return 'from-sky-400 to-blue-500'
    }
  }

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
      setClickedCard(null)
    }, 8000) // Slower for more contemplative feel
    return () => clearInterval(timer)
  }, [])

  // Navigation functions
  const slideToNext = () => {
    if (isSliding) return
    
    setIsSliding(true)
    setCurrentSlide((prev) => (prev + 1) % 3)
    setClickedCard(null)
    
    setTimeout(() => setIsSliding(false), 400)
  }

  const slideToPrevious = () => {
    if (isSliding) return
    
    setIsSliding(true)
    setCurrentSlide((prev) => (prev - 1 + 3) % 3)
    setClickedCard(null)
    
    setTimeout(() => setIsSliding(false), 400)
  }

  const jumpToSlide = (index: number) => {
    if (isSliding || index === currentSlide) return
    
    setIsSliding(true)
    setCurrentSlide(index)
    setClickedCard(null)
    
    setTimeout(() => setIsSliding(false), 400)
  }

  // Mini-game: Spawn bonus on card click
  const handleCardClick = (cardIndex: number, event: React.MouseEvent<HTMLButtonElement>) => {
    // Toggle clicked state
    setClickedCard(clickedCard === cardIndex ? null : cardIndex)
    
    // 20% chance to spawn a bonus (like Mario's ? block)
    if (Math.random() < 0.2) {
      const rect = event.currentTarget.getBoundingClientRect()
      const bonusType: BonusType = Math.random() < 0.5 ? 'thunder' : 'nada'
      
      const newBonus: Bonus = {
        id: bonusIdRef.current++,
        type: bonusType,
        x: rect.left + rect.width / 2,
        y: rect.top
      }
      
      setBonuses(prev => [...prev, newBonus])
      
      // Remove bonus after animation (2 seconds)
      setTimeout(() => {
        setBonuses(prev => prev.filter(b => b.id !== newBonus.id))
      }, 2000)
    }
  }

  const slides = [
    {
      title: "Read & Earn",
      subtitle: "Transform Reading into Rewards",
      description: "Every article you read earns you NADA points. Build daily streaks and unlock achievements.",
      icon: BookOpen,
      gradient: 'from-emerald-500 via-teal-500 to-green-600',
      features: [
        { icon: Flame, text: "Daily Streaks", gradient: 'from-orange-500 to-red-500' },
        { icon: Trophy, text: "35+ Achievements", gradient: 'from-amber-500 to-yellow-500' },
        { icon: Target, text: "Progressive Rewards", gradient: 'from-violet-500 to-purple-500' },
        { icon: Star, text: "Level Up", gradient: 'from-blue-500 to-cyan-500' }
      ]
    },
    {
      title: "Community Power",
      subtitle: "Vote, Share, Create",
      description: "Join a thriving community where your voice matters. Vote on features and submit ideas.",
      icon: Users,
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-600',
      features: [
        { icon: TrendingUp, text: "Community Voting", gradient: 'from-green-500 to-emerald-500' },
        { icon: Sparkles, text: "Submit Ideas", gradient: 'from-pink-500 to-rose-500' },
        { icon: Heart, text: "Share Articles", gradient: 'from-red-500 to-pink-500' },
        { icon: Users, text: "Reading Matches", gradient: 'from-indigo-500 to-purple-500' }
      ]
    },
    {
      title: "Unlock Features",
      subtitle: "NADA Points Buy Power",
      description: "Trade NADA for exclusive features like Swipe Mode, custom themes, and hemp merch.",
      icon: Unlock,
      gradient: 'from-amber-500 via-yellow-500 to-orange-600',
      features: [
        { icon: Zap, text: "Swipe Mode", gradient: 'from-yellow-500 to-amber-500' },
        { icon: ShoppingBag, text: "Swag Shop", gradient: 'from-orange-500 to-red-500' },
        { icon: Palette, text: "Premium Themes", gradient: 'from-fuchsia-500 to-pink-500' },
        { icon: Gift, text: "Exclusive Content", gradient: 'from-emerald-500 to-teal-500' }
      ]
    }
  ]

  const totalSlides = slides.length
  const currentSlideData = slides[currentSlide]

  // Get slides to display: 1 before, current, 1 after (sliding window like Browse page)
  const getVisibleSlides = () => {
    const visible = []
    
    for (let i = -1; i <= 1; i++) {
      const index = (currentSlide + i + totalSlides) % totalSlides
      visible.push({ ...slides[index], offset: i, index })
    }
    return visible
  }

  const visibleSlides = getVisibleSlides()

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* Top Header - Fixed at Top */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full">
        {/* Gradient blur mask */}
        <div 
          className="absolute inset-0 backdrop-blur-2xl"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
          }}
        />

        {/* Content */}
        <div className="relative">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-4">
              {/* CENTER: Logo Button */}
              <button
                onClick={cycleTheme}
                className="group relative flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full active:scale-95"
                aria-label="Change theme"
              >
                {/* Animated glow on theme change */}
                {isAnimating && (
                  <div className={`absolute -inset-6 bg-gradient-to-r ${getThemeGlow()} rounded-full blur-2xl opacity-50 animate-pulse`} />
                )}

                {/* Logo */}
                <div className={`relative transition-all ${isAnimating ? 'scale-110' : 'group-hover:scale-105'}`}>
                  <BrandLogo size="md" showAnimation={isAnimating} />
                </div>

                {/* Floating sparkles on animation */}
                {isAnimating && (
                  <>
                    <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-primary animate-ping" />
                    <Sparkles className="absolute -bottom-1 -left-1 w-3 h-3 text-primary animate-ping" style={{ animationDelay: '150ms' }} />
                  </>
                )}
              </button>

              {/* Title & Subtitle (Right of Logo) */}
              <div className="text-left">
                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  DEWII
                </h1>
                <p className="text-xs text-muted-foreground">
                  Digital Eco Wisdom
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Navbar - Carousel Navigation Icons */}
      <div className="fixed top-16 left-0 right-0 z-40 w-full">
        {/* Blurred background with gradient - strongest in center, fading at top/bottom */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-background/40"
            style={{
              backdropFilter: 'blur(2px)',
            }}
          />
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 80% 100% at center, rgba(0,0,0,0.15) 0%, transparent 100%)',
              backdropFilter: 'blur(20px)',
            }}
          />
        </div>
        
        {/* 3-icon carousel with arrows */}
        <div className="relative h-16 flex items-center justify-center px-2 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Left Arrow */}
            <button
              onClick={slideToPrevious}
              disabled={isSliding}
              className="flex-shrink-0 p-2 sm:p-2.5 rounded-full bg-background/80 border border-border/50 hover:border-primary/50 hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Slide Icons: All 3 visible */}
            <div className="flex items-center gap-2 sm:gap-4">
              {visibleSlides.map(({ icon: Icon, gradient, offset, index, title }) => {
                const isCenter = offset === 0
                
                return (
                  <motion.button
                    key={index}
                    onClick={() => jumpToSlide(index)}
                    disabled={isSliding || isCenter}
                    initial={false}
                    animate={{
                      scale: isCenter ? (isMobile ? 1 : 1.1) : (isMobile ? 0.65 : 0.75),
                      opacity: isCenter ? 1 : 0.4,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className={`flex-shrink-0 p-2.5 sm:p-4 rounded-full transition-all duration-500 ease-out ${
                      isCenter
                        ? `bg-gradient-to-br ${gradient} shadow-xl cursor-default`
                        : 'bg-muted/40 hover:bg-muted/60 hover:scale-90 cursor-pointer'
                    } ${isSliding ? 'pointer-events-none' : ''}`}
                    title={title}
                  >
                    <Icon 
                      className={`w-5 h-5 sm:w-7 sm:h-7 transition-colors duration-500 ${
                        isCenter 
                          ? 'text-white' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </motion.button>
                )
              })}
            </div>

            {/* Right Arrow */}
            <button
              onClick={slideToNext}
              disabled={isSliding}
              className="flex-shrink-0 p-2 sm:p-2.5 rounded-full bg-background/80 border border-border/50 hover:border-primary/50 hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Carousel - Fills remaining space */}
      <div className="relative z-10 flex-1 flex flex-col justify-center pt-32 pb-28 px-4">
        <div className="max-w-5xl w-full mx-auto">
          {/* Slide Content - Subtle Fade In */}
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Title */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className={`text-2xl md:text-5xl font-black text-center mb-1.5 bg-gradient-to-r ${currentSlideData.gradient} bg-clip-text text-transparent`}
            >
              {currentSlideData.title}
            </motion.h2>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="text-sm md:text-xl text-center text-foreground/80 mb-4 font-medium"
            >
              {currentSlideData.subtitle}
            </motion.p>

            {/* Description - Hidden on mobile */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              className="hidden md:block text-sm md:text-base text-center text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed"
            >
              {currentSlideData.description}
            </motion.p>

            {/* Features Grid - Independent Staggered Animations */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-2xl mx-auto mb-6">
              {currentSlideData.features.map((feature, i) => {
                const FeatureIcon = feature.icon
                const isActive = hoveredCard === i || clickedCard === i
                
                return (
                  <motion.div 
                    key={i} 
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.7,
                      delay: 0.4 + (i * 0.15), // Staggered by 150ms each
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    {/* Wallet-style Button */}
                    <button
                      onMouseEnter={() => setHoveredCard(i)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={(e) => handleCardClick(i, e)}
                      className="group relative w-full aspect-square rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      {/* Subtle glow effect */}
                      <div className={`absolute -inset-2 bg-gradient-to-r ${feature.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                      
                      {/* Main gradient background - Wallet style */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-85`} />
                      
                      {/* Subtle pattern overlay */}
                      <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                      }} />
                      
                      {/* Icon - Large and centered */}
                      <div className="relative h-full flex items-center justify-center p-4">
                        <FeatureIcon className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-lg" strokeWidth={2} />
                      </div>

                      {/* Subtle shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </button>

                    {/* Text - Space always reserved, visibility toggles */}
                    <div className="mt-2 h-8 flex items-center justify-center">
                      <p className={`text-xs md:text-sm font-bold text-center text-foreground whitespace-nowrap transition-opacity duration-300 ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}>
                        {feature.text}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Stats Bar - Hidden on mobile, shown on larger screens */}
          <motion.div 
            className="hidden lg:block mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0, ease: 'easeOut' }}
          >
            <div className="flex justify-center gap-6">
              <div className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity" />
                <div className="relative bg-card/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl px-5 py-2 text-center">
                  <div className="text-xl font-black text-foreground">35+</div>
                  <div className="text-xs text-muted-foreground">Achievements</div>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity" />
                <div className="relative bg-card/60 backdrop-blur-xl border border-amber-500/20 rounded-2xl px-5 py-2 text-center">
                  <div className="text-xl font-black text-foreground">10+</div>
                  <div className="text-xs text-muted-foreground">Features</div>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity" />
                <div className="relative bg-card/60 backdrop-blur-xl border border-violet-500/20 rounded-2xl px-5 py-2 text-center">
                  <div className="text-xl font-black text-foreground">∞</div>
                  <div className="text-xs text-muted-foreground">NADA Points</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bonus Icons - Mini-game Easter Egg */}
      {bonuses.map((bonus) => (
        <div
          key={bonus.id}
          className="fixed pointer-events-none z-[100] bonus-pop-evaporate"
          style={{
            left: bonus.x,
            top: bonus.y,
          }}
        >
          {bonus.type === 'thunder' ? (
            // Thunder icon (Points)
            <div className="relative">
              <div className="absolute -inset-4 bg-amber-400 rounded-full blur-xl opacity-60 animate-pulse" />
              <Zap className="relative w-12 h-12 text-amber-400 fill-amber-400 drop-shadow-2xl" strokeWidth={0} />
            </div>
          ) : (
            // NADA Ripple icon
            <div className="relative">
              <div className="absolute -inset-4 bg-teal-400 rounded-full blur-xl opacity-60 animate-pulse" />
              <div className="relative w-12 h-12 flex items-center justify-center">
                {/* Ripple circles */}
                <div className="absolute inset-0 border-4 border-teal-400 rounded-full animate-ping" />
                <div className="absolute inset-2 border-4 border-teal-300 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                <Coins className="relative w-6 h-6 text-teal-400 drop-shadow-2xl" strokeWidth={3} />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Bottom Navbar - Fixed */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="h-20 flex items-end justify-center px-4">
          <div className="relative h-20 flex items-end justify-center w-full">
            {/* Gradient blur mask */}
            <div 
              className="absolute inset-0 backdrop-blur-2xl pointer-events-auto"
              style={{
                WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
                maskImage: 'linear-gradient(to top, black 0%, transparent 100%)'
              }}
            />

            {/* Content */}
            <div className="relative w-full max-w-md mx-auto pointer-events-auto h-full pb-3">
              <div className="flex items-center justify-center h-full px-4">
                {/* Big CTA Button - Centered */}
                <Button
                  onClick={() => {
                    setAuthModalMode('signup')
                    setAuthModalOpen(true)
                  }}
                  className="relative group h-14 px-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-black text-base shadow-xl hover:scale-105 transition-all w-full md:w-auto"
                >
                  {/* Glow effect */}
                  <div className={`absolute -inset-2 bg-gradient-to-r ${getThemeGlow()} rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity`} />
                  
                  <div className="relative flex items-center gap-2">
                    <LogIn className="w-5 h-5" strokeWidth={3} />
                    <span>Sign In / Join</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onLogin={onLogin}
        onSignup={onSignup}
      />

      <style>{`
        /* Bonus Pop & Evaporate Animation - Like Mario */
        @keyframes bonus-pop-evaporate {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0);
          }
          20% {
            opacity: 1;
            transform: translateY(-60px) scale(1.2);
          }
          40% {
            transform: translateY(-100px) scale(1);
          }
          70% {
            opacity: 1;
            transform: translateY(-140px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-180px) scale(0.5);
          }
        }
        
        .bonus-pop-evaporate {
          animation: bonus-pop-evaporate 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </div>
  )
}