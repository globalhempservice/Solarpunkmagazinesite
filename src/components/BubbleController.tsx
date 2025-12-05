import { motion, AnimatePresence } from 'motion/react'
import { BookOpen, Palette } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface BubbleControllerProps {
  isVisible: boolean
  onWikiClick: () => void
  onThemeClick: () => void
  onThemeSelect?: (theme: 'light' | 'dark' | 'hempin') => void
  onClose: () => void
  position: { x: number; y: number }
  currentTheme?: 'light' | 'dark' | 'hempin'
}

export function BubbleController({ isVisible, onWikiClick, onThemeClick, onThemeSelect, onClose, position, currentTheme = 'light' }: BubbleControllerProps) {
  const [showThemeOptions, setShowThemeOptions] = useState(false)
  const longPressTimerRef = useRef<number | null>(null)
  const isLongPressRef = useRef(false)

  // Get theme-specific gradient colors
  const getThemeGradient = (theme: 'light' | 'dark' | 'hempin' = currentTheme) => {
    switch(theme) {
      case 'light': return 'from-sky-400 to-blue-500'
      case 'dark': return 'from-emerald-400 to-teal-500'
      case 'hempin': return 'from-amber-400 to-orange-500'
      default: return 'from-purple-400 to-pink-500'
    }
  }

  const getThemeLabel = (theme: 'light' | 'dark' | 'hempin') => {
    switch(theme) {
      case 'light': return '1'
      case 'dark': return '2'
      case 'hempin': return '3'
    }
  }

  const handleThemeMouseDown = () => {
    isLongPressRef.current = false
    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressRef.current = true
      setShowThemeOptions(true)
    }, 500) // 500ms long press
  }

  const handleThemeMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }
    
    // If it wasn't a long press, just cycle the theme
    if (!isLongPressRef.current && !showThemeOptions) {
      onThemeClick()
    }
  }

  const handleThemeSelect = (theme: 'light' | 'dark' | 'hempin') => {
    if (onThemeSelect) {
      onThemeSelect(theme)
    }
    setShowThemeOptions(false)
    onClose()
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  // Reset theme options when bubble closes
  useEffect(() => {
    if (!isVisible) {
      setShowThemeOptions(false)
    }
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop - clicking it closes the bubble */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90]"
            onClick={onClose}
          />

          {/* Wiki Button - Left side */}
          <motion.button
            initial={{ scale: 0, opacity: 0, x: 20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0, x: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'fixed',
              left: position.x - 90, // 90px to the left of center
              top: position.y,
              transformOrigin: 'center center'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              onWikiClick()
            }}
            className="group relative z-[95]"
          >
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
            
            {/* Button circle */}
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg transform transition-transform">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
          </motion.button>

          {/* Theme Button - Right side */}
          <motion.button
            initial={{ scale: 0, opacity: 0, x: -20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0, x: -20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'fixed',
              left: position.x + 30, // 30px to the right of center
              top: position.y,
              transformOrigin: 'center center'
            }}
            onMouseDown={handleThemeMouseDown}
            onMouseUp={handleThemeMouseUp}
            onTouchStart={handleThemeMouseDown}
            onTouchEnd={handleThemeMouseUp}
            whileHover={{ scale: showThemeOptions ? 1 : 1.1 }}
            whileTap={{ scale: showThemeOptions ? 1 : 0.95 }}
            className="group relative z-[95]"
          >
            {/* Glow effect */}
            <div className={`absolute -inset-2 bg-gradient-to-r ${getThemeGradient()} rounded-full blur-lg opacity-60 group-hover:opacity-100 transition-opacity`} />
            
            {/* Button circle */}
            <div className={`relative w-14 h-14 rounded-full bg-gradient-to-br ${getThemeGradient()} flex items-center justify-center shadow-lg transform transition-transform`}>
              <Palette className="w-7 h-7 text-white" />
            </div>
          </motion.button>

          {/* Theme Selection Bubbles - Third Row */}
          {showThemeOptions && (
            <>
              {/* Light Theme Bubble - Theme 1 */}
              <motion.button
                initial={{ scale: 0, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, y: -20 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0 }}
                style={{
                  position: 'fixed',
                  left: position.x + 0, // Aligned to start under theme button
                  top: position.y + 60, // Below the main buttons
                  transformOrigin: 'center center'
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleThemeSelect('light')
                }}
                className="group relative z-[95]"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-1.5 bg-gradient-to-r ${getThemeGradient('light')} rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity`} />
                
                {/* Button circle */}
                <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${getThemeGradient('light')} flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-black text-lg">{getThemeLabel('light')}</span>
                </div>
              </motion.button>

              {/* Dark Theme Bubble - Theme 2 */}
              <motion.button
                initial={{ scale: 0, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, y: -20 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.05 }}
                style={{
                  position: 'fixed',
                  left: position.x + 40, // Spaced to the right
                  top: position.y + 60,
                  transformOrigin: 'center center'
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleThemeSelect('dark')
                }}
                className="group relative z-[95]"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-1.5 bg-gradient-to-r ${getThemeGradient('dark')} rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity`} />
                
                {/* Button circle */}
                <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${getThemeGradient('dark')} flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-black text-lg">{getThemeLabel('dark')}</span>
                </div>
              </motion.button>

              {/* Hemp'in Theme Bubble - Theme 3 */}
              <motion.button
                initial={{ scale: 0, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, y: -20 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.1 }}
                style={{
                  position: 'fixed',
                  left: position.x + 80, // Further to the right
                  top: position.y + 60,
                  transformOrigin: 'center center'
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleThemeSelect('hempin')
                }}
                className="group relative z-[95]"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-1.5 bg-gradient-to-r ${getThemeGradient('hempin')} rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity`} />
                
                {/* Button circle */}
                <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${getThemeGradient('hempin')} flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-black text-lg">{getThemeLabel('hempin')}</span>
                </div>
              </motion.button>
            </>
          )}
        </>
      )}
    </AnimatePresence>
  )
}