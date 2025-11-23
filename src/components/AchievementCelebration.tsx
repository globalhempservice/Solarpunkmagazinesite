import { useEffect, useState } from 'react'
import { Trophy, Sparkles, Star, Zap, Award } from 'lucide-react'
import { Button } from './ui/button'

interface Achievement {
  achievement_id: string
  name: string
  description: string
  points: number
}

interface AchievementCelebrationProps {
  achievements: Achievement[]
  totalPoints: number
  onClose: () => void
}

export function AchievementCelebration({ achievements, totalPoints, onClose }: AchievementCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      handleClose()
    }
  }

  const currentAchievement = achievements[currentIndex]

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(8px)'
      }}
    >
      {/* Confetti/Particle Explosion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 animate-confetti"
            style={{
              left: '50%',
              top: '50%',
              background: ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'][i % 5],
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              '--tx': `${(Math.random() - 0.5) * 1000}px`,
              '--ty': `${(Math.random() - 0.5) * 1000}px`,
              '--rotation': `${Math.random() * 720}deg`,
            } as any}
          />
        ))}
      </div>

      {/* Radiating light rays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 w-2 h-1/2 origin-top animate-spin-slow"
            style={{
              background: `linear-gradient(to bottom, rgba(251, 191, 36, 0.3), transparent)`,
              transform: `rotate(${i * 30}deg)`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '4s'
            }}
          />
        ))}
      </div>

      {/* Main celebration card */}
      <div 
        className={`relative max-w-2xl w-full transition-all duration-500 ${
          isVisible ? 'scale-100 rotate-0' : 'scale-50 rotate-12'
        }`}
      >
        {/* Outer glow */}
        <div className="absolute -inset-8 bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-75 animate-pulse" />
        
        {/* Card container with comic border */}
        <div className="relative bg-gradient-to-br from-card via-card to-card border-8 border-foreground rounded-3xl overflow-hidden"
          style={{
            boxShadow: '16px 16px 0px 0px rgba(0, 0, 0, 0.5), 32px 32px 0px 0px rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Comic halftone pattern overlay */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, black 2px, transparent 2px)`,
              backgroundSize: '20px 20px'
            }}
          />

          {/* Top burst badge */}
          <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-8 px-6 border-b-8 border-foreground overflow-hidden">
            {/* Animated stripes */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 20px,
                  rgba(0,0,0,0.3) 20px,
                  rgba(0,0,0,0.3) 40px
                )`,
                animation: 'slide-stripe 2s linear infinite'
              }}
            />

            <div className="relative text-center space-y-4">
              {/* Floating trophy with rings */}
              <div className="relative inline-block">
                {/* Pulsing rings */}
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div
                      className="absolute w-32 h-32 rounded-full border-4 border-white/40 animate-ping"
                      style={{
                        animationDuration: `${1.5 + i * 0.5}s`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    />
                  </div>
                ))}
                
                {/* Trophy icon */}
                <div className="relative bg-white rounded-full p-6 shadow-2xl transform animate-bounce">
                  <Trophy className="w-16 h-16 text-amber-500" />
                  
                  {/* Sparkles around trophy */}
                  {[...Array(8)].map((_, i) => (
                    <Sparkles
                      key={i}
                      className="absolute w-6 h-6 text-yellow-300 animate-ping"
                      style={{
                        left: `${50 + 60 * Math.cos((i * Math.PI) / 4)}%`,
                        top: `${50 + 60 * Math.sin((i * Math.PI) / 4)}%`,
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '1.5s'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* MAIN TITLE - COMIC STYLE */}
              <div className="relative">
                {/* Shadow layers for 3D effect */}
                <div className="absolute inset-0 translate-x-2 translate-y-2">
                  <h1 className="text-6xl font-black text-black/50 uppercase tracking-wider">
                    Unlocked!
                  </h1>
                </div>
                <div className="absolute inset-0 translate-x-1 translate-y-1">
                  <h1 className="text-6xl font-black text-black/30 uppercase tracking-wider">
                    Unlocked!
                  </h1>
                </div>
                
                {/* Main text with stroke */}
                <h1 
                  className="relative text-6xl font-black text-white uppercase tracking-wider"
                  style={{
                    textShadow: `
                      4px 4px 0px rgba(0,0,0,0.8),
                      -2px -2px 0px rgba(0,0,0,0.5),
                      2px -2px 0px rgba(0,0,0,0.5),
                      -2px 2px 0px rgba(0,0,0,0.5),
                      0px 0px 20px rgba(255,255,255,0.5)
                    `
                  }}
                >
                  Unlocked!
                </h1>
              </div>

              {/* Achievement count badge */}
              <div className="inline-block">
                <div 
                  className="relative bg-white text-foreground px-8 py-3 rounded-full border-4 border-foreground shadow-lg transform -rotate-2"
                  style={{
                    boxShadow: '6px 6px 0px 0px rgba(0,0,0,0.5)'
                  }}
                >
                  <div className="text-4xl font-black">
                    {achievements.length} Achievement{achievements.length > 1 ? 's' : ''}!
                  </div>
                </div>
              </div>

              {/* Action lines */}
              <div className="absolute top-1/2 left-0 w-full flex justify-center gap-4 pointer-events-none">
                <div className="flex gap-2 -rotate-12">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-1 bg-white/60 rounded-full"
                      style={{ width: `${80 - i * 15}px` }}
                    />
                  ))}
                </div>
                <div className="flex gap-2 rotate-12">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-1 bg-white/60 rounded-full"
                      style={{ width: `${80 - i * 15}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Achievement details */}
          <div className="relative p-8 space-y-6">
            {/* Current achievement showcase */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl" />
              
              <div className="relative bg-gradient-to-br from-background via-card to-background border-4 border-border rounded-2xl p-6 space-y-4"
                style={{
                  boxShadow: '8px 8px 0px 0px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Progress indicator */}
                {achievements.length > 1 && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {achievements.map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          i === currentIndex 
                            ? 'w-12 bg-gradient-to-r from-amber-500 to-orange-500' 
                            : i < currentIndex
                            ? 'w-2 bg-emerald-500'
                            : 'w-2 bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Achievement icon */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-br from-amber-400 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-60 animate-pulse" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                      <Award className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </div>

                {/* Achievement name - COMIC STYLE */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 translate-x-1 translate-y-1">
                      <h2 className="text-4xl font-black text-black/20">
                        {currentAchievement.name}
                      </h2>
                    </div>
                    <h2 
                      className="relative text-4xl font-black bg-gradient-to-r from-amber-500 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                      style={{
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                      }}
                    >
                      {currentAchievement.name}
                    </h2>
                  </div>
                </div>

                {/* Description */}
                <p className="text-center text-xl text-muted-foreground font-medium">
                  {currentAchievement.description}
                </p>

                {/* Points badge */}
                <div className="flex justify-center">
                  <div 
                    className="relative bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-2xl border-4 border-amber-600 transform rotate-1"
                    style={{
                      boxShadow: '6px 6px 0px 0px rgba(0,0,0,0.3)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6" />
                      <span className="text-2xl font-black">+{currentAchievement.points} Points</span>
                      <Star className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total points earned (if multiple achievements) */}
            {achievements.length > 1 && (
              <div className="text-center">
                <div className="inline-block bg-muted border-4 border-border rounded-2xl px-6 py-3">
                  <div className="text-sm text-muted-foreground font-bold uppercase tracking-wide mb-1">
                    Total Bonus
                  </div>
                  <div className="text-3xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                    +{totalPoints} Points
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons - COMIC STYLE */}
            <div className="flex gap-4 pt-4">
              {currentIndex < achievements.length - 1 ? (
                <Button
                  onClick={handleNext}
                  className="flex-1 group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-4 border-emerald-700 font-black text-xl py-8 rounded-2xl transition-all duration-200"
                  style={{
                    boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.4)',
                    transform: 'translateY(0)'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,0.4)'
                    e.currentTarget.style.transform = 'translate(4px, 4px)'
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,0.4)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>Next Achievement</span>
                    <Zap className="w-6 h-6" />
                  </div>
                </Button>
              ) : (
                <Button
                  onClick={handleClose}
                  className="flex-1 group relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-4 border-amber-700 font-black text-xl py-8 rounded-2xl transition-all duration-200"
                  style={{
                    boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.4)',
                    transform: 'translateY(0)'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,0.4)'
                    e.currentTarget.style.transform = 'translate(4px, 4px)'
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,0.4)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>Awesome!</span>
                    <Sparkles className="w-6 h-6" />
                  </div>
                </Button>
              )}
            </div>

            {/* Skip all button */}
            {achievements.length > 1 && currentIndex < achievements.length - 1 && (
              <button
                onClick={handleClose}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Skip to end ({achievements.length - currentIndex - 1} remaining)
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) rotate(var(--rotation));
            opacity: 0;
          }
        }

        @keyframes slide-stripe {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 40px 40px;
          }
        }

        .animate-confetti {
          animation: confetti forwards;
        }
      `}</style>
    </div>
  )
}
