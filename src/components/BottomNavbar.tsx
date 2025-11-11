import { Home, User, Plus } from 'lucide-react'
import { Button } from './ui/button'

interface BottomNavbarProps {
  currentView: 'feed' | 'dashboard' | 'editor' | 'article' | 'admin'
  onNavigate: (view: 'feed' | 'dashboard' | 'editor') => void
  isAuthenticated: boolean
}

export function BottomNavbar({ currentView, onNavigate, isAuthenticated }: BottomNavbarProps) {
  if (!isAuthenticated) return null

  const handleNavigate = (view: 'feed' | 'dashboard' | 'editor') => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    onNavigate(view)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-lg shadow-lg md:shadow-2xl">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Centered 3-icon layout */}
        <div className="flex items-center justify-center gap-4 h-20 md:h-24 max-w-md mx-auto">
          {/* Home/Feed Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate('feed')}
            className={`flex flex-col items-center gap-1.5 h-auto py-3 px-8 md:px-10 transition-all group rounded-2xl ${
              currentView === 'feed'
                ? 'text-emerald-600 dark:text-emerald-400 hempin:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hempin:bg-emerald-950/20 scale-105'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105'
            }`}
          >
            <div className="relative">
              <Home className={`h-7 w-7 md:h-8 md:w-8 ${currentView === 'feed' ? 'scale-110' : ''} transition-transform`} />
              {currentView === 'feed' && (
                <div className="absolute -inset-2 bg-emerald-400/20 rounded-full blur-md animate-pulse" />
              )}
            </div>
            <span className="text-xs md:text-sm font-semibold">Explore</span>
          </Button>

          {/* Me/Dashboard Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate('dashboard')}
            className={`flex flex-col items-center gap-1.5 h-auto py-3 px-8 md:px-10 transition-all group rounded-2xl ${
              currentView === 'dashboard'
                ? 'text-sky-600 dark:text-sky-400 hempin:text-amber-400 bg-sky-50 dark:bg-sky-950/30 hempin:bg-amber-950/20 scale-105'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105'
            }`}
          >
            <div className="relative">
              <User className={`h-7 w-7 md:h-8 md:w-8 ${currentView === 'dashboard' ? 'scale-110' : ''} transition-transform`} />
              {currentView === 'dashboard' && (
                <div className="absolute -inset-2 bg-sky-400/20 dark:bg-sky-400/20 hempin:bg-amber-400/20 rounded-full blur-md animate-pulse" />
              )}
            </div>
            <span className="text-xs md:text-sm font-semibold">Me</span>
          </Button>

          {/* Create Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate('editor')}
            className={`flex flex-col items-center gap-1.5 h-auto py-3 px-8 md:px-10 transition-all group rounded-2xl ${
              currentView === 'editor'
                ? 'text-amber-600 dark:text-amber-400 hempin:text-amber-500 bg-amber-50 dark:bg-amber-950/30 hempin:bg-amber-950/20 scale-105'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105'
            }`}
          >
            <div className="relative">
              <Plus className={`h-7 w-7 md:h-8 md:w-8 ${currentView === 'editor' ? 'scale-110' : ''} transition-transform`} />
              {currentView === 'editor' && (
                <div className="absolute -inset-2 bg-amber-400/20 rounded-full blur-md animate-pulse" />
              )}
            </div>
            <span className="text-xs md:text-sm font-semibold">Create</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}