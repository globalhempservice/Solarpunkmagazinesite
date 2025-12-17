import { motion, AnimatePresence } from 'motion/react'
import { BookOpen, Palette } from 'lucide-react'
import { useEffect } from 'react'
import { HempButton } from './ui/hemp-button'

interface BubbleControllerProps {
  isVisible: boolean
  onWikiClick: () => void
  onThemeClick: () => void
  onThemeSelect?: (theme: 'light' | 'dark' | 'hempin') => void
  onClose: () => void
  position: { x: number; y: number }
  currentTheme?: 'light' | 'dark' | 'hempin'
}

export function BubbleController({ isVisible, onWikiClick, onThemeClick, onClose, position, currentTheme = 'light' }: BubbleControllerProps) {
  // Debug: Log currentTheme when component receives it
  useEffect(() => {
    if (isVisible) {
      console.log('🎨 BubbleController received currentTheme:', currentTheme)
    }
  }, [isVisible, currentTheme])

  // Get theme for the main theme button - simplified to light/dark only
  const getMainThemeButtonTheme = () => {
    // If dark theme, show dark button. Otherwise show light button.
    return currentTheme === 'dark' ? 'themeDark' : 'themeLight'
  }

  const handleThemeButtonClick = (e: any) => {
    console.log('🎨 Theme button clicked in BubbleController')
    e?.stopPropagation()
    onThemeClick()
  }

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
          <motion.div
            initial={{ scale: 0, opacity: 0, x: 20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0, x: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'fixed',
              left: position.x - 90, // 90px to the left of center
              top: position.y - 28, // Center vertically (56px height / 2)
              transformOrigin: 'center center',
              zIndex: 95,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <HempButton
              icon={BookOpen}
              onClick={(e) => {
                console.log('🔍 Wiki button clicked!')
                e?.stopPropagation()
                onWikiClick()
                onClose()
              }}
              theme="wiki"
              size="lg"
              enableMagnetic
              enableShimmer={false}
              enableRipple
              aria-label="Open Wiki"
              title="Hemp'in Knowledge Base"
            />
          </motion.div>

          {/* Theme Button - Right side */}
          <motion.div
            initial={{ scale: 0, opacity: 0, x: -20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0, x: -20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'fixed',
              left: position.x + 30, // 30px to the right of center
              top: position.y - 28, // Center vertically
              transformOrigin: 'center center',
              zIndex: 95,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <HempButton
              icon={Palette}
              onClick={handleThemeButtonClick}
              theme={getMainThemeButtonTheme()}
              size="lg"
              enableMagnetic
              enableShimmer={false}
              enableRipple
              aria-label="Toggle theme"
              title="Click to toggle between Light and Dark themes"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
