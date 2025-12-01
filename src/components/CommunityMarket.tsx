import { BrandLogo } from './BrandLogo'
import { WorldMapBrowser3D } from './WorldMapBrowser3D'
import { HempForum } from './HempForum'
import { useState, useEffect } from 'react'
import { ArrowLeft, Store, Zap, TrendingUp, X, ChevronRight, Leaf, Sparkles, Settings, User, BookOpen, Building2, MessageCircle } from 'lucide-react'
import { Button } from './ui/button'
import { VotingModal } from './VotingModal'
import { SubmitIdeaModal } from './SubmitIdeaModal'
import { Badge } from './ui/badge'
import { NadaWalletPanel } from './NadaWalletPanel'
import { MarketSettings } from './MarketSettings'
import { MarketProfilePanel } from './MarketProfilePanel'
import { BudCharacter } from './BudCharacter'
import { BudModal } from './BudModal'
import { AddOrganization } from './AddOrganization'
import { OrganizationProfilePage } from './OrganizationProfilePage'

// Circular Forum Icon (like community discussion circles)
function CircularForumIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circle */}
      <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="4" opacity="0.8" fill="none" />
      
      {/* Inner circles - forum seats */}
      <circle cx="50" cy="20" r="6" fill="currentColor" opacity="0.9" />
      <circle cx="73" cy="30" r="6" fill="currentColor" opacity="0.9" />
      <circle cx="80" cy="50" r="6" fill="currentColor" opacity="0.9" />
      <circle cx="73" cy="70" r="6" fill="currentColor" opacity="0.9" />
      <circle cx="50" cy="80" r="6" fill="currentColor" opacity="0.9" />
      <circle cx="27" cy="70" r="6" fill="currentColor" opacity="0.9" />
      <circle cx="20" cy="50" r="6" fill="currentColor" opacity="0.9" />
      <circle cx="27" cy="30" r="6" fill="currentColor" opacity="0.9" />
      
      {/* Center hub */}
      <circle cx="50" cy="50" r="10" fill="currentColor" opacity="1" />
    </svg>
  )
}

// NADA Ripple Icon
function NadaRippleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Center droplet */}
      <circle cx="50" cy="50" r="8" fill="currentColor" opacity="1" />
      
      {/* First ripple */}
      <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="3" opacity="0.7" fill="none" />
      
      {/* Second ripple */}
      <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="2.5" opacity="0.5" fill="none" />
      
      {/* Third ripple */}
      <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="2" opacity="0.3" fill="none" />
    </svg>
  )
}

interface CommunityMarketProps {
  userId: string | null
  accessToken: string | null
  serverUrl: string
  onBack: () => void
  onNavigateToBrowse?: () => void
  onFeatureUnlock?: (featureId: any) => void
  userEmail?: string | null
  nadaPoints: number
  onNadaUpdate: (newBalance: number) => void
  onNavigateToSwagShop?: () => void
  onNavigateToSwagMarketplace?: () => void
  onNavigateToSettings?: () => void
  equippedBadgeId?: string | null
  profileBannerUrl?: string | null
  marketUnlocked?: boolean
}

