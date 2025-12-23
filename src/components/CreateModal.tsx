import { motion, AnimatePresence } from 'motion/react'
import { X, FileText, MapPin, Package, Briefcase } from 'lucide-react'
import { useState, useEffect } from 'react'

interface CreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateArticle: () => void
  onAddPlace: () => void
  onListSwapItem: () => void
  onCreateRFP?: () => void
}

interface CreateOption {
  id: string
  label: string
  description: string
  icon: any
  gradient: string
  iconColor: string
  action: () => void
  universe: string
}

export function CreateModal({
  isOpen,
  onClose,
  onCreateArticle,
  onAddPlace,
  onListSwapItem,
  onCreateRFP
}: CreateModalProps) {
  const [isLightTheme, setIsLightTheme] = useState(false)

  // Check theme on mount and when it changes
  useEffect(() => {
    const checkTheme = () => {
      const html = document.documentElement
      const hasLightTheme = !html.classList.contains('dark') && 
                           !html.classList.contains('hempin') && 
                           !html.classList.contains('solarpunk-dreams') &&
                           !html.classList.contains('midnight-hemp') &&
                           !html.classList.contains('golden-hour')
      setIsLightTheme(hasLightTheme)
    }
    
    checkTheme()
    
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  const createOptions: CreateOption[] = [
    {
      id: 'article',
      label: 'Article',
      description: 'Share knowledge',
      icon: FileText,
      gradient: 'linear-gradient(135deg, #c7d2fe 0%, #818cf8 100%)',
      iconColor: '#312e81',
      universe: 'MAG',
      action: () => {
        onCreateArticle()
        onClose()
      }
    },
    {
      id: 'place',
      label: 'Place',
      description: 'Add location',
      icon: MapPin,
      gradient: 'linear-gradient(135deg, #5eead4 0%, #14b8a6 100%)',
      iconColor: '#0f766e',
      universe: 'PLACES',
      action: () => {
        onAddPlace()
        onClose()
      }
    },
    {
      id: 'swap',
      label: 'Item',
      description: 'List for trade',
      icon: Package,
      gradient: 'linear-gradient(135deg, #fdba74 0%, #f97316 100%)',
      iconColor: '#7c2d12',
      universe: 'SWAP',
      action: () => {
        onListSwapItem()
        onClose()
      }
    },
    {
      id: 'rfp',
      label: 'RFP',
      description: 'Request proposal',
      icon: Briefcase,
      gradient: 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%)',
      iconColor: '#1e3a8a',
      universe: 'GLOBE',
      action: () => {
        onCreateRFP?.()
        onClose()
      }
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-[201] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="rounded-3xl p-6 relative overflow-hidden"
              style={{
                background: isLightTheme
                  ? 'rgba(255, 255, 255, 0.95)'
                  : 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: isLightTheme
                  ? '1.5px solid rgba(0, 0, 0, 0.1)'
                  : '1.5px solid rgba(255, 255, 255, 0.15)',
                boxShadow: isLightTheme
                  ? '0 20px 60px rgba(0, 0, 0, 0.2)'
                  : '0 20px 60px rgba(0, 0, 0, 0.6)',
              }}
            >
              {/* Gradient glow */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #06b6d4, #3b82f6)',
                  filter: 'blur(40px)',
                }}
              />

              {/* Header */}
              <div className="relative flex items-center justify-between mb-6">
                <div>
                  <h2 
                    className="text-2xl font-black tracking-tight"
                    style={{
                      color: isLightTheme ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)'
                    }}
                  >
                    Create New
                  </h2>
                  <p 
                    className="text-sm mt-1"
                    style={{
                      color: isLightTheme ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    Add a stamp to the universe
                  </p>
                </div>
                
                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-full transition-colors"
                  style={{
                    background: isLightTheme
                      ? 'rgba(0, 0, 0, 0.05)'
                      : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <X 
                    size={20} 
                    strokeWidth={2.5}
                    style={{
                      color: isLightTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)'
                    }}
                  />
                </motion.button>
              </div>

              {/* Options Grid - Pin shapes */}
              <div className="relative grid grid-cols-2 gap-4">
                {createOptions.map((option, index) => {
                  const Icon = option.icon
                  
                  return (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={option.action}
                      className="group relative rounded-2xl p-5 flex flex-col items-center gap-3 transition-all"
                      style={{
                        background: option.gradient,
                        boxShadow: isLightTheme
                          ? '0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                          : '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        border: isLightTheme
                          ? '1px solid rgba(255, 255, 255, 0.8)'
                          : '1.5px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      {/* Glass highlight overlay */}
                      <div 
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                        }}
                      />
                      
                      {/* Pin shadow */}
                      <div 
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 rounded-full blur-md transition-all group-hover:w-16 group-hover:h-3"
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                        }}
                      />
                      
                      {/* Icon */}
                      <div className="relative">
                        <Icon 
                          size={32}
                          strokeWidth={2}
                          style={{
                            color: option.iconColor,
                            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
                          }}
                        />
                      </div>
                      
                      {/* Label */}
                      <div className="relative text-center">
                        <p 
                          className="font-black text-sm"
                          style={{ 
                            color: option.iconColor,
                            textShadow: '0 1px 2px rgba(255,255,255,0.5)',
                          }}
                        >
                          {option.label}
                        </p>
                        <p 
                          className="text-[10px] font-medium mt-0.5"
                          style={{ 
                            color: option.iconColor,
                            opacity: 0.7,
                          }}
                        >
                          {option.description}
                        </p>
                      </div>

                      {/* Universe badge */}
                      <div 
                        className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-black tracking-wide"
                        style={{
                          background: 'rgba(255, 255, 255, 0.3)',
                          color: option.iconColor,
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        {option.universe}
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Hint text */}
              <p 
                className="text-center text-xs mt-6"
                style={{
                  color: isLightTheme ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.5)'
                }}
              >
                Each creation adds a stamp to its universe
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
