import { X, Shield, Crown, Star, Lock, Sparkles, Award, TrendingUp, Zap, CheckCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { motion, AnimatePresence } from 'motion/react'

interface BadgeRequirementModalProps {
  isOpen: boolean
  onClose: () => void
  badgeType: string
  organizationName: string
  organizationLogo?: string | null
  hasRequiredBadge: boolean
}

const BADGE_ICONS: Record<string, any> = {
  Shield: Shield,
  Crown: Crown,
  Star: Star
}

const BADGE_INFO: Record<string, {
  name: string
  description: string
  benefits: string[]
  howToEarn: string[]
  gradient: string
  iconColor: string
  borderColor: string
}> = {
  Shield: {
    name: 'Shield Badge',
    description: 'Verified member badge for trusted community members and organization affiliates.',
    benefits: [
      'Access to exclusive member-only products',
      'Early access to new product launches',
      'Special member pricing on select items',
      'Priority customer support'
    ],
    howToEarn: [
      'Join an organization as a verified member',
      'Complete organization verification process',
      'Maintain active membership status',
      'Organizations can award this badge to members'
    ],
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    iconColor: 'text-cyan-400',
    borderColor: 'border-cyan-400/30'
  },
  Crown: {
    name: 'Crown Badge',
    description: 'Premium VIP badge for top contributors and organization leaders.',
    benefits: [
      'Access to all exclusive products',
      'VIP-only limited edition items',
      'Enhanced member benefits',
      'Recognition in the community',
      'Special event access'
    ],
    howToEarn: [
      'Achieve leadership role in an organization',
      'Earn through major community contributions',
      'Awarded to founding members',
      'Special recognition by DEWII team'
    ],
    gradient: 'from-amber-500 via-yellow-500 to-orange-500',
    iconColor: 'text-amber-400',
    borderColor: 'border-amber-400/30'
  },
  Star: {
    name: 'Star Badge',
    description: 'Achievement badge for active community participants and top performers.',
    benefits: [
      'Access to achievement-gated products',
      'Special rewards and bonuses',
      'Community recognition',
      'Exclusive product collections'
    ],
    howToEarn: [
      'Complete community achievements',
      'Reach milestones in reading, voting, or contributing',
      'Earn through consistent engagement',
      'Awarded for exceptional contributions'
    ],
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-400/30'
  }
}

export function BadgeRequirementModal({
  isOpen,
  onClose,
  badgeType,
  organizationName,
  organizationLogo,
  hasRequiredBadge
}: BadgeRequirementModalProps) {
  if (!isOpen) return null

  const badgeInfo = BADGE_INFO[badgeType] || BADGE_INFO.Shield
  const BadgeIcon = BADGE_ICONS[badgeType] || Shield

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, type: 'spring' }}
          className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950 border-2 ${badgeInfo.borderColor} rounded-3xl shadow-2xl`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-emerald-900/50 border-2 border-emerald-500/30 text-emerald-200 hover:bg-emerald-800/50 hover:text-white transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            {/* Header with Badge Icon */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {/* Glow effect */}
                  <div className={`absolute -inset-8 bg-gradient-to-r ${badgeInfo.gradient} rounded-full blur-3xl opacity-30 animate-pulse`} />
                  
                  {/* Badge Icon */}
                  <div className={`relative bg-gradient-to-br ${badgeInfo.gradient} rounded-3xl p-8 border-2 ${badgeInfo.borderColor} shadow-2xl`}>
                    <BadgeIcon className="w-24 h-24 text-white" strokeWidth={1.5} />
                    
                    {/* Status Overlay */}
                    {hasRequiredBadge && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full p-2 border-2 border-emerald-300 shadow-lg">
                        <CheckCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                    )}
                    {!hasRequiredBadge && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full p-2 border-2 border-gray-500 shadow-lg">
                        <Lock className="w-6 h-6 text-gray-300" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <h2 className="font-black text-4xl text-white mb-3">{badgeInfo.name}</h2>
              <p className="text-emerald-200/80 text-lg leading-relaxed max-w-xl mx-auto">
                {badgeInfo.description}
              </p>

              {/* Status Badge */}
              {hasRequiredBadge ? (
                <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/20 border-2 border-emerald-400/30 rounded-2xl">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="font-black text-emerald-300">You have this badge!</span>
                </div>
              ) : (
                <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-amber-500/20 border-2 border-amber-400/30 rounded-2xl">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <span className="font-black text-amber-300">Badge Required</span>
                </div>
              )}
            </div>

            {/* Organization Info */}
            <div className="mb-8 p-6 bg-emerald-900/30 rounded-2xl border-2 border-emerald-500/20">
              <div className="flex items-center gap-4 mb-3">
                {organizationLogo ? (
                  <img
                    src={organizationLogo}
                    alt={organizationName}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400/30"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-800/50 border-2 border-emerald-400/30 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                )}
                <div>
                  <p className="text-xs text-emerald-300/70 font-bold uppercase tracking-wide">Product offered by</p>
                  <p className="font-black text-white text-lg">{organizationName}</p>
                </div>
              </div>
              <p className="text-emerald-200/70 text-sm">
                This organization requires verified members to have the <strong>{badgeInfo.name}</strong> to access exclusive products.
              </p>
            </div>

            {/* Benefits Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${badgeInfo.gradient} border-2 ${badgeInfo.borderColor}`}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-black text-2xl text-white uppercase tracking-wide">Benefits</h3>
              </div>
              <div className="grid gap-3">
                {badgeInfo.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/20 hover:bg-emerald-900/30 transition-colors"
                  >
                    <div className={`mt-0.5 p-1.5 rounded-lg bg-gradient-to-br ${badgeInfo.gradient}`}>
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="flex-1 text-emerald-200/90">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Earn Section */}
            {!hasRequiredBadge && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 border-2 border-amber-400/30">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-black text-2xl text-white uppercase tracking-wide">How to Earn</h3>
                </div>
                <div className="grid gap-3">
                  {badgeInfo.howToEarn.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-amber-900/20 rounded-xl border border-amber-500/20 hover:bg-amber-900/30 transition-colors"
                    >
                      <div className="mt-0.5 w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-white text-sm">
                        {index + 1}
                      </div>
                      <p className="flex-1 text-amber-100/90">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="space-y-3">
              {hasRequiredBadge ? (
                <div className="p-6 bg-emerald-500/10 border-2 border-emerald-400/30 rounded-2xl text-center">
                  <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                  <p className="font-black text-emerald-300 text-lg mb-2">You're All Set!</p>
                  <p className="text-emerald-200/70 text-sm">
                    You have the required badge and can purchase this product.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-6 bg-purple-900/20 border-2 border-purple-400/30 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-400/30">
                        <TrendingUp className="w-6 h-6 text-purple-300" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-white mb-2">Ready to Unlock?</h4>
                        <p className="text-purple-200/70 text-sm mb-4">
                          Contact <strong>{organizationName}</strong> to learn more about membership and earning this badge.
                        </p>
                        <Button
                          size="sm"
                          className="gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-black border-2 border-purple-400/30"
                          onClick={() => {
                            // TODO: Add contact organization functionality
                            console.log('Contact organization:', organizationName)
                          }}
                        >
                          <Zap className="w-4 h-4" />
                          Contact Organization
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full font-black text-lg py-6 border-2 border-emerald-500/30 hover:bg-emerald-500/10"
                    onClick={onClose}
                  >
                    Got It
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
