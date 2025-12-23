import { ReactNode } from 'react'

/**
 * Mini-App Metadata
 * Defines branding and identity for each app
 */
export interface MiniAppMetadata {
  id: string
  name: string
  tagline: string
  icon: ReactNode
  brandColors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  description?: string
  tips?: string[]
}

/**
 * Mini-App Loading State
 */
export type MiniAppLoadingState = 'idle' | 'loading' | 'loaded' | 'error'

/**
 * Mini-App Props Interface
 * All mini-apps should implement these props
 */
export interface MiniAppProps {
  onClose: () => void
  userId?: string | null
  accessToken?: string | null
  serverUrl?: string
  [key: string]: any // Allow additional props
}

/**
 * Mini-App Data Loader
 * Function that loads app data asynchronously
 */
export type MiniAppDataLoader = () => Promise<void>
