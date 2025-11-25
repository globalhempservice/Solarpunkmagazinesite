import { CompanyManager } from './CompanyManager'

interface CompanyManagerWrapperProps {
  userId: string
  accessToken: string
  serverUrl: string
  onClose: () => void
}

// Simple wrapper to show CompanyManager in full screen modal
export function CompanyManagerWrapper({ userId, accessToken, serverUrl, onClose }: CompanyManagerWrapperProps) {
  return (
    <div className="fixed inset-0 z-[10000] bg-background overflow-auto">
      {/* Close button */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-card border-2 border-border font-bold hover:bg-muted transition-colors"
        >
          ← Back
        </button>
      </div>
      
      <CompanyManager
        userId={userId}
        accessToken={accessToken}
        serverUrl={serverUrl}
        onClose={onClose}
      />
    </div>
  )
}
