import { MiniAppContainer } from './MiniAppContainer'
import { getMiniAppMetadata } from '../../config/mini-apps-metadata'
import { HempAgora } from '../forum/HempAgora'
import { MiniAppProps } from '../../types/mini-app'

/**
 * Forum App - The Hemp Agora
 * A living forum for hemp knowledge, debate, and building the future
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
    // HempAgora loads its own data
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return (
    <MiniAppContainer
      metadata={metadata}
      onClose={onClose}
      loadData={loadData}
      showWelcomeFirst={false}
    >
      <HempAgora
        userId={userId!}
        accessToken={accessToken!}
        serverUrl={serverUrl}
        nadaPoints={nadaPoints}
        onClose={onClose}
        onNadaUpdate={onNadaUpdate}
      />
    </MiniAppContainer>
  )
}