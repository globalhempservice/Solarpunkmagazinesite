import { MiniAppContainer } from './MiniAppContainer'
import { getMiniAppMetadata } from '../../config/mini-apps-metadata'
import { SwagMarketplace } from '../SwagMarketplace'
import { MiniAppProps } from '../../types/mini-app'

/**
 * Swag App - Hemp Organization Merchandise
 * Browse and purchase official hemp organization products
 */
export function SwagApp({ 
  onClose, 
  userId,
  accessToken,
  serverUrl = '',
  userBadges = [],
  nadaPoints = 0,
  onNadaUpdate
}: MiniAppProps & {
  userBadges?: any[]
  nadaPoints?: number
  onNadaUpdate?: (newBalance: number) => void
}) {
  const metadata = getMiniAppMetadata('swag')!

  // Data loader
  const loadData = async () => {
    // SwagMarketplace loads its own data
    await new Promise(resolve => setTimeout(resolve, 1200))
  }

  return (
    <MiniAppContainer
      metadata={metadata}
      onClose={onClose}
      loadData={loadData}
      showWelcomeFirst={false}
    >
      {/* Background Layer - Extends full screen behind navbars */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950" />

      {/* Content Layer - Padded to stay between navbars */}
      <div 
        className="relative h-full flex flex-col"
        style={{
          paddingTop: '80px',
          paddingBottom: '96px',
        }}
      >
        <SwagMarketplace
          accessToken={accessToken || ''}
          serverUrl={serverUrl}
          userId={userId || undefined}
          userBadges={userBadges}
          onClose={onClose}
          nadaPoints={nadaPoints}
          onNadaUpdate={onNadaUpdate || (() => {})}
        />
      </div>
    </MiniAppContainer>
  )
}