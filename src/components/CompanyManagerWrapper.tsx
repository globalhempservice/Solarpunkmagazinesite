import { useState, useEffect } from 'react'
import { CompanyManagerDrilldown } from './CompanyManagerDrilldown'
import { CompanyManagerMobile } from './CompanyManagerMobile'
import { X } from 'lucide-react'

interface CompanyManagerWrapperProps {
  userId: string
  accessToken: string
  serverUrl: string
  onClose: () => void
}

// Simple wrapper to show CompanyManager in full screen modal
export function CompanyManagerWrapper({ userId, accessToken, serverUrl, onClose }: CompanyManagerWrapperProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="fixed inset-0 z-[10000] overflow-hidden">
      {/* Close button */}
      <div className="fixed top-6 right-6 z-[10001]">
        <button
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl bg-emerald-900/50 border-2 border-emerald-500/30 font-black hover:bg-emerald-800/60 transition-all hover:scale-105 active:scale-95 text-white backdrop-blur-sm shadow-lg flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Close
        </button>
      </div>
      
      {isMobile ? (
        <CompanyManagerMobile
          userId={userId}
          accessToken={accessToken}
          serverUrl={serverUrl}
          onClose={onClose}
        />
      ) : (
        <CompanyManagerDrilldown
          userId={userId}
          accessToken={accessToken}
          serverUrl={serverUrl}
          onClose={onClose}
        />
      )}
    </div>
  )
}