import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  X, 
  Sparkles, 
  Crown, 
  Leaf, 
  Gem,
  Palette,
  Image as ImageIcon,
  HeadphonesIcon,
  ShoppingCart,
  Check,
  Lock,
  ArrowLeft,
  Zap,
  Coins,
  Star,
  Sword,
  Shield,
  Wand2,
  Volume2,
  Puzzle
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

interface PluginsShopProps {
  userId: string | null
  accessToken: string | null
  serverUrl: string
  nadaPoints: number
  onClose: () => void
  onPurchaseComplete: (newBalance: number) => void
}

interface DigitalItem {
  id: string
  name: string
  description: string
  longDescription: string
  price: number
  icon: any
  category: 'theme' | 'badge' | 'banner' | 'support'
  gradient: string
  borderColor: string
  iconColor: string
  rarity?: 'free' | 'common' | 'rare' | 'epic' | 'legendary'
  stats?: {
    power?: number
    style?: number
    prestige?: number
  }
  preview?: {
    type: 'color' | 'image'
    colors?: string[]
    image?: string
  }
}

const DIGITAL_ITEMS: DigitalItem[] = [
  // THEMES
  {
    id: 'theme-solarpunk-dreams',
    name: 'Solarpunk Dreams',
    description: 'The original vision',
    longDescription: 'Classic Hemp\'in aesthetic - Emerald forests meet golden sunlight in perfect harmony.',
    price: 0,
    icon: Palette,
    category: 'theme',
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    borderColor: 'border-emerald-400/50',
    iconColor: 'text-emerald-400',
    rarity: 'free',
    stats: { power: 5, style: 8, prestige: 6 },
    preview: {
      type: 'color',
      colors: ['#86efac', '#fbbf24', '#14532d']
    }
  },
  {
    id: 'theme-midnight-hemp',
    name: 'Midnight Hemp',
    description: 'Bioluminescent darkness',
    longDescription: 'Mysterious purple skies with glowing green accents - Perfect for night warriors.',
    price: 8000,
    icon: Wand2,
    category: 'theme',
    gradient: 'from-purple-500 via-violet-500 to-purple-600',
    borderColor: 'border-purple-400/50',
    iconColor: 'text-purple-400',
    rarity: 'epic',
    stats: { power: 9, style: 10, prestige: 8 },
    preview: {
      type: 'color',
      colors: ['#a78bfa', '#4ade80', '#1e1b4b']
    }
  },
  {
    id: 'theme-golden-hour',
    name: 'Golden Hour',
    description: 'Eternal sunset warmth',
    longDescription: 'Bask in endless golden hour - Warm amber and orange tones create a legendary aura.',
    price: 8000,
    icon: Star,
    category: 'theme',
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    borderColor: 'border-amber-400/50',
    iconColor: 'text-amber-400',
    rarity: 'epic',
    stats: { power: 8, style: 9, prestige: 9 },
    preview: {
      type: 'color',
      colors: ['#fbbf24', '#fb923c', '#78350f']
    }
  },
  
  // BADGES
  {
    id: 'badge-founder',
    name: 'Founder\'s Crown',
    description: 'Mark of the ancients',
    longDescription: 'Legendary artifact proving you walked among the first - Maximum prestige boost!',
    price: 5000,
    icon: Crown,
    category: 'badge',
    gradient: 'from-purple-500 via-pink-500 to-purple-600',
    borderColor: 'border-purple-400/50',
    iconColor: 'text-purple-400',
    rarity: 'legendary',
    stats: { power: 7, style: 8, prestige: 10 }
  },
  {
    id: 'badge-hemp-pioneer',
    name: 'Pioneer\'s Leaf',
    description: 'Trailblazer emblem',
    longDescription: 'Epic badge for those who forge new paths in the hemp revolution - High power!',
    price: 5000,
    icon: Leaf,
    category: 'badge',
    gradient: 'from-emerald-500 via-green-500 to-emerald-600',
    borderColor: 'border-emerald-400/50',
    iconColor: 'text-emerald-400',
    rarity: 'epic',
    stats: { power: 9, style: 7, prestige: 8 }
  },
  {
    id: 'badge-nada-whale',
    name: 'Whale\'s Gem',
    description: 'Token of wealth',
    longDescription: 'Rare crystalline badge showing your commitment to the cause - Balanced stats!',
    price: 5000,
    icon: Gem,
    category: 'badge',
    gradient: 'from-cyan-500 via-blue-500 to-cyan-600',
    borderColor: 'border-cyan-400/50',
    iconColor: 'text-cyan-400',
    rarity: 'rare',
    stats: { power: 7, style: 8, prestige: 7 }
  },
  
  // BANNERS
  {
    id: 'custom-profile-banner',
    name: 'Custom Banner Scroll',
    description: 'Personal signature',
    longDescription: 'Epic item allowing custom banner uploads - Show your true colors to the world!',
    price: 10000,
    icon: ImageIcon,
    category: 'banner',
    gradient: 'from-pink-500 via-rose-500 to-pink-600',
    borderColor: 'border-pink-400/50',
    iconColor: 'text-pink-400',
    rarity: 'epic',
    stats: { power: 6, style: 10, prestige: 9 }
  },
  
  // SUPPORT
  {
    id: 'priority-support',
    name: 'VIP Access Pass',
    description: 'Premium assistance',
    longDescription: 'Legendary support item granting priority access to the Hemp\'in team - Ultimate prestige!',
    price: 15000,
    icon: Shield,
    category: 'support',
    gradient: 'from-indigo-500 via-blue-500 to-indigo-600',
    borderColor: 'border-indigo-400/50',
    iconColor: 'text-indigo-400',
    rarity: 'legendary',
    stats: { power: 10, style: 9, prestige: 10 }
  }
]

