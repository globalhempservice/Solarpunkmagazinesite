import React, { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { createClient } from '../../utils/supabase/client'

interface MessageIconProps {
  onOpenMessages: () => void
  userId: string
  accessToken: string
  projectId: string
}

export function MessageIcon({ 
  onOpenMessages, 
  userId, 
  accessToken, 
  projectId
}: MessageIconProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchUnreadCount()
    const cleanup = setupRealtimeSubscription()
    return cleanup
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
    const supabase = createClient()

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
    <div className="relative">
      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" strokeWidth={2.5} />
      
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#E8FF00] text-black rounded-full flex items-center justify-center border border-white shadow-md">
          <span className="text-[8px] font-bold leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </div>
      )}
    </div>
  )
}