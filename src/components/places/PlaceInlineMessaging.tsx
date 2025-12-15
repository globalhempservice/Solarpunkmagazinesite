import { useState, useEffect, useRef } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { motion, AnimatePresence } from 'motion/react'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  sender?: {
    display_name: string
    avatar_url?: string
  }
}

interface PlaceInlineMessagingProps {
  placeId: string
  placeName: string
  placeOwnerId: string
  currentUserId: string
  currentUserName: string
  currentUserAvatar?: string | null
  serverUrl: string
  accessToken: string
}

export function PlaceInlineMessaging({
  placeId,
  placeName,
  placeOwnerId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  serverUrl,
  accessToken
}: PlaceInlineMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Fetch existing conversation
  useEffect(() => {
    fetchMessages()
  }, [placeId, currentUserId])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      // Fetch messages for this specific conversation
      const response = await fetch(
        `${serverUrl}/messages/conversation?userId=${currentUserId}&contextType=place&contextId=${placeId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      console.log('📤 Sending place message:', {
        recipientId: placeOwnerId,
        contextType: 'place',
        contextId: placeId,
        placeName
      })

      const response = await fetch(`${serverUrl}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          recipientId: placeOwnerId,
          content: newMessage.trim(),
          contextType: 'place',
          contextId: placeId,
          contextName: placeName
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Place message sent successfully:', data)
        
        // Add the new message to the list
        const newMsg: Message = {
          id: data.message?.id || Date.now().toString(),
          content: newMessage.trim(),
          sender_id: currentUserId,
          created_at: new Date().toISOString(),
          sender: {
            display_name: currentUserName,
            avatar_url: currentUserAvatar || undefined
          }
        }
        
        setMessages([...messages, newMsg])
        setNewMessage('')
        
        // Refresh to get server data
        setTimeout(() => fetchMessages(), 500)
        
        // Show success message
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 3000)
      } else {
        const error = await response.json()
        console.error('❌ Failed to send place message:', error)
        alert(`Failed to send message: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Error sending place message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900/40 to-slate-950/40">
      {/* Messages Area - Cleaner, no redundant header since we have one above */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[280px] max-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-sm text-slate-400">Loading conversation...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-4 border border-purple-500/30">
              <Send className="w-7 h-7 text-purple-400" />
            </div>
            <p className="text-slate-300 mb-1">Start the conversation</p>
            <p className="text-slate-500 text-sm">Send the first message to {placeName}</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => {
              const isCurrentUser = message.sender_id === currentUserId
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {message.sender?.avatar_url ? (
                      <img
                        src={message.sender.avatar_url}
                        alt={message.sender.display_name}
                        className="w-9 h-9 rounded-full border-2 border-purple-500/30 shadow-lg"
                      />
                    ) : (
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg ${
                        isCurrentUser 
                          ? 'bg-gradient-to-br from-purple-500 to-purple-600 border-2 border-purple-400/50' 
                          : 'bg-gradient-to-br from-cyan-500 to-cyan-600 border-2 border-cyan-400/50'
                      }`}>
                        <span className="text-white text-sm font-bold">
                          {message.sender?.display_name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Message bubble */}
                  <div className={`flex flex-col max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl shadow-lg ${
                        isCurrentUser
                          ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white border border-purple-500/30'
                          : 'bg-gradient-to-br from-slate-800 to-slate-900 text-white border border-cyan-500/30'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    </div>
                    <span className="text-xs text-slate-500 mt-1.5 px-1">
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Enhanced design */}
      <div className="p-4 border-t border-purple-500/20 bg-gradient-to-r from-purple-900/10 to-slate-900/30">
        <div className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={2}
            disabled={sending}
            className="flex-1 px-4 py-3 bg-slate-800/80 border border-purple-500/30 rounded-xl text-white placeholder:text-slate-500 focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none disabled:opacity-50 transition-all"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white self-end px-5 shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:shadow-none"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-500">
            Press Enter to send • Shift+Enter for new line
          </p>
          {showSuccessMessage && (
            <motion.p 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-green-400 flex items-center gap-1"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400"></span>
              Message sent!
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}