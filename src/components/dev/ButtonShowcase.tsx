/**
 * BUTTON DESIGN SYSTEM SHOWCASE
 * Visual documentation of all Hemp'in navbar buttons
 * This component can be used for design review and testing
 */

import { useState } from 'react'
import { 
  AdminButton, 
  BackButton, 
  WalletButton, 
  MessagesButton,
  HomeButton,
  MeButton,
  ContextualPlusButton,
  StreakBadge,
} from '../navbar/NavbarButtons'
import { HempButton } from '../ui/hemp-button'
import { 
  Shield, ArrowLeft, Home, User, Plus, Wallet, 
  MessageCircle, Package, Sparkles, MapPin, Briefcase,
  Heart, Zap, Settings,
} from 'lucide-react'

export function ButtonShowcase() {
  const [activeButton, setActiveButton] = useState<string>('')
  const [walletOpen, setWalletOpen] = useState(false)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            Hemp'in Button Design System
          </h1>
          <p className="text-muted-foreground">
            Solarpunk Futuristic Gamified UI Components
          </p>
        </div>
        
        {/* ================================================ */}
        {/* TOP NAVBAR BUTTONS */}
        {/* ================================================ */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Top Navbar Buttons</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Admin Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Admin Buttons</h3>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <AdminButton 
                    onClick={() => console.log('Site Admin')} 
                    variant="site"
                  />
                  <AdminButton 
                    onClick={() => console.log('Market Admin')} 
                    variant="market"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Authority/Warning - Red/Orange & Cyan/Blue
                </p>
              </div>
            </div>
            
            {/* Back Button */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Back Button</h3>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-center">
                  <BackButton onClick={() => console.log('Back')} />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Utility/Navigation - Emerald/Teal
                </p>
              </div>
            </div>
            
            {/* Wallet Button */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Wallet Button</h3>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <WalletButton 
                    onClick={() => setWalletOpen(!walletOpen)} 
                    isOpen={false}
                  />
                  <WalletButton 
                    onClick={() => setWalletOpen(!walletOpen)} 
                    isOpen={true}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Status/Currency - Emerald/Teal (Idle & Active)
                </p>
              </div>
            </div>
            
            {/* Messages Button */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Messages Button</h3>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <MessagesButton onClick={() => console.log('Messages')} />
                  <MessagesButton 
                    onClick={() => console.log('Messages')} 
                    hasUnread
                  />
                  <MessagesButton 
                    onClick={() => console.log('Messages')} 
                    hasUnread
                    unreadCount={5}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Communication - Violet/Purple (Normal, Dot, Badge)
                </p>
              </div>
            </div>
            
            {/* Streak Badge */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Streak Badge</h3>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <StreakBadge count={3} />
                  <StreakBadge count={7} />
                  <StreakBadge count={15} />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Gamification - Orange/Red Fire
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* ================================================ */}
        {/* BOTTOM NAVBAR BUTTONS */}
        {/* ================================================ */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Bottom Navbar Buttons</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Home Button */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Home/Explore Button</h3>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-center gap-6">
                  <HomeButton 
                    onClick={() => setActiveButton('home')} 
                    isActive={false}
                  />
                  <HomeButton 
                    onClick={() => setActiveButton('home')} 
                    isActive={true}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Primary Navigation - Emerald/Teal (Idle & Active)
                </p>
              </div>
            </div>
            
            {/* ME Button */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">ME/Profile Button</h3>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-center gap-6">
                  <MeButton 
                    onClick={() => setActiveButton('me')} 
                    isActive={false}
                  />
                  <MeButton 
                    onClick={() => setActiveButton('me')} 
                    isActive={true}
                    hasNotification
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Profile Hub - Sky/Purple/Pink (Idle & Active w/ Notification)
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* ================================================ */}
        {/* CONTEXTUAL PLUS BUTTONS */}
        {/* ================================================ */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Contextual Plus Buttons</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Article Context */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Article Creation</h3>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <ContextualPlusButton 
                    onClick={() => console.log('Create Article')} 
                    context="article"
                  />
                  <ContextualPlusButton 
                    onClick={() => console.log('Create Article')} 
                    context="article"
                    isActive
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Emerald/Teal/Cyan (Idle & Active)
                </p>
              </div>
            </div>
            
            {/* Swap Context */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Swap Item</h3>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <ContextualPlusButton 
                    onClick={() => console.log('List Swap')} 
                    context="swap"
                  />
                  <ContextualPlusButton 
                    onClick={() => console.log('List Swap')} 
                    context="swap"
                    isActive
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Amber/Orange (with animated icon morph)
                </p>
              </div>
            </div>
            
            {/* SWAG Context */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">SWAG Product</h3>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <ContextualPlusButton 
                    onClick={() => console.log('Browse SWAG')} 
                    context="swag"
                  />
                  <ContextualPlusButton 
                    onClick={() => console.log('Browse SWAG')} 
                    context="swag"
                    isActive
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Purple/Pink/Rose
                </p>
              </div>
            </div>
            
            {/* Places Context */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Add Place</h3>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <ContextualPlusButton 
                    onClick={() => console.log('Add Place')} 
                    context="places"
                  />
                  <ContextualPlusButton 
                    onClick={() => console.log('Add Place')} 
                    context="places"
                    isActive
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Blue/Cyan/Teal
                </p>
              </div>
            </div>
            
            {/* RFP Context */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Create RFP</h3>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <ContextualPlusButton 
                    onClick={() => console.log('Create RFP')} 
                    context="rfp"
                  />
                  <ContextualPlusButton 
                    onClick={() => console.log('Create RFP')} 
                    context="rfp"
                    isActive
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Blue/Indigo/Violet
                </p>
              </div>
            </div>
            
            {/* Locked State */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Locked State</h3>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <ContextualPlusButton 
                    onClick={() => console.log('Unlock')} 
                    context="article"
                    isLocked
                    articlesNeeded={3}
                  />
                  <ContextualPlusButton 
                    onClick={() => console.log('Unlock')} 
                    context="article"
                    isLocked
                    articlesNeeded={10}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Amber/Orange/Red with animated burst rays
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* ================================================ */}
        {/* HEMP BUTTON VARIANTS */}
        {/* ================================================ */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">HempButton Component States</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Normal State */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Normal</h3>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6">
                <div className="flex items-center justify-center">
                  <HempButton
                    icon={Heart}
                    onClick={() => console.log('Liked')}
                    theme="home"
                    size="lg"
                    enableMagnetic
                    enableShimmer
                    enableBreathing
                  />
                </div>
              </div>
            </div>
            
            {/* Active State */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Active</h3>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6">
                <div className="flex items-center justify-center">
                  <HempButton
                    icon={Heart}
                    onClick={() => console.log('Liked')}
                    theme="home"
                    size="lg"
                    isActive
                    enableMagnetic
                    enableShimmer
                  />
                </div>
              </div>
            </div>
            
            {/* Disabled State */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Disabled</h3>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6">
                <div className="flex items-center justify-center">
                  <HempButton
                    icon={Heart}
                    onClick={() => console.log('Liked')}
                    theme="home"
                    size="lg"
                    disabled
                  />
                </div>
              </div>
            </div>
            
            {/* Loading State */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Loading</h3>
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6">
                <div className="flex items-center justify-center">
                  <HempButton
                    icon={Heart}
                    onClick={() => console.log('Liked')}
                    theme="home"
                    size="lg"
                    loading
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* ================================================ */}
        {/* DESIGN PRINCIPLES */}
        {/* ================================================ */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Design Principles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 space-y-3">
              <div className="text-3xl">🌿</div>
              <h3 className="font-semibold text-emerald-500">ORGANIC</h3>
              <p className="text-sm text-muted-foreground">
                Nature-inspired curves, breathing animations
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 space-y-3">
              <div className="text-3xl">📦</div>
              <h3 className="font-semibold text-purple-500">DEPTH</h3>
              <p className="text-sm text-muted-foreground">
                Layered shadows, 3D feeling, tactile
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-2xl p-6 space-y-3">
              <div className="text-3xl">✨</div>
              <h3 className="font-semibold text-amber-500">LUMINOUS</h3>
              <p className="text-sm text-muted-foreground">
                Glow effects, light sources, radiance
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6 space-y-3">
              <div className="text-3xl">⚡</div>
              <h3 className="font-semibold text-blue-500">RESPONSIVE</h3>
              <p className="text-sm text-muted-foreground">
                Spring physics, magnetic interactions
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-6 space-y-3">
              <div className="text-3xl">🎯</div>
              <h3 className="font-semibold text-red-500">CLEAR</h3>
              <p className="text-sm text-muted-foreground">
                High contrast, accessible, intentional
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
