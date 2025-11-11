import { useState, useEffect } from 'react'
import { BrandLogo } from "./BrandLogo"
import { Sparkles } from 'lucide-react'

interface HeaderProps {
  currentView: 'feed' | 'dashboard' | 'editor' | 'article' | 'admin'
  onNavigate: (view: 'feed' | 'dashboard' | 'editor' | 'admin') => void
  isAuthenticated: boolean
  onLogout: () => void
  userPoints?: number
}

type Theme = 'light' | 'dark' | 'hempin'

export function Header({ currentView, onNavigate, isAuthenticated }: HeaderProps) {
  const [theme, setTheme] = useState<Theme>('light')
  const [isAnimating, setIsAnimating] = useState(false)

  // Check for saved theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme && ['light', 'dark', 'hempin'].includes(savedTheme)) {
      setTheme(savedTheme)
    } else {
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark')
      }
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    // Remove all theme classes
    document.documentElement.classList.remove('dark', 'hempin')
    
    // Apply new theme class
    if (newTheme !== 'light') {
      document.documentElement.classList.add(newTheme)
    }
  }

  const cycleTheme = () => {
    const themeOrder: Theme[] = ['light', 'dark', 'hempin']
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    applyTheme(themeOrder[nextIndex])
    
    // Trigger animation
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 600)
  }

  // Get theme label with fun names
  const getThemeLabel = () => {
    switch(theme) {
      case 'light': return '☀️ Bright'
      case 'dark': return '🌱 Eco'
      case 'hempin': return '🌿 Hemp'
      default: return '☀️ Bright'
    }
  }

  // Get theme colors for the glow effect
  const getThemeGlow = () => {
    switch(theme) {
      case 'light': return 'from-sky-400 to-blue-500'
      case 'dark': return 'from-emerald-400 to-teal-500'
      case 'hempin': return 'from-amber-400 to-orange-500'
      default: return 'from-sky-400 to-blue-500'
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-center">
        {/* Centered Logo with Theme Switcher */}
        <button
          onClick={cycleTheme}
          className="group relative flex items-center justify-center py-2 px-6 rounded-2xl transition-all hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95"
          aria-label="Change theme"
        >
          {/* Animated glow background */}
          <div className={`absolute -inset-4 bg-gradient-to-r ${getThemeGlow()} rounded-3xl blur-2xl opacity-0 group-hover:opacity-20 transition-all duration-500 ${isAnimating ? 'opacity-40 animate-pulse' : ''}`} />
          
          {/* Logo with scale animation */}
          <div className={`relative transform group-hover:scale-110 transition-all duration-300 ${isAnimating ? 'scale-125 rotate-12' : ''}`}>
            <BrandLogo size="sm" showAnimation={true} />
            
            {/* Floating sparkles on hover */}
            {isAnimating && (
              <>
                <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-primary animate-ping" />
                <Sparkles className="absolute -bottom-2 -left-2 w-3 h-3 text-primary animate-ping" style={{ animationDelay: '150ms' }} />
              </>
            )}
          </div>
          
          {/* Decorative shine effect */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        </button>
      </div>
    </header>
  )
}