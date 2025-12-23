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
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-950 via-teal-950 to-cyan-950 overflow-auto">
        <div className="pt-24 pb-8">
          <SwapShopFeed userId={userId || ''} />
        </div>
      </div>
    </MiniAppContainer>
  )
}
