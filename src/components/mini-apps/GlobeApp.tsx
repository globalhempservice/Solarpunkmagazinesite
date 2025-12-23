import { useState } from 'react'
import { MiniAppContainer } from './MiniAppContainer'
import { getMiniAppMetadata } from '../../config/mini-apps-metadata'
import { WorldMapBrowser3D } from '../WorldMapBrowser3D'
import { MiniAppProps } from '../../types/mini-app'

/**
 * Globe App - 3D Interactive World Map
 * Shows hemp locations, companies, and places on a 3D globe
 */
export function GlobeApp({ 
  onClose, 
  userId, 
  accessToken,
  serverUrl = '',
  publicAnonKey = '',
  onViewCompany,
  onManageOrganization,
  onAddOrganization
}: MiniAppProps & {
  publicAnonKey?: string
  onViewCompany?: (companyId: string) => void
  onManageOrganization?: () => void
  onAddOrganization?: () => void
}) {
  const metadata = getMiniAppMetadata('globe')!

  // Data loader
  const loadData = async () => {
    // The WorldMapBrowser3D loads its own data
    // We just simulate a brief loading time
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return (
    <MiniAppContainer
      metadata={metadata}
      onClose={onClose}
      loadData={loadData}
      showWelcomeFirst={false}
    >
      <WorldMapBrowser3D
        serverUrl={serverUrl}
        userId={userId || undefined}
        accessToken={accessToken || undefined}
        publicAnonKey={publicAnonKey}
        onClose={onClose}
        onViewCompany={onViewCompany}
        onManageOrganization={onManageOrganization}
        onAddOrganization={onAddOrganization}
      />
    </MiniAppContainer>
  )
}
