import { motion, AnimatePresence } from 'motion/react'
import { X, Leaf, Sun, Droplets, Trees, Sparkle, CheckCircle2, Zap, Plug } from 'lucide-react'
import { useState } from 'react'
import { BrandLogo } from '../BrandLogo'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { toast } from 'sonner@2.0.3'

interface PluginStoreModalProps {
  isOpen: boolean
  onClose: () => void
  currentTheme?: string
  onThemeSelect: (theme: string) => Promise<void>
  userId: string
  accessToken: string
  serverUrl: string
}

type ThemeOption = {
  id: string
  name: string
  description: string
  icon: any
  gradient: string
  points: number
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'default',
    name: 'Hemp Plant',
    description: 'Classic Hemp\'in brand icon with organic curves',
    icon: Leaf,
    gradient: 'from-emerald-400 via-teal-500 to-emerald-600',
    points: 50
  },
  {
    id: 'solar',
    name: 'Solar Energy',
    description: 'Bright sun icon representing renewable energy',
    icon: Sun,
    gradient: 'from-amber-400 via-orange-500 to-amber-600',
    points: 50
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    description: 'Water droplets for ocean conservation',
    icon: Droplets,
    gradient: 'from-blue-400 via-cyan-500 to-blue-600',
    points: 50
  },
  {
    id: 'forest',
    name: 'Forest Grove',
    description: 'Tree icon celebrating nature and forests',
    icon: Trees,
    gradient: 'from-emerald-400 via-teal-500 to-emerald-600',
    points: 50
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Beautiful sunset for evening vibes',
    icon: () => (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
    gradient: 'from-rose-400 via-pink-500 to-rose-600',
    points: 50
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    description: 'Magical sparkle for cosmic inspiration',
    icon: Sparkle,
    gradient: 'from-purple-400 via-indigo-500 to-purple-600',
    points: 50
  }
]

