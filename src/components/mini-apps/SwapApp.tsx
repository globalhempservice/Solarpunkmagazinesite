import { MiniAppContainer } from './MiniAppContainer'
import { getMiniAppMetadata } from '../../config/mini-apps-metadata'
import { SwapShopFeed } from '../swap/SwapShopFeed'
import { MiniAppProps } from '../../types/mini-app'

/**
 * Swap App - C2C Community Marketplace
 * Trade hemp products peer-to-peer
 */
export function SwapApp({ 
  onClose, 
  userId
}: MiniAppProps) {
  const metadata = getMiniAppMetadata('swap')!

  // Data loader
  const loadData = async () => {
    // SwapShopFeed loads its own data
    await new Promise(resolve => setTimeout(resolve, 900))
  }

  return (
    <MiniAppContainer
      metadata={metadata}
      onClose={onClose}
      loadData={loadData}
      showWelcomeFirst={false}
    >
      {/* Background Layer - Extends full screen behind navbars */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-cyan-950 via-teal-950 to-emerald-950" />

      {/* Content Layer - Padded to stay between navbars */}
      <div 
        className="relative h-full flex flex-col"
        style={{
          paddingTop: '80px',
          paddingBottom: '96px',
        }}
      >
        <SwapShopFeed userId={userId || ''} />
      </div>
    </MiniAppContainer>
  )
}