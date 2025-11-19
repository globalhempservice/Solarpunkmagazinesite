import { motion, AnimatePresence } from 'motion/react'
import { X, Heart, Sparkles, Star, Zap, Eye, Mouse, ScrollText, Clock } from 'lucide-react'

interface PointsRulesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PointsRulesModal({ isOpen, onClose }: PointsRulesModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Soft backdrop - doesn't cover navbars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
            style={{ top: '80px' }} // Below header
          />

          {/* Helper Modal - lives in content area */}
          <div className="fixed left-0 right-0 z-[90] flex justify-center px-4 py-8 pointer-events-none" style={{ top: '80px', bottom: '0' }}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg pointer-events-auto h-fit max-h-full overflow-y-auto"
            >
              {/* Soft pink glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400 rounded-[2.5rem] blur-3xl opacity-20" />
              
              {/* Main card */}
              <div className="relative bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:from-pink-950/90 dark:via-rose-950/90 dark:to-pink-900/90 rounded-3xl shadow-2xl overflow-hidden border-4 border-pink-200/60 dark:border-pink-700/40">
                
                {/* Floating hearts background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(12)].map((_, i) => (
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
                        duration: 8 + Math.random() * 4,
                        repeat: Infinity,
                        delay: i * 0.8,
                        ease: 'linear'
                      }}
                    >
                      <Heart className="w-4 h-4 text-pink-300 dark:text-pink-600 fill-pink-300 dark:fill-pink-600" />
                    </motion.div>
                  ))}
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 dark:bg-pink-900/60 hover:bg-white dark:hover:bg-pink-800/80 transition-all group shadow-lg"
                >
                  <X className="w-5 h-5 text-pink-600 dark:text-pink-300 group-hover:rotate-90 transition-transform" />
                </button>

                {/* Header with friendly helper character */}
                <div className="relative p-5 pb-4">
                  {/* Friendly bubble mascot */}
                  <motion.div
                    animate={{ 
                      y: [0, -6, 0],
                      rotate: [-3, 3, -3]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="w-14 h-14 mx-auto mb-3 relative"
                  >
                    {/* Glow behind helper */}
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full blur-lg opacity-60" />
                    
                    {/* Helper character - cute circle with sparkle */}
                    <div className="relative w-14 h-14 bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500 rounded-full shadow-lg flex items-center justify-center border-3 border-white/50 dark:border-pink-200/30">
                      {/* Happy face */}
                      <div className="relative">
                        {/* Eyes */}
                        <div className="flex gap-2 mb-0.5">
                          <motion.div 
                            animate={{ scaleY: [1, 0.3, 1] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                            className="w-1.5 h-1.5 bg-white rounded-full"
                          />
                          <motion.div 
                            animate={{ scaleY: [1, 0.3, 1] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                            className="w-1.5 h-1.5 bg-white rounded-full"
                          />
                        </div>
                        {/* Smile */}
                        <div className="w-5 h-2.5 border-b-2 border-white rounded-full" />
                      </div>
                      
                      {/* Sparkle accent */}
                      <motion.div
                        animate={{ 
                          rotate: [0, 180, 360],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-1 -right-1"
                      >
                        <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                      </motion.div>
                    </div>

                    {/* Speech bubble tail coming from helper */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2"
                    >
                      <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-white dark:border-t-pink-200/20" />
                    </motion.div>
                  </motion.div>

                  {/* Main speech bubble */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-pink-200/20 rounded-xl p-3 shadow-lg border-2 border-pink-200 dark:border-pink-700/40"
                  >
                    <h2 className="text-center text-lg font-black text-transparent bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 bg-clip-text mb-1">
                      Hi there! Let me show you how to win points!
                    </h2>
                    <p className="text-center text-xs text-pink-700 dark:text-pink-300 font-semibold">
                      Just follow these 5 simple things when reading articles
                    </p>
                  </motion.div>
                </div>

                {/* Rules as conversation bubbles */}
                <div className="relative px-5 pb-5 space-y-2.5">
                  {[
                    {
                      icon: Clock,
                      title: 'Spend a Little Time',
                      description: 'Stay on the article for at least 3 seconds',
                      color: 'from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40',
                      border: 'border-blue-200 dark:border-blue-700/40',
                      iconColor: 'text-blue-600 dark:text-blue-400'
                    },
                    {
                      icon: ScrollText,
                      title: 'Scroll Through',
                      description: 'Read through at least 30% of the content',
                      color: 'from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40',
                      border: 'border-purple-200 dark:border-purple-700/40',
                      iconColor: 'text-purple-600 dark:text-purple-400'
                    },
                    {
                      icon: Mouse,
                      title: 'Move Your Mouse',
                      description: 'Show you\'re engaged with 5+ movements',
                      color: 'from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40',
                      border: 'border-rose-200 dark:border-rose-700/40',
                      iconColor: 'text-rose-600 dark:text-rose-400'
                    },
                    {
                      icon: Eye,
                      title: 'Stay Focused',
                      description: 'Keep the tab in focus for at least half your reading time',
                      color: 'from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40',
                      border: 'border-amber-200 dark:border-amber-700/40',
                      iconColor: 'text-amber-600 dark:text-amber-400'
                    },
                    {
                      icon: Sparkles,
                      title: 'Natural Reading',
                      description: 'Scroll naturally 2+ times (no speed reading!)',
                      color: 'from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40',
                      border: 'border-emerald-200 dark:border-emerald-700/40',
                      iconColor: 'text-emerald-600 dark:text-emerald-400'
                    }
                  ].map((rule, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="relative"
                    >
                      {/* Speech bubble tail on alternating sides */}
                      <div className={`absolute top-4 ${index % 2 === 0 ? '-left-2' : '-right-2'} w-0 h-0 ${index % 2 === 0 ? 'border-r-[12px]' : 'border-l-[12px]'} ${index % 2 === 0 ? 'border-r-white' : 'border-l-white'} dark:${index % 2 === 0 ? 'border-r-pink-200/20' : 'border-l-pink-200/20'} border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent`} />
                      
                      {/* Bubble content */}
                      <div className={`relative overflow-hidden rounded-xl bg-white dark:bg-pink-200/20 p-3 border-2 ${rule.border} shadow-sm hover:shadow-md transition-all group`}>
                        <div className="flex items-start gap-2.5">
                          {/* Icon */}
                          <div className={`flex-shrink-0 p-2 rounded-lg bg-gradient-to-r ${rule.color}`}>
                            <rule.icon className={`w-4 h-4 ${rule.iconColor}`} strokeWidth={2.5} />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-sm text-gray-800 dark:text-gray-100 mb-0.5">
                              {rule.title}
                            </h3>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug">
                              {rule.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Final encouraging message bubble */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="relative mt-3"
                  >
                    {/* Speech bubble tail */}
                    <div className="absolute -left-2 top-3 w-0 h-0 border-r-[10px] border-r-pink-200 dark:border-r-pink-700/60 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent" />
                    
                    <div className="p-3 bg-pink-200/60 dark:bg-pink-950/40 border-2 border-pink-300 dark:border-pink-700/60 rounded-xl">
                      <div className="flex items-start gap-2.5">
                        <div className="flex-shrink-0 p-1.5 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full">
                          <Heart className="w-3 h-3 text-white fill-white" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-pink-700 dark:text-pink-300 mb-0.5">
                            That's it!
                          </h4>
                          <p className="text-xs text-pink-600 dark:text-pink-400 leading-snug">
                            Our system checks these to keep things fair. Just read naturally and you'll earn <span className="font-black">+10 points</span> for each article!
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Friendly footer */}
                <div className="relative bg-gradient-to-r from-pink-200/60 via-rose-200/60 to-pink-200/60 dark:from-pink-900/40 dark:via-rose-900/40 dark:to-pink-900/40 p-4 border-t-2 border-pink-200/60 dark:border-pink-700/40">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-yellow-400 rounded-full">
                        <Zap className="w-4 h-4 text-yellow-900 fill-yellow-900" />
                      </div>
                      <p className="text-xs font-bold text-pink-800 dark:text-pink-200">
                        Each article = <span className="text-base text-pink-600 dark:text-pink-400">+10 points</span>
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-black rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all"
                    >
                      Got it!
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}