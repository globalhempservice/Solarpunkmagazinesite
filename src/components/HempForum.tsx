import { useState } from 'react'
import { ArrowLeft, MessageCircle, TrendingUp, Sparkles, Users, Zap } from 'lucide-react'
import { Button } from './ui/button'
import { VotingModal } from './VotingModal'
import { SubmitIdeaModal } from './SubmitIdeaModal'
import { motion } from 'motion/react'

interface HempForumProps {
  userId: string | null
  accessToken: string | null
  serverUrl: string
  nadaPoints?: number
  onClose: () => void
  onNadaUpdate?: (newBalance: number) => void
}

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

export function HempForum({ userId, accessToken, serverUrl, nadaPoints, onClose, onNadaUpdate }: HempForumProps) {
  const [showVotingModal, setShowVotingModal] = useState(false)
  const [showSubmitIdeaModal, setShowSubmitIdeaModal] = useState(false)

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-y-auto z-[9995]">
      {/* Hemp fiber texture overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '80px 80px'
      }} />

      {/* Content Container */}
      <div className="relative max-w-6xl mx-auto px-6 py-24 pb-32">
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative mx-auto w-24 h-24 mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full blur-2xl opacity-60 animate-pulse" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-2xl">
              <MessageCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-6xl font-black text-white mb-6 drop-shadow-2xl"
            style={{
              textShadow: '4px 4px 0 rgba(0,0,0,0.3), -1px -1px 0 rgba(255,255,255,0.1)'
            }}
          >
            HEMP FORUM
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-purple-200/90 max-w-2xl mx-auto"
          >
            Connect the Hemp Universe • Share Your Voice • Shape the Future
          </motion.p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Vote on Features Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => setShowVotingModal(true)}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/60 via-pink-900/60 to-fuchsia-900/60 hover:from-purple-800/80 hover:via-pink-800/80 hover:to-fuchsia-800/80 p-8 border-2 border-purple-400/30 hover:border-purple-400/60 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            {/* Halftone pattern */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: '12px 12px'
            }} />

            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 rounded-3xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity" />

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 mb-6">
                <TrendingUp className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>

              {/* Title */}
              <h3 className="text-3xl font-black text-white mb-3 drop-shadow-lg">Vote on Features</h3>

              {/* Description */}
              <p className="text-purple-100/80 leading-relaxed mb-6">
                Have your say in what gets built next. Vote on proposed features and help prioritize development based on community needs.
              </p>

              {/* Action */}
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 hover:from-purple-600 hover:via-pink-600 hover:to-fuchsia-600 text-white font-black text-base py-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105"
              >
                Cast Your Vote
              </Button>
            </div>
          </motion.div>

          {/* Submit Ideas Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => setShowSubmitIdeaModal(true)}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/60 via-cyan-900/60 to-teal-900/60 hover:from-blue-800/80 hover:via-cyan-800/80 hover:to-teal-800/80 p-8 border-2 border-cyan-400/30 hover:border-cyan-400/60 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            {/* Halftone pattern */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: '12px 12px'
            }} />

            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-3xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity" />

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-cyan-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 mb-6">
                <Sparkles className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>

              {/* Title */}
              <h3 className="text-3xl font-black text-white mb-3 drop-shadow-lg">Submit Your Ideas</h3>

              {/* Description */}
              <p className="text-cyan-100/80 leading-relaxed mb-6">
                Got a brilliant idea? Share it with the community! Submit feature requests and innovative concepts to enhance DEWII.
              </p>

              {/* Action */}
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 text-white font-black text-base py-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105"
              >
                Share Your Idea
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Coming Soon Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/60 via-purple-900/40 to-slate-900/60 p-8 border-2 border-purple-400/20"
        >
          {/* Halftone pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '12px 12px'
          }} />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-purple-400" strokeWidth={2.5} />
              <h3 className="text-2xl font-black text-white">Coming Soon</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Feature 1 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-400" strokeWidth={2.5} />
                  <h4 className="font-black text-white">Community Discussions</h4>
                </div>
                <p className="text-sm text-purple-200/70">Join conversations with other hemp enthusiasts</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5 text-cyan-400" strokeWidth={2.5} />
                  <h4 className="font-black text-white">Direct Messaging</h4>
                </div>
                <p className="text-sm text-cyan-200/70">Connect directly with industry leaders</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-pink-400" strokeWidth={2.5} />
                  <h4 className="font-black text-white">Polls & Surveys</h4>
                </div>
                <p className="text-sm text-pink-200/70">Gather community feedback and insights</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center"
        >
          <p className="text-purple-200/60 text-sm">
            The Hemp Forum is your gateway to shaping the future of DEWII and connecting with the global hemp community
          </p>
        </motion.div>
      </div>

      {/* Voting Modal */}
      {showVotingModal && userId && accessToken && (
        <VotingModal
          isOpen={showVotingModal}
          onClose={() => setShowVotingModal(false)}
          userId={userId}
          accessToken={accessToken}
          serverUrl={serverUrl}
          nadaPoints={nadaPoints || 0}
          onVoteSuccess={(newBalance) => {
            onNadaUpdate && onNadaUpdate(newBalance)
          }}
        />
      )}

      {/* Submit Idea Modal */}
      {showSubmitIdeaModal && userId && accessToken && (
        <SubmitIdeaModal
          isOpen={showSubmitIdeaModal}
          onClose={() => setShowSubmitIdeaModal(false)}
          userId={userId}
          accessToken={accessToken}
          serverUrl={serverUrl}
          onSubmitSuccess={() => {
            console.log('Idea submitted successfully!')
          }}
        />
      )}
    </div>
  )
}