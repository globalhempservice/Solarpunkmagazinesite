import { MiniAppContainer } from './MiniAppContainer'
import { getMiniAppMetadata } from '../../config/mini-apps-metadata'
import { TerpeneHunter } from '../terpene/TerpeneHunter'
import { MiniAppProps } from '../../types/mini-app'

/**
 * Terpene Hunter App - Pokemon GO for Cannabis Terpenes
 * Hunt and collect terpenes in Bangkok (PRO/Adult Verified only)
 */
export function TerpeneHunterApp({ 
  onClose, 
  userId,
  accessToken
}: MiniAppProps) {
  const metadata = getMiniAppMetadata('compass')!

  // Data loader
  const loadData = async () => {
    // TerpeneHunter loads its own data
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  return (
    <MiniAppContainer
      metadata={metadata}
      onClose={onClose}
      loadData={loadData}
      showWelcomeFirst={false}
    >
      <TerpeneHunter
        userId={userId || ''}
        accessToken={accessToken || ''}
        onClose={onClose}
      />
    </MiniAppContainer>
  )
}