export default function CommunityMarket({
  userId,
  accessToken,
  serverUrl,
  onBack,
  onNavigateToBrowse,
  onFeatureUnlock,
  userEmail,
  nadaPoints,
  onNadaUpdate,
  onNavigateToSwagShop,
  onNavigateToSwagMarketplace,
  onNavigateToSettings,
  equippedBadgeId,
  profileBannerUrl,
  marketUnlocked = false
}: CommunityMarketProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showTutorial, setShowTutorial] = useState(true)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [showVotingModal, setShowVotingModal] = useState(false)
  const [showSubmitIdeaModal, setShowSubmitIdeaModal] = useState(false)
  const [showNadaWallet, setShowNadaWallet] = useState(false)
  const [showMarketSettings, setShowMarketSettings] = useState(false)
  const [showProfilePanel, setShowProfilePanel] = useState(false)
  const [selectedMarketTheme, setSelectedMarketTheme] = useState('default')
  
  // World Map and Company states
  const [showWorldMap, setShowWorldMap] = useState(false)
  const [showManageOrganization, setShowManageOrganization] = useState(false)
  const [showAddOrganization, setShowAddOrganization] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [previousView, setPreviousView] = useState<'list' | 'map' | null>(null)
  
  // BUD helper modals
  const [showSwagMarketInfo, setShowSwagMarketInfo] = useState(false)
  const [showHempAtlasInfo, setShowHempAtlasInfo] = useState(false)
  const [showMagazineInfo, setShowMagazineInfo] = useState(false)
  const [showHempForumInfo, setShowHempForumInfo] = useState(false)
  
  // Hemp Forum
  const [showHempForum, setShowHempForum] = useState(false)
  
  // User's personal market stats
  const [userStats, setUserStats] = useState({
    totalVotes: 0,
    totalIdeasSubmitted: 0,
    totalUnlocks: 0
  })

  // Fetch user's selected theme on mount
  useEffect(() => {
    if (userId && accessToken) {
      fetchUserTheme()
    }
  }, [userId, accessToken])

  const fetchUserTheme = async () => {
    if (!userId || !accessToken) return

    try {
      const response = await fetch(
        `${serverUrl}/user-progress/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        const theme = data.selectedTheme || 'default'
        setSelectedMarketTheme(theme)
        console.log('Loaded market theme:', theme)
      }
    } catch (error) {
      console.error('Error fetching user theme:', error)
    }
  }

  // Callback to update theme instantly (no reload)
  const handleThemeUpdate = (newTheme: string) => {
    setSelectedMarketTheme(newTheme)
    console.log('Theme updated instantly:', newTheme)
  }

  // Theme background classes
  const getThemeBackgroundClass = () => {
    switch (selectedMarketTheme) {
      case 'solarpunk':
        return 'bg-gradient-to-br from-emerald-900 via-green-800 to-amber-900'
      case 'midnight':
        return 'bg-gradient-to-br from-purple-950 via-indigo-900 to-violet-950'
      case 'golden':
        return 'bg-gradient-to-br from-orange-900 via-amber-800 to-yellow-950'
      default:
        return 'bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950'
    }
  }

  // Theme glow colors
  const getThemeGlowColors = () => {
    switch (selectedMarketTheme) {
      case 'solarpunk':
        return {
          primary: 'bg-emerald-500/20',
          secondary: 'bg-amber-500/20',
          tertiary: 'bg-green-400/10'
        }
      case 'midnight':
        return {
          primary: 'bg-purple-500/20',
          secondary: 'bg-indigo-500/20',
          tertiary: 'bg-violet-400/10'
        }
      case 'golden':
        return {
          primary: 'bg-orange-500/20',
          secondary: 'bg-amber-500/20',
          tertiary: 'bg-yellow-400/10'
        }
      default:
        return {
          primary: 'bg-emerald-500/20',
          secondary: 'bg-teal-500/20',
          tertiary: 'bg-green-400/10'
        }
    }
  }

  // Check if user has seen tutorial before
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(`market_tutorial_${userId}`)
    if (hasSeenTutorial) {
      setShowTutorial(false)
    }
  }, [userId])
  
  // Fetch user's market stats
  useEffect(() => {
    if (userId && accessToken && !showTutorial) {
      fetchUserStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, accessToken, showTutorial])
  
  const fetchUserStats = async () => {
    if (!userId || !accessToken) return
    
    try {
      const response = await fetch(`${serverUrl}/user-market-stats/${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserStats({
          totalVotes: data.totalVotes || 0,
          totalIdeasSubmitted: data.totalIdeasSubmitted || 0,
          totalUnlocks: data.totalUnlocks || 0
        })
      }
    } catch (error) {
      console.error('Error fetching user market stats:', error)
    }
  }
  
  // Refresh stats after voting or submitting idea
  const handleVoteSuccess = (newBalance: number) => {
    onNadaUpdate(newBalance)
    fetchUserStats() // Refresh stats
    console.log('Vote successful! New NADA balance:', newBalance)
  }
  
  const handleIdeaSubmitSuccess = () => {
    fetchUserStats() // Refresh stats
    console.log('Idea submitted successfully!')
  }

  const tutorialSteps = [
    {
      title: "Welcome to Community Market",
      description: "Your voice shapes DEWII's future. Vote, submit ideas, and earn rewards!",
      icon: Store,
      gradient: "from-purple-500 via-pink-500 to-amber-500"
    },
    {
      title: "NADA Currency",
      description: "Use NADA to vote on features and submit proposals. Earn more by reading!",
      icon: NadaRippleIcon,
      gradient: "from-violet-500 via-purple-500 to-indigo-500"
    },
    {
      title: "Shape the Future",
      description: "Top proposals get implemented. Contributors earn rewards!",
      icon: TrendingUp,
      gradient: "from-blue-500 via-cyan-500 to-teal-500"
    }
  ]

  const handleTutorialComplete = () => {
    localStorage.setItem(`market_tutorial_${userId}`, 'true')
    setShowTutorial(false)
  }

  const handleSkipTutorial = () => {
    localStorage.setItem(`market_tutorial_${userId}`, 'true')
    setShowTutorial(false)
  }

  // Tutorial Full Screen Overlay - Mobile Optimized
  if (showTutorial) {
    const currentStep = tutorialSteps[tutorialStep]
    const Icon = currentStep.icon

    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4 overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 animate-float"
              style={{
                width: `${Math.random() * 100 + 30}px`,
                height: `${Math.random() * 100 + 30}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`
              }}
            />
          ))}
        </div>

        {/* Tutorial Card - Mobile Optimized */}
        <div className="relative w-full max-w-md mx-auto flex flex-col items-center">
          {/* Skip button - Fixed top right */}
          <button
            onClick={handleSkipTutorial}
            className="fixed top-4 right-4 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors text-white shadow-xl"
            aria-label="Skip tutorial"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Main Content Card */}
          <div className="relative w-full overflow-hidden rounded-3xl bg-black/40 backdrop-blur-2xl border-2 border-white/20 p-6 sm:p-8 shadow-2xl">
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentStep.gradient} opacity-10`} />
            
            {/* Halftone pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: '12px 12px'
            }} />
            
            {/* Content */}
            <div className="relative z-10 text-center space-y-6">
              {/* Icon with glow */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className={`absolute -inset-4 bg-gradient-to-r ${currentStep.gradient} rounded-full blur-2xl opacity-50 animate-pulse`} />
                  <div className={`relative bg-gradient-to-r ${currentStep.gradient} rounded-full p-6 shadow-2xl`}>
                    {Icon === NadaRippleIcon ? (
                      <NadaRippleIcon className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
                    ) : (
                      <Icon className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
                    )}
                  </div>
                </div>
              </div>

              {/* Title - Mobile optimized */}
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight px-2">
                {currentStep.title}
              </h2>

              {/* Description - Mobile optimized */}
              <p className="text-base sm:text-lg text-white/90 leading-relaxed px-2">
                {currentStep.description}
              </p>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 pt-2">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === tutorialStep 
                        ? 'w-8 bg-white shadow-lg' 
                        : 'w-2 bg-white/30'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Button */}
              <div className="pt-4">
                {tutorialStep < tutorialSteps.length - 1 ? (
                  <Button
                    onClick={() => setTutorialStep(tutorialStep + 1)}
                    className={`w-full bg-gradient-to-r ${currentStep.gradient} hover:opacity-90 text-white font-black text-lg px-6 py-6 rounded-2xl shadow-xl border-2 border-white/20`}
                  >
                    Next <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleTutorialComplete}
                    className={`w-full bg-gradient-to-r ${currentStep.gradient} hover:opacity-90 text-white font-black text-lg px-6 py-6 rounded-2xl shadow-xl border-2 border-white/20`}
                  >
                    Enter Market <Sparkles className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </div>

              {/* Step indicator text */}
              <div className="text-white/60 text-sm font-semibold">
                {tutorialStep + 1} / {tutorialSteps.length}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) translateX(0) rotate(0deg);
              opacity: 0.1;
            }
            50% {
              transform: translateY(-80px) translateX(40px) rotate(180deg);
              opacity: 0.3;
            }
          }
          
          .animate-float {
            animation: float linear infinite;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Solarpunk Hemp Universe Background - Dynamic Theme */}
      <div className={`fixed inset-0 ${getThemeBackgroundClass()}`}>
        {/* Hemp fiber texture overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }} />
        
        {/* Organic glow orbs - Dynamic Theme Colors */}
        {(() => {
          const glows = getThemeGlowColors()
          return (
            <>
              <div className={`absolute top-20 left-20 w-96 h-96 ${glows.primary} rounded-full blur-3xl animate-pulse`} />
              <div className={`absolute bottom-40 right-20 w-[32rem] h-[32rem] ${glows.secondary} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }} />
              <div className={`absolute top-1/2 left-1/3 w-64 h-64 ${glows.tertiary} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }} />
            </>
          )
        })()}
        
        {/* Floating hemp leaves */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-10"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `floatLeaf ${15 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            >
              <Leaf className="w-12 h-12 text-emerald-300" style={{
                transform: `rotate(${Math.random() * 360}deg)`
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Custom Market Header */}
      <div className="sticky top-0 z-50">
        {/* Gradient blur mask */}
        <div 
          className="absolute inset-0 backdrop-blur-2xl"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
          }}
        />
        
        <div className="h-20 flex items-center justify-center relative px-4">
          {/* Empty Left Space for symmetry */}
          <div className="absolute left-4 flex items-center gap-2">
          </div>
          
          {/* CENTER: DEWII Logo Button */}
          <button
            onClick={() => {
              // Cycle through market themes
              const themes = ['default', 'solarpunk', 'midnight', 'golden']
              const currentIndex = themes.indexOf(selectedMarketTheme)
              const nextIndex = (currentIndex + 1) % themes.length
              const nextTheme = themes[nextIndex]
              setSelectedMarketTheme(nextTheme)
              
              // Save theme to server
              if (userId && accessToken) {
                fetch(`${serverUrl}/user-theme`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                  },
                  body: JSON.stringify({ theme: nextTheme })
                }).catch(err => console.error('Failed to save theme:', err))
              }
            }}
            className="group relative flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 active:scale-95 z-10"
            aria-label="Change theme"
          >
            {/* Animated glow background */}
            <div className="absolute -inset-6 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-500" />
            
            {/* Outer ring - Nice gradient transparent aura */}
            <div className="relative rounded-full p-1.5 transition-all group-hover:scale-110 bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-purple-500/20 group-hover:from-emerald-400/30 group-hover:via-teal-400/30 group-hover:to-purple-400/30 backdrop-blur-sm">
              {/* Inner circle - Semi-transparent */}
              <div className="rounded-full p-4 sm:p-5 bg-black/40 backdrop-blur-md">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                  <BrandLogo size="sm" showAnimation={false} theme="default" />
                </div>
              </div>
            </div>
          </button>
          
          {/* NADA Counter - Right Side */}
          <div className="absolute right-4 flex items-center gap-2">
            <button onClick={() => setShowNadaWallet(true)}>
              <Badge
                variant="secondary"
                className="gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-400/30 text-violet-300 shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <NadaRippleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-violet-300" />
                <span className="font-bold">{nadaPoints}</span>
              </Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Cards & Stats are the hero */}
      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12">
        {/* Feature Cards Grid - Hemp Atlas, Hemp Forum, Swag Market, Magazine */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-12">
          {/* Card 1 - Hemp Atlas */}
          <div className="relative">
            {/* BUD Helper - Flying above card */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowHempAtlasInfo(true)
              }}
              className="absolute -top-8 right-4 z-50 group/bud animate-bounce"
              style={{ animationDuration: '3s' }}
              title="What is this?"
            >
              <BudCharacter size="sm" className="hover:scale-125 transition-transform drop-shadow-2xl" />
            </button>

            <div className="group relative overflow-hidden rounded-[2rem] backdrop-blur-xl border-3 border-emerald-400/40 hover:border-emerald-300/70 transition-all duration-500 hover:scale-105 hover:-translate-y-3 shadow-[0_20px_60px_rgba(16,185,129,0.3)] hover:shadow-[0_30px_80px_rgba(16,185,129,0.5)]">
              {/* Organic texture pattern */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='20' y='10' width='20' height='30' fill='%2310b981' fill-opacity='0.3'/%3E%3Crect x='15' y='15' width='30' height='35' fill='%2310b981' fill-opacity='0.2'/%3E%3C/svg%3E")`,
                backgroundSize: '40px 40px'
              }} />
              
              {/* Gradient background with depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-green-900/70 to-teal-900/80" />
              
              {/* Depth layers */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-emerald-500/10 to-green-500/10" />
              
              {/* Outer glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
              
              <div className="relative p-8 space-y-6">
                {/* Icon and Title - Side by Side */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 flex-shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-3xl font-black text-white drop-shadow-lg">Hemp Atlas</h3>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white font-black text-base py-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105"
                  onClick={() => {
                    setShowWorldMap(true)
                    setShowManageOrganization(false) // Reset state for clean atlas opening
                    setShowAddOrganization(false) // Reset this too
                  }}
                >
                  Open Hemp'in Globe
                </Button>
              </div>
            </div>
          </div>

          {/* Card 2 - Hemp Forum */}
          <div className="relative">
            {/* BUD Helper - Flying above card */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowHempForumInfo(true)
              }}
              className="absolute -top-8 right-4 z-50 group/bud animate-bounce"
              style={{ animationDuration: '3s', animationDelay: '0.5s' }}
              title="What is this?"
            >
              <BudCharacter size="sm" className="hover:scale-125 transition-transform drop-shadow-2xl" />
            </button>

            <div className="group relative overflow-hidden rounded-[2rem] backdrop-blur-xl border-3 border-purple-400/40 hover:border-purple-300/70 transition-all duration-500 hover:scale-105 hover:-translate-y-3 shadow-[0_20px_60px_rgba(168,85,247,0.3)] hover:shadow-[0_30px_80px_rgba(168,85,247,0.5)]">
              {/* Organic texture pattern */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='15' cy='15' r='3' fill='%23a855f7' fill-opacity='0.3'/%3E%3Ccircle cx='30' cy='15' r='3' fill='%23a855f7' fill-opacity='0.3'/%3E%3Ccircle cx='45' cy='15' r='3' fill='%23a855f7' fill-opacity='0.3'/%3E%3Ccircle cx='15' cy='30' r='3' fill='%23a855f7' fill-opacity='0.3'/%3E%3Ccircle cx='30' cy='30' r='5' fill='%23a855f7' fill-opacity='0.4'/%3E%3Ccircle cx='45' cy='30' r='3' fill='%23a855f7' fill-opacity='0.3'/%3E%3Ccircle cx='15' cy='45' r='3' fill='%23a855f7' fill-opacity='0.3'/%3E%3Ccircle cx='30' cy='45' r='3' fill='%23a855f7' fill-opacity='0.3'/%3E%3Ccircle cx='45' cy='45' r='3' fill='%23a855f7' fill-opacity='0.3'/%3E%3C/svg%3E")`,
                backgroundSize: '40px 40px'
              }} />
              
              {/* Gradient background with depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-indigo-900/70 to-violet-900/80" />
              
              {/* Depth layers */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/10 to-indigo-500/10" />
              
              {/* Outer glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-violet-500 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
              
              <div className="relative p-8 space-y-6">
                {/* Icon and Title - Side by Side */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 flex-shrink-0 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-3xl font-black text-white drop-shadow-lg">Hemp Forum</h3>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-violet-500 hover:from-purple-600 hover:via-indigo-600 hover:to-violet-600 text-white font-black text-base py-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105"
                  onClick={() => setShowHempForum(true)}
                >
                  Enter Forum
                </Button>
              </div>
            </div>
          </div>

          {/* Card 3 - Swag Market */}
          <div className="relative">
            {/* BUD Helper - Flying above card */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowSwagMarketInfo(true)
              }}
              className="absolute -top-8 right-4 z-50 group/bud animate-bounce"
              style={{ animationDuration: '3s', animationDelay: '1s' }}
              title="What is this?"
            >
              <BudCharacter size="sm" className="hover:scale-125 transition-transform drop-shadow-2xl" />
            </button>

            <div className="group relative overflow-hidden rounded-[2rem] backdrop-blur-xl border-3 border-amber-400/40 hover:border-amber-300/70 transition-all duration-500 hover:scale-105 hover:-translate-y-3 shadow-[0_20px_60px_rgba(245,158,11,0.3)] hover:shadow-[0_30px_80px_rgba(245,158,11,0.5)]">
              {/* Organic texture pattern */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10 L35 25 L50 25 L38 35 L43 50 L30 40 L17 50 L22 35 L10 25 L25 25 Z' fill='%23f59e0b' fill-opacity='0.3'/%3E%3C/svg%3E")`,
                backgroundSize: '40px 40px'
              }} />
              
              {/* Gradient background with depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-yellow-900/70 to-orange-900/80" />
              
              {/* Depth layers */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-500/10 to-yellow-500/10" />
              
              {/* Outer glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
              
              <div className="relative p-8 space-y-6">
                {/* Icon and Title - Side by Side */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 flex-shrink-0 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-2xl shadow-amber-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Store className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-3xl font-black text-white drop-shadow-lg">SWAG MARKET</h3>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white font-black text-base py-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all"
                  onClick={() => onNavigateToSwagMarketplace && onNavigateToSwagMarketplace()}
                >
                  Browse Marketplace
                </Button>
              </div>
            </div>
          </div>

          {/* Card 4 - Magazine */}
          <div className="relative">
            {/* BUD Helper - Flying above card */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMagazineInfo(true)
              }}
              className="absolute -top-8 right-4 z-50 group/bud animate-bounce"
              style={{ animationDuration: '3s', animationDelay: '1.5s' }}
              title="What is this?"
            >
              <BudCharacter size="sm" className="hover:scale-125 transition-transform drop-shadow-2xl" />
            </button>

            <div className="group relative overflow-hidden rounded-[2rem] backdrop-blur-xl border-3 border-pink-400/40 hover:border-pink-300/70 transition-all duration-500 hover:scale-105 hover:-translate-y-3 shadow-[0_20px_60px_rgba(236,72,153,0.3)] hover:shadow-[0_30px_80px_rgba(236,72,153,0.5)]">
              {/* UNLOCKED Badge - Top Right when market is unlocked */}
              {marketUnlocked && (
                <div className="absolute top-6 right-6 z-10">
                  <Badge className="bg-pink-500/40 backdrop-blur-sm text-white border-2 border-pink-400/50 shadow-lg px-4 py-2 font-black text-sm">
                    UNLOCKED
                  </Badge>
                </div>
              )}

              {/* Organic texture pattern */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='15' y='20' width='30' height='20' rx='2' fill='%23ec4899' fill-opacity='0.3'/%3E%3Cline x1='20' y1='25' x2='40' y2='25' stroke='%23ec4899' stroke-width='2' stroke-opacity='0.3'/%3E%3Cline x1='20' y1='30' x2='40' y2='30' stroke='%23ec4899' stroke-width='2' stroke-opacity='0.3'/%3E%3Cline x1='20' y1='35' x2='35' y2='35' stroke='%23ec4899' stroke-width='2' stroke-opacity='0.3'/%3E%3C/svg%3E")`,
                backgroundSize: '40px 40px'
              }} />
              
              {/* Gradient background with depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-900/80 via-rose-900/70 to-fuchsia-900/80" />
              
              {/* Depth layers */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-pink-500/10 to-rose-500/10" />
              
              {/* Outer glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
              
              <div className="relative p-8 space-y-6">
                {/* Icon and Title - Side by Side */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 flex-shrink-0 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-2xl shadow-pink-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <BookOpen className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-3xl font-black text-white drop-shadow-lg">DEWII</h3>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 hover:from-pink-600 hover:via-rose-600 hover:to-fuchsia-600 text-white font-black text-base py-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105"
                  onClick={() => onNavigateToBrowse && onNavigateToBrowse()}
                >
                  Read DEWII
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatLeaf {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.05;
          }
          50% {
            transform: translateY(-60px) translateX(40px) rotate(180deg);
            opacity: 0.15;
          }
        }
      `}</style>

      {/* Add Organization Panel - Full Screen */}
      {showAddOrganization && userId && accessToken && (
        <div className="fixed inset-0 z-[9999]">
          <AddOrganization
            userId={userId}
            accessToken={accessToken}
            serverUrl={serverUrl}
            onClose={() => {
              setShowAddOrganization(false)
              setShowManageOrganization(false) // Reset state for clean atlas opening
              setShowWorldMap(true) // Return to world map
            }}
            onSuccess={() => {
              // Refresh the world map to show the new organization
              console.log('Organization added successfully!')
            }}
          />
        </div>
      )}

      {/* World Map Browser - Full Screen */}
      {showWorldMap && !selectedCompanyId && !showManageOrganization && !showAddOrganization && (
        <div className="fixed inset-0 z-[9998]">
          <WorldMapBrowser3D
            serverUrl={serverUrl}
            userId={userId || undefined}
            accessToken={accessToken || undefined}
            onClose={() => setShowWorldMap(false)}
            onViewCompany={(companyId) => {
              setSelectedCompanyId(companyId)
              setPreviousView('map')
              setShowWorldMap(false)
            }}
            onManageOrganization={() => {
              // Close the atlas and open ME panel with Organizations management
              setShowWorldMap(false)
              setShowManageOrganization(false) // Reset state so atlas can reopen later
              setShowProfilePanel(true) // Open the ME panel
            }}
            onAddOrganization={() => {
              setShowWorldMap(false) // Close the globe
              setShowManageOrganization(false) // Reset state
              setShowAddOrganization(true) // Open Add Organization form
            }}
          />
        </div>
      )}

      {/* Organization Profile Page - Full Screen */}
      {selectedCompanyId && (
        <div className="fixed inset-0 z-[9999]">
          <OrganizationProfilePage
            companyId={selectedCompanyId}
            serverUrl={serverUrl}
            userId={userId || undefined}
            accessToken={accessToken || undefined}
            onClose={() => {
              setSelectedCompanyId(null)
              // Return to previous view (map or list)
              if (previousView === 'map') {
                setShowManageOrganization(false) // Reset state
                setShowAddOrganization(false) // Reset state
                setShowWorldMap(true)
              }
              setPreviousView(null)
            }}
          />
        </div>
      )}

      {/* Bottom Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none">
        <div className="h-24 flex items-end justify-center px-4">
          <div className="relative h-24 flex items-end justify-center w-full">
            {/* Gradient blur mask: 100% blur at bottom, 0% blur at top */}
            <div 
              className="absolute inset-0 backdrop-blur-2xl pointer-events-auto"
              style={{
                WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
                maskImage: 'linear-gradient(to top, black 0%, transparent 100%)'
              }}
            />

            {/* ME Button Container */}
            <div className="relative flex items-center justify-center w-full max-w-md mx-auto pointer-events-auto h-full pb-4">
              <button
                onClick={() => setShowProfilePanel(!showProfilePanel)}
                className="relative group"
              >
                {/* Outer pulsing aura - largest */}
                <div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-emerald-400 to-teal-500 blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-300"
                  style={{
                    width: '100px',
                    height: '100px',
                    marginLeft: '-25px',
                    marginTop: '-25px',
                    animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }}
                />
                
                {/* Middle aura */}
                <div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300"
                  style={{
                    width: '80px',
                    height: '80px',
                    marginLeft: '-15px',
                    marginTop: '-15px',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }}
                />
                
                {/* Inner glow */}
                <div 
                  className="absolute inset-0 rounded-full bg-primary/30 blur-lg opacity-60 group-hover:opacity-90 transition-opacity duration-300"
                  style={{
                    width: '60px',
                    height: '60px',
                    marginLeft: '-5px',
                    marginTop: '-5px'
                  }}
                />
                
                {/* Main button */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary via-emerald-500 to-teal-600 flex items-center justify-center border-4 border-background shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
                  
                  {/* Shine overlay */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 via-transparent to-transparent" />
                  
                  {/* Rotating shine effect */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.3) 10%, transparent 20%)',
                      animation: 'spin 4s linear infinite'
                    }}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* BUD Info Modals */}
      <BudModal
        isOpen={showSwagMarketInfo}
        onClose={() => setShowSwagMarketInfo(false)}
        title="SWAG MARKET - Community Marketplace"
        message="Welcome to the SWAG MARKET! 🛍️✨🌱

Browse organization swag catalogs. Discover hemp products, member-exclusive merch, and community marketplace items.

This is the community marketplace where organizations showcase their hemp products. Here you can:

🌿 Browse organization product catalogs
🏢 Discover member-exclusive merchandise  
🏅 Shop badge-gated items (requires membership)
🔗 Access external partner shops
💚 Support hemp industry organizations

Organizations in the Hemp Atlas can create their own swag shops here. As a member, you can unlock exclusive products and support the hemp community ecosystem!"
      />

      <BudModal
        isOpen={showHempAtlasInfo}
        onClose={() => setShowHempAtlasInfo(false)}
        title="Hemp Atlas - Global Directory"
        message="Explore the Hemp Atlas! 🌍🌱

Browse the global directory of hemp stakeholders. Discover companies, connect with the industry, and showcase your business.

The Hemp Atlas features:

🏢 Directory of hemp stakeholders worldwide
🗺️ Interactive 3D world map browser
🤝 Connect with industry leaders
📊 Showcase your own business
🏅 Earn association badges

Whether you're looking to discover hemp companies or promote your own, the Hemp Atlas connects you with the entire ecosystem. Dive in and explore!"
      />

      <BudModal
        isOpen={showMagazineInfo}
        onClose={() => setShowMagazineInfo(false)}
        title="DEWII Magazine - Knowledge Hub"
        message="Welcome to the DEWII Magazine! 📚🌱

Discover hemp articles, earn points, build your streak, and unlock achievements. The Magazine is where knowledge meets rewards.

The Magazine features:

📚 Articles on hemp cultivation, processing, and applications
📊 Industry trends and statistics
🌱 Educational content on hemp benefits and uses
🏆 Achievement badges for reading streaks and milestones
💎 NADA points for every article you read
🔥 Daily streaks and progression system

Stay informed, earn rewards, and unlock achievements by reading. Dive in and explore the world of hemp!"
      />

      <BudModal
        isOpen={showHempForumInfo}
        onClose={() => setShowHempForumInfo(false)}
        title="Hemp Forum - Community Discussion"
        message="Welcome to the Hemp Forum! 🌱💬

Connect the hemp universe. Vote on features, submit ideas, and use your voice to shape DEWII's future.

The Hemp Forum features:

💬 Vote on new feature proposals
💡 Submit your own ideas
🏆 Earn rewards for participation
📊 See real-time voting results
👥 Connect with the community
📢 Shape the platform's direction

Your voice matters here. Join the conversation, contribute ideas, and help build the future of DEWII!"
      />

      {/* Profile Panel */}
      <MarketProfilePanel
        isOpen={showProfilePanel}
        userId={userId}
        accessToken={accessToken}
        serverUrl={serverUrl}
        userEmail={userEmail}
        nadaPoints={nadaPoints}
        equippedBadgeId={equippedBadgeId}
        profileBannerUrl={profileBannerUrl}
        onClose={() => setShowProfilePanel(false)}
        onVote={() => {
          setShowProfilePanel(false)
          setShowHempForum(true)
        }}
        onSubmitIdea={() => {
          setShowProfilePanel(false)
          setShowHempForum(true)
        }}
        onSettings={() => {
          setShowProfilePanel(false)
          onNavigateToSettings && onNavigateToSettings()
        }}
        onNavigateToSwagMarketplace={() => {
          setShowProfilePanel(false)
          onNavigateToSwagMarketplace && onNavigateToSwagMarketplace()
        }}
        onNadaUpdate={onNadaUpdate}
      />

      {/* Hemp Forum - Full Screen */}
      {showHempForum && (
        <HempForum
          userId={userId}
          accessToken={accessToken}
          serverUrl={serverUrl}
          nadaPoints={nadaPoints}
          onBack={() => setShowHempForum(false)}
          onNadaUpdate={onNadaUpdate}
        />
      )}
    </div>
  )
}