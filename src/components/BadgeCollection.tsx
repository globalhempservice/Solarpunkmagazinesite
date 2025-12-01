import { useState } from 'react'
import { BadgeDisplay, BADGE_DEFINITIONS } from './BadgeDisplay'
import { Lock, Sparkles, ShoppingBag, CheckCircle2 } from 'lucide-react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

interface BadgeCollectionProps {
  ownedBadgeIds: string[] // e.g., ['badge-founder', 'badge-hemp-pioneer']
  equippedBadgeId?: string | null
  onEquip: (badgeId: string) => Promise<void>
  onNavigateToShop?: () => void
  isEquipping?: string | null // Currently equipping badge ID
}

export function BadgeCollection({
  ownedBadgeIds,
  equippedBadgeId,
  onEquip,
  onNavigateToShop,
  isEquipping
}: BadgeCollectionProps) {
  const allBadges = Object.values(BADGE_DEFINITIONS)
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null)

  const handleEquipClick = async (badgeId: string) => {
    // If already equipped, do nothing
    if (equippedBadgeId === badgeId) return
    
    // If not owned, prompt to visit shop
    if (!ownedBadgeIds.includes(badgeId)) {
      if (onNavigateToShop) {
        onNavigateToShop()
      } else {
        alert('Purchase this badge in the Swag Shop first!')
      }
      return
    }

    // Equip the badge
    await onEquip(badgeId)
  }

  const isOwned = (badgeId: string) => ownedBadgeIds.includes(badgeId)
  const isEquipped = (badgeId: string) => equippedBadgeId === badgeId

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Badge Collection
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Equip badges to show them on your profile
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10 border-primary/50 text-primary">
          {ownedBadgeIds.length} / {allBadges.length}
        </Badge>
      </div>

      <Separator />

      {/* Badge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allBadges.map((badge) => {
          const owned = isOwned(badge.id)
          const equipped = isEquipped(badge.id)
          const equipping = isEquipping === badge.id

          return (
            <Card
              key={badge.id}
              className={`
                relative overflow-hidden p-6 transition-all duration-300
                ${owned ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'opacity-60'}
                ${equipped ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''}
                ${equipping ? 'animate-pulse' : ''}
              `}
              onClick={() => owned && handleEquipClick(badge.id)}
            >
              {/* Halftone background pattern */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                  backgroundSize: '16px 16px'
                }}
              />

              <div className="relative z-10 flex flex-col items-center gap-4">
                {/* Badge Display */}
                <BadgeDisplay
                  badgeId={badge.id}
                  size="xl"
                  equipped={equipped}
                  showRarity
                />

                {/* Badge Info */}
                <div className="text-center space-y-1">
                  <h4 className="font-black text-lg">
                    {badge.name}
                  </h4>
                  {badge.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {badge.description}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="w-full">
                  {equipped ? (
                    <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary/20 border border-primary/50">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-primary">
                        Equipped
                      </span>
                    </div>
                  ) : owned ? (
                    <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-secondary/20 border border-secondary/50 hover:bg-secondary/30 transition-colors">
                      <Sparkles className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-bold text-secondary">
                        {equipping ? 'Equipping...' : 'Click to Equip'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-muted border border-border">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-muted-foreground">
                        Locked
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Locked Overlay */}
              {!owned && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-sm font-bold text-muted-foreground">
                      Purchase in Swag Shop
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Footer - Show owned count */}
      {ownedBadgeIds.length === 0 && (
        <Card className="p-6 bg-amber-500/10 border-amber-500/30">
          <div className="flex items-start gap-3">
            <ShoppingBag className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-bold text-amber-600 dark:text-amber-400">
                No badges yet!
              </p>
              <p className="text-sm text-muted-foreground">
                Visit the Swag Shop to purchase exclusive badges and show them off on your profile.
              </p>
              {onNavigateToShop && (
                <button
                  onClick={onNavigateToShop}
                  className="mt-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors"
                >
                  Go to Swag Shop
                </button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
