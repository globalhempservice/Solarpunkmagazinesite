import { Button } from "./ui/button"
import { Leaf, User, LogOut, LayoutDashboard, PenSquare, BookOpen } from "lucide-react"
import { Badge } from "./ui/badge"

interface HeaderProps {
  currentView: 'feed' | 'dashboard' | 'editor' | 'article'
  onNavigate: (view: 'feed' | 'dashboard' | 'editor') => void
  isAuthenticated: boolean
  onLogout: () => void
  userPoints?: number
}

export function Header({ currentView, onNavigate, isAuthenticated, onLogout, userPoints }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg border-emerald-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('feed')}>
          <div className="p-2 rounded-full bg-gradient-to-br from-emerald-400 to-sky-400">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl">Solarpunk Magazine</h1>
            <p className="text-xs text-muted-foreground">Building Tomorrow, Today</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <Button
                variant={currentView === 'feed' ? 'default' : 'ghost'}
                onClick={() => onNavigate('feed')}
                className={currentView === 'feed' ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-emerald-50'}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Articles
              </Button>

              <Button
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => onNavigate('dashboard')}
                className={currentView === 'dashboard' ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-emerald-50'}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>

              <Button
                variant={currentView === 'editor' ? 'default' : 'ghost'}
                onClick={() => onNavigate('editor')}
                className={currentView === 'editor' ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-emerald-50'}
              >
                <PenSquare className="w-4 h-4 mr-2" />
                Write
              </Button>

              {userPoints !== undefined && (
                <Badge className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white">
                  {userPoints} pts
                </Badge>
              )}

              <Button
                variant="ghost"
                onClick={onLogout}
                className="hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
