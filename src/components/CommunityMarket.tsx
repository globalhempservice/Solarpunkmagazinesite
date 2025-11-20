import { useState, useEffect } from 'react'
import { ArrowLeft, Store, Sparkles, Zap, TrendingUp, X, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'
import { VotingModal } from './VotingModal'
import { SubmitIdeaModal } from './SubmitIdeaModal'

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
  onFeatureUnlock?: (featureId: any) => void
  userEmail?: string | null
  nadaPoints: number
  onNadaUpdate: (newBalance: number) => void
}

export default function CommunityMarket({
  userId,
  accessToken,
  serverUrl,
  onBack,
  onFeatureUnlock,
  userEmail,
  nadaPoints,
  onNadaUpdate
}: CommunityMarketProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showTutorial, setShowTutorial] = useState(true)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [showVotingModal, setShowVotingModal] = useState(false)
  const [showSubmitIdeaModal, setShowSubmitIdeaModal] = useState(false)

  // Check if user has seen tutorial before
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(`market_tutorial_${userId}`)
    if (hasSeenTutorial) {
      setShowTutorial(false)
    }
  }, [userId])

  const tutorialSteps = [
    {
      title: "Welcome to the Community Market",
      description: "A place where your voice shapes the future of DEWII. This is a completely different world where you can vote, submit ideas, and earn rewards.",
      icon: Store,
      gradient: "from-purple-500 via-pink-500 to-amber-500"
    },
    {
      title: "NADA: Your Voice Currency",
      description: "Use NADA points to cast votes on features, submit proposals, and unlock exclusive content. Earn NADA by reading articles and engaging with the community.",
      icon: NadaRippleIcon,
      gradient: "from-violet-500 via-purple-500 to-indigo-500"
    },
    {
      title: "Shape the Future",
      description: "Vote on features, submit ideas, and see them come to life. The most popular proposals get implemented, and contributors earn rewards.",
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

  // Tutorial Full Screen Overlay
  if (showTutorial) {
    const currentStep = tutorialSteps[tutorialStep]
    const Icon = currentStep.icon

    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 animate-float"
              style={{
                width: `${Math.random() * 150 + 50}px`,
                height: `${Math.random() * 150 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`
              }}
            />
          ))}
        </div>

        {/* Tutorial Card */}
        <div className="relative max-w-2xl w-full">
          {/* Skip button */}
          <button
            onClick={handleSkipTutorial}
            className="absolute -top-4 -right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative overflow-hidden rounded-3xl bg-black/40 backdrop-blur-2xl border-2 border-white/20 p-12 shadow-2xl">
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentStep.gradient} opacity-10`} />
            
            {/* Content */}
            <div className="relative z-10 text-center space-y-8">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className={`absolute -inset-6 bg-gradient-to-r ${currentStep.gradient} rounded-full blur-3xl opacity-50 animate-pulse`} />
                  <div className={`relative bg-gradient-to-r ${currentStep.gradient} rounded-full p-8`}>
                    {Icon === NadaRippleIcon ? (
                      <NadaRippleIcon className="w-20 h-20 text-white" />
                    ) : (
                      <Icon className="w-20 h-20 text-white" />
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-5xl font-black text-white">
                {currentStep.title}
              </h2>

              {/* Description */}
              <p className="text-xl text-white/80 max-w-lg mx-auto leading-relaxed">
                {currentStep.description}
              </p>

              {/* Progress dots */}
              <div className="flex justify-center gap-3 pt-4">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-3 rounded-full transition-all duration-300 ${
                      index === tutorialStep 
                        ? 'w-12 bg-white' 
                        : 'w-3 bg-white/30'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-center gap-4 pt-4">
                {tutorialStep < tutorialSteps.length - 1 ? (
                  <Button
                    onClick={() => setTutorialStep(tutorialStep + 1)}
                    className={`bg-gradient-to-r ${currentStep.gradient} hover:opacity-90 text-white font-black text-lg px-8 py-6 rounded-2xl shadow-lg`}
                  >
                    Next <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleTutorialComplete}
                    className={`bg-gradient-to-r ${currentStep.gradient} hover:opacity-90 text-white font-black text-lg px-8 py-6 rounded-2xl shadow-lg`}
                  >
                    Enter Market <Sparkles className="w-5 h-5 ml-2" />
                  </Button>
                )}
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
              transform: translateY(-100px) translateX(50px) rotate(180deg);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Custom Market Header with NADA Counter */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Exit Market</span>
            </button>
            
            {/* Market Title */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur-md opacity-50" />
                <Store className="relative w-7 h-7 text-purple-300" />
              </div>
              <h1 className="text-2xl font-black text-white">Community Market</h1>
            </div>
            
            {/* NADA Counter */}
            <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-violet-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl border-2 border-violet-400/30">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full blur-sm opacity-60" />
                <NadaRippleIcon className="relative w-8 h-8 text-violet-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-violet-200/70 font-medium uppercase tracking-wider">Voice Currency</span>
                <span className="text-2xl font-black text-white">{nadaPoints}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 rounded-full blur-2xl opacity-50 animate-pulse" />
            <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 rounded-full p-6">
              <Sparkles className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h2 className="text-5xl font-black text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
            Welcome to the Market!
          </h2>
          
          <p className="text-xl text-white/70">
            A completely different world. Vote on features, submit ideas, and shape the future of DEWII.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Card 1 - Vote on Features */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl border-2 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
            
            <div className="relative p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white">Vote on Features</h3>
              <p className="text-white/60">Use your NADA points to vote on upcoming features and help prioritize development.</p>
              
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
                onClick={() => setShowVotingModal(true)}
              >
                Vote Now
              </Button>
            </div>
          </div>

          {/* Card 2 - Submit Ideas */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-xl border-2 border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
            
            <div className="relative p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Zap className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white">Submit Ideas</h3>
              <p className="text-white/60">Have a great feature idea? Submit it to the community and earn rewards if it gets implemented.</p>
              
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold"
                onClick={() => setShowSubmitIdeaModal(true)}
              >
                Submit Idea
              </Button>
            </div>
          </div>

          {/* Card 3 - Marketplace */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600/20 to-yellow-600/20 backdrop-blur-xl border-2 border-amber-500/30 hover:border-amber-400/50 transition-all duration-300 hover:scale-105">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
            
            <div className="relative p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                <Store className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white">Marketplace</h3>
              <p className="text-white/60">Trade items, unlock special themes, and access exclusive community content.</p>
              
              <Button 
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold"
                disabled
              >
                Coming Soon
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="text-4xl font-black text-white mb-2">0</div>
              <div className="text-sm text-white/60">Active Proposals</div>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="text-4xl font-black text-white mb-2">0</div>
              <div className="text-sm text-white/60">Total Votes Cast</div>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="text-4xl font-black text-white mb-2">0</div>
              <div className="text-sm text-white/60">Ideas Implemented</div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-xl border-2 border-purple-500/30 p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
            
            <div className="relative text-center space-y-4">
              <h3 className="text-2xl font-bold text-white">Building Something Amazing</h3>
              <p className="text-white/70 max-w-2xl mx-auto">
                The Community Market is under construction! We're creating a unique space where your voice matters and your engagement is rewarded. Stay tuned for updates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5 animate-float"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-100px) translateX(50px);
            opacity: 0.3;
          }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>

      {/* Voting Modal */}
      {showVotingModal && userId && accessToken && (
        <VotingModal
          isOpen={showVotingModal}
          onClose={() => setShowVotingModal(false)}
          userId={userId}
          serverUrl={serverUrl}
          accessToken={accessToken}
          nadaPoints={nadaPoints}
          onVoteSuccess={(newBalance) => {
            onNadaUpdate(newBalance)
            console.log('Vote successful! New NADA balance:', newBalance)
          }}
        />
      )}

      {/* Submit Idea Modal */}
      {showSubmitIdeaModal && userId && accessToken && (
        <SubmitIdeaModal
          isOpen={showSubmitIdeaModal}
          onClose={() => setShowSubmitIdeaModal(false)}
          userId={userId}
          serverUrl={serverUrl}
          accessToken={accessToken}
          onSubmitSuccess={() => {
            // Refresh or show success message
            console.log('Idea submitted successfully!')
          }}
        />
      )}
    </div>
  )
}