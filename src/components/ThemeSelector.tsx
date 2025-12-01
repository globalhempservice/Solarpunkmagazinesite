import React, { useState, useEffect } from 'react'
import { Palette, Lock, Check, Sparkles } from 'lucide-react'

interface ThemeOption {
  id: string
  name: string
  description: string
  preview: {
    primary: string
    secondary: string
    background: string
  }
  itemId: string // Matches item_id in user_swag_items table
  gradientClass: string
}

const AVAILABLE_THEMES: ThemeOption[] = [
  {
    id: 'solarpunk-dreams',
    name: 'Solarpunk Dreams',
    description: 'Emerald forests and golden sunlight',
    preview: {
      primary: '#fbbf24',
      secondary: '#10b981',
      background: 'linear-gradient(135deg, #0a1f15 0%, #0f2e22 100%)'
    },
    itemId: 'theme-solarpunk-dreams',
    gradientClass: 'from-emerald-400 to-amber-400'
  },
  {
    id: 'midnight-hemp',
    name: 'Midnight Hemp',
    description: 'Dark skies with bioluminescent glow',
    preview: {
      primary: '#a855f7',
      secondary: '#10b981',
      background: 'linear-gradient(135deg, #0c0a1f 0%, #1e1b33 100%)'
    },
    itemId: 'theme-midnight-hemp',
    gradientClass: 'from-purple-400 to-green-400'
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Warm sunset hues and amber horizons',
    preview: {
      primary: '#f59e0b',
      secondary: '#fb923c',
      background: 'linear-gradient(135deg, #1f1108 0%, #3d2416 100%)'
    },
    itemId: 'theme-golden-hour',
    gradientClass: 'from-amber-400 to-orange-400'
  }
]

interface ThemeSelectorProps {
  userId: string
  serverUrl: string
  accessToken: string
  currentTheme: string
  ownedItems: Array<{ item_id: string; item_name: string }>
  onThemeChange: (themeId: string) => void
  onNavigateToShop?: () => void
}

export function ThemeSelector({
  userId,
  serverUrl,
  accessToken,
  currentTheme,
  ownedItems,
  onThemeChange,
  onNavigateToShop
}: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme)
  const [updating, setUpdating] = useState(false)

  // Check if user owns a theme
  function isThemeOwned(itemId: string): boolean {
    // Solarpunk Dreams is default/free for everyone
    if (itemId === 'theme-solarpunk-dreams') return true
    
    // Check if user owns this theme in their swag items
    return ownedItems.some(item => item.item_id === itemId)
  }

  async function handleSelectTheme(theme: ThemeOption) {
    // Check ownership
    if (!isThemeOwned(theme.itemId)) {
      if (onNavigateToShop) {
        if (confirm(`This theme is locked! Would you like to visit the Swag Shop to purchase it?`)) {
          onNavigateToShop()
        }
      } else {
        alert('Purchase this theme in the Swag Shop first!')
      }
      return
    }

    // Apply theme immediately
    setSelectedTheme(theme.id)
    onThemeChange(theme.id)

    // Save to backend
    setUpdating(true)
    try {
      const response = await fetch(`${serverUrl}/update-user-theme`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ theme: theme.id })
      })

      const data = await response.json()
      
      if (!data.success) {
        console.error('Failed to save theme:', data.error)
        alert('Theme applied, but failed to save. It will reset on refresh.')
      }
    } catch (error) {
      console.error('Error saving theme:', error)
      alert('Theme applied, but failed to save. It will reset on refresh.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Palette className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white">Color Themes</h3>
          <p className="text-sm text-white/60">Personalize your DEWII experience</p>
        </div>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AVAILABLE_THEMES.map((theme) => {
          const isOwned = isThemeOwned(theme.itemId)
          const isSelected = selectedTheme === theme.id

          return (
            <button
              key={theme.id}
              onClick={() => handleSelectTheme(theme)}
              disabled={updating}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                ${isSelected 
                  ? 'border-white/40 bg-white/10 shadow-lg shadow-white/20' 
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }
                ${!isOwned ? 'opacity-60' : ''}
                ${updating ? 'cursor-wait' : 'cursor-pointer'}
              `}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-950" />
                </div>
              )}

              {/* Lock Indicator */}
              {!isOwned && (
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Lock className="w-3 h-3 text-white/60" />
                </div>
              )}

              {/* Theme Preview */}
              <div 
                className="w-full h-24 rounded-lg mb-3 overflow-hidden"
                style={{ background: theme.preview.background }}
              >
                <div className="h-full flex items-center justify-center gap-2 p-4">
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: theme.preview.primary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.preview.secondary }}
                  />
                </div>
              </div>

              {/* Theme Info */}
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-white">{theme.name}</h4>
                  {theme.id !== 'solarpunk-dreams' && (
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  )}
                </div>
                <p className="text-xs text-white/60">{theme.description}</p>
              </div>

              {/* Status Badge */}
              <div className="mt-3 pt-3 border-t border-white/10">
                {isOwned ? (
                  <span className="text-xs font-bold text-emerald-400">
                    {theme.id === 'solarpunk-dreams' ? 'Default' : 'Owned'}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-white/40">
                    🔒 Locked
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Help Text */}
      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
        <p className="text-sm text-white/70">
          <span className="font-bold text-white">💡 Tip:</span> Premium themes can be purchased in the{' '}
          {onNavigateToShop ? (
            <button 
              onClick={onNavigateToShop}
              className="font-bold text-amber-400 hover:text-amber-300 underline"
            >
              Swag Shop
            </button>
          ) : (
            <span className="font-bold text-amber-400">Swag Shop</span>
          )}
          {' '}using NADA points. Themes apply instantly across your entire experience!
        </p>
      </div>
    </div>
  )
}
