import { useState } from 'react'
import { Palette, X, RotateCcw, Save } from 'lucide-react'
import { Button } from './ui/button'

interface GlobeStyle {
  oceanColor: string
  landColor: string
  atmosphereColor: string
  atmosphereIntensity: number
  showGrid: boolean
}

interface GlobeCustomizationPanelProps {
  style: GlobeStyle
  onStyleChange: (style: GlobeStyle) => void
  onClose: () => void
}

const PRESETS: { [key: string]: GlobeStyle } = {
  solarpunk: {
    oceanColor: '#059669', // Deep emerald ocean
    landColor: '#84cc16', // Bright lime green land - hemp vibes!
    atmosphereColor: '#fbbf24', // Golden atmosphere
    atmosphereIntensity: 0.7,
    showGrid: false
  },
  midnight: {
    oceanColor: '#1e1b4b', // Deep indigo ocean
    landColor: '#6366f1', // Bright indigo land - alien world!
    atmosphereColor: '#c084fc', // Purple atmosphere
    atmosphereIntensity: 0.9,
    showGrid: false
  },
  golden: {
    oceanColor: '#ea580c', // Deep orange ocean
    landColor: '#fbbf24', // Golden land - sunset planet!
    atmosphereColor: '#fef3c7', // Warm cream atmosphere
    atmosphereIntensity: 0.8,
    showGrid: false
  },
  retro: {
    oceanColor: '#0ea5e9', // Bright cyan ocean
    landColor: '#10b981', // Emerald land - 8-bit style!
    atmosphereColor: '#ec4899', // Hot pink atmosphere
    atmosphereIntensity: 0.6,
    showGrid: true
  }
}

export function GlobeCustomizationPanel({ style, onStyleChange, onClose }: GlobeCustomizationPanelProps) {
  const [localStyle, setLocalStyle] = useState<GlobeStyle>(style)

  const updateStyle = (updates: Partial<GlobeStyle>) => {
    const newStyle = { ...localStyle, ...updates }
    setLocalStyle(newStyle)
    onStyleChange(newStyle)
  }

  const applyPreset = (presetName: string) => {
    const preset = PRESETS[presetName]
    setLocalStyle(preset)
    onStyleChange(preset)
  }

  const resetToDefault = () => {
    applyPreset('solarpunk')
  }

  const saveToLocalStorage = () => {
    localStorage.setItem('dewii-globe-style', JSON.stringify(localStyle))
  }

  return (
    <div className="fixed top-4 right-4 w-80 bg-neutral-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600/20 to-amber-600/20 border-b border-emerald-500/30 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-emerald-400" />
          <h3 className="text-emerald-100">Globe Customization</h3>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-white/10"
        >
          <X className="w-4 h-4 text-neutral-400" />
        </Button>
      </div>

      {/* Presets */}
      <div className="p-4 border-b border-neutral-800">
        <p className="text-xs text-neutral-400 mb-2">🎨 Style Presets</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => applyPreset('solarpunk')}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/30 hover:border-emerald-400/50 transition-all text-sm text-emerald-200"
          >
            🌱 Solarpunk
          </button>
          <button
            onClick={() => applyPreset('midnight')}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 hover:border-purple-400/50 transition-all text-sm text-purple-200"
          >
            🌙 Midnight
          </button>
          <button
            onClick={() => applyPreset('golden')}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 hover:border-amber-400/50 transition-all text-sm text-amber-200"
          >
            🌅 Golden Hour
          </button>
          <button
            onClick={() => applyPreset('retro')}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600/20 to-pink-600/20 border border-blue-500/30 hover:border-blue-400/50 transition-all text-sm text-blue-200"
          >
            🎮 Retro Game
          </button>
        </div>
      </div>

      {/* Color Controls */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Ocean Color */}
        <div>
          <label className="text-xs text-neutral-400 mb-1 block">🌊 Ocean Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={localStyle.oceanColor}
              onChange={(e) => updateStyle({ oceanColor: e.target.value })}
              className="w-12 h-10 rounded-lg cursor-pointer bg-neutral-800 border border-neutral-700"
            />
            <input
              type="text"
              value={localStyle.oceanColor}
              onChange={(e) => updateStyle({ oceanColor: e.target.value })}
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200"
              placeholder="#10b981"
            />
          </div>
        </div>

        {/* Land Color */}
        <div>
          <label className="text-xs text-neutral-400 mb-1 block">🌍 Land Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={localStyle.landColor}
              onChange={(e) => updateStyle({ landColor: e.target.value })}
              className="w-12 h-10 rounded-lg cursor-pointer bg-neutral-800 border border-neutral-700"
            />
            <input
              type="text"
              value={localStyle.landColor}
              onChange={(e) => updateStyle({ landColor: e.target.value })}
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200"
              placeholder="#047857"
            />
          </div>
        </div>

        {/* Atmosphere Color */}
        <div>
          <label className="text-xs text-neutral-400 mb-1 block">✨ Atmosphere Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={localStyle.atmosphereColor}
              onChange={(e) => updateStyle({ atmosphereColor: e.target.value })}
              className="w-12 h-10 rounded-lg cursor-pointer bg-neutral-800 border border-neutral-700"
            />
            <input
              type="text"
              value={localStyle.atmosphereColor}
              onChange={(e) => updateStyle({ atmosphereColor: e.target.value })}
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200"
              placeholder="#fbbf24"
            />
          </div>
        </div>

        {/* Atmosphere Intensity */}
        <div>
          <label className="text-xs text-neutral-400 mb-1 block">
            ✨ Atmosphere Intensity: {Math.round(localStyle.atmosphereIntensity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={localStyle.atmosphereIntensity * 100}
            onChange={(e) => updateStyle({ atmosphereIntensity: parseInt(e.target.value) / 100 })}
            className="w-full"
          />
        </div>

        {/* Visual Effects - Simplified */}
        <div className="space-y-2">
          <p className="text-xs text-neutral-400">🎮 Visual Options</p>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localStyle.showGrid}
              onChange={(e) => updateStyle({ showGrid: e.target.checked })}
              className="w-4 h-4 rounded border-neutral-700"
            />
            <span className="text-sm text-neutral-300">Show Country Borders</span>
          </label>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-neutral-800 flex gap-2">
        <Button
          onClick={resetToDefault}
          variant="outline"
          size="sm"
          className="flex-1 gap-1 border-neutral-700 hover:bg-white/5"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
        <Button
          onClick={saveToLocalStorage}
          size="sm"
          className="flex-1 gap-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
        >
          <Save className="w-3 h-3" />
          Save Style
        </Button>
      </div>
    </div>
  )
}
