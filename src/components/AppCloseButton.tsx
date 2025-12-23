import { X } from 'lucide-react'
import { motion } from 'motion/react'

interface AppCloseButtonProps {
  onClose: () => void
  label?: string
}

/**
 * Universal close button for all mini-apps
 * Positioned at top center, sends user back to homescreen (feed)
 */
export function AppCloseButton({ onClose, label = 'Close' }: AppCloseButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', damping: 15 }}
      onClick={onClose}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] group"
      aria-label={label}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#E8FF00] via-white to-[#E8FF00] rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
      
      {/* Button */}
      <div className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-md border-2 border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.15)] group-hover:shadow-[0_6px_30px_rgba(232,255,0,0.3)] transition-all group-hover:scale-105 active:scale-95">
        {/* Close icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#E8FF00] rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
          <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <X className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        </div>
        
        {/* Label */}
        <span className="text-sm font-bold text-slate-900 tracking-wide">
          {label}
        </span>
      </div>
    </motion.button>
  )
}
