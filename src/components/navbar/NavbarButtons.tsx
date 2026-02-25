/**
 * HEMP'IN NAVBAR BUTTON COMPONENTS
 * Specialized buttons for top and bottom navigation bars
 * Built on the HempButton foundation with context-specific styling
 */

import { motion } from 'motion/react'
import { Shield, MessageCircle, Home, User, Plus, Package, MapPin, Store, Briefcase, Lock, Wallet, ArrowLeft, Sparkles, type LucideIcon } from 'lucide-react'
import { HempButton } from '../ui/hemp-button'
import { BUTTON_THEMES } from '../../utils/buttonDesignTokens'
import { forwardRef } from 'react'

// ================================================
// ADMIN BUTTONS (Top Left)
// ================================================

interface AdminButtonProps {
  onClick: () => void
  variant?: 'site' | 'market'
  showLabel?: boolean
}

export function AdminButton({ onClick, variant = 'site', showLabel = true }: AdminButtonProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <HempButton
        icon={Shield}
        label={variant === 'site' ? 'SITE' : 'MARKET'}
        showLabel={showLabel}
        onClick={onClick}
        theme={variant === 'site' ? 'admin' : 'marketAdmin'}
        size="md"
        enableMagnetic={false}
        enableShimmer={false}
        enableBreathing={false}
        className="gap-2 px-4 h-12 w-auto rounded-full"
        title={`${variant === 'site' ? 'Site' : 'Market'} Admin Dashboard`}
      />
    </motion.div>
  )
}

// ================================================
// BACK BUTTON (Top Left)
// ================================================

interface BackButtonProps {
  onClick: () => void
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <HempButton
      icon={ArrowLeft}
      onClick={onClick}
      theme="back"
      size="md"
      enableMagnetic
      enableRipple
      aria-label="Go back"
      title="Go back"
      className="relative overflow-visible"
    />
  )
}

// ================================================
// LOGO BUTTON (Top Center)
// ================================================

interface LogoButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
  isAuthenticated: boolean
}

export function LogoButton({ onClick, children, isAuthenticated }: LogoButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="group relative flex items-center justify-center transition-all focus:outline-none rounded-full z-10"
      whileHover={{ scale: 2 }}
      whileTap={{ scale: 1.8 }}
      aria-label={isAuthenticated ? "Open BUD menu" : "Change theme"}
    >
      {/* Outer pulse ring for authenticated users */}
      {isAuthenticated && (
        <div className="absolute -inset-6 rounded-full border-2 border-teal-400/0 group-hover:border-teal-400/30 transition-all duration-300" />
      )}
      
      {children}
      
      {/* Hover glow - enhanced */}
      <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400/0 via-teal-400/30 to-emerald-400/0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Shimmer hint for authenticated users - DISABLED to prevent moving gradient */}
      {/* {isAuthenticated && (
        <motion.div
          className="absolute -inset-4 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 5,
            ease: 'easeInOut',
          }}
        />
      )} */}
    </motion.button>
  )
}

// ================================================
// WALLET BUTTON (Top Right)
// ================================================

interface WalletButtonProps {
  onClick: () => void
  isOpen: boolean
}

export function WalletButton({ onClick, isOpen }: WalletButtonProps) {
  return (
    <HempButton
      icon={Wallet}
      onClick={onClick}
      theme="wallet"
      size="md"
      isActive={isOpen}
      enableMagnetic={false}
      enableShimmer={false}
      enableBreathing={false}
      aria-label="Wallet"
      title="Open wallet"
    />
  )
}

// ================================================
// MESSAGES BUTTON (Top Right)
// ================================================

interface MessagesButtonProps {
  onClick: () => void
  hasUnread?: boolean
  unreadCount?: number
}

export function MessagesButton({ onClick, hasUnread, unreadCount }: MessagesButtonProps) {
  return (
    <HempButton
      icon={MessageCircle}
      onClick={onClick}
      theme="messages"
      size="md"
      enableMagnetic={false}
      enableShimmer={false}
      enableBreathing={hasUnread ? true : false}
      showNotification={hasUnread && !unreadCount}
      badge={unreadCount ? { count: unreadCount, color: '#10B981', glow: true } : undefined}
      aria-label={hasUnread ? `Messages (${unreadCount || 'new'})` : 'Messages'}
      title={hasUnread ? 'You have new messages' : 'Messages'}
    />
  )
}

// ================================================
// HOME/EXPLORE BUTTON (Bottom Left)
// ================================================

interface HomeButtonProps {
  onClick: () => void
  isActive: boolean
}

export function HomeButton({ onClick, isActive }: HomeButtonProps) {
  return (
    <div className="relative flex flex-col items-center">
      <HempButton
        icon={Home}
        onClick={onClick}
        theme="home"
        size="xl"
        isActive={isActive}
        enableMagnetic={false}
        enableShimmer={false}
        enableBreathing={false}
        aria-label="Home"
        title="Explore feed"
      />
    </div>
  )
}

// ================================================
// ME/PROFILE BUTTON (Bottom Center - Elevated)
// ================================================

interface MeButtonProps {
  onClick: () => void
  isActive: boolean
  hasNotification?: boolean
}

