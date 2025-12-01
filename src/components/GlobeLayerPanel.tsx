import { useState } from 'react'
import { Layers, Lock, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from './ui/button'

export interface GlobeLayer {
  id: string
  name: string
  icon: string
  color: string
  enabled: boolean
  requiresAuth: boolean
  count?: number
  minZoomLevel: number
}

interface GlobeLayerPanelProps {
  layers: GlobeLayer[]
  isAuthenticated: boolean
  onLayerToggle: (layerId: string) => void
  onSignInClick: () => void
  currentZoom?: number
}

export function GlobeLayerPanel({ 
  layers, 
  isAuthenticated, 
  onLayerToggle, 
  onSignInClick,
  currentZoom = 0
}: GlobeLayerPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="fixed top-4 left-4 w-72 bg-neutral-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-emerald-600/20 to-purple-600/20 border-b border-emerald-500/30 p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h3 className="text-emerald-100">Map Layers</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-neutral-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-400" />
        )}
      </div>

      {/* Layers List */}
      {isExpanded && (
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {layers.map((layer) => {
            const isLocked = layer.requiresAuth && !isAuthenticated
            const isBelowMinZoom = currentZoom < layer.minZoomLevel
            const isDisabled = isLocked || isBelowMinZoom

            return (
              <div
                key={layer.id}
                className={`
                  p-3 rounded-xl border transition-all
                  ${layer.enabled && !isDisabled
                    ? 'bg-gradient-to-r from-emerald-600/10 to-purple-600/10 border-emerald-500/50'
                    : 'bg-neutral-800/50 border-neutral-700/50'
                  }
                  ${isDisabled ? 'opacity-60' : 'opacity-100'}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{layer.icon}</span>
                    <div>
                      <h4 className="text-sm text-neutral-200">{layer.name}</h4>
                      {layer.count !== undefined && (
                        <p className="text-xs text-neutral-400">
                          {layer.count} {layer.count === 1 ? 'item' : 'items'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Toggle or Lock */}
                  {isLocked ? (
                    <Lock className="w-4 h-4 text-amber-500" />
                  ) : (
                    <button
                      onClick={() => !isDisabled && onLayerToggle(layer.id)}
                      disabled={isDisabled}
                      className={`
                        p-1 rounded-lg transition-colors
                        ${!isDisabled && 'hover:bg-white/10 cursor-pointer'}
                      `}
                    >
                      {layer.enabled ? (
                        <Eye className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-neutral-500" />
                      )}
                    </button>
                  )}
                </div>

                {/* Color Preview */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="text-xs text-neutral-400">Color: {layer.color}</span>
                </div>

                {/* Lock Message */}
                {isLocked && (
                  <div className="mt-2 pt-2 border-t border-neutral-700/50">
                    <p className="text-xs text-amber-400 mb-2">🔒 Sign in to view this layer</p>
                    <Button
                      onClick={onSignInClick}
                      size="sm"
                      className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-xs"
                    >
                      Sign In to Explore
                    </Button>
                  </div>
                )}

                {/* Zoom Message */}
                {!isLocked && isBelowMinZoom && (
                  <div className="mt-2 pt-2 border-t border-neutral-700/50">
                    <p className="text-xs text-blue-400">
                      🔍 Zoom in to level {layer.minZoomLevel} to activate
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Auth CTA Footer */}
      {!isAuthenticated && isExpanded && (
        <div className="p-4 border-t border-neutral-800 bg-gradient-to-r from-amber-600/10 to-orange-600/10">
          <p className="text-xs text-amber-300 mb-2">
            ✨ Sign in to unlock all data layers and explore the global hemp network!
          </p>
          <Button
            onClick={onSignInClick}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-sm"
          >
            Sign In to Explore
          </Button>
        </div>
      )}
    </div>
  )
}
