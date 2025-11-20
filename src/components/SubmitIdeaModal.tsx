import { useState } from 'react'
import { X, Lightbulb, Send, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { motion } from 'motion/react'

interface SubmitIdeaModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  serverUrl: string
  accessToken: string
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

  const handleSubmit = async () => {
    if (!idea.trim() || submitting) return

    setSubmitting(true)

    try {
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
        throw new Error(error.error || 'Failed to submit idea')
      }

      // Show success state
      setSubmitted(true)

      // Wait a moment then close
      setTimeout(() => {
        onSubmitSuccess()
        onClose()
        // Reset state for next time
        setIdea('')
        setSubmitted(false)
      }, 2000)

    } catch (error) {
      console.error('Submit error:', error)
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-2xl"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={submitting}
          className="absolute -top-4 -right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors text-white disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-12 shadow-2xl border-4 border-white/20">
          {!submitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-white/30 rounded-full blur-2xl" />
                    <div className="relative bg-white/20 backdrop-blur-md rounded-full p-6">
                      <Lightbulb className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>

                <h2 className="text-5xl font-black text-white mb-4">
                  Submit Your Idea
                </h2>
                <p className="text-xl text-white/90">
                  Share your vision for DEWII and help shape its future
                </p>
              </div>

              {/* Input Field */}
              <div className="mb-8">
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Describe your feature idea in detail... What problem does it solve? How would it work?"
                  disabled={submitting}
                  className="w-full h-48 px-6 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-white/60 transition-colors resize-none text-lg disabled:opacity-50"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2 px-2">
                  <p className="text-white/60 text-sm">
                    Be specific and clear about your idea
                  </p>
                  <p className="text-white/60 text-sm">
                    {idea.length} / 500
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSubmit}
                  disabled={!idea.trim() || submitting}
                  className="px-12 py-6 bg-white hover:bg-white/90 text-blue-600 font-black text-lg rounded-2xl shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Idea
                    </>
                  )}
                </Button>
              </div>

              {/* Info */}
              <div className="mt-8 text-center">
                <p className="text-white/70 text-sm">
                  💡 Great ideas earn rewards when implemented!
                </p>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-12">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute -inset-4 bg-white/30 rounded-full blur-2xl animate-pulse" />
                  <div className="relative bg-white/20 backdrop-blur-md rounded-full p-6">
                    <Sparkles className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>

              <h2 className="text-5xl font-black text-white mb-4">
                Idea Submitted! 🎉
              </h2>
              <p className="text-xl text-white/90 max-w-md mx-auto">
                Thank you for contributing! Your idea will be reviewed and may earn you rewards if implemented.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