const RARITY_CONFIG: Record<string, { 
  label: string
  color: string
  glow: string
  textColor: string
  stars: number 
}> = {
  free: { 
    label: 'STARTER', 
    color: 'bg-slate-600', 
    glow: 'shadow-slate-500/50',
    textColor: 'text-slate-300',
    stars: 1
  },
  common: { 
    label: 'COMMON', 
    color: 'bg-blue-600', 
    glow: 'shadow-blue-500/50',
    textColor: 'text-blue-300',
    stars: 2
  },
  rare: { 
    label: 'RARE', 
    color: 'bg-cyan-600', 
    glow: 'shadow-cyan-500/50',
    textColor: 'text-cyan-300',
    stars: 3
  },
  epic: { 
    label: 'EPIC', 
    color: 'bg-purple-600', 
    glow: 'shadow-purple-500/50',
    textColor: 'text-purple-300',
    stars: 4
  },
  legendary: { 
    label: 'LEGENDARY', 
    color: 'bg-amber-600', 
    glow: 'shadow-amber-500/50',
    textColor: 'text-amber-300',
    stars: 5
  }
}

const CATEGORY_LABELS: Record<string, { label: string }> = {
  theme: { label: 'APPEARANCE' },
  badge: { label: 'EQUIPMENT' },
  banner: { label: 'CUSTOMIZE' },
  support: { label: 'PREMIUM' }
}

// Pixel art style stat bar component
function StatBar({ label, value, max = 10, color }: { label: string; value: number; max?: number; color: string }) {
  const percentage = (value / max) * 100
  
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <span className="text-xs font-black text-white/70 w-12 sm:w-16 uppercase tracking-tight">{label}</span>
      <div className="flex-1 h-2.5 sm:h-3 bg-black/40 border border-white/20 sm:border-2 relative overflow-hidden" style={{
        imageRendering: 'pixelated'
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full ${color} relative`}
        >
          {/* Pixel pattern overlay */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)`,
            imageRendering: 'pixelated'
          }} />
        </motion.div>
      </div>
      <span className="text-xs font-black text-white w-7 sm:w-8 text-right">{value}/{max}</span>
    </div>
  )
}

