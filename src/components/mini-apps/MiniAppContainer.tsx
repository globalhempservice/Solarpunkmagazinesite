import { ReactNode, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MiniAppMetadata, MiniAppDataLoader, MiniAppLoadingState } from '../../types/mini-app'
import { MiniAppLoader } from './MiniAppLoader'
import { AppCloseButton } from '../AppCloseButton'

interface MiniAppContainerProps {
  metadata: MiniAppMetadata
  onClose: () => void
  loadData?: MiniAppDataLoader
  welcomeScreen?: ReactNode
  children: ReactNode
  showWelcomeFirst?: boolean // If true, shows welcome screen before main content
  skipLoading?: boolean // Skip loading screen entirely
}

/**
 * Universal container for all mini-apps
 * Handles: expansion animation, loading screen, welcome screen, close button
 */
export function MiniAppContainer({
  metadata,
  onClose,
  loadData,
  welcomeScreen,
  children,
  showWelcomeFirst = false,
  skipLoading = false
}: MiniAppContainerProps) {
  const [loadingState, setLoadingState] = useState<MiniAppLoadingState>(skipLoading ? 'loaded' : 'loading')
  const [progress, setProgress] = useState(0)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)

  // Simulate progress and load data
  useEffect(() => {
    if (skipLoading) return

    let progressInterval: number

    const load = async () => {
      // Start progress animation
      progressInterval = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev // Hold at 90% until data loads
          return prev + Math.random() * 15
        })
      }, 200)

      try {
        // Load data if provided
        if (loadData) {
          await loadData()
        } else {
          // Minimum loading time for UX (even if no data to load)
          await new Promise(resolve => setTimeout(resolve, 1500))
        }

        // Complete progress
        setProgress(100)
        
        // Wait a bit then transition
        setTimeout(() => {
          setLoadingState('loaded')
          if (showWelcomeFirst && welcomeScreen) {
            setShowWelcome(true)
          }
        }, 500)
      } catch (error) {
        console.error('Mini-app loading error:', error)
        setLoadingState('error')
        clearInterval(progressInterval)
      }
    }

    load()

    // Cycle through tips
    const tipInterval = window.setInterval(() => {
      if (metadata.tips && metadata.tips.length > 0) {
        setCurrentTipIndex(prev => (prev + 1) % metadata.tips!.length)
      }
    }, 3000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(tipInterval)
    }
  }, [loadData, skipLoading, showWelcomeFirst, welcomeScreen, metadata.tips])

  // Handle close from welcome screen
  const handleProceedFromWelcome = () => {
    setShowWelcome(false)
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-40"
    >
      <AnimatePresence mode="wait">
        {/* Loading Screen */}
        {loadingState === 'loading' && (
          <MiniAppLoader
            key="loader"
            metadata={metadata}
            progress={progress}
            currentTip={metadata.tips?.[currentTipIndex]}
          />
        )}

        {/* Error State */}
        {loadingState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-red-950 to-slate-950"
          >
            <div className="text-center px-8">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-black text-white mb-2">Oops! Something went wrong</h2>
              <p className="text-white/70 mb-6">Failed to load {metadata.name}</p>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
              >
                Go Back
              </button>
            </div>
          </motion.div>
        )}

        {/* Welcome Screen */}
        {loadingState === 'loaded' && showWelcome && welcomeScreen && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999]"
          >
            {/* Pass proceed handler to welcome screen */}
            {typeof welcomeScreen === 'function' 
              ? welcomeScreen({ onProceed: handleProceedFromWelcome, onClose })
              : welcomeScreen
            }
          </motion.div>
        )}

        {/* Main App Content */}
        {loadingState === 'loaded' && !showWelcome && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative h-full"
          >
            {/* App Content - Fills entire screen */}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}