import { MiniAppContainer } from './MiniAppContainer'
import { getMiniAppMetadata } from '../../config/mini-apps-metadata'
import { HempForum } from '../HempForum'
import { MiniAppProps } from '../../types/mini-app'

/**
 * Forum App - Feature Voting & Community Ideas
 * Vote on features and submit ideas for Hemp'in platform
 */
export function ForumApp({ 
  onClose, 
  userId,
  accessToken,
  serverUrl = '',
  nadaPoints = 0,
  onNadaUpdate
}: MiniAppProps & {
  nadaPoints?: number
  onNadaUpdate?: (newBalance: number) => void
}) {
  const metadata = getMiniAppMetadata('forum')!

  // Data loader
  const loadData = async () => {
    // HempForum loads its own data
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return (
    <MiniAppContainer
      metadata={metadata}
      onClose={onClose}
      loadData={loadData}
      showWelcomeFirst={false}
    >
      <HempForum
        userId={userId}
        accessToken={accessToken}
        serverUrl={serverUrl}
        nadaPoints={nadaPoints}
        onClose={onClose}
        onNadaUpdate={onNadaUpdate}
      />
    </MiniAppContainer>
  )
}