export function PluginStoreModal({
  isOpen,
  onClose,
  currentTheme = 'default',
  onThemeSelect,
  userId,
  accessToken,
  serverUrl
}: PluginStoreModalProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme)
  const [saving, setSaving] = useState(false)
  const [customizedThemes, setCustomizedThemes] = useState<string[]>([currentTheme])

  const handleThemeClick = (themeId: string) => {
    setSelectedTheme(themeId)
  }

  const handleSave = async () => {
    if (selectedTheme === currentTheme) {
      onClose()
      return
    }

    setSaving(true)
    try {
      await onThemeSelect(selectedTheme)
      
      // Mark theme as customized (for points)
      if (!customizedThemes.includes(selectedTheme)) {
        setCustomizedThemes([...customizedThemes, selectedTheme])
      }
      
      toast.success(`🎨 Logo theme changed to ${THEME_OPTIONS.find(t => t.id === selectedTheme)?.name}!`)
      onClose()
    } catch (error) {
      console.error('Error saving theme:', error)
      toast.error('Failed to save theme. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const selectedThemeData = THEME_OPTIONS.find(t => t.id === selectedTheme)
  const isAlreadyCustomized = customizedThemes.includes(selectedTheme)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[85vh] bg-card rounded-2xl shadow-2xl border-2 border-primary/20 z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative px-6 py-5 border-b border-border/50">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10" />
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 flex items-center justify-center">
                    <Plug className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Plugin Store</h2>
                    <p className="text-sm text-muted-foreground">Customize your logo icon</p>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="px-6 py-4 bg-muted/30 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <BrandLogo 
                      size="lg" 
                      theme={selectedTheme as any}
                      showAnimation={true}
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedThemeData?.name || 'Select a theme'}</p>
                    <p className="text-sm text-muted-foreground">{selectedThemeData?.description || 'Preview your logo'}</p>
                  </div>
                </div>
                
                {selectedThemeData && (
                  <Badge 
                    variant={isAlreadyCustomized ? "default" : "outline"}
                    className={isAlreadyCustomized ? "bg-emerald-500 hover:bg-emerald-600" : "bg-primary/10 border-primary/30"}
                  >
                    {isAlreadyCustomized ? (
                      <><CheckCircle2 className="w-3 h-3 mr-1" /> Earned {selectedThemeData.points} pts</>
                    ) : (
                      <><Zap className="w-3 h-3 mr-1" /> Earn {selectedThemeData.points} pts</>
                    )}
                  </Badge>
                )}
              </div>
            </div>

            {/* Theme Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {THEME_OPTIONS.map((theme) => {
                  const Icon = theme.icon
                  const isSelected = selectedTheme === theme.id
                  const isCurrent = currentTheme === theme.id
                  
                  return (
                    <motion.button
                      key={theme.id}
                      onClick={() => handleThemeClick(theme.id)}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className={`group relative overflow-hidden rounded-2xl transition-all text-left ${
                        isSelected
                          ? 'shadow-2xl'
                          : 'shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {/* Animated gradient border */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
                      
                      {/* Card background */}
                      <div className={`relative m-[2px] rounded-2xl bg-card/95 backdrop-blur-sm p-5 border-2 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border/50 group-hover:border-primary/50 group-hover:bg-card'
                      }`}>
                        
                        {/* Glow effect for selected */}
                        {isSelected && (
                          <motion.div
                            layoutId="theme-glow"
                            className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-10 blur-xl -z-10`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.15 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                        
                        {/* Selection indicator */}
                        {isSelected && (
                          <motion.div
                            layoutId="selected-theme"
                            className="absolute top-4 right-4 z-10"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg`}>
                              <CheckCircle2 className="w-5 h-5 text-white" fill="currentColor" strokeWidth={0} />
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Current badge */}
                        {isCurrent && !isSelected && (
                          <Badge className="absolute top-4 right-4 text-xs font-black" variant="outline">
                            Current
                          </Badge>
                        )}

                        {/* Icon preview with glow */}
                        <div className="relative mb-4">
                          {/* Icon glow */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-30 blur-2xl scale-110`} />
                          
                          {/* Icon container */}
                          <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-xl`}>
                            {/* Inner highlight */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                            
                            {/* Icon */}
                            {typeof Icon === 'function' && Icon.prototype === undefined ? (
                              <div className="w-10 h-10 text-white relative z-10 drop-shadow-lg">
                                <Icon />
                              </div>
                            ) : (
                              <Icon className="w-10 h-10 text-white relative z-10 drop-shadow-lg" strokeWidth={2.5} />
                            )}
                            
                            {/* Shine effect */}
                            <motion.div 
                              className="absolute -top-1 -right-1 w-10 h-10 bg-white/40 rounded-full blur-lg"
                              animate={{ 
                                scale: [1, 1.1, 1],
                                opacity: [0.4, 0.6, 0.4] 
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut" 
                              }}
                            />
                          </div>
                        </div>

                        {/* Theme info */}
                        <div className="mb-3">
                          <h3 className="font-black text-base mb-1.5 tracking-tight">{theme.name}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{theme.description}</p>
                        </div>

                        {/* Points indicator */}
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r ${theme.gradient} bg-opacity-10`}>
                            <Zap className="w-3.5 h-3.5 text-amber-500" fill="currentColor" />
                            <span className="text-xs font-black text-foreground">+{theme.points}</span>
                          </div>
                        </div>

                        {/* Hover highlight effect */}
                        <motion.div 
                          className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl pointer-events-none`}
                        />
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border/50 bg-muted/30">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  {selectedTheme === currentTheme 
                    ? 'Select a different theme to customize' 
                    : 'Click "Apply Theme" to save your selection'}
                </p>
                
                <div className="flex gap-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving || selectedTheme === currentTheme}
                    className="min-w-[120px]"
                  >
                    {saving ? 'Applying...' : 'Apply Theme'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}