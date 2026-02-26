import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ChevronLeft, Mail } from 'lucide-react'
import { MessageDashboard } from './MessageDashboard'
import { ConversationList } from './ConversationList'
import { MessageThread } from './MessageThread'
import { PlacesInboxOverview } from './PlacesInboxOverview'
import { SwapConversationList } from './SwapConversationList'
import { SwapProposalCard } from './SwapProposalCard'

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

type ViewState = 'dashboard' | 'places-overview' | 'inbox' | 'thread' | 'swap-inbox' | 'swap-proposal'

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
  onMarkedAsRead?: () => void  // Notify parent when messages are read
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
  serverUrl,
  onMarkedAsRead
}: MessagePanelProps) {
  const [viewState, setViewState] = useState<ViewState>('dashboard')
  const [selectedInboxType, setSelectedInboxType] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null) // Track selected place
  const [selectedSwapProposal, setSelectedSwapProposal] = useState<any | null>(null) // Track selected SWAP proposal
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
    
    // Special handling for SWAP - show SWAP conversation list
    if (contextType === 'swap') {
      setSelectedInboxType('swap')
      setViewState('swap-inbox')
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

  // SWAP-specific handlers
  const handleSelectSwapProposal = (proposal: any) => {
    setSelectedSwapProposal(proposal)
    setViewState('swap-proposal')
  }

  const handleSelectSwapConversation = (conversationId: string, proposal: any) => {
    // Find or create the conversation object
    // For now, we'll need to fetch the conversation details
    setSelectedSwapProposal(proposal) // Store proposal for context
    setViewState('thread')
    // TODO: Fetch full conversation details using conversationId
  }

  const handleSwapProposalAccept = (conversationId: string) => {
    // After accepting, navigate to the conversation
    // We need to fetch the conversation details and open it
    setViewState('swap-inbox') // Go back to SWAP inbox for now
    // TODO: Fetch and open the newly created conversation
  }

  const handleSwapProposalDecline = () => {
    // Go back to SWAP inbox
    setViewState('swap-inbox')
    setSelectedSwapProposal(null)
  }

  const handleBackFromSwapProposal = () => {
    setSelectedSwapProposal(null)
    setViewState('swap-inbox')
  }

  const handleBackFromSwapInbox = () => {
    setSelectedInboxType(null)
    setViewState('dashboard')
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
            className="fixed inset-0 bg-black z-[100]"
            onClick={onClose}
          />

          {/* Panel - Full screen on mobile, right panel on desktop, covers everything including navbar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 md:right-0 md:left-auto md:w-[500px] bg-[#0A0F1E] md:border-l border-white/10 z-[101] flex flex-col"
          >
            {/* Compact Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                {/* Back Button */}
                {viewState !== 'dashboard' && (
                  <button
                    onClick={
                      viewState === 'places-overview' 
                        ? handleBackFromPlacesOverview 
                        : viewState === 'inbox' 
                        ? handleBackFromInbox 
                        : viewState === 'swap-inbox'
                        ? handleBackFromSwapInbox
                        : viewState === 'swap-proposal'
                        ? handleBackFromSwapProposal
                        : handleBackFromThread
                    }
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} className="text-white/60" />
                  </button>
                )}
                
                {/* Purple Mail Icon on Dashboard, Title on other views */}
                {viewState === 'dashboard' ? (
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-400/30">
                    <Mail size={18} className="text-violet-300" strokeWidth={2.5} />
                  </div>
                ) : (
                  <h2 className="text-white text-sm font-medium">{getInboxTitle(selectedInboxType)}</h2>
                )}
              </div>
              
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
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
              ) : viewState === 'swap-inbox' ? (
                <SwapConversationList
                  userId={userId}
                  accessToken={accessToken}
                  projectId={projectId}
                  publicAnonKey={publicAnonKey}
                  onSelectConversation={handleSelectSwapConversation}
                  onSelectProposal={handleSelectSwapProposal}
                />
              ) : viewState === 'swap-proposal' ? (
                <SwapProposalCard
                  proposal={selectedSwapProposal!}
                  userId={userId}
                  accessToken={accessToken}
                  projectId={projectId}
                  isIncoming={selectedSwapProposal?.swap_item?.user_profile?.user_id === userId}
                  onClose={handleBackFromSwapProposal}
                  onAccept={handleSwapProposalAccept}
                  onDecline={handleSwapProposalDecline}
                />
              ) : (
                <MessageThread
                  conversation={selectedConversation!}
                  userId={userId}
                  accessToken={accessToken}
                  projectId={projectId}
                  publicAnonKey={publicAnonKey}
                  onBack={handleBackFromThread}
                  onMarkedAsRead={onMarkedAsRead}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}