import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import { Search, MessageCircle, ArchiveX } from 'lucide-react'
import { Input } from '../ui/input'

// Simple time ago helper
function formatDistanceToNow(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  
  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  }
  
  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval)
    if (interval >= 1) {
      return `${interval} ${name}${interval > 1 ? 's' : ''} ago`
    }
  }
  
  return 'just now'
}

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
  context_name?: string  // Add context name (e.g., place name)
}

interface ConversationListProps {
  userId: string
  accessToken: string
  projectId: string
  publicAnonKey: string
  onSelectConversation: (conversation: Conversation) => void
  contextType?: string // Filter by context type
  pendingRecipient?: {
    recipientId: string
    contextType?: string
    contextId?: string
    contextName?: string  // Add context name (e.g., place name)
  }
}

export function ConversationList({
  userId,
  accessToken,
  projectId,
  publicAnonKey,
  onSelectConversation,
  contextType,
  pendingRecipient
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [archivingId, setArchivingId] = useState<string | null>(null)

  // Fetch conversations
  useEffect(() => {
    fetchConversations()
    setupRealtimeSubscription()
  }, [userId, contextType])

  // Handle pendingRecipient - find or create conversation
  useEffect(() => {
    if (pendingRecipient && conversations.length >= 0) {
      // Try to find existing conversation with this recipient and matching context
      const existingConv = conversations.find(conv => {
        // Match by participant
        const matchesParticipant = conv.other_participant.id === pendingRecipient.recipientId
        
        // If no context specified, any conversation with this participant is fine
        if (!pendingRecipient.contextType) {
          return matchesParticipant
        }
        
        // Otherwise, try to match context too (Note: we'd need to add context_type to Conversation interface)
        return matchesParticipant
      })
      
      if (existingConv) {
        // Open existing conversation
        onSelectConversation(existingConv)
      } else {
        // Fetch user info then create conversation
        fetchRecipientInfoAndCreateConversation()
      }
    }
  }, [pendingRecipient, conversations])

  const fetchRecipientInfoAndCreateConversation = async () => {
    if (!pendingRecipient) return

    try {
      // Fetch user profile from backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/user/profile/${pendingRecipient.recipientId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      let displayName = 'User'
      let avatarUrl = null

      if (response.ok) {
        const data = await response.json()
        displayName = data.profile?.display_name || data.profile?.username || 'User'
        avatarUrl = data.profile?.avatar_url || null
      }

      // Create a fake conversation object to open the thread
      const newConversation: Conversation = {
        id: `new_${pendingRecipient.recipientId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: null,
        last_message_preview: null,
        unread_count: 0,
        archived: false,
        muted: false,
        other_participant: {
          id: pendingRecipient.recipientId,
          display_name: displayName,
          avatar_url: avatarUrl
        },
        context_type: pendingRecipient.contextType,
        context_id: pendingRecipient.contextId,
        context_name: pendingRecipient.contextName  // Include context name
      }
      onSelectConversation(newConversation)
    } catch (err) {
      console.error('Error fetching recipient info:', err)
      
      // Fallback - create conversation with placeholder name
      const newConversation: Conversation = {
        id: `new_${pendingRecipient.recipientId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: null,
        last_message_preview: null,
        unread_count: 0,
        archived: false,
        muted: false,
        other_participant: {
          id: pendingRecipient.recipientId,
          display_name: 'User',
          avatar_url: null
        },
        context_type: pendingRecipient.contextType,
        context_id: pendingRecipient.contextId,
        context_name: pendingRecipient.contextName  // Include context name
      }
      onSelectConversation(newConversation)
    }
  }

  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build URL with context filter if provided
      const url = new URL(`https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/messages/conversations`)
      if (contextType) {
        url.searchParams.append('contextType', contextType)
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (err: any) {
      console.error('Error fetching conversations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    setArchivingId(conversationId)
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/messages/conversation/${conversationId}/archive`,
        { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}` } }
      )
      // Remove immediately from local list
      setConversations(prev => prev.filter(c => c.id !== conversationId))
    } catch {
      // Silently ignore — worst case it reappears on next fetch
    } finally {
      setArchivingId(null)
    }
  }

  const setupRealtimeSubscription = () => {
    const supabase = createClient(projectId, publicAnonKey)

    // Subscribe to new messages for this user
    const channel = supabase
      .channel('user-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`
      }, () => {
        // Refresh conversations when new message received
        fetchConversations()
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`
      }, () => {
        // Refresh when message read status changes
        fetchConversations()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }

  // Filter conversations by search query
  const filteredConversations = conversations.filter(conv =>
    conv.other_participant.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/60">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E8FF00]"></div>
        <p className="mt-4">Loading conversations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/60 p-4">
        <MessageCircle size={48} className="mb-4 text-white/20" />
        <p className="text-center">Failed to load conversations</p>
        <button 
          onClick={fetchConversations}
          className="mt-4 px-4 py-2 bg-[#E8FF00] text-black rounded-lg hover:bg-[#d4ed00] transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/60 p-8">
        <MessageCircle size={64} className="mb-4 text-white/20" />
        <h3 className="text-white mb-2">No Messages Yet</h3>
        <p className="text-center text-sm">
          Start a conversation from a Discovery Match or User Profile
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 pb-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none z-10" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 transition-colors"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto pb-24">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/60 p-8">
            <p className="text-center text-sm">No conversations match your search</p>
          </div>
        ) : (
          <div className="px-2">
            {filteredConversations.map((conversation, index) => (
              <div key={conversation.id} className="relative group mb-2">
              <button
                onClick={() => {
                  // Optimistically clear the unread badge before the thread marks-read round-trip
                  if (conversation.unread_count > 0) {
                    setConversations(prev =>
                      prev.map(c => c.id === conversation.id ? { ...c, unread_count: 0 } : c)
                    )
                  }
                  onSelectConversation(conversation)
                }}
                className={`
                  w-full p-3 rounded-xl
                  hover:bg-white/10 active:bg-white/15
                  transition-all duration-150
                  text-left flex items-center gap-3
                  ${conversation.unread_count > 0 ? 'bg-white/5' : ''}
                `}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E8FF00]/20 to-[#00D9FF]/20 flex items-center justify-center border border-white/10 overflow-hidden">
                    {conversation.other_participant.avatar_url ? (
                      <img
                        src={conversation.other_participant.avatar_url}
                        alt={conversation.other_participant.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[#E8FF00] text-lg font-medium">
                        {conversation.other_participant.display_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {/* Online indicator (placeholder for future feature) */}
                  {/* <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0A0F1E]"></div> */}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`truncate ${conversation.unread_count > 0 ? 'text-white font-semibold' : 'text-white/90'}`}>
                      {conversation.context_type === 'place' && conversation.context_name 
                        ? conversation.context_name 
                        : conversation.other_participant.display_name}
                    </h4>
                    {conversation.last_message_at && (
                      <span className={`text-xs flex-shrink-0 ${conversation.unread_count > 0 ? 'text-[#E8FF00]' : 'text-white/40'}`}>
                        {formatDistanceToNow(new Date(conversation.last_message_at))}
                      </span>
                    )}
                  </div>
                  
                  {/* For place conversations, show owner's name as subtitle */}
                  {conversation.context_type === 'place' && conversation.context_name && (
                    <p className="text-xs text-white/40 truncate mb-1">
                      Managed by {conversation.other_participant.display_name}
                    </p>
                  )}
                  
                  {conversation.last_message_preview && (
                    <p className={`text-sm truncate ${conversation.unread_count > 0 ? 'text-white/80 font-medium' : 'text-white/50'}`}>
                      {conversation.last_message_preview}
                    </p>
                  )}
                </div>

                {/* Unread Badge */}
                {conversation.unread_count > 0 && (
                  <div className="flex-shrink-0">
                    <div className="min-w-[24px] h-6 px-2 rounded-full bg-[#E8FF00] flex items-center justify-center">
                      <span className="text-xs text-black font-bold">
                        {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                      </span>
                    </div>
                  </div>
                )}
              </button>

              {/* Archive button — visible on hover (desktop) or always on mobile */}
              <button
                onClick={(e) => handleArchive(e, conversation.id)}
                disabled={archivingId === conversation.id}
                title="Hide conversation"
                className="
                  absolute right-1 top-1/2 -translate-y-1/2
                  w-7 h-7 rounded-full
                  bg-black/60 border border-white/10
                  flex items-center justify-center
                  text-white/30 hover:text-white/80 hover:bg-white/10
                  transition-all duration-150
                  opacity-0 group-hover:opacity-100
                  md:opacity-0 md:group-hover:opacity-100
                  disabled:cursor-not-allowed
                "
              >
                {archivingId === conversation.id
                  ? <div className="w-3 h-3 border border-white/40 border-t-transparent rounded-full animate-spin" />
                  : <ArchiveX size={12} />
                }
              </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}