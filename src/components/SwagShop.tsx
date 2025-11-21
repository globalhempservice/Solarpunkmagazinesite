import React, { useState, useEffect } from 'react'
import { X, ShoppingBag, Shirt, Palette, Award, Sparkles, Check, Lock } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

// NADA Ripple Icon
function NadaRippleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="50" cy="50" r="8" fill="currentColor" opacity="1" />
      <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="3" opacity="0.7" fill="none" />
      <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="2.5" opacity="0.5" fill="none" />
      <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="2" opacity="0.3" fill="none" />
    </svg>
  )
}

interface SwagItem {
  id: string
  name: string
  description: string
  price: number
  category: 'merch' | 'theme' | 'badge' | 'feature'
  image?: string
  gradient: string
  icon: any
  limited?: boolean
  stock?: number
}

interface SwagShopProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  accessToken: string | null
  serverUrl: string
  nadaPoints: number
  onNadaUpdate: (newBalance: number) => void
}

export function SwagShop({
  isOpen,
  onClose,
  userId,
  accessToken,
  serverUrl,
  nadaPoints,
  onNadaUpdate
}: SwagShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [ownedItems, setOwnedItems] = useState<string[]>([])
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SwagItem | null>(null)

  // Swag Items Database
  const swagItems: SwagItem[] = [
    // MERCH
    {
      id: 'hemp-tee-black',
      name: 'DEWII Hemp Tee',
      description: 'Premium organic hemp t-shirt with solarpunk design',
      price: 500,
      category: 'merch',
      gradient: 'from-emerald-500 to-teal-600',
      icon: Shirt,
      limited: true,
      stock: 25
    },
    {
      id: 'hemp-hoodie',
      name: 'Hemp Universe Hoodie',
      description: 'Cozy hemp blend hoodie with embroidered logo',
      price: 1000,
      category: 'merch',
      gradient: 'from-green-500 to-emerald-600',
      icon: Shirt,
      limited: true,
      stock: 15
    },
    // THEMES
    {
      id: 'theme-solarpunk',
      name: 'Solarpunk Dreams',
      description: 'Emerald and gold color scheme with organic animations',
      price: 150,
      category: 'theme',
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      icon: Palette
    },
    {
      id: 'theme-midnight-hemp',
      name: 'Midnight Hemp',
      description: 'Dark mode theme with bioluminescent accents',
      price: 150,
      category: 'theme',
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      icon: Palette
    },
    {
      id: 'theme-golden-hour',
      name: 'Golden Hour',
      description: 'Warm sunset colors with ambient glow effects',
      price: 150,
      category: 'theme',
      gradient: 'from-amber-500 via-orange-500 to-yellow-500',
      icon: Palette
    },
    // BADGES
    {
      id: 'badge-founder',
      name: 'Founder Badge',
      description: 'Exclusive badge for early community members',
      price: 250,
      category: 'badge',
      gradient: 'from-purple-500 to-pink-600',
      icon: Award,
      limited: true,
      stock: 100
    },
    {
      id: 'badge-hemp-pioneer',
      name: 'Hemp Pioneer',
      description: 'Show your dedication to the hemp movement',
      price: 200,
      category: 'badge',
      gradient: 'from-green-500 to-emerald-600',
      icon: Award
    },
    {
      id: 'badge-nada-whale',
      name: 'NADA Whale',
      description: 'For the true NADA collectors',
      price: 500,
      category: 'badge',
      gradient: 'from-cyan-500 to-blue-600',
      icon: Award
    },
    // FEATURES
    {
      id: 'feature-custom-profile',
      name: 'Custom Profile Banner',
      description: 'Upload your own profile banner image',
      price: 300,
      category: 'feature',
      gradient: 'from-violet-500 to-purple-600',
      icon: Sparkles
    },
    {
      id: 'feature-priority-support',
      name: 'Priority Support',
      description: 'Get priority response on feature requests',
      price: 400,
      category: 'feature',
      gradient: 'from-blue-500 to-cyan-600',
      icon: Sparkles
    }
  ]

  const categories = [
    { id: 'all', name: 'All Items', icon: ShoppingBag },
    { id: 'merch', name: 'Merch', icon: Shirt },
    { id: 'theme', name: 'Themes', icon: Palette },
    { id: 'badge', name: 'Badges', icon: Award },
    { id: 'feature', name: 'Features', icon: Sparkles }
  ]

  // Fetch owned items
  useEffect(() => {
    if (isOpen && userId && accessToken) {
      fetchOwnedItems()
    }
  }, [isOpen, userId, accessToken])

  const fetchOwnedItems = async () => {
    if (!userId || !accessToken) return
    
    try {
      const response = await fetch(`${serverUrl}/user-swag-items/${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setOwnedItems(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching owned items:', error)
    }
  }

  const handlePurchaseClick = (item: SwagItem) => {
    if (ownedItems.includes(item.id)) return
    if (nadaPoints < item.price) return
    
    setSelectedItem(item)
    setShowConfirmModal(true)
  }

  const handleConfirmPurchase = async () => {
    if (!selectedItem || !userId || !accessToken) return
    
    setPurchasingItem(selectedItem.id)
    
    try {
      const response = await fetch(`${serverUrl}/purchase-swag-item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          userId,
          itemId: selectedItem.id,
          itemName: selectedItem.name,
          price: selectedItem.price
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Update NADA balance
        onNadaUpdate(data.newBalance)
        
        // Add to owned items
        setOwnedItems([...ownedItems, selectedItem.id])
        
        // Close modals
        setShowConfirmModal(false)
        setSelectedItem(null)
        
        console.log('Item purchased successfully!')
      } else {
        console.error('Purchase failed:', data.error)
        alert(data.error || 'Purchase failed')
      }
    } catch (error) {
      console.error('Error purchasing item:', error)
      alert('Failed to purchase item')
    } finally {
      setPurchasingItem(null)
    }
  }

  const filteredItems = selectedCategory === 'all' 
    ? swagItems 
    : swagItems.filter(item => item.category === selectedCategory)

  if (!isOpen) return null

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 border-2 border-emerald-400/30 shadow-2xl">
          {/* Hemp fiber texture */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }} />

          {/* Header */}
          <div className="relative border-b border-emerald-400/20 bg-emerald-950/50 backdrop-blur-xl">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-emerald-50">Swag Shop</h2>
                  <p className="text-emerald-200/60 text-sm">Unlock exclusive hemp universe items</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge className="gap-2 px-4 py-2 text-base bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-400/30 text-violet-300">
                  <NadaRippleIcon className="w-5 h-5" />
                  <span className="font-bold">{nadaPoints}</span>
                </Badge>
                
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 hover:text-emerald-50 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 px-6 pb-4 overflow-x-auto">
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                        : 'bg-emerald-500/10 text-emerald-200/60 hover:bg-emerald-500/20 hover:text-emerald-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="relative overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const Icon = item.icon
                const isOwned = ownedItems.includes(item.id)
                const canAfford = nadaPoints >= item.price
                const isPurchasing = purchasingItem === item.id

                return (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-2xl backdrop-blur-xl border-2 border-emerald-400/20 hover:border-emerald-400/40 transition-all duration-300 hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-2xl"
                  >
                    {/* Gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-20`} />
                    
                    {/* Depth layer */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Glow effect */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />

                    <div className="relative p-6 space-y-4">
                      {/* Icon & Badge */}
                      <div className="flex items-start justify-between">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        
                        {isOwned && (
                          <Badge className="bg-green-500/20 border-green-400/50 text-green-300 gap-1">
                            <Check className="w-3 h-3" />
                            Owned
                          </Badge>
                        )}
                        
                        {item.limited && !isOwned && (
                          <Badge className="bg-amber-500/20 border-amber-400/50 text-amber-300">
                            Limited
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="text-xl font-black text-emerald-50 mb-2">{item.name}</h3>
                        <p className="text-emerald-200/60 text-sm leading-relaxed">{item.description}</p>
                      </div>

                      {/* Stock */}
                      {item.limited && item.stock && !isOwned && (
                        <div className="text-xs text-emerald-300/70">
                          Only {item.stock} available
                        </div>
                      )}

                      {/* Price & Action */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <NadaRippleIcon className="w-5 h-5 text-violet-400" />
                          <span className="text-2xl font-black text-emerald-50">{item.price}</span>
                        </div>

                        <Button
                          onClick={() => handlePurchaseClick(item)}
                          disabled={isOwned || !canAfford || isPurchasing}
                          className={`font-bold ${
                            isOwned
                              ? 'bg-green-500/20 border-green-400/50 text-green-300 cursor-not-allowed'
                              : canAfford
                              ? `bg-gradient-to-r ${item.gradient} hover:opacity-90 text-white`
                              : 'bg-gray-500/20 border-gray-400/50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isPurchasing ? (
                            'Processing...'
                          ) : isOwned ? (
                            'Owned'
                          ) : !canAfford ? (
                            <>
                              <Lock className="w-4 h-4 mr-1" />
                              Not Enough
                            </>
                          ) : (
                            'Purchase'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-emerald-200/60 text-lg">No items in this category yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      {showConfirmModal && selectedItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-md w-full overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 border-2 border-emerald-400/30 shadow-2xl">
            {/* Animated ripples */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-400/30"
                  style={{
                    width: '100px',
                    height: '100px',
                    animation: `ripple 2s ease-out infinite ${i * 0.5}s`
                  }}
                />
              ))}
            </div>

            <div className="relative p-8 space-y-6">
              <div className="text-center space-y-4">
                {/* Icon */}
                <div className="flex justify-center">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${selectedItem.gradient} flex items-center justify-center shadow-2xl`}>
                    {React.createElement(selectedItem.icon, { className: "w-10 h-10 text-white" })}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-emerald-50">Confirm Purchase</h3>
                <p className="text-emerald-200/80">
                  Purchase <span className="font-bold text-emerald-100">{selectedItem.name}</span> for{' '}
                  <span className="font-bold text-violet-300">{selectedItem.price} NADA</span>?
                </p>

                <div className="text-sm text-emerald-300/60">
                  Balance after: {nadaPoints - selectedItem.price} NADA
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowConfirmModal(false)
                    setSelectedItem(null)
                  }}
                  variant="outline"
                  className="flex-1 border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmPurchase}
                  disabled={purchasingItem !== null}
                  className={`flex-1 bg-gradient-to-r ${selectedItem.gradient} hover:opacity-90 text-white font-bold`}
                >
                  {purchasingItem ? 'Processing...' : 'Confirm Purchase'}
                </Button>
              </div>
            </div>

            <style>{`
              @keyframes ripple {
                0% {
                  width: 100px;
                  height: 100px;
                  opacity: 0.8;
                }
                100% {
                  width: 400px;
                  height: 400px;
                  opacity: 0;
                }
              }
            `}</style>
          </div>
        </div>
      )}
    </>
  )
}