import { motion } from 'motion/react'
import { BudCharacter } from './BudCharacter'
import { Sparkles, Heart, ArrowRight } from 'lucide-react'

interface BudIntroCardProps {
  variant?: 'compact' | 'expanded' | 'inline'
  onLearnMore?: () => void
  className?: string
}

export function BudIntroCard({ 
  variant = 'compact', 
  onLearnMore,
  className = '' 
}: BudIntroCardProps) {
  
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <BudCharacter size="sm" expression="winking" mood="default" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-black text-pink-600 dark:text-pink-400">BUD</span> is your friendly companion throughout the Hemp'in Universe
        </p>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className={`relative bg-gradient-to-br from-pink-100 via-white to-green-100 dark:from-pink-900/30 dark:via-gray-900 dark:to-green-900/30 rounded-2xl p-6 shadow-lg border-2 border-pink-300 dark:border-pink-600 ${className}`}
      >
        <div className="flex items-start gap-4">
          <BudCharacter size="md" expression="happy" mood="default" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-black text-transparent bg-gradient-to-r from-pink-600 to-green-600 bg-clip-text">
                Meet BUD
              </h3>
              <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Your friendly companion who guides, teaches, and celebrates with you throughout the Hemp'in Universe!
            </p>
            {onLearnMore && (
              <button
                onClick={onLearnMore}
                className="flex items-center gap-2 text-sm font-black text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors group"
              >
                Learn more about BUD
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // variant === 'expanded'
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gradient-to-br from-pink-50 via-white to-green-50 dark:from-pink-950/50 dark:via-gray-900 dark:to-green-950/50 rounded-3xl p-8 shadow-2xl border-3 border-pink-300 dark:border-pink-600 overflow-hidden ${className}`}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden opacity-10 dark:opacity-5 pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const icons = [Sparkles, Heart]
          const Icon = icons[i % icons.length]
          return (
            <motion.div
              key={i}
              className="absolute"
              initial={{ 
                y: '110%', 
                x: `${Math.random() * 100}%`,
                opacity: 0,
                scale: 0.5 + Math.random() * 0.5
              }}
              animate={{ 
                y: '-10%',
                opacity: [0, 0.3, 0],
                rotate: [0, 360]
              }}
              transition={{
                duration: 10 + Math.random() * 5,
                repeat: Infinity,
                delay: i * 0.8,
                ease: 'linear'
              }}
            >
              <Icon className="w-6 h-6 text-pink-400 fill-pink-400" />
            </motion.div>
          )
        })}
      </div>

      <div className="relative">
        {/* Header with BUD */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
          <div className="relative">
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <BudCharacter size="xl" expression="celebrating" mood="default" />
            </motion.div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <h2 className="font-black text-transparent bg-gradient-to-r from-pink-600 via-rose-500 to-green-600 bg-clip-text">
                Meet BUD
              </h2>
              <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </div>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
              Your friendly companion throughout the Hemp'in Universe
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              BUD is here to guide you, celebrate your achievements, and make your journey delightful!
            </p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center">
              <span className="text-2xl">🧭</span>
            </div>
            <h4 className="font-black text-cyan-600 dark:text-cyan-400 text-sm mb-1">Your Guide</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Navigate features</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <h4 className="font-black text-green-600 dark:text-green-400 text-sm mb-1">Your Teacher</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Learn & earn</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎉</span>
            </div>
            <h4 className="font-black text-yellow-600 dark:text-yellow-400 text-sm mb-1">Your Cheerleader</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Celebrate wins</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
              <span className="text-2xl">🤝</span>
            </div>
            <h4 className="font-black text-pink-600 dark:text-pink-400 text-sm mb-1">Your Connector</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Find opportunities</p>
          </div>
        </div>

        {/* Learn more button */}
        {onLearnMore && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={onLearnMore}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-green-500 hover:from-pink-600 hover:via-rose-600 hover:to-green-600 text-white font-black rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center gap-2 group"
            >
              Learn more about BUD
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
