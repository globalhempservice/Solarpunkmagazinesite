import { useState, useEffect, lazy, Suspense } from 'react'
import { LoadingScreen } from './LoadingScreen'

const CommunityMarket = lazy(() => {
  // Add minimum display time for loading screen
  return Promise.all([
    import('./CommunityMarket'),
    new Promise(resolve => setTimeout(resolve, 1500)) // 1.5 seconds minimum
  ]).then(([moduleExports]) => moduleExports)
})

interface CommunityMarketLoaderProps {
  userId: string | null
  accessToken: string | null
  serverUrl: string
  publicAnonKey: string
  onBack: () => void
  onNavigateToBrowse?: () => void
  onFeatureUnlock: (featureId: 'swipe-mode' | 'article-sharing' | 'article-creation' | 'reading-analytics' | 'theme-customization') => void
  userEmail: string | null
  nadaPoints: number
  onNadaUpdate: (newBalance: number) => void
  onNavigateToSwagShop?: () => void
  onNavigateToSwagMarketplace?: () => void
  onNavigateToSettings?: () => void
  equippedBadgeId?: string | null
  profileBannerUrl?: string | null
  marketUnlocked?: boolean
}

export function CommunityMarketLoader(props: CommunityMarketLoaderProps) {
  return (
    <Suspense fallback={<LoadingScreen message="Loading Community Market" variant="market" />}>
      <CommunityMarket {...props} />
    </Suspense>
  )
}