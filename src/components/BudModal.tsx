import { motion, AnimatePresence } from 'motion/react'
import { X, Heart, Sparkles, Star } from 'lucide-react'
import { BudCharacter } from './BudCharacter'
import { ReactNode } from 'react'

interface BudModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  budExpression?: 'happy' | 'excited' | 'thinking' | 'celebrating' | 'winking'
  budMood?: 'default' | 'success' | 'info' | 'warning'
  footerButton?: {
    text: string
    onClick?: () => void
  }
}

export function BudModal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  children,
  budExpression = 'happy',
  budMood = 'default',
  footerButton
}: BudModalProps) {
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
            style={{ top: 'var(--nav-top)' }}
          />

          {/* Helper Modal - lives in content area between navbars */}
          <div className="fixed left-0 right-0 z-[90] flex justify-center px-4 pointer-events-none" style={{ top: 'var(--nav-top)', bottom: 'var(--nav-bottom)' }}>
            <div className="w-full h-full flex items-center justify-center py-4">
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg pointer-events-auto max-h-full overflow-y-auto"
              >
                {/* Colorful multi-tone glow */}
                <div className="absolute -inset-6 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400 rounded-[3rem] blur-3xl opacity-30" />
                <div className="absolute -inset-4 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 rounded-[2.5rem] blur-2xl opacity-20" />
                
                {/* Main card */}
                <div className="relative bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:from-pink-950/90 dark:via-rose-950/90 dark:to-pink-900/90 rounded-3xl shadow-2xl overflow-hidden border-4 border-pink-300/70 dark:border-pink-600/50">
                  
                  {/* Animated gradient background overlay */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                      animate={{
                        background: [
                          'radial-gradient(circle at 20% 20%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
                          'radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
                          'radial-gradient(circle at 20% 20%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
                        ]
                      }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0"
                    />
                  </div>

                  {/* Floating sparkles background */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(15)].map((_, i) => {
                      const icons = [Heart, Sparkles, Star]
                      const Icon = icons[i % icons.length]
                      const colors = [
                        'text-pink-300 fill-pink-300 dark:text-pink-500 dark:fill-pink-500',
                        'text-rose-300 fill-rose-300 dark:text-rose-500 dark:fill-rose-500',
                        'text-green-300 fill-green-300 dark:text-green-500 dark:fill-green-500',
                        'text-yellow-300 fill-yellow-300 dark:text-yellow-500 dark:fill-yellow-500'
                      ]
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
                            opacity: [0, 0.4, 0],
                            rotate: [0, 360]
                          }}
                          transition={{
                            duration: 8 + Math.random() * 4,
                            repeat: Infinity,
                            delay: i * 0.6,
                            ease: 'linear'
                          }}
                        >
                          <Icon className={`w-4 h-4 ${colors[i % colors.length]}`} />
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/90 dark:bg-pink-800/80 hover:bg-white dark:hover:bg-pink-700 transition-all group shadow-lg border-2 border-pink-200 dark:border-pink-600"
                  >
                    <X className="w-5 h-5 text-pink-600 dark:text-pink-200 group-hover:rotate-90 transition-transform" />
                  </button>

                  {/* Header with BUD */}
                  <div className="relative p-6 pb-4">
                    {/* BUD - The friendly helper character */}
                    <div className="flex justify-center mb-4">
                      <BudCharacter size="lg" expression={budExpression} mood={budMood} />
                    </div>

                    {/* Speech bubble tail coming from BUD */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute top-[6rem] left-1/2 -translate-x-1/2 z-10"
                    >
                      <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[16px] border-t-white dark:border-t-pink-800/90" />
                    </motion.div>

                    {/* Main speech bubble */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white dark:bg-pink-800/90 rounded-2xl p-4 shadow-xl border-3 border-pink-300 dark:border-pink-600"
                    >
                      <h2 className="text-center font-black text-transparent bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text mb-1.5">
                        {title}
                      </h2>
                      {subtitle && (
                        <p className="text-center text-sm text-pink-700 dark:text-pink-200 font-bold">
                          {subtitle}
                        </p>
                      )}
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="relative px-6 pb-6">
                    {children}
                  </div>

                  {/* Footer with button */}
                  {footerButton && (
                    <div className="relative bg-gradient-to-r from-pink-300/80 via-rose-300/80 to-pink-300/80 dark:from-pink-800/80 dark:via-rose-800/80 dark:to-pink-800/80 p-5 border-t-4 border-pink-400/60 dark:border-pink-600/60">
                      <div className="flex justify-center">
                        <button
                          onClick={footerButton.onClick || onClose}
                          className="px-8 py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-600 hover:via-rose-600 hover:to-pink-600 text-white font-black rounded-full shadow-xl hover:shadow-2xl active:scale-95 transition-all border-3 border-white/50"
                        >
                          {footerButton.text}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
