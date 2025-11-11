import { Button } from "./ui/button"
import { Leaf, User, LogOut, LayoutDashboard, PenSquare, BookOpen, Shield, Menu } from "lucide-react"
import { Badge } from "./ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "./ui/sheet"
import { useState } from "react"

interface HeaderProps {
  currentView: 'feed' | 'dashboard' | 'editor' | 'article' | 'admin'
  onNavigate: (view: 'feed' | 'dashboard' | 'editor' | 'admin') => void
  isAuthenticated: boolean
  onLogout: () => void
  userPoints?: number
}

export function Header({ currentView, onNavigate, isAuthenticated, onLogout, userPoints }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavigate = (view: 'feed' | 'dashboard' | 'editor' | 'admin') => {
    onNavigate(view)
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg border-emerald-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigate('feed')}>
          <div className="p-2 rounded-full bg-gradient-to-br from-emerald-400 to-sky-400">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl">Solarpunk Magazine</h1>
            <p className="text-xs text-muted-foreground">Building Tomorrow, Today</p>
          </div>
          <div className="sm:hidden">
            <h1 className="text-lg">Solarpunk</h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
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

              <Button
                variant={currentView === 'admin' ? 'default' : 'ghost'}
                onClick={() => onNavigate('admin')}
                className={currentView === 'admin' ? 'bg-sky-600 hover:bg-sky-700' : 'hover:bg-sky-50'}
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
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

        {/* Mobile Navigation */}
        {isAuthenticated && (
          <div className="md:hidden flex items-center gap-2">
            {userPoints !== undefined && (
              <Badge className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white text-xs">
                {userPoints}
              </Badge>
            )}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Navigate through the Solarpunk Magazine sections
                </SheetDescription>
                <div className="flex flex-col gap-4 mt-8">
                  <Button
                    variant={currentView === 'feed' ? 'default' : 'ghost'}
                    onClick={() => handleNavigate('feed')}
                    className={`justify-start ${currentView === 'feed' ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-emerald-50'}`}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Articles
                  </Button>

                  <Button
                    variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                    onClick={() => handleNavigate('dashboard')}
                    className={`justify-start ${currentView === 'dashboard' ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-emerald-50'}`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>

                  <Button
                    variant={currentView === 'editor' ? 'default' : 'ghost'}
                    onClick={() => handleNavigate('editor')}
                    className={`justify-start ${currentView === 'editor' ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-emerald-50'}`}
                  >
                    <PenSquare className="w-4 h-4 mr-2" />
                    Write Article
                  </Button>

                  <Button
                    variant={currentView === 'admin' ? 'default' : 'ghost'}
                    onClick={() => handleNavigate('admin')}
                    className={`justify-start ${currentView === 'admin' ? 'bg-sky-600 hover:bg-sky-700' : 'hover:bg-sky-50'}`}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>

                  <div className="border-t pt-4 mt-4">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full justify-start hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </header>
  )
}