export function MeButton({ onClick, isActive, hasNotification }: MeButtonProps) {
  return (
    <div className="relative flex flex-col items-center -mt-8">
      {/* Elevation shadow */}
      <div 
        className="absolute -inset-4 rounded-full blur-2xl transition-opacity duration-300"
        style={{
          background: 'linear-gradient(to bottom right, #0ea5e9, #a855f7, #ec4899)',
          opacity: isActive ? 0.4 : 0.2,
        }}
      />
      
      <HempButton
        icon={User}
        onClick={onClick}
        theme="me"
        size="2xl"
        isActive={isActive}
        enableMagnetic={false}
        enableShimmer={false}
        enableBreathing={hasNotification ? true : false}
        showNotification={hasNotification}
        aria-label="My profile"
        title="My dashboard"
        className="shadow-2xl"
      />
    </div>
  )
}

// ================================================
// CONTEXTUAL PLUS BUTTON (Bottom Right)
// ================================================

type PlusContext = 'article' | 'swap' | 'swag' | 'places' | 'rfp'

interface PlusButtonProps {
  onClick: () => void
  context: PlusContext
  isActive?: boolean
  isLocked?: boolean
  articlesNeeded?: number
}

const PLUS_ICON_MAP: Record<PlusContext, LucideIcon> = {
  article: Plus,
  swap: Package,
  swag: Sparkles,
  places: MapPin,
  rfp: Briefcase,
}

export function ContextualPlusButton({ 
  onClick, 
  context, 
  isActive = false,
  isLocked = false,
  articlesNeeded = 0,
}: PlusButtonProps) {
  const IconComponent = PLUS_ICON_MAP[context]
  
  // Locked state
  if (isLocked) {
    return (
      <div className="relative">
        {/* Animated burst rays */}
        <motion.div 
          className="absolute inset-0 -z-10 scale-150"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 100 100" className="w-24 h-24 -translate-x-1/4 -translate-y-1/4">
            <defs>
              <radialGradient id="burstGradient">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
            </defs>
            {[...Array(12)].map((_, i) => (
              <polygon
                key={i}
                points="50,50 48,30 52,30"
                fill="url(#burstGradient)"
                transform={`rotate(${i * 30} 50 50)`}
              />
            ))}
          </svg>
        </motion.div>
        
        {/* Lock button */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8, bounce: 0.6 }}
        >
          <HempButton
            icon={Lock}
            onClick={onClick}
            theme="locked"
            size="lg"
            enableMagnetic
            enableShimmer
            badge={{ count: articlesNeeded, color: '#ef4444', glow: true }}
            aria-label={`Unlock feature (${articlesNeeded} articles needed)`}
            title="Read more articles to unlock"
          />
        </motion.div>
      </div>
    )
  }
  
  // Swap context - animated icon morph
  if (context === 'swap') {
    return (
      <div className="relative flex flex-col items-center">
        <div className="relative">
          <HempButton
            icon={Package}
            onClick={onClick}
            theme={BUTTON_THEMES.plus[context]}
            size="lg"
            isActive={isActive}
            enableMagnetic={false}
            enableShimmer={false}
            enableBreathing={false}
            aria-label="List swap item"
            title="List an item for swap"
          />
          
          {/* Animated Plus overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Plus className="w-8 h-8 text-white" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }} />
          </motion.div>
        </div>
        
        {isActive && (
          <motion.div
            className="absolute -bottom-1 w-1.5 h-1.5 rounded-full"
            style={{
              background: 'linear-gradient(to right, #fbbf24, #f97316)',
              boxShadow: '0 0 10px rgba(251, 191, 36, 0.6)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
        )}
      </div>
    )
  }
  
  // Standard plus button
  return (
    <div className="relative flex flex-col items-center">
      <HempButton
        icon={IconComponent}
        onClick={onClick}
        theme={BUTTON_THEMES.plus[context]}
        size="lg"
        isActive={isActive}
        enableMagnetic={false}
        enableShimmer={false}
        enableBreathing={false}
        aria-label={`Create ${context}`}
        title={`Create new ${context}`}
      />
      
      {isActive && (
        <motion.div
          className="absolute -bottom-1 w-1.5 h-1.5 rounded-full"
          style={{
            background: `linear-gradient(to right, ${BUTTON_THEMES.plus[context].gradient.from}, ${BUTTON_THEMES.plus[context].gradient.to})`,
            boxShadow: `0 0 10px ${BUTTON_THEMES.plus[context].glow}`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        />
      )}
    </div>
  )
}

// ================================================
// STREAK BADGE (Top Left - displayed in swipe mode)
// ================================================

interface StreakBadgeProps {
  count: number
}

export function StreakBadge({ count }: StreakBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative"
    >
      {/* Glow effect */}
      <div className="absolute -inset-2 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-full blur-lg animate-pulse" />
      
      {/* Badge */}
      <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500/40 backdrop-blur-xl">
        {/* Flame icon */}
        <svg 
          className="w-4 h-4 fill-orange-500 drop-shadow-lg" 
          viewBox="0 0 24 24"
        >
          <path d="M12 2C12 2 5 8 5 14C5 17.866 8.13401 21 12 21C15.866 21 19 17.866 19 14C19 8 12 2 12 2Z" />
          <path d="M12 17C10.8954 17 10 16.1046 10 15C10 13.5 12 11 12 11C12 11 14 13.5 14 15C14 16.1046 13.1046 17 12 17Z" fill="#fbbf24" />
        </svg>
        
        {/* Count */}
        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
          {count}
        </span>
      </div>
    </motion.div>
  )
}