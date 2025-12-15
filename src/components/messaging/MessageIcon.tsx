import React, { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { createClient } from '../../utils/supabase/client'

interface MessageIconProps {
  onClick: () => void
  userId: string
  accessToken: string
  projectId: string
  publicAnonKey: string
}

export function MessageIcon({ 
  onClick, 
  userId, 
  accessToken, 
  projectId, 
  publicAnonKey 
}: MessageIconProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchUnreadCount()
    setupRealtimeSubscription()
  }, [userId])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/messages/unread-count`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unread_count || 0)
      }
    } catch (err) {
      console.error('Error fetching unread count:', err)
    }
  }

  const setupRealtimeSubscription = () => {
    const supabase = createClient(projectId, publicAnonKey)

    // Subscribe to new messages where user is recipient
    const channel = supabase
      .channel('user-unread-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`
      }, () => {
        // Refresh unread count
        fetchUnreadCount()
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`
      }, () => {
        // Refresh when messages are marked as read
        fetchUnreadCount()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }

  return (
    <button
      onClick={onClick}
      className="relative group rounded-full h-10 sm:h-12 px-3 sm:px-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
      aria-label="Messages"
    >
      {/* Outer glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur opacity-60 group-hover:opacity-80 transition-all" />
      
      {/* Icon */}
      <div className="relative">
        <MessageCircle size={20} className="text-white sm:w-5 sm:h-5" strokeWidth={2.5} />
      </div>
      
      {/* Badge on mobile, text on desktop */}
      <span className="hidden sm:inline relative text-white font-bold tracking-wide">
        Messages
      </span>
      
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#E8FF00] text-black rounded-full flex items-center justify-center border-2 border-white shadow-md">
          <span className="text-xs font-bold leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </div>
      )}
    </button>
  )
}