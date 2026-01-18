import { useState, useEffect, useRef } from 'react'
import { BubbleController } from './BubbleController'
import { WikiPage } from './WikiPage'
import { motion } from 'motion/react'
import { AuthModal } from './AuthModal'
import { Button } from './ui/button'
import { 
  Leaf, LogIn, ChevronDown, BookOpen, Users, Unlock, 
  Flame, Trophy, Target, Star, TrendingUp, Sparkles, 
  Heart, Zap, ShoppingBag, Palette, Gift, ChevronLeft, 
  ChevronRight, Coins, MapPin, Package, MessageCircle, Globe, Shield
} from 'lucide-react'

interface LandingPageProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (email: string, password: string, name: string, acceptedTerms: boolean, marketingOptIn: boolean) => Promise<void>
}

type Theme = 'default' | 'solarpunk-dreams' | 'midnight-hemp' | 'golden-hour'

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
  const [theme, setTheme] = useState<Theme>('default')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSliding, setIsSliding] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [clickedCard, setClickedCard] = useState<number | null>(null)
  const [bonuses, setBonuses] = useState<Bonus[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [showBubbleController, setShowBubbleController] = useState(false)
  const [showWikiPage, setShowWikiPage] = useState(false)
  const [bubblePosition, setBubblePosition] = useState({ x: 0, y: 0 })
  const bonusIdRef = useRef(0)
  const logoRef = useRef<HTMLDivElement>(null)
  const carouselSectionRef = useRef<HTMLDivElement>(null)

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
    if (savedTheme && ['default', 'solarpunk-dreams', 'midnight-hemp', 'golden-hour'].includes(savedTheme)) {
      applyTheme(savedTheme)
    } else {
      // Default to solarpunk-dreams (branded green theme)
      applyTheme('solarpunk-dreams')
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    // Remove all theme classes
    document.documentElement.classList.remove('default', 'dark', 'hempin', 'solarpunk-dreams', 'midnight-hemp', 'golden-hour')
    
    // Apply new theme class
    if (newTheme !== 'default') {
      document.documentElement.classList.add(newTheme)
    }
  }

  const cycleTheme = () => {
    const themeOrder: Theme[] = ['default', 'solarpunk-dreams', 'midnight-hemp', 'golden-hour']
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
      case 'default': return 'from-sky-400 to-blue-500'
      case 'solarpunk-dreams': return 'from-emerald-400 to-yellow-500'
      case 'midnight-hemp': return 'from-purple-500 to-indigo-600'
      case 'golden-hour': return 'from-amber-400 to-orange-500'
      default: return 'from-sky-400 to-blue-500'
    }
  }

  // Get theme-specific background gradient
  const getThemeBackground = () => {
    switch(theme) {
      case 'default': return 'from-sky-50 via-blue-50 to-indigo-100'
      case 'solarpunk-dreams': return 'from-emerald-950 via-teal-950 to-green-950'
      case 'midnight-hemp': return 'from-purple-950 via-indigo-950 to-violet-950'
      case 'golden-hour': return 'from-amber-950 via-orange-950 to-yellow-950'
      default: return 'from-sky-50 via-blue-50 to-indigo-100'
    }
  }

  // Get theme-specific text color
  const getThemeTextColor = () => {
    switch(theme) {
      case 'default': return 'text-gray-900'
      case 'solarpunk-dreams': return 'text-emerald-100'
      case 'midnight-hemp': return 'text-purple-100'
      case 'golden-hour': return 'text-amber-100'
      default: return 'text-gray-900'
    }
  }

  // Get theme-specific gradient for titles
  const getThemeTitleGradient = () => {
    switch(theme) {
      case 'default': return 'from-sky-600 via-blue-600 to-indigo-600'
      case 'solarpunk-dreams': return 'from-emerald-400 via-teal-400 to-green-500'
      case 'midnight-hemp': return 'from-purple-400 via-violet-400 to-indigo-500'
      case 'golden-hour': return 'from-amber-400 via-orange-400 to-yellow-500'
      default: return 'from-sky-600 via-blue-600 to-indigo-600'
    }
  }

  // Get theme-specific button color (solid, no gradient)
  const getThemeButtonColor = () => {
    switch(theme) {
      case 'default': return 'bg-blue-600 hover:bg-blue-700'
      case 'solarpunk-dreams': return 'bg-emerald-500 hover:bg-emerald-600'
      case 'midnight-hemp': return 'bg-purple-600 hover:bg-purple-700'
      case 'golden-hour': return 'bg-amber-500 hover:bg-amber-600'
      default: return 'bg-blue-600 hover:bg-blue-700'
    }
  }

  // Get theme-specific button text color
  const getThemeButtonTextColor = () => {
    switch(theme) {
      case 'default': return 'text-white'
      case 'solarpunk-dreams': return 'text-emerald-950'
      case 'midnight-hemp': return 'text-white'
      case 'golden-hour': return 'text-amber-950'
      default: return 'text-white'
    }
  }

  // Get theme-specific border color
  const getThemeBorderColor = () => {
    switch(theme) {
      case 'default': return 'border-sky-400/40 hover:border-sky-400/80'
      case 'solarpunk-dreams': return 'border-emerald-400/40 hover:border-emerald-400/80'
      case 'midnight-hemp': return 'border-purple-400/40 hover:border-purple-400/80'
      case 'golden-hour': return 'border-amber-400/40 hover:border-amber-400/80'
      default: return 'border-sky-400/40 hover:border-sky-400/80'
    }
  }

  // Get theme-specific background orb colors
  const getThemeOrbColors = () => {
    switch(theme) {
      case 'default': return [
        'bg-sky-400/20',
        'bg-blue-400/20',
        'bg-indigo-400/10'
      ]
      case 'solarpunk-dreams': return [
        'bg-emerald-400/10',
        'bg-teal-400/10',
        'bg-green-400/5'
      ]
      case 'midnight-hemp': return [
        'bg-purple-400/10',
        'bg-violet-400/10',
        'bg-indigo-400/5'
      ]
      case 'golden-hour': return [
        'bg-amber-400/10',
        'bg-orange-400/10',
        'bg-yellow-400/5'
      ]
      default: return [
        'bg-sky-400/20',
        'bg-blue-400/20',
        'bg-indigo-400/10'
      ]
    }
  }

  // Get theme-specific navbar colors
  const getThemeNavbarBg = () => {
    switch(theme) {
      case 'default': return 'from-sky-100/80 via-sky-50/40'
      case 'solarpunk-dreams': return 'from-emerald-950/80 via-emerald-950/40'
      case 'midnight-hemp': return 'from-purple-950/80 via-purple-950/40'
      case 'golden-hour': return 'from-amber-950/80 via-amber-950/40'
      default: return 'from-sky-100/80 via-sky-50/40'
    }
  }

  // Get theme-specific secondary navbar colors
  const getThemeSecondaryNavBg = () => {
    switch(theme) {
      case 'default': return 'bg-sky-950/60'
      case 'solarpunk-dreams': return 'bg-emerald-950/60'
      case 'midnight-hemp': return 'bg-purple-950/60'
      case 'golden-hour': return 'bg-amber-950/60'
      default: return 'bg-sky-950/60'
    }
  }

  // Scroll to carousel section
  const scrollToCarousel = () => {
    carouselSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
      setClickedCard(null)
    }, 8000)
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
    setClickedCard(clickedCard === cardIndex ? null : cardIndex)
    
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
      features: [
        { icon: Flame, label: 'Daily Streaks', color: 'from-orange-500 to-red-500' },
        { icon: Trophy, label: '35+ Achievements', color: 'from-yellow-500 to-amber-500' },
        { icon: Target, label: 'Progressive Rewards', color: 'from-green-500 to-emerald-500' },
        { icon: Star, label: 'Level Up', color: 'from-purple-500 to-pink-500' }
      ]
    },
    {
      title: "Community Power",
      subtitle: "Vote, Share, Create Together",
      description: "Join a thriving community where your voice matters. Vote on features and submit ideas.",
      icon: Users,
      features: [
        { icon: TrendingUp, label: 'Community Voting', color: 'from-cyan-500 to-blue-500' },
        { icon: Sparkles, label: 'Submit Ideas', color: 'from-violet-500 to-purple-500' },
        { icon: Heart, label: 'Share Articles', color: 'from-rose-500 to-pink-500' },
        { icon: Users, label: 'Reading Matches', color: 'from-teal-500 to-green-500' }
      ]
    },
    {
      title: "Unlock Features",
      subtitle: "NADA Points Buy Power",
      description: "Trade NADA for exclusive features like Swipe Mode, custom themes, and hemp merch.",
      icon: Unlock,
      features: [
        { icon: Zap, label: 'Swipe Mode', color: 'from-amber-500 to-orange-500' },
        { icon: ShoppingBag, label: 'Hemp Merch', color: 'from-emerald-500 to-teal-500' },
        { icon: Palette, label: 'Custom Themes', color: 'from-purple-500 to-pink-500' },
        { icon: Gift, label: 'Exclusive Access', color: 'from-blue-500 to-cyan-500' }
      ]
    }
  ]

  // Feature Cards for Horizontal Carousel
  const featureCards = [
    {
      title: "MAG - Editorial Feed",
      description: "Discover premium hemp articles in an infinite scrolling nebula feed with aurora gradients",
      icon: BookOpen,
      gradient: "from-purple-600 via-indigo-600 to-purple-700",
      stats: "+12 NADA per article",
      miniApp: "MAG"
    },
    {
      title: "SWIPE - Quick Discovery",
      description: "Tinder-style article swiping. Right for save, left to skip. Fast-paced content curation",
      icon: Zap,
      gradient: "from-amber-500 via-orange-500 to-red-500",
      stats: "Unlock at 500 NADA",
      miniApp: "SWIPE"
    },
    {
      title: "PLACES - Hemp Map",
      description: "Global directory of hemp businesses, farms, and shops. Find local hemp near you",
      icon: MapPin,
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      stats: "1000+ locations",
      miniApp: "PLACES"
    },
    {
      title: "SWAP - Barter Items",
      description: "C2C marketplace for trading used hemp products peer-to-peer. Sustainable commerce",
      icon: Package,
      gradient: "from-cyan-600 via-teal-600 to-cyan-700",
      stats: "Zero transaction fees",
      miniApp: "SWAP"
    },
    {
      title: "FORUM - Hemp Agora",
      description: "Civic-inspired discussion threads. Debate hemp policy, share grows, connect with experts",
      icon: MessageCircle,
      gradient: "from-slate-600 via-gray-700 to-slate-800",
      stats: "Real-time discussions",
      miniApp: "FORUM"
    },
    {
      title: "GLOBE - World News",
      description: "Breaking hemp news from every country. Real-time updates from the global hemp economy",
      icon: Globe,
      gradient: "from-emerald-600 via-teal-600 to-green-700",
      stats: "24/7 news stream",
      miniApp: "GLOBE"
    },
    {
      title: "SWAG - Merch Store",
      description: "Official hemp organization merchandise. Buy exclusive products with NADA points",
      icon: ShoppingBag,
      gradient: "from-emerald-500 via-teal-500 to-green-600",
      stats: "100+ products",
      miniApp: "SWAG"
    },
    {
      title: "HUNT - Terpene Quest",
      description: "Gamified terpene education. Learn cannabis chemistry through interactive challenges",
      icon: Target,
      gradient: "from-violet-600 via-purple-600 to-fuchsia-700",
      stats: "50+ terpenes to discover",
      miniApp: "HUNT"
    },
    {
      title: "Daily Streaks",
      description: "Read every day to build your streak. Unlock multipliers and bonus achievements",
      icon: Flame,
      gradient: "from-orange-500 via-red-500 to-rose-600",
      stats: "3x points at 30 days",
      miniApp: "STREAKS"
    },
    {
      title: "Achievements System",
      description: "35+ unlockable badges from Week Warrior to Speed Reader. Show off your dedication",
      icon: Trophy,
      gradient: "from-yellow-500 via-amber-500 to-orange-600",
      stats: "35+ badges",
      miniApp: "BADGES"
    },
    {
      title: "Community Voting",
      description: "Vote on feature requests and product decisions. Your voice shapes the platform",
      icon: TrendingUp,
      gradient: "from-cyan-500 via-blue-500 to-indigo-600",
      stats: "Democratic governance",
      miniApp: "VOTE"
    },
    {
      title: "Reader Matching",
      description: "AI matches you with readers who share your interests. Start conversations, collaborate",
      icon: Users,
      gradient: "from-teal-500 via-emerald-500 to-green-600",
      stats: "Smart AI matching",
      miniApp: "MATCH"
    },
    {
      title: "Hemp Provenance",
      description: "Track product origins, certifications, and carbon footprint. Verified supply chains",
      icon: Shield,
      gradient: "from-green-600 via-emerald-600 to-teal-700",
      stats: "Blockchain verified",
      miniApp: "PROVENANCE"
    },
    {
      title: "Wallet & Points",
      description: "Earn NADA points for every action. Spend on features, merch, and premium content",
      icon: Coins,
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
      stats: "∞ earning potential",
      miniApp: "WALLET"
    }
  ]

  const totalSlides = slides.length
  const currentSlideData = slides[currentSlide]

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
    <div className={`min-h-screen bg-gradient-to-br ${getThemeBackground()} text-foreground overflow-x-hidden`}>
      
      {/* Hemp fiber texture overlay */}
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '80px 80px'
      }} />

      {/* Animated background orbs */}
      <div className={`fixed top-20 left-20 w-64 h-64 ${getThemeOrbColors()[0]} rounded-full blur-3xl animate-pulse pointer-events-none`} />
      <div className={`fixed bottom-20 right-20 w-80 h-80 ${getThemeOrbColors()[1]} rounded-full blur-3xl animate-pulse pointer-events-none`} style={{ animationDelay: '1s' }} />
      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${getThemeOrbColors()[2]} rounded-full blur-3xl animate-pulse pointer-events-none`} style={{ animationDelay: '0.5s' }} />

      {/* Top Header - Fixed at Top */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full">
        <div 
          className="absolute inset-0 backdrop-blur-xl bg-gradient-to-b from-emerald-950/80 via-emerald-950/40 to-transparent"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
          }}
        />

        <div className="relative">
          <div className="container mx-auto px-4 py-5">
            <div className="flex items-center justify-center">
              <button
                ref={logoRef}
                onClick={() => {
                  if (logoRef.current) {
                    const rect = logoRef.current.getBoundingClientRect()
                    setBubblePosition({
                      x: rect.left + rect.width / 2,
                      y: rect.bottom + 10
                    })
                  }
                  setShowBubbleController(!showBubbleController)
                }}
                className="relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded-full"
                aria-label="Open gaming menu"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-all" />
                
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-green-500 flex items-center justify-center shadow-xl">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                  <Leaf className="relative w-8 h-8 text-white drop-shadow-lg" strokeWidth={2.5} />
                  <div className="absolute top-2 right-2 w-4 h-4 bg-white/40 rounded-full blur-md" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO - Centered DEWII branding + CTA */}
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          {/* DEWII Branding - Comic style */}
          <motion.div 
            className="relative inline-block"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Comic drop shadow */}
            <div 
              className="absolute inset-0 text-emerald-950/80 font-black"
              style={{
                transform: 'translate(6px, 6px)',
                zIndex: -1
              }}
            >
              <div className="text-center">
                <h1 className="text-7xl sm:text-8xl md:text-9xl tracking-tighter">
                  DEWII
                </h1>
                <p className="text-base sm:text-lg tracking-wider mt-2">
                  Digital Eco-Wisdom Interface
                </p>
              </div>
            </div>

            {/* Main text */}
            <div className="relative text-center">
              <h1 
                className="text-7xl sm:text-8xl md:text-9xl font-black text-white tracking-tighter" 
                style={{
                  textShadow: '0 0 30px rgba(16, 185, 129, 0.8), 4px 4px 0 rgba(5, 150, 105, 0.9)'
                }}
              >
                DEWII
              </h1>
              <p 
                className="text-base sm:text-lg text-emerald-300 font-bold tracking-wider mt-2"
                style={{
                  textShadow: '0 0 15px rgba(16, 185, 129, 0.6), 3px 3px 0 rgba(5, 150, 105, 0.8)'
                }}
              >
                Digital Eco-Wisdom Interface
              </p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="space-y-4 flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {/* Sign In / Join Button */}
            <Button
              onClick={() => {
                setAuthModalMode('signup')
                setAuthModalOpen(true)
              }}
              className={`relative group h-20 px-16 rounded-full ${getThemeButtonColor()} ${getThemeButtonTextColor()} font-black text-2xl shadow-2xl hover:scale-105 transition-all`}
            >
              <div className={`absolute -inset-3 bg-gradient-to-r ${getThemeGlow()} rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity`} />
              
              <div className="relative flex items-center gap-4">
                <LogIn className="w-8 h-8" strokeWidth={3} />
                <span>Sign In / Join</span>
              </div>
            </Button>

            {/* Learn More Button */}
            <Button
              onClick={scrollToCarousel}
              variant="ghost"
              className={`group h-14 px-8 rounded-full border-2 ${getThemeBorderColor()} hover:bg-opacity-40 ${getThemeTextColor()} font-bold text-lg transition-all`}
            >
              <div className="flex items-center gap-3">
                <span>Learn More</span>
                <ChevronDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" strokeWidth={2.5} />
              </div>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: CAROUSEL - Full features carousel */}
      <section ref={carouselSectionRef} className="min-h-screen relative pt-24 pb-32">
        {/* Secondary Navbar - Carousel Navigation Icons */}
        <div className="sticky top-20 left-0 right-0 z-40 w-full mb-12">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div 
              className="absolute inset-0 backdrop-blur-md"
              style={{
                WebkitMaskImage: 'radial-gradient(ellipse 60% 100% at center, black 0%, rgba(0,0,0,0.6) 40%, transparent 70%)',
                maskImage: 'radial-gradient(ellipse 60% 100% at center, black 0%, rgba(0,0,0,0.6) 40%, transparent 70%)'
              }}
            />
            <div 
              className="absolute inset-0 bg-emerald-950/40"
              style={{
                WebkitMaskImage: 'radial-gradient(ellipse 50% 100% at center, black 0%, rgba(0,0,0,0.4) 30%, transparent 60%)',
                maskImage: 'radial-gradient(ellipse 50% 100% at center, black 0%, rgba(0,0,0,0.4) 30%, transparent 60%)'
              }}
            />
          </div>
          
          <div className="relative h-16 flex items-center justify-center px-2 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-6">
              <button
                onClick={slideToPrevious}
                disabled={isSliding}
                className="flex-shrink-0 p-2 sm:p-2.5 rounded-full bg-emerald-950/60 border-2 border-emerald-700/40 hover:border-emerald-500/60 hover:bg-emerald-900/70 hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
              </button>

              <div className="flex items-center gap-2 sm:gap-4">
                {visibleSlides.map(({ icon: Icon, offset, index, title }) => {
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
                      className={`relative flex-shrink-0 p-2.5 sm:p-4 rounded-full transition-all duration-500 ease-out border-2 ${
                        isCenter
                          ? 'bg-gradient-to-br from-emerald-400 via-teal-400 to-green-500 border-emerald-950 shadow-xl cursor-default'
                          : 'bg-emerald-950/50 border-emerald-800/30 hover:bg-emerald-900/60 hover:scale-90 cursor-pointer'
                      } ${isSliding ? 'pointer-events-none' : ''}`}
                      title={title}
                    >
                      {isCenter && (
                        <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none" style={{
                          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.6) 1px, transparent 0)`,
                          backgroundSize: '8px 8px'
                        }} />
                      )}
                      
                      {isCenter && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-300/30 to-transparent blur-md" />
                      )}
                      
                      <Icon 
                        className={`relative w-5 h-5 sm:w-7 sm:h-7 transition-colors duration-500 ${ 
                          isCenter 
                            ? 'text-emerald-950 drop-shadow-lg' 
                            : 'text-emerald-400/60'
                        }`}
                        strokeWidth={isCenter ? 3 : 2}
                      />
                    </motion.button>
                  )
                })}
              </div>

              <button
                onClick={slideToNext}
                disabled={isSliding}
                className="flex-shrink-0 p-2 sm:p-2.5 rounded-full bg-emerald-950/60 border-2 border-emerald-700/40 hover:border-emerald-500/60 hover:bg-emerald-900/70 hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Content */}
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
          >
            {/* Title & Subtitle */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <motion.h2 
                className={`text-5xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r ${getThemeTitleGradient()}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {currentSlideData.title}
              </motion.h2>
              <motion.p 
                className={`text-xl sm:text-2xl ${getThemeTextColor()}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {currentSlideData.subtitle}
              </motion.p>
            </div>

            {/* Feature Cards */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              {currentSlideData.features.map((feature, i) => (
                <motion.button
                  key={feature.label}
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={(e) => handleCardClick(i, e)}
                  className="group relative aspect-square transition-all duration-300 hover:scale-105 active:scale-95"
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.5 + (i * 0.1),
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <div 
                    className="absolute inset-0 bg-emerald-950 rounded-3xl"
                    style={{
                      transform: 'translate(6px, 6px)',
                      zIndex: -1
                    }}
                  />
                  <div className={`relative w-full h-full bg-gradient-to-br ${feature.color} rounded-3xl border-4 border-emerald-950 shadow-2xl overflow-hidden flex items-center justify-center`}>
                    <div className="absolute inset-0 rounded-3xl opacity-30 pointer-events-none" style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,200,0.4) 1px, transparent 0)`,
                      backgroundSize: '12px 12px'
                    }} />
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <feature.icon className="relative w-12 h-12 md:w-16 md:h-16 text-emerald-950 drop-shadow-lg" strokeWidth={3} />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="mt-3">
                    <p className="text-sm md:text-base font-bold text-center text-emerald-100">
                      {feature.label}
                    </p>
                  </div>
                </motion.button>
              ))}
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-center text-lg text-emerald-200 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              {currentSlideData.description}
            </motion.p>

            {/* Stats Pills (only for Unlock Features) */}
            {currentSlideData.title === 'Unlock Features' && (
              <motion.div 
                className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/60 backdrop-blur-xl border border-emerald-500/30">
                  <Trophy className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-100">35+ Achievements</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/60 backdrop-blur-xl border border-amber-500/30">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-bold text-emerald-100">10+ Features</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/60 backdrop-blur-xl border border-violet-500/30">
                  <Coins className="w-5 h-5 text-violet-400" />
                  <span className="text-sm font-bold text-emerald-100">∞ NADA Points</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: FEATURE SHOWCASE - Horizontal Carousel */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <motion.div 
            className="text-center space-y-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={`text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${getThemeTitleGradient()}`}>
              Everything You Need
            </h2>
            <p className={`text-lg sm:text-xl ${getThemeTextColor()} max-w-2xl mx-auto`}>
              From editorial feeds to global maps, from community forums to hemp commerce
            </p>
          </motion.div>

          {/* Horizontal Scrolling Carousel */}
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide pb-8">
              <div className="flex gap-6 min-w-max px-4">
                {featureCards.map((card, index) => (
                  <motion.div
                    key={card.miniApp}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="group relative w-80 sm:w-96 flex-shrink-0"
                  >
                    {/* Comic Drop Shadow */}
                    <div 
                      className="absolute inset-0 bg-emerald-950/80 rounded-3xl"
                      style={{
                        transform: 'translate(8px, 8px)',
                        zIndex: -1
                      }}
                    />

                    {/* Card Content */}
                    <div className={`relative h-full bg-gradient-to-br ${card.gradient} rounded-3xl border-4 border-emerald-950 shadow-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl`}>
                      {/* Pattern Overlay */}
                      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.6) 1px, transparent 0)`,
                        backgroundSize: '16px 16px'
                      }} />

                      {/* Gradient Glow on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />

                      {/* Content */}
                      <div className="relative p-8 flex flex-col h-full min-h-[320px]">
                        {/* Icon */}
                        <div className="mb-6">
                          <div className="inline-flex p-4 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20">
                            <card.icon className="w-10 h-10 text-white drop-shadow-lg" strokeWidth={2.5} />
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-black text-white mb-3 drop-shadow-lg">
                          {card.title}
                        </h3>

                        {/* Description */}
                        <p className="text-white/90 text-base mb-6 flex-grow leading-relaxed">
                          {card.description}
                        </p>

                        {/* Stats Badge */}
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 w-fit">
                          <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
                          <span className="text-sm font-bold text-white">
                            {card.stats}
                          </span>
                        </div>

                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Fade Edges Indicators */}
            <div className="absolute left-0 top-0 bottom-8 w-24 bg-gradient-to-r from-emerald-950 via-emerald-950/50 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-8 w-24 bg-gradient-to-l from-emerald-950 via-emerald-950/50 to-transparent pointer-events-none" />
          </div>

          {/* CTA Below Carousel */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              onClick={() => {
                setAuthModalMode('signup')
                setAuthModalOpen(true)
              }}
              className={`h-16 px-12 rounded-full ${getThemeButtonColor()} ${getThemeButtonTextColor()} font-black text-xl shadow-2xl hover:scale-105 transition-all`}
            >
              <div className="flex items-center gap-3">
                <LogIn className="w-6 h-6" strokeWidth={3} />
                <span>Start Your Journey</span>
              </div>
            </Button>
            <p className={`mt-4 text-sm ${getThemeTextColor()} opacity-70`}>
              Join thousands of hemp enthusiasts worldwide
            </p>
          </motion.div>
        </div>
      </section>

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
            <div className="relative">
              <div className="absolute -inset-4 bg-amber-400 rounded-full blur-xl opacity-60 animate-pulse" />
              <Zap className="relative w-12 h-12 text-amber-400 fill-amber-400 drop-shadow-2xl" strokeWidth={0} />
            </div>
          ) : (
            <div className="relative">
              <div className="absolute -inset-4 bg-teal-400 rounded-full blur-xl opacity-60 animate-pulse" />
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-teal-400 rounded-full animate-ping" />
                <div className="absolute inset-2 border-4 border-teal-300 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                <Coins className="relative w-6 h-6 text-teal-400 drop-shadow-2xl" strokeWidth={3} />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onLogin={onLogin}
        onSignup={onSignup}
      />

      {/* Bubble Controller */}
      <BubbleController
        isVisible={showBubbleController}
        onWikiClick={() => {
          setShowBubbleController(false)
          setShowWikiPage(true)
        }}
        onThemeClick={() => {
          cycleTheme()
          setShowBubbleController(false)
        }}
        onClose={() => setShowBubbleController(false)}
        position={bubblePosition}
      />

      {/* Wiki Page */}
      <WikiPage
        isOpen={showWikiPage}
        onClose={() => setShowWikiPage(false)}
      />

      <style>{`
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

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  )
}