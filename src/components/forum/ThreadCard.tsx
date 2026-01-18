import { MessageCircle, Eye, Bookmark, Sparkles, Pin } from 'lucide-react'
import { Thread } from './types'
import { ReputationBadge } from './ReputationBadge'
import { StatusChip } from './StatusChip'
import { motion } from 'motion/react'

interface ThreadCardProps {
  thread: Thread
  onClick: () => void
  variant?: 'default' | 'compact'
}

export function ThreadCard({ thread, onClick, variant = 'default' }: ThreadCardProps) {
  const isCompact = variant === 'compact'

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      {/* Glass card with aurora overlay */}
      <div 
        className="relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg"
        style={{
          background: 'rgba(30, 20, 60, 0.4)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(147, 51, 234, 0.2)',
        }}
      >
        {/* Aurora gradient overlay on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
          }}
        />

        {/* Grain texture */}
        <div 
          className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className={`relative z-10 ${isCompact ? 'p-4' : 'p-6'}`}>
          {/* Header: Status + Room */}
          <div className="flex items-center gap-2 mb-3">
            {thread.isPinned && (
              <div className="flex items-center gap-1 text-amber-400">
                <Pin className="w-3.5 h-3.5 fill-amber-400" />
              </div>
            )}
            {thread.status && <StatusChip status={thread.status} size="sm" />}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: thread.roomName === 'Hemp Cultivation' ? '#10B981' : '#8B5CF6' }}
              />
              <span className="text-xs text-white/60">{thread.roomName}</span>
            </div>
            
            {/* Tags */}
            {thread.tags.slice(0, 2).map((tag, i) => (
              <span 
                key={i}
                className="text-xs text-purple-300/60 px-2 py-0.5 rounded-full bg-purple-500/10"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className={`font-bold text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-blue-300 transition-all ${isCompact ? 'text-base' : 'text-lg'}`}>
            {thread.title}
          </h3>

          {/* Excerpt */}
          {!isCompact && (
            <p className="text-sm text-white/50 mb-4 line-clamp-2 leading-relaxed">
              {thread.excerpt}
            </p>
          )}

          {/* Footer: Author + Signals */}
          <div className="flex items-center justify-between gap-4">
            {/* Author */}
            <div className="flex items-center gap-2 min-w-0">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br from-purple-500 to-blue-500 text-white flex-shrink-0"
              >
                {thread.author.name[0]}
              </div>
              <div className="min-w-0">
                <div className="text-sm text-white/80 truncate">{thread.author.name}</div>
                <ReputationBadge reputation={thread.author.reputation} size="sm" />
              </div>
            </div>

            {/* Signals */}
            <div className="flex items-center gap-3 text-xs text-white/40 flex-shrink-0">
              <div className="flex items-center gap-1 hover:text-purple-300 transition-colors">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{thread.signals.replies}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{thread.signals.views}</span>
              </div>
              <div className="flex items-center gap-1 hover:text-emerald-300 transition-colors">
                <Bookmark className="w-3.5 h-3.5" />
                <span>{thread.signals.saves}</span>
              </div>
              {thread.signals.nadaPotential > 0 && (
                <div className="flex items-center gap-1 text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+{thread.signals.nadaPotential}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
