import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ChevronLeft, Mail } from 'lucide-react'
import { MessageDashboard } from './MessageDashboard'
import { ConversationList } from './ConversationList'
import { MessageThread } from './MessageThread'
import { SwapConversationList } from './SwapConversationList'
import { SwapProposalCard } from './SwapProposalCard'

// ─── Types ────────────────────────────────────────────────────────────────────

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
  context_type?: string
  context_id?: string
  context_name?: string
}

type ViewState = 'dashboard' | 'inbox' | 'thread' | 'swap-inbox' | 'swap-proposal'

// Depth determines animation direction (higher = forward, lower = back)
const VIEW_DEPTH: Record<ViewState, number> = {
  'dashboard':     0,
  'inbox':         1,
  'swap-inbox':    1,
  'swap-proposal': 2,
  'thread':        2,
}

// ─── Slide animation variants ─────────────────────────────────────────────────
// Forward: new view slides in from right, old exits left (parallax dimming)
// Back:    new view slides in from left,  old exits right

const slideVariants = {
  enter: (dir: 'forward' | 'back') => ({
    x: dir === 'forward' ? '100%' : '-20%',
    opacity: dir === 'back' ? 0 : 1,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: 'forward' | 'back') => ({
    x: dir === 'forward' ? '-20%' : '100%',
    opacity: dir === 'forward' ? 0 : 1,
  }),
}

const slideTransition = {
  type: 'spring' as const,
  damping: 32,
  stiffness: 320,
  mass: 0.6,
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MessagePanelProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  accessToken: string
  projectId: string
  publicAnonKey: string
  initialInboxType?: string
  initialConversationId?: string
  initialRecipientId?: string
  initialContextType?: string
  initialContextId?: string
  initialContextName?: string
  serverUrl: string
  onMarkedAsRead?: () => void
}

// Build a Conversation object from a swap proposal + conversationId so we can
// navigate straight to the MessageThread without a separate fetch.
function buildConversationFromProposal(
  proposal: any,
  conversationId: string,
  currentUserId: string
): Conversation {
  const isIncoming = proposal.swap_item?.user_profile?.user_id === currentUserId
  const other = isIncoming ? proposal.proposer_profile : proposal.swap_item?.user_profile
  return {
    id: conversationId,
    created_at: proposal.created_at,
    updated_at: proposal.created_at,
    last_message_at: null,
    last_message_preview: null,
    unread_count: 0,
    archived: false,
    muted: false,
    context_type: 'swap',
    context_id: proposal.id,
    context_name: proposal.swap_item?.title || 'SWAP Deal',
    other_participant: {
      id: other?.user_id || '',
      display_name: other?.display_name || 'Trader',
      avatar_url: other?.avatar_url || null,
    },
  }
}

export function MessagePanel({
  isOpen,
  onClose,
  userId,
  accessToken,
  projectId,
  publicAnonKey,
  initialInboxType,
  initialConversationId,
  initialRecipientId,
  initialContextType,
  initialContextId,
  initialContextName,
  serverUrl,
  onMarkedAsRead,
}: MessagePanelProps) {
  const [viewState, setViewState]               = useState<ViewState>('dashboard')
  const [navDirection, setNavDirection]         = useState<'forward' | 'back'>('forward')
  const [selectedInboxType, setSelectedInboxType] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [selectedSwapProposal, setSelectedSwapProposal] = useState<any | null>(null)
  const [pendingConversation, setPendingConversation] = useState<{
    recipientId: string
    contextType?: string
    contextId?: string
    contextName?: string
  } | null>(null)

  // ── Navigate helper: sets direction, then view ─────────────────────────────
  const navigateTo = useCallback((newView: ViewState) => {
    setNavDirection(
      (VIEW_DEPTH[newView] ?? 0) >= (VIEW_DEPTH[viewState] ?? 0) ? 'forward' : 'back'
    )
    setViewState(newView)
  }, [viewState])

  // ── Open directly to a conversation (deep-link) ────────────────────────────
  useEffect(() => {
    if (!isOpen) return

    if (initialConversationId) {
      // Deep-link to a specific conversation thread (e.g. from SwapInbox "Open Chat")
      // We don't have the full Conversation object here, so build a minimal one.
      // MessageThread will fetch the actual messages by conversation ID.
      setSelectedConversation({
        id: initialConversationId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: null,
        last_message_preview: null,
        unread_count: 0,
        archived: false,
        muted: false,
        context_type: 'swap',
        other_participant: { id: '', display_name: 'Trader', avatar_url: null },
      })
      navigateTo('thread')
      return
    }

    if (initialInboxType) {
      setSelectedInboxType(initialInboxType)
      if (initialInboxType === 'swap') {
        navigateTo('swap-inbox')
      } else {
        navigateTo('inbox')
      }
      if (initialRecipientId) {
        setPendingConversation({
          recipientId: initialRecipientId,
          contextType: initialContextType,
          contextId:   initialContextId,
          contextName: initialContextName,
        })
      }
    }
  }, [isOpen, initialConversationId, initialInboxType, initialRecipientId, initialContextType, initialContextId, initialContextName])

  // ── Reset on close ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setViewState('dashboard')
      setNavDirection('forward')
      setSelectedInboxType(null)
      setSelectedConversation(null)
      setPendingConversation(null)
    }
  }, [isOpen])

  // ── Navigation handlers ────────────────────────────────────────────────────

  const handleSelectInbox = (contextType: string) => {
    if (contextType === 'swap') {
      setSelectedInboxType('swap')
      navigateTo('swap-inbox')
      return
    }
    // All other inbox types (personal, organization, swag, rfp, place)
    // go directly to ConversationList — no intermediate overview
    setSelectedInboxType(contextType)
    navigateTo('inbox')
  }

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    navigateTo('thread')
  }

  const handleSelectSwapProposal = (proposal: any) => {
    setSelectedSwapProposal(proposal)
    navigateTo('swap-proposal')
  }

  const handleSelectSwapConversation = (conversationId: string, proposal: any) => {
    const convo = buildConversationFromProposal(proposal, conversationId, userId)
    setSelectedConversation(convo)
    navigateTo('thread')
  }

  const handleSwapProposalAccept = (conversationId: string) => {
    if (selectedSwapProposal && conversationId) {
      const convo = buildConversationFromProposal(selectedSwapProposal, conversationId, userId)
      setSelectedConversation(convo)
      navigateTo('thread')
    } else {
      navigateTo('swap-inbox')
    }
  }

  const handleSwapProposalDecline = () => {
    setSelectedSwapProposal(null)
    navigateTo('swap-inbox')
  }

  // Back handlers
  const handleBack = () => {
    switch (viewState) {
      case 'thread':
        setSelectedConversation(null)
        if (selectedConversation?.context_type === 'swap') {
          navigateTo('swap-inbox')
        } else {
          navigateTo('inbox')
        }
        break
      case 'inbox':
        setSelectedInboxType(null)
        setPendingConversation(null)
        navigateTo('dashboard')
        break
      case 'swap-proposal':
        setSelectedSwapProposal(null)
        navigateTo('swap-inbox')
        break
      case 'swap-inbox':
        setSelectedInboxType(null)
        navigateTo('dashboard')
        break
      default:
        break
    }
  }

  // ── Header title ────────────────────────────────────────────────────────────
  const getTitle = (): string => {
    const titles: Record<string, string> = {
      personal:     'Personal Messages',
      organization: 'Organizations',
      swap:         'SWAP Deals',
      swag:         'SWAG Orders',
      rfp:          'RFP Projects',
      place:        'Places',
    }
    if (viewState === 'thread' && selectedConversation) {
      return (
        selectedConversation.context_name ||
        selectedConversation.other_participant.display_name
      )
    }
    if (viewState === 'swap-proposal') return 'SWAP Proposal'
    return selectedInboxType ? (titles[selectedInboxType] || 'Messages') : 'Messages'
  }

  // ── Render ──────────────────────────────────────────────────────────────────
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

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 md:right-0 md:left-auto md:w-[500px] bg-[#0A0F1E] md:border-l border-white/10 z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                {viewState !== 'dashboard' ? (
                  <button
                    onClick={handleBack}
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
                  >
                    <ChevronLeft size={20} className="text-white/60" />
                  </button>
                ) : (
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-400/30 flex-shrink-0">
                    <Mail size={18} className="text-violet-300" strokeWidth={2.5} />
                  </div>
                )}

                <AnimatePresence mode="wait" initial={false}>
                  <motion.h2
                    key={viewState}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="text-white text-sm font-medium truncate"
                  >
                    {viewState === 'dashboard' ? '' : getTitle()}
                  </motion.h2>
                </AnimatePresence>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
              >
                <X size={20} className="text-white/60" />
              </button>
            </div>

            {/* Sliding content area */}
            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence initial={false} custom={navDirection}>
                <motion.div
                  key={viewState}
                  custom={navDirection}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTransition}
                  className="absolute inset-0 overflow-y-auto"
                >
                  {viewState === 'dashboard' && (
                    <MessageDashboard
                      userId={userId}
                      accessToken={accessToken}
                      projectId={projectId}
                      publicAnonKey={publicAnonKey}
                      onSelectInbox={handleSelectInbox}
                    />
                  )}

                  {viewState === 'inbox' && (
                    <ConversationList
                      userId={userId}
                      accessToken={accessToken}
                      projectId={projectId}
                      publicAnonKey={publicAnonKey}
                      onSelectConversation={handleConversationSelect}
                      contextType={selectedInboxType || undefined}
                      pendingRecipient={pendingConversation || undefined}
                    />
                  )}

                  {viewState === 'swap-inbox' && (
                    <SwapConversationList
                      userId={userId}
                      accessToken={accessToken}
                      projectId={projectId}
                      publicAnonKey={publicAnonKey}
                      onSelectConversation={handleSelectSwapConversation}
                      onSelectProposal={handleSelectSwapProposal}
                    />
                  )}

                  {viewState === 'swap-proposal' && (
                    <SwapProposalCard
                      proposal={selectedSwapProposal!}
                      userId={userId}
                      accessToken={accessToken}
                      projectId={projectId}
                      isIncoming={selectedSwapProposal?.swap_item?.user_profile?.user_id === userId}
                      onClose={handleBack}
                      onAccept={handleSwapProposalAccept}
                      onDecline={handleSwapProposalDecline}
                    />
                  )}

                  {viewState === 'thread' && selectedConversation && (
                    <MessageThread
                      conversation={selectedConversation}
                      userId={userId}
                      accessToken={accessToken}
                      projectId={projectId}
                      publicAnonKey={publicAnonKey}
                      onBack={handleBack}
                      onMarkedAsRead={onMarkedAsRead}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
