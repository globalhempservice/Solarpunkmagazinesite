import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ChevronLeft, Mail, SquarePen, Search, User } from 'lucide-react'
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

type ViewState = 'dashboard' | 'inbox' | 'thread' | 'swap-inbox' | 'swap-proposal' | 'compose'

// Depth determines animation direction (higher = forward, lower = back)
const VIEW_DEPTH: Record<ViewState, number> = {
  'dashboard':     0,
  'inbox':         1,
  'swap-inbox':    1,
  'compose':       1,
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
  onViewProfile?: (userId: string) => void
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
  onViewProfile,
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
  // Compose state
  const [composeQuery, setComposeQuery] = useState('')
  const [composeResults, setComposeResults] = useState<Array<{ user_id: string; display_name: string; avatar_url: string | null; country: string | null }>>([])
  const [composeLoading, setComposeLoading] = useState(false)

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
      case 'compose':
        setComposeQuery('')
        setComposeResults([])
        navigateTo('dashboard')
        break
      default:
        break
    }
  }

  // ── Compose: search users ────────────────────────────────────────────────────
  const handleComposeSearch = async (q: string) => {
    setComposeQuery(q)
    if (q.trim().length < 2) { setComposeResults([]); return }
    setComposeLoading(true)
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/messages/search-users?q=${encodeURIComponent(q.trim())}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      )
      if (res.ok) {
        const data = await res.json()
        setComposeResults(data.users || [])
      }
    } finally {
      setComposeLoading(false)
    }
  }

  const handleComposeSelectUser = (user: { user_id: string; display_name: string; avatar_url: string | null }) => {
    setComposeQuery('')
    setComposeResults([])
    // Open a new personal conversation with this user
    const newConv: Conversation = {
      id: `new_${user.user_id}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: null,
      last_message_preview: null,
      unread_count: 0,
      archived: false,
      muted: false,
      context_type: 'personal',
      context_id: undefined,
      other_participant: { id: user.user_id, display_name: user.display_name, avatar_url: user.avatar_url }
    }
    setSelectedConversation(newConv)
    navigateTo('thread')
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
    if (viewState === 'compose') return 'New Message'
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

              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Compose button — visible on dashboard + inbox */}
                {(viewState === 'dashboard' || viewState === 'inbox') && (
                  <button
                    onClick={() => navigateTo('compose')}
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                    title="New message"
                  >
                    <SquarePen size={18} className="text-white/60" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white/60" />
                </button>
              </div>
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
                      onViewProfile={onViewProfile}
                    />
                  )}

                  {viewState === 'compose' && (
                    <div className="flex flex-col h-full p-4 gap-4">
                      {/* Search input */}
                      <div className="relative">
                        {!composeQuery && (
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                        )}
                        <input
                          autoFocus
                          type="text"
                          inputMode="search"
                          placeholder="Search by name…"
                          value={composeQuery}
                          onChange={e => handleComposeSearch(e.target.value)}
                          className={`w-full pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#E8FF00]/50 focus:bg-white/8 transition-colors text-base ${composeQuery ? 'pl-4' : 'pl-9'}`}
                        />
                      </div>

                      {/* Results */}
                      <div className="flex-1 overflow-y-auto space-y-1">
                        {composeLoading && (
                          <div className="flex justify-center pt-8">
                            <div className="w-6 h-6 border-2 border-[#E8FF00] border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        {!composeLoading && composeQuery.length >= 2 && composeResults.length === 0 && (
                          <div className="text-center text-white/40 text-sm pt-8">No users found</div>
                        )}
                        {!composeLoading && composeQuery.length < 2 && (
                          <p className="text-center text-white/30 text-sm pt-8">Type at least 2 characters to search</p>
                        )}
                        {composeResults.map(user => (
                          <button
                            key={user.user_id}
                            onClick={() => handleComposeSelectUser(user)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8FF00]/20 to-[#00D9FF]/20 flex items-center justify-center border border-white/10 overflow-hidden flex-shrink-0">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                              ) : (
                                <User size={18} className="text-[#E8FF00]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate">{user.display_name}</p>
                              {user.country && <p className="text-white/40 text-xs">{user.country}</p>}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
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
