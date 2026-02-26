import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '../../utils/supabase/client'
import { ChevronLeft, Send, MoreVertical } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

// Simple time ago helper
function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }): string {
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
      const text = `${interval} ${name}${interval > 1 ? 's' : ''}`
      return options?.addSuffix ? `${text} ago` : text
    }
  }
  
  return 'just now'
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  read_at: string | null
  deleted: boolean
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
  context_type?: string  // Optional: for new conversations
  context_id?: string    // Optional: for new conversations
  context_name?: string  // Optional: for new conversations (e.g., place name)
}

interface MessageThreadProps {
  conversation: Conversation
  userId: string
  accessToken: string
  projectId: string
  publicAnonKey: string
  onBack: () => void
  onMarkedAsRead?: () => void
}

export function MessageThread({
  conversation,
  userId,
  accessToken,
  projectId,
  publicAnonKey,
  onBack,
  onMarkedAsRead
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch messages on mount
  useEffect(() => {
    // Don't fetch messages for new conversations (ID starts with "new_")
    if (!conversation.id.startsWith('new_')) {
      fetchMessages()
      markAsRead()
    } else {
      // New conversation - just show empty state
      setLoading(false)
      setMessages([])
    }
    
    // Setup realtime and return cleanup function
    const cleanup = setupRealtimeSubscription()
    return cleanup
  }, [conversation.id])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/messages/thread/${conversation.id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(data.messages || [])
    } catch (err: any) {
      console.error('Error fetching messages:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async () => {
    if (conversation.id.startsWith('new_')) return

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/messages/mark-read/${conversation.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      // Tell the parent (AppNavigation) the count changed so badge clears immediately
      onMarkedAsRead?.()
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const setupRealtimeSubscription = () => {
    const supabase = createClient(projectId, publicAnonKey)

    // For new conversations, subscribe to messages sent to/from this recipient
    // Once the first message is sent, it will appear via this subscription
    if (conversation.id.startsWith('new_')) {
      const channel = supabase
        .channel(`new-conversation-${conversation.other_participant.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${userId}`
        }, (payload) => {
          const newMsg = payload.new as Message
          
          // Only show messages sent to this specific recipient
          if (newMsg.recipient_id === conversation.other_participant.id) {
            setMessages(prev => {
              const exists = prev.some(m => m.id === newMsg.id)
              if (exists) return prev
              return [...prev, newMsg]
            })
          }
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`
        }, (payload) => {
          const newMsg = payload.new as Message
          
          // Only show messages from this specific sender
          if (newMsg.sender_id === conversation.other_participant.id) {
            setMessages(prev => {
              const exists = prev.some(m => m.id === newMsg.id)
              if (exists) return prev
              return [...prev, newMsg]
            })
            markAsRead()
          }
        })
        .subscribe()

      return () => {
        channel.unsubscribe()
      }
    }

    // For existing conversations, subscribe to messages in this conversation
    const channel = supabase
      .channel(`conversation-${conversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.id}`
      }, (payload) => {
        const newMsg = payload.new as Message
        
        // Deduplicate - only add if not already in state
        setMessages(prev => {
          const exists = prev.some(m => m.id === newMsg.id)
          if (exists) return prev
          return [...prev, newMsg]
        })
        
        // Mark as read if we're the recipient
        if (newMsg.recipient_id === userId) {
          markAsRead()
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    const content = newMessage.trim()
    if (!content || sending) return

    setSendError(null)

    // Optimistic: add the message to the UI immediately
    const tempId = `temp_${Date.now()}`
    const optimisticMsg: Message = {
      id: tempId,
      conversation_id: conversation.id,
      sender_id: userId,
      recipient_id: conversation.other_participant.id,
      content,
      created_at: new Date().toISOString(),
      read_at: null,
      deleted: false
    }
    setMessages(prev => [...prev, optimisticMsg])
    setNewMessage('')

    try {
      setSending(true)

      const requestBody: any = {
        recipientId: conversation.other_participant.id,
        content
      }
      if (conversation.context_type) requestBody.contextType = conversation.context_type
      if (conversation.context_id)   requestBody.contextId   = conversation.context_id

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/messages/send`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.shouldRetry || errorData.code === 'connection_error'
            ? 'Connection issue. Check your internet and try again.'
            : errorData.error || 'Failed to send message'
        )
      }

      const responseData = await response.json()

      // Replace the temp message with the confirmed real message from server
      setMessages(prev => {
        const withoutTemp = prev.filter(m => m.id !== tempId)
        // Only add if Realtime hasn't already delivered it
        const alreadyHere = withoutTemp.some(m => m.id === responseData.message?.id)
        if (alreadyHere || !responseData.message) return withoutTemp
        return [...withoutTemp, { ...responseData.message, deleted: false }]
      })

      inputRef.current?.focus()
    } catch (err: any) {
      console.error('Error sending message:', err)
      // Remove the optimistic message and restore the input text
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setNewMessage(content)
      setSendError(
        err.message.includes('Connection issue')
          ? err.message
          : 'Failed to send. Please try again.'
      )
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-white/10 rounded w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Loading */}
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E8FF00]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8FF00]/20 to-[#00D9FF]/20 flex items-center justify-center flex-shrink-0 border border-white/10">
          {conversation.other_participant.avatar_url ? (
            <img
              src={conversation.other_participant.avatar_url}
              alt={conversation.other_participant.display_name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-[#E8FF00] text-sm">
              {conversation.other_participant.display_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Show place name prominently for place contexts */}
          {conversation.context_type === 'place' && conversation.context_name ? (
            <>
              <h3 className="text-white truncate">
                {conversation.context_name}
              </h3>
              <p className="text-xs text-white/50 truncate">
                Managed by {conversation.other_participant.display_name}
              </p>
            </>
          ) : (
            <h3 className="text-white truncate">
              {conversation.other_participant.display_name}
            </h3>
          )}
        </div>

        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <MoreVertical size={20} className="text-white/60" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/60">
            {conversation.context_type === 'place' && conversation.context_name ? (
              <p className="text-sm text-center px-4">
                Send your first message to <span className="text-white font-medium">{conversation.context_name}</span>
              </p>
            ) : (
              <p className="text-sm">No messages yet. Say hi!</p>
            )}
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender_id === userId
            const showTimestamp = index === 0 || 
              (new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000)

            return (
              <div key={message.id}>
                {showTimestamp && (
                  <div className="flex justify-center mb-4">
                    <span className="text-xs text-white/40">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl transition-opacity ${
                      isOwn
                        ? 'bg-[#E8FF00] text-black rounded-br-sm'
                        : 'bg-white/10 text-white rounded-bl-sm'
                    } ${message.id.startsWith('temp_') ? 'opacity-60' : ''}`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 mb-20 md:mb-0">
        {sendError && (
          <p className="text-xs text-red-400 mb-2 px-1">{sendError}</p>
        )}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => { setNewMessage(e.target.value); setSendError(null) }}
            disabled={sending}
            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-[#E8FF00] text-black hover:bg-[#d4ed00] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
            ) : (
              <Send size={18} />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}