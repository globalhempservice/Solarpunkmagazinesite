import { motion } from 'motion/react'
import { Building2, Package, Calendar, Layers, X, MapPin } from 'lucide-react'

export type LayerType = 'off' | 'places' | 'organizations' | 'products' | 'events' | 'all'

interface GlobeLayerSelectorProps {
  activeLayer: LayerType
  onLayerChange: (layer: LayerType) => void
}

export function GlobeLayerSelector({ activeLayer, onLayerChange }: GlobeLayerSelectorProps) {
  const layers: { value: LayerType; icon: React.ReactNode; color: string; glowColor: string; hint: string }[] = [
    {
      value: 'off',
      icon: <X className="w-5 h-5" />,
      color: 'from-slate-400 to-gray-500',
      glowColor: 'slate-500',
      hint: 'Off'
    },
    {
      value: 'places',
      icon: <MapPin className="w-5 h-5" />,
      color: 'from-pink-400 to-rose-500',
      glowColor: 'pink-500',
      hint: 'Places'
    },
    {
      value: 'organizations',
      icon: <Building2 className="w-5 h-5" />,
      color: 'from-emerald-400 to-teal-500',
      glowColor: 'teal-500',
      hint: 'Orgs'
    },
    {
      value: 'products',
      icon: <Package className="w-5 h-5" />,
      color: 'from-amber-400 to-orange-500',
      glowColor: 'orange-500',
      hint: 'Products'
    },
    {
      value: 'events',
      icon: <Calendar className="w-5 h-5" />,
      color: 'from-purple-400 to-pink-500',
      glowColor: 'purple-500',
      hint: 'Events'
    },
    {
      value: 'all',
      icon: <Layers className="w-5 h-5" />,
      color: 'from-cyan-400 to-blue-500',
      glowColor: 'cyan-500',
      hint: 'All'
    }
  ]

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-black/30 backdrop-blur-xl border border-hemp-primary/30 rounded-full shadow-2xl shadow-hemp-primary/20 p-1.5 flex items-center gap-1"
      >
        {/* Layer Buttons */}
        {layers.map((layer) => {
          const isActive = activeLayer === layer.value
          
          return (
            <motion.button
              key={layer.value}
              onClick={() => onLayerChange(layer.value)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`
                relative group p-3 rounded-full
                transition-all duration-300 flex items-center justify-center
                ${isActive 
                  ? `bg-gradient-to-br ${layer.color} shadow-lg` 
                  : 'bg-black/20 hover:bg-black/40'
                }
              `}
              title={layer.hint}
            >
              {/* Glow ring for active layer */}
              {isActive && (
                <motion.div 
                  className={`absolute -inset-1 bg-gradient-to-r ${layer.color} rounded-full blur-md opacity-60`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.6, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              
              {/* Icon */}
              <div className={`relative ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>
                {layer.icon}
              </div>

              {/* Pulse animation for active */}
              {isActive && (
                <motion.div
                  className={`absolute inset-0 rounded-full border-2 border-white/50`}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
