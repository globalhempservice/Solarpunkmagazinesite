import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ChevronLeft } from 'lucide-react'
import { MessageDashboard } from './MessageDashboard'
import { ConversationList } from './ConversationList'
import { MessageThread } from './MessageThread'
import { PlacesInboxOverview } from './PlacesInboxOverview'

interface Conversation {
  id: string
  created_at: string
  updated_at: string
  last_message_at: string | null
  last_message_preview: string | null
  unread_count: number
  archived: boolean
  muted: boolean
  other_participant: {
    id: string
    display_name: string
    avatar_url: string | null
  }
}

type ViewState = 'dashboard' | 'places-overview' | 'inbox' | 'thread'

interface MessagePanelProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  accessToken: string
  projectId: string
  publicAnonKey: string
  // Optional: Open directly to a specific inbox and/or conversation
  initialInboxType?: string
  initialRecipientId?: string
  initialContextType?: string
  initialContextId?: string
  initialContextName?: string  // Add context name (e.g., place name)
  serverUrl: string  // Add serverUrl for places fetching
}

export function MessagePanel({ 
  isOpen, 
  onClose, 
  userId, 
  accessToken, 
  projectId, 
  publicAnonKey,
  initialInboxType,
  initialRecipientId,
  initialContextType,
  initialContextId,
  initialContextName,
  serverUrl
}: MessagePanelProps) {
  const [viewState, setViewState] = useState<ViewState>('dashboard')
  const [selectedInboxType, setSelectedInboxType] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null) // Track selected place
  const [pendingConversation, setPendingConversation] = useState<{
    recipientId: string
    contextType?: string
    contextId?: string
    contextName?: string  // Add context name
  } | null>(null)

  // Handle initial parameters to open directly to a conversation
  useEffect(() => {
    if (isOpen && initialInboxType) {
      setSelectedInboxType(initialInboxType)
      setViewState('inbox')
      
      // If we also have recipient info, prepare to start/open a conversation
      if (initialRecipientId) {
        setPendingConversation({
          recipientId: initialRecipientId,
          contextType: initialContextType,
          contextId: initialContextId,
          contextName: initialContextName  // Pass through context name
        })
      }
    }
  }, [isOpen, initialInboxType, initialRecipientId, initialContextType, initialContextId, initialContextName])

  // Reset to dashboard when panel closes
  useEffect(() => {
    if (!isOpen) {
      setViewState('dashboard')
      setSelectedInboxType(null)
      setSelectedConversation(null)
      setPendingConversation(null)
    }
  }, [isOpen])

  const handleSelectInbox = (contextType: string) => {
    // Special handling for Places - show overview first
    if (contextType === 'place') {
      setViewState('places-overview')
      return
    }
    
    setSelectedInboxType(contextType)
    setViewState('inbox')
  }
  
  const handleSelectPlace = (placeId: string, placeName: string) => {
    // When a specific place is selected from the overview
    setSelectedPlaceId(placeId)
    setSelectedInboxType('place')
    setViewState('inbox')
  }

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setViewState('thread')
  }

  const handleBackFromThread = () => {
    setSelectedConversation(null)
    setViewState('inbox')
  }

  const handleBackFromInbox = () => {
    // If we're in a place inbox (specific or general), go back to places overview
    if (selectedInboxType === 'place') {
      setSelectedPlaceId(null)
      setViewState('places-overview')
      return
    }
    
    setSelectedInboxType(null)
    setViewState('dashboard')
  }
  
  const handleBackFromPlacesOverview = () => {
    setViewState('dashboard')
  }

  const getInboxTitle = (contextType: string | null) => {
    const titles: { [key: string]: string } = {
      'personal': 'Personal Messages',
      'organization': 'Organization Messages',
      'swap': 'SWAP Deals',
      'swag': 'SWAG Orders',
      'rfp': 'RFP Projects',
      'place': 'Places'
    }
    return contextType ? titles[contextType] || 'Messages' : 'Messages'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed top-0 left-0 right-0 bottom-0 md:top-[64px] md:right-0 md:left-auto md:bottom-[80px] md:w-[500px] bg-[#0A0F1E] md:border-l border-white/10 z-50 flex flex-col"
            style={{
              // On mobile: full screen but respect safe areas
              top: 'env(safe-area-inset-top, 0)',
              paddingTop: 'max(64px, env(safe-area-inset-top, 0))',
              paddingBottom: 'max(80px, env(safe-area-inset-bottom, 0))'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                {/* Back Button */}
                {viewState !== 'dashboard' && (
                  <button
                    onClick={
                      viewState === 'places-overview' 
                        ? handleBackFromPlacesOverview 
                        : viewState === 'inbox' 
                        ? handleBackFromInbox 
                        : handleBackFromThread
                    }
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors -ml-2"
                  >
                    <ChevronLeft size={20} className="text-white/60" />
                  </button>
                )}
                
                <h2 className="text-white">
                  {viewState === 'dashboard' ? 'Messages' : getInboxTitle(selectedInboxType)}
                </h2>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X size={20} className="text-white/60" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {viewState === 'dashboard' ? (
                <MessageDashboard
                  userId={userId}
                  accessToken={accessToken}
                  projectId={projectId}
                  publicAnonKey={publicAnonKey}
                  onSelectInbox={handleSelectInbox}
                />
              ) : viewState === 'places-overview' ? (
                <PlacesInboxOverview
                  userId={userId}
                  accessToken={accessToken}
                  projectId={projectId}
                  publicAnonKey={publicAnonKey}
                  serverUrl={serverUrl}
                  onSelectPlace={handleSelectPlace}
                />
              ) : viewState === 'inbox' ? (
                <ConversationList
                  userId={userId}
                  accessToken={accessToken}
                  projectId={projectId}
                  publicAnonKey={publicAnonKey}
                  onSelectConversation={handleConversationSelect}
                  contextType={selectedInboxType || undefined}
                  pendingRecipient={pendingConversation || undefined}
                />
              ) : (
                <MessageThread
                  conversation={selectedConversation!}
                  userId={userId}
                  accessToken={accessToken}
                  projectId={projectId}
                  publicAnonKey={publicAnonKey}
                  onBack={handleBackFromThread}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}