import { useState, useEffect } from 'react'
import { Sun, Moon, Home, User, Plus, TrendingUp, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface BottomNavbarProps {
  currentView: 'feed' | 'dashboard' | 'editor' | 'article' | 'admin'
  onNavigate: (view: 'feed' | 'dashboard' | 'editor') => void
  isAuthenticated: boolean
}

type Theme = 'light' | 'dark' | 'hempin'

export function BottomNavbar({ currentView, onNavigate, isAuthenticated }: BottomNavbarProps) {
  const [theme, setTheme] = useState<Theme>('light')

  // Check for saved theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme && ['light', 'dark', 'hempin'].includes(savedTheme)) {
      applyTheme(savedTheme)
    } else {
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark')
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

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />
      case 'dark':
        return <Moon className="h-5 w-5" />
      case 'hempin':
        return <Sparkles className="h-5 w-5" />
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Eco'
      case 'hempin':
        return 'Hemp'
    }
  }

  if (!isAuthenticated) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border shadow-lg">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-around h-16 md:h-20">
          {/* Home/Feed Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('feed')}
            className={`flex flex-col items-center gap-1 h-auto py-2 px-4 transition-all ${
              currentView === 'feed'
                ? 'text-emerald-600 dark:text-emerald-400 hempin:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hempin:bg-emerald-950/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Home className={`h-5 w-5 ${currentView === 'feed' ? 'scale-110' : ''} transition-transform`} />
            <span className="text-xs">Explore</span>
          </Button>

          {/* Dashboard Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('dashboard')}
            className={`flex flex-col items-center gap-1 h-auto py-2 px-4 transition-all ${
              currentView === 'dashboard'
                ? 'text-sky-600 dark:text-sky-400 hempin:text-amber-400 bg-sky-50 dark:bg-sky-950/30 hempin:bg-amber-950/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className={`h-5 w-5 ${currentView === 'dashboard' ? 'scale-110' : ''} transition-transform`} />
            <span className="text-xs">Progress</span>
          </Button>

          {/* Create Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('editor')}
            className={`flex flex-col items-center gap-1 h-auto py-2 px-4 transition-all ${
              currentView === 'editor'
                ? 'text-amber-600 dark:text-amber-400 hempin:text-amber-500 bg-amber-50 dark:bg-amber-950/30 hempin:bg-amber-950/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Plus className={`h-5 w-5 ${currentView === 'editor' ? 'scale-110' : ''} transition-transform`} />
            <span className="text-xs">Create</span>
          </Button>

          {/* Theme Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-2 px-4 text-muted-foreground hover:text-foreground transition-all group"
                aria-label="Change theme"
              >
                <div className="relative h-5 w-5">
                  {getThemeIcon()}
                </div>
                <span className="text-xs">{getThemeLabel()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => applyTheme('light')}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Sun className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">Light Mode</div>
                  <div className="text-xs text-muted-foreground">Clean & bright</div>
                </div>
                {theme === 'light' && <div className="w-2 h-2 rounded-full bg-primary" />}
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={() => applyTheme('dark')}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Moon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">Eco Mode</div>
                  <div className="text-xs text-muted-foreground">Emerald forest</div>
                </div>
                {theme === 'dark' && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={() => applyTheme('hempin')}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">Hemp'in Mode</div>
                  <div className="text-xs text-muted-foreground">Carbon mint</div>
                </div>
                {theme === 'hempin' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Decorative gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </nav>
  )
}
