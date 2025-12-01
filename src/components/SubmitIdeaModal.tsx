import { useState } from 'react'
import { X, Lightbulb, Send, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface SubmitIdeaModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  serverUrl: string
  accessToken: string | null
  onSubmitSuccess: () => void
}

export function SubmitIdeaModal({
  isOpen,
  onClose,
  userId,
  serverUrl,
  accessToken,
  onSubmitSuccess
}: SubmitIdeaModalProps) {
  const [idea, setIdea] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const MAX_LENGTH = 1000
  const isOverLimit = idea.length > MAX_LENGTH

  const handleSubmit = async () => {
    if (!idea.trim() || submitting || !userId || !accessToken) return

    setSubmitting(true)

    try {
      console.log('💡 Submitting idea:', { userId, ideaLength: idea.trim().length })

      const response = await fetch(`${serverUrl}/nada-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          userId,
          suggestion: idea.trim()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ Submit failed:', error)
        throw new Error(error.error || 'Failed to submit idea')
      }

      console.log('✅ Idea submitted successfully!')

      // Show success state
      setSubmitted(true)

      // Wait a moment then close
      setTimeout(() => {
        onSubmitSuccess()
        onClose()
        // Reset state for next time
        setIdea('')
        setSubmitted(false)
        setSubmitting(false)
      }, 2500)

    } catch (error) {
      console.error('❌ Submit error:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit idea')
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (submitting) return
    setIdea('')
    setSubmitted(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[99999] bg-gradient-to-b from-slate-950 via-teal-950 to-slate-950 select-none">
      {/* Close Button - Top Right */}
      <button
        onClick={handleClose}
        disabled={submitting}
        className="fixed top-6 right-6 z-[100000] p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white shadow-lg disabled:opacity-50"
        aria-label="Close"
      >
        <X className="w-6 h-6" strokeWidth={3} />
      </button>

      <AnimatePresence mode="wait">
        {!submitted ? (
          /* Submission Form */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex flex-col items-center justify-center px-4 sm:px-6 pt-6 pb-32"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              className="mb-4 sm:mb-8"
            >
              <div className="relative">
                <div className="absolute -inset-4 sm:-inset-6 bg-teal-400/30 rounded-full blur-3xl" />
                <div className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 bg-teal-500/20 backdrop-blur-md border-4 border-white/30 shadow-2xl flex items-center justify-center">
                  <Lightbulb className="w-12 h-12 sm:w-20 sm:h-20 text-white" strokeWidth={2} />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-2 sm:mb-4 text-center leading-tight px-4"
            >
              Share Your Vision
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-xl text-white/80 mb-6 sm:mb-12 text-center max-w-2xl px-4"
            >
              Help shape the future of Hemp and DEWII
            </motion.p>

            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-3xl"
            >
              <div className="rounded-3xl sm:rounded-[3rem] bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 p-6 sm:p-8 md:p-12 shadow-[0_20px_100px_rgba(20,184,166,0.5)] border-4 border-white/10 relative overflow-visible">
                {/* Halftone pattern */}
                <div className="absolute inset-0 opacity-20 rounded-3xl sm:rounded-[3rem] pointer-events-none" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                  backgroundSize: '16px 16px'
                }} />

                {/* Content */}
                <div className="relative">
                  {/* Textarea */}
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Express yourself here, in any language..."
                    disabled={submitting}
                    className="w-full h-48 sm:h-64 px-4 sm:px-6 py-4 sm:py-5 bg-white/15 backdrop-blur-md border-3 border-white/30 rounded-2xl sm:rounded-3xl text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all resize-none text-base sm:text-lg disabled:opacity-50"
                  />

                  {/* Over Limit Warning - Only shown when over limit */}
                  {isOverLimit && (
                    <div className="mt-3 px-4">
                      <p className="text-red-300 font-black text-sm">
                        Vision text size reached. Please reduce to submit
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-center mt-6 sm:mt-8">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmit}
                      disabled={!idea.trim() || submitting || isOverLimit}
                      className="group relative px-12 sm:px-16 py-4 sm:py-5 bg-white hover:bg-white/90 text-teal-600 font-black text-lg sm:text-xl rounded-2xl shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    >
                      {/* Button glow */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
                      
                      <div className="relative flex items-center gap-2 sm:gap-3">
                        {submitting ? (
                          <>
                            <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
                            <span>Submit Vision</span>
                          </>
                        )}
                      </div>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* Success State */
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="fixed inset-0 flex flex-col items-center justify-center px-6"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', damping: 12 }}
              className="mb-8"
            >
              <div className="relative">
                <div className="absolute -inset-8 bg-teal-400/40 rounded-full blur-3xl animate-pulse" />
                <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 bg-teal-500/20 backdrop-blur-md border-4 border-white/30 shadow-2xl flex items-center justify-center">
                  <Sparkles className="w-24 h-24 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>

            {/* Success Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl sm:text-7xl font-black text-white mb-6 text-center leading-tight"
            >
              Vision Submitted!
            </motion.h2>

            {/* Success Message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl text-white/90 max-w-2xl text-center leading-relaxed"
            >
              Thank you for sharing your vision! Our team will review your idea and it may be featured in the community.
            </motion.p>

            {/* Success Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full border-2 border-white/30"
            >
              <span className="text-white font-black text-lg">Visionary Contributor</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}