export function PluginsShop({
  userId,
  accessToken,
  serverUrl,
  nadaPoints,
  onClose,
  onPurchaseComplete
}: PluginsShopProps) {
  const [ownedItems, setOwnedItems] = useState<string[]>([])
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  useEffect(() => {
    if (userId && accessToken) {
      fetchOwnedItems()
    }
  }, [userId, accessToken])

  const fetchOwnedItems = async () => {
    if (!userId || !accessToken) return

    try {
      const response = await fetch(
        `${serverUrl}/user-swag-items/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        // Backend already returns array of item_ids, no need to map
        const itemIds = data.items || []
        setOwnedItems(itemIds)
        console.log('📦 Loaded owned items:', itemIds.length, 'items', itemIds)
      } else {
        console.error('Failed to fetch owned items')
      }
    } catch (error) {
      console.error('Error fetching owned items:', error)
    }
  }

  const handlePurchase = async (item: DigitalItem) => {
    if (!userId || !accessToken) return
    
    // Check if already owned
    if (ownedItems.includes(item.id)) {
      console.log('✅ You already own this item:', item.name)
      return
    }
    
    // Check if can afford
    if (nadaPoints < item.price) {
      console.log('❌ Insufficient NADA. Need:', item.price, 'Have:', nadaPoints)
      return
    }

    setPurchasing(item.id)

    try {
      const response = await fetch(
        `${serverUrl}/purchase-swag-item`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            itemId: item.id,
            itemName: item.name,
            price: item.price
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        setOwnedItems([...ownedItems, item.id])
        onPurchaseComplete(data.newBalance)
        console.log('🎮 ITEM ACQUIRED:', item.name)
      } else {
        const error = await response.json()
        
        // Handle specific error cases
        if (error.error?.includes('already own')) {
          console.log('✅ Item already owned, refreshing inventory...')
          // Refresh owned items to sync state
          fetchOwnedItems()
        } else {
          console.error('❌ Purchase failed:', error.error || error)
        }
      }
    } catch (error) {
      console.error('Error purchasing item:', error)
    } finally {
      setPurchasing(null)
    }
  }

  const filteredItems = selectedCategory === 'all' 
    ? DIGITAL_ITEMS 
    : DIGITAL_ITEMS.filter(item => item.category === selectedCategory)

  const categories = [
    { id: 'all', label: 'ALL ITEMS', icon: Sparkles },
    { id: 'theme', label: 'APPEARANCE', icon: Palette },
    { id: 'badge', label: 'EQUIPMENT', icon: Sword },
    { id: 'banner', label: 'CUSTOMIZE', icon: ImageIcon },
    { id: 'support', label: 'PREMIUM', icon: Shield }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-7xl h-[100vh] sm:h-[95vh] overflow-hidden"
        style={{
          imageRendering: 'pixelated'
        }}
      >
        {/* Game window border */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black border-4 sm:border-8 border-slate-700 rounded-none shadow-2xl shadow-emerald-500/20">
          {/* Inner decorative border */}
          <div className="absolute inset-1 sm:inset-2 border-2 sm:border-4 border-emerald-500/30 pointer-events-none" />
          
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 sm:w-8 sm:h-8 border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-amber-400" />
          <div className="absolute top-0 right-0 w-4 h-4 sm:w-8 sm:h-8 border-t-2 sm:border-t-4 border-r-2 sm:border-r-4 border-amber-400" />
          <div className="absolute bottom-0 left-0 w-4 h-4 sm:w-8 sm:h-8 border-b-2 sm:border-b-4 border-l-2 sm:border-l-4 border-amber-400" />
          <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-8 sm:h-8 border-b-2 sm:border-b-4 border-r-2 sm:border-r-4 border-amber-400" />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col">
          {/* Game-style header */}
          <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-b-2 sm:border-b-4 border-emerald-500/50 p-2 sm:p-4 flex-shrink-0">
            {/* Scan line effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent animate-pulse pointer-events-none" />
            
            <div className="relative flex items-center justify-between gap-2">
              {/* Shop Title */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative hidden sm:block">
                  {/* Animated glow */}
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(16, 185, 129, 0.3)',
                        '0 0 40px rgba(16, 185, 129, 0.6)',
                        '0 0 20px rgba(16, 185, 129, 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center border-3 sm:border-4 border-emerald-400"
                  >
                    <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={3} />
                  </motion.div>
                  
                  {/* Level indicator */}
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-amber-500 border-2 sm:border-3 border-amber-300 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="white" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                    <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 uppercase tracking-wider drop-shadow-lg" style={{
                      textShadow: '1px 1px 0px rgba(0,0,0,0.5), 0 0 10px rgba(16, 185, 129, 0.5)'
                    }}>
                      ITEM SHOP
                    </h2>
                    <Volume2 className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-emerald-300 font-bold tracking-wide uppercase text-xs sm:text-sm hidden sm:block">
                    Merchant's Inventory • Premium Plugins
                  </p>
                </div>
              </div>

              {/* Close button - game style */}
              <button
                onClick={onClose}
                className="group relative w-10 h-10 sm:w-12 sm:h-12 bg-red-600 hover:bg-red-500 border-2 sm:border-4 border-red-400 hover:border-red-300 transition-all active:scale-95 flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white mx-auto" strokeWidth={4} />
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              </button>
            </div>

            {/* NADA Currency Display - RPG style */}
            <div className="mt-2 sm:mt-4 relative">
              <div className="bg-black/60 border-2 sm:border-4 border-amber-500/80 p-2 sm:p-3 inline-flex items-center gap-2 sm:gap-3 shadow-lg shadow-amber-500/30">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" fill="currentColor" />
                  </motion.div>
                  <div>
                    <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">Currency</div>
                    <div className="text-lg sm:text-2xl font-black text-amber-400" style={{
                      textShadow: '1px 1px 0px rgba(0,0,0,0.8), 0 0 5px rgba(251, 191, 36, 0.5)'
                    }}>
                      {nadaPoints.toLocaleString()} NADA
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Tabs - Game menu style */}
          <div className="bg-slate-900 border-b-2 sm:border-b-4 border-slate-700 p-1 sm:p-2 flex-shrink-0">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {categories.map(cat => {
                const isActive = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`relative px-2 sm:px-4 py-2 sm:py-3 font-black uppercase tracking-wide text-xs sm:text-sm transition-all border-2 sm:border-4 whitespace-nowrap flex-shrink-0 flex items-center gap-1 sm:gap-2 ${
                      isActive
                        ? 'bg-emerald-600 border-emerald-400 text-white sm:scale-105 shadow-lg shadow-emerald-500/50'
                        : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700 hover:border-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <cat.icon className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={3} />
                    <span className="hidden sm:inline">{cat.label}</span>
                    <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Items Grid - Inventory style */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-6" style={{
            WebkitOverflowScrolling: 'touch'
          }}>
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 relative pb-4">
              {filteredItems.map((item, index) => {
                const Icon = item.icon
                const owned = ownedItems.includes(item.id)
                const canAfford = nadaPoints >= item.price
                const isPurchasing = purchasing === item.id
                const rarity = RARITY_CONFIG[item.rarity || 'common']
                const isHovered = hoveredItem === item.id

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onHoverStart={() => setHoveredItem(item.id)}
                    onHoverEnd={() => setHoveredItem(null)}
                    className="relative group"
                  >
                    {/* Item card - RPG style */}
                    <div className={`relative bg-gradient-to-br from-slate-800 via-slate-900 to-black border-2 sm:border-4 ${
                      owned 
                        ? 'border-green-500 shadow-lg shadow-green-500/50' 
                        : isHovered
                        ? `border-${rarity.color.split('-')[1]}-400 shadow-xl ${rarity.glow}`
                        : 'border-slate-600'
                    } transition-all duration-300 ${isHovered ? 'sm:scale-105 sm:-translate-y-1' : ''}`}>
                      
                      {/* Rarity glow effect */}
                      {isHovered && !owned && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} opacity-20 blur-xl`}
                        />
                      )}

                      {/* Card content */}
                      <div className="relative p-3 sm:p-4">
                        {/* Rarity & Stars */}
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div className={`${rarity.color} px-2 sm:px-3 py-0.5 sm:py-1 border border-black/50 sm:border-2 ${rarity.textColor} text-xs font-black tracking-wider`}>
                            {rarity.label}
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(rarity.stars)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${rarity.textColor}`}
                                fill="currentColor"
                              />
                            ))}
                          </div>
                        </div>

                        {/* Item icon */}
                        <div className="mb-3 sm:mb-4 relative">
                          <motion.div
                            animate={isHovered ? { 
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0]
                            } : {}}
                            transition={{ duration: 0.5 }}
                            className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br ${item.gradient} border-2 sm:border-4 border-white/30 flex items-center justify-center relative ${rarity.glow}`}
                          >
                            <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-lg" strokeWidth={2.5} />
                            
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent" />
                          </motion.div>

                          {/* Owned checkmark */}
                          {owned && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-green-500 border-2 sm:border-4 border-green-300 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50"
                            >
                              <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={4} />
                            </motion.div>
                          )}
                        </div>

                        {/* Item info */}
                        <div className="mb-2 sm:mb-3">
                          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-1">
                            {CATEGORY_LABELS[item.category].label}
                          </div>
                          <h3 className="text-lg sm:text-xl font-black text-white mb-1 tracking-tight" style={{
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                          }}>
                            {item.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-400 font-medium">
                            {item.description}
                          </p>
                        </div>

                        {/* Color preview for themes */}
                        {item.preview?.type === 'color' && item.preview.colors && (
                          <div className="flex gap-1 mb-2 sm:mb-3">
                            {item.preview.colors.map((color, i) => (
                              <div
                                key={i}
                                className="flex-1 h-5 sm:h-6 border border-white/40 sm:border-2"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        )}

                        {/* Stats bars - RPG style */}
                        {item.stats && (
                          <div className="space-y-1 mb-3 sm:mb-4 p-2 sm:p-3 bg-black/40 border border-white/10 sm:border-2">
                            <StatBar label="PWR" value={item.stats.power || 0} color="bg-red-500" />
                            <StatBar label="STYLE" value={item.stats.style || 0} color="bg-blue-500" />
                            <StatBar label="PRSTG" value={item.stats.prestige || 0} color="bg-amber-500" />
                          </div>
                        )}

                        {/* Price & Purchase button */}
                        <div className="space-y-1.5 sm:space-y-2">
                          {/* Price display */}
                          <div className="bg-black/60 border border-amber-500/50 sm:border-2 p-1.5 sm:p-2 flex items-center justify-center gap-1.5 sm:gap-2">
                            <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                            <span className="text-lg sm:text-xl font-black text-amber-400">
                              {item.price === 0 ? 'FREE' : item.price.toLocaleString()}
                            </span>
                            {item.price > 0 && (
                              <span className="text-amber-300 text-xs sm:text-sm font-bold">NADA</span>
                            )}
                          </div>

                          {/* Purchase button - game style */}
                          <button
                            onClick={() => handlePurchase(item)}
                            disabled={owned || !canAfford || isPurchasing || item.price === 0}
                            className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 font-black uppercase tracking-wide text-xs sm:text-sm border-2 sm:border-4 transition-all ${
                              owned
                                ? 'bg-green-600 border-green-400 text-white cursor-default'
                                : !canAfford && item.price > 0
                                ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                                : item.price === 0
                                ? 'bg-slate-700 border-slate-600 text-slate-400 cursor-default'
                                : 'bg-emerald-600 border-emerald-400 text-white hover:bg-emerald-500 hover:border-emerald-300 active:scale-95 shadow-lg shadow-emerald-500/30'
                            }`}
                          >
                            {isPurchasing ? (
                              <div className="flex items-center justify-center gap-2">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                  className="w-4 h-4 sm:w-5 sm:h-5 border-2 sm:border-3 border-white/30 border-t-white rounded-full"
                                />
                                <span className="hidden sm:inline">ACQUIRING...</span>
                                <span className="sm:hidden">BUYING...</span>
                              </div>
                            ) : owned ? (
                              <>
                                <Check className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                                OWNED
                              </>
                            ) : item.price === 0 ? (
                              <>
                                <span className="hidden sm:inline">DEFAULT ITEM</span>
                                <span className="sm:hidden">DEFAULT</span>
                              </>
                            ) : !canAfford ? (
                              <>
                                <Lock className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">INSUFFICIENT FUNDS</span>
                                <span className="sm:hidden">NOT ENOUGH</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">PURCHASE ITEM</span>
                                <span className="sm:hidden">BUY</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Pixel corner decorations */}
                      <div className="absolute top-0 left-0 w-2 h-2 sm:w-3 sm:h-3 border-t border-l sm:border-t-2 sm:border-l-2 border-white/30" />
                      <div className="absolute top-0 right-0 w-2 h-2 sm:w-3 sm:h-3 border-t border-r sm:border-t-2 sm:border-r-2 border-white/30" />
                      <div className="absolute bottom-0 left-0 w-2 h-2 sm:w-3 sm:h-3 border-b border-l sm:border-b-2 sm:border-l-2 border-white/30" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 border-b border-r sm:border-b-2 sm:border-r-2 border-white/30" />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Footer - Game UI style */}
          <div className="bg-slate-900 border-t-2 sm:border-t-4 border-emerald-500/50 p-2 sm:p-4 flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-400 font-bold text-xs sm:text-base">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{filteredItems.length} Items</span>
              </div>
              <div className="text-slate-500 text-xs sm:text-sm font-mono">
                <span className="hidden sm:inline">v2.0.HEMP • DEWII GAME SHOP</span>
                <span className="sm:hidden">GAME SHOP</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
