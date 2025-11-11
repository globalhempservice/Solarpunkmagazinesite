import { Button } from "./ui/button"
import { UserCircle, LogOut } from "lucide-react"
import { Badge } from "./ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "./ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-lg border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo/Branding */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate('feed')}>
          <div className="p-2 rounded-full bg-gradient-to-br from-emerald-400 to-sky-400 dark:from-emerald-500 dark:to-emerald-600 hempin:from-amber-500 hempin:to-emerald-400">
            {/* DEWII Logo - Simple leaf/plant icon */}
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
              <path d="M12 6v12"/>
              <path d="M16 10l-4 4-4-4"/>
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-semibold text-foreground">DEWII</h1>
            <p className="text-xs text-muted-foreground">Discover • Engage • Write</p>
          </div>
          <div className="sm:hidden">
            <h1 className="font-semibold text-foreground">DEWII</h1>
          </div>
        </div>

        {/* Desktop Navigation - Profile Only */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-3">
            {userPoints !== undefined && (
              <Badge className="bg-primary text-primary-foreground border-0">
                {userPoints} pts
              </Badge>
            )}
            
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-accent rounded-full"
                  aria-label="User menu"
                >
                  <UserCircle className="w-6 h-6 text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem 
                  onClick={() => onNavigate('dashboard')}
                  className="cursor-pointer"
                >
                  <UserCircle className="w-4 h-4 mr-2" />
                  <div className="flex-1">
                    <div className="font-medium">My Profile</div>
                    <div className="text-xs text-muted-foreground">View stats & achievements</div>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={onLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        )}

        {/* Mobile Navigation - Profile Only */}
        {isAuthenticated && (
          <div className="md:hidden flex items-center gap-3">
            {userPoints !== undefined && (
              <Badge className="bg-primary text-primary-foreground border-0 text-xs px-2">
                {userPoints}
              </Badge>
            )}
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full hover:bg-accent"
                  aria-label="User menu"
                >
                  <UserCircle className="w-6 h-6 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetTitle className="sr-only">User Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Access your profile and account settings
                </SheetDescription>
                
                <div className="flex flex-col gap-3 mt-8">
                  {/* Profile Section */}
                  <div className="pb-4 border-b border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <UserCircle className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">My Account</div>
                        {userPoints !== undefined && (
                          <div className="text-sm text-muted-foreground">{userPoints} points</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate('dashboard')}
                    className="justify-start hover:bg-accent text-foreground"
                  >
                    <UserCircle className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>

                  <div className="border-t border-border pt-3 mt-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
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
