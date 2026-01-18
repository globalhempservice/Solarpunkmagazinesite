import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, ChevronUp, ArrowRight, X, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { SocialButton } from './SocialButton'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface MobileBottomSheetProps {
  email: string
  password: string
  name: string
  showPassword: boolean
  isLoading: boolean
  authState: 'initial' | 'signin' | 'signup' | 'magic-link-sent'
  errorType: 'invalid-email' | 'network-error' | 'auth-error' | null
  errorMessage: string | null
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onNameChange: (name: string) => void
  onTogglePassword: () => void
  onContinue: () => void
  onSubmit: (e: React.FormEvent) => void
  onToggleMode: () => void
}

export function MobileBottomSheet({
  email,
  password,
  name,
  showPassword,
  isLoading,
  authState,
  errorType,
  errorMessage,
  onEmailChange,
  onPasswordChange,
  onNameChange,
  onTogglePassword,
  onContinue,
  onSubmit,
  onToggleMode,
}: MobileBottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      {/* Backdrop when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: isExpanded ? 0 : 'calc(100% - 80px)' }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, info) => {
          if (info.offset.y < -50) {
            setIsExpanded(true)
          } else if (info.offset.y > 50) {
            setIsExpanded(false)
          }
        }}
        transition={{ 
          type: 'spring',
          damping: 30,
          stiffness: 300
        }}
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-area-bottom"
        style={{ touchAction: 'none' }}
      >
        <div 
          onClick={() => !isExpanded && setIsExpanded(true)}
          className={`rounded-t-3xl p-6 pb-safe shadow-2xl ${!isExpanded ? 'cursor-pointer' : ''}`}
          style={{
            background: 'rgba(11, 47, 39, 0.98)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(110, 231, 183, 0.25)',
            borderBottom: 'none',
            boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.6)',
            maxHeight: isExpanded ? '85vh' : 'none',
            overflowY: isExpanded ? 'auto' : 'visible',
          }}
        >
          {/* Drag Handle */}
          <div className="w-full flex justify-center mb-4">
            <div className="w-12 h-1.5 rounded-full bg-emerald-400/40" />
          </div>

          {/* Header - Always visible, clickable when collapsed */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Continue to DEWII
              {!isExpanded && (
                <ChevronUp className="w-5 h-5 text-emerald-400 animate-bounce" />
              )}
            </h3>
            {isExpanded && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(false)
                }}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {errorType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div 
                  className="p-3 rounded-xl flex items-start gap-2"
                  style={{
                    background: errorType === 'network-error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                    border: errorType === 'network-error' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(251, 191, 36, 0.3)',
                  }}
                >
                  <AlertCircle className={`w-4 h-4 flex-shrink-0 ${errorType === 'network-error' ? 'text-red-400' : 'text-yellow-400'}`} />
                  <p className={`text-xs ${errorType === 'network-error' ? 'text-red-200' : 'text-yellow-200'}`}>
                    {errorMessage}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="mobile-email" className="text-white text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400/50" />
                <Input
                  id="mobile-email"
                  type="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading || authState !== 'initial'}
                  onFocus={() => setIsExpanded(true)}
                  className="h-14 pl-12 text-base bg-white/5 border-white/10 text-white placeholder:text-emerald-200/30 rounded-xl"
                  style={{
                    boxShadow: errorType === 'invalid-email' ? '0 0 0 2px rgba(239, 68, 68, 0.3)' : 'none',
                  }}
                />
              </div>
              {authState === 'initial' && !isExpanded && (
                <p className="text-xs text-emerald-200/50">
                  Tap to continue
                </p>
              )}
            </div>

            {/* Name Field (signup only, expanded only) */}
            <AnimatePresence>
              {isExpanded && authState === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="mobile-name" className="text-white text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id="mobile-name"
                    type="text"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="Your name"
                    required
                    disabled={isLoading}
                    className="h-14 text-base bg-white/5 border-white/10 text-white placeholder:text-emerald-200/30 rounded-xl"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password Field (signin/signup, expanded only) */}
            <AnimatePresence>
              {isExpanded && (authState === 'signin' || authState === 'signup') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="mobile-password" className="text-white text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400/50" />
                    <Input
                      id="mobile-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => onPasswordChange(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      className="h-14 pl-12 pr-12 text-base bg-white/5 border-white/10 text-white placeholder:text-emerald-200/30 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={onTogglePassword}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400/50 hover:text-emerald-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {authState === 'signup' && (
                    <p className="text-xs text-emerald-200/50">
                      Min 6 characters
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Primary CTA - Always visible for thumb access */}
            <Button
              type={authState === 'initial' ? 'button' : 'submit'}
              onClick={authState === 'initial' ? onContinue : undefined}
              disabled={isLoading}
              className="w-full h-14 rounded-full font-bold text-base sticky bottom-0"
              style={{
                background: 'linear-gradient(135deg, #10B981, #14B8A6)',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
              }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue to DEWII
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>

            {/* Toggle mode */}
            {isExpanded && (authState === 'signin' || authState === 'signup') && (
              <button
                type="button"
                onClick={onToggleMode}
                className="text-sm text-emerald-300 hover:text-emerald-200 transition-colors block text-center w-full"
              >
                {authState === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            )}
          </form>

          {/* Social Buttons - Only when expanded */}
          {isExpanded && authState === 'initial' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 mt-4"
            >
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0B2F27] px-3 text-emerald-200/50">or</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <SocialButton
                    provider="apple"
                    onClick={() => alert('Apple OAuth coming in Phase 2')}
                    disabled={true}
                  />
                  <span 
                    className="absolute -top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      background: 'linear-gradient(135deg, #10B981, #14B8A6)',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    Recommended
                  </span>
                </div>
                <SocialButton
                  provider="google"
                  onClick={() => alert('Google OAuth coming in Phase 2')}
                  disabled={true}
                />
              </div>

              {/* Legal */}
              <p className="text-xs text-emerald-200/40 text-center leading-relaxed pt-2">
                By continuing you agree to our{' '}
                <a href="#" className="underline">Terms</a>
                {' '}&{' '}
                <a href="#" className="underline">Privacy</a>
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  )
}