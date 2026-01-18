import { Users, TrendingUp } from 'lucide-react'
import { Room } from './types'
import { motion } from 'motion/react'

interface RoomCardProps {
  room: Room
  onClick: () => void
  variant?: 'default' | 'compact' | 'featured'
}

export function RoomCard({ room, onClick, variant = 'default' }: RoomCardProps) {
  const isCompact = variant === 'compact'
  const isFeatured = variant === 'featured'

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      <div 
        className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
          isFeatured 
            ? 'p-6 hover:shadow-xl' 
            : isCompact 
            ? 'p-3 hover:shadow-md' 
            : 'p-4 hover:shadow-lg'
        }`}
        style={{
          background: 'rgba(30, 20, 60, 0.3)',
          backdropFilter: 'blur(20px)',
          borderColor: `${room.color}30`,
        }}
      >
        {/* Colored glow on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
          style={{
            background: `radial-gradient(circle at center, ${room.color}20 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10">
          {/* Icon + Title */}
          <div className="flex items-start gap-3 mb-2">
            <div 
              className={`${isFeatured ? 'w-12 h-12' : 'w-10 h-10'} rounded-lg flex items-center justify-center flex-shrink-0 text-2xl transition-transform group-hover:scale-110`}
              style={{
                background: `linear-gradient(135deg, ${room.color}40, ${room.color}20)`,
                border: `1px solid ${room.color}50`,
              }}
            >
              {room.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-bold text-white mb-1 truncate ${isFeatured ? 'text-lg' : 'text-base'}`}>
                {room.name}
              </h4>
              {!isCompact && (
                <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                  {room.description}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-white/60">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{room.threadCount} threads</span>
            </div>
            {room.activeNow > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400">{room.activeNow} active</span>
              </div>
            )}
            {room.isFollowing && (
              <div className="ml-auto">
                <div className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                  <span className="text-xs font-medium text-purple-300">Following</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
