import { createClient } from 'npm:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
})

export function setupMessagingRoutes(app: any, requireAuth: any) {
  console.log('💬 Setting up messaging routes...')

  // ============================================
  // SEND MESSAGE (SIMPLIFIED UPSERT APPROACH)
  // ============================================
  app.post('/make-server-053bcd80/messages/send', requireAuth, async (c: any) => {
    try {
      const userId = c.get('userId')
      const body = await c.req.json()
      const { recipientId, content, contextType, contextId, conversationId: knownConversationId } = body

      console.log('📤 Sending message:', { from: userId, to: recipientId, contextType, contextId, knownConversationId })

      // Validate input
      if (!recipientId || !content) {
        return c.json({ error: 'recipientId and content are required' }, 400)
      }

      if (content.trim().length === 0) {
        return c.json({ error: 'Message content cannot be empty' }, 400)
      }

      // Validate contextType if provided
      const validContextTypes = ['personal', 'organization', 'swap', 'swag', 'rfp', 'place']
      const finalContextType = contextType || 'personal'
      if (!validContextTypes.includes(finalContextType)) {
        return c.json({ error: 'Invalid contextType' }, 400)
      }

      // Prevent self-messaging
      if (userId === recipientId) {
        return c.json({ error: 'Cannot send message to yourself' }, 400)
      }

      // Check if recipient exists
      const { data: recipient, error: recipientError } = await supabase.auth.admin.getUserById(recipientId)
      if (recipientError || !recipient) {
        console.error('❌ Recipient not found:', recipientId, recipientError)
        return c.json({ error: 'Recipient not found', details: recipientError?.message || 'User does not exist' }, 404)
      }

      console.log('✅ Recipient found:', recipient.user.email)

      // Fast-path: if the client already knows the conversation ID, skip the lookup entirely.
      // This guarantees messages land in the exact conversation the receiver is watching.
      if (knownConversationId) {
        // Verify caller is a participant (security check)
        const { data: knownConv } = await supabase
          .from('conversations')
          .select('id')
          .eq('id', knownConversationId)
          .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
          .maybeSingle()

        if (knownConv) {
          const { data: fastMsg, error: fastErr } = await supabase
            .from('messages')
            .insert({
              conversation_id: knownConversationId,
              sender_id: userId,
              recipient_id: recipientId,
              content: content.trim()
            })
            .select()
            .single()

          if (fastErr) {
            console.error('❌ Fast-path insert error:', fastErr)
            return c.json({ error: 'Failed to send message', details: fastErr.message }, 500)
          }

          console.log('✅ Fast-path message sent:', fastMsg.id)
          return c.json({
            success: true,
            message: {
              id: fastMsg.id,
              conversation_id: fastMsg.conversation_id,
              sender_id: fastMsg.sender_id,
              recipient_id: fastMsg.recipient_id,
              content: fastMsg.content,
              created_at: fastMsg.created_at,
              read_at: fastMsg.read_at
            },
            conversation: { id: knownConversationId }
          })
        }
        // If verification fails, fall through to normal lookup
        console.warn('⚠️  knownConversationId not valid for this user, falling back to lookup')
      }

      // NEW APPROACH: Query first, then insert if not found
      let conversationId = null
      
      // Normalize contextId - empty/null should be empty string to match constraint COALESCE(context_id, '')
      const normalizedContextId = contextId && contextId.trim() ? contextId.trim() : ''
      
      console.log('🔍 STEP 1: Looking for existing conversation...', { 
        userId, 
        recipientId, 
        contextType: finalContextType, 
        contextId: normalizedContextId 
      })
      
      // Try to find existing conversation (both directions)
      const { data: existingConv1 } = await supabase
        .from('conversations')
        .select('id')
        .eq('participant_1_id', userId)
        .eq('participant_2_id', recipientId)
        .eq('context_type', finalContextType)
        .eq('context_id', normalizedContextId)
        .maybeSingle()
      
      if (existingConv1) {
        conversationId = existingConv1.id
        console.log('✅ Found existing conversation (direction 1):', conversationId)
      } else {
        const { data: existingConv2 } = await supabase
          .from('conversations')
          .select('id')
          .eq('participant_1_id', recipientId)
          .eq('participant_2_id', userId)
          .eq('context_type', finalContextType)
          .eq('context_id', normalizedContextId)
          .maybeSingle()
        
        if (existingConv2) {
          conversationId = existingConv2.id
          console.log('✅ Found existing conversation (direction 2):', conversationId)
        }
      }
      
      // If no conversation found, create one
      if (!conversationId) {
        console.log('🚀 STEP 2: No existing conversation, creating new one...')
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            participant_1_id: userId,
            participant_2_id: recipientId,
            context_type: finalContextType,
            context_id: normalizedContextId
          })
          .select('id')
          .single()

        console.log('📊 INSERT result:', { newConv, createError: JSON.stringify(createError, null, 2) })

        if (createError) {
          console.error('❌ Error creating conversation:', createError)
          console.log('🔍 Error details:', {
            code: createError.code,
            message: createError.message,
            details: createError.details,
            hint: createError.hint
          })
          
          // If we got duplicate error, try one more time to find it
          if (createError.code === '23505') {
            console.log('⚠️  Duplicate error - race condition? Querying again...')
            
            const { data: raceConv1 } = await supabase
              .from('conversations')
              .select('id')
              .eq('participant_1_id', userId)
              .eq('participant_2_id', recipientId)
              .eq('context_type', finalContextType)
              .eq('context_id', normalizedContextId)
              .maybeSingle()
            
            if (raceConv1) {
              conversationId = raceConv1.id
              console.log('✅ Found conversation after race condition:', conversationId)
            } else {
              const { data: raceConv2 } = await supabase
                .from('conversations')
                .select('id')
                .eq('participant_1_id', recipientId)
                .eq('participant_2_id', userId)
                .eq('context_type', finalContextType)
                .eq('context_id', normalizedContextId)
                .maybeSingle()
              
              if (raceConv2) {
                conversationId = raceConv2.id
                console.log('✅ Found conversation after race condition (reverse):', conversationId)
              } else {
                // WORKAROUND: Database constraint is wrong (doesn't include context)
                // Just find ANY conversation between these users
                console.log('⚠️  WARNING: Using existing conversation as workaround for bad constraint')
                const { data: anyConv } = await supabase
                  .from('conversations')
                  .select('id')
                  .or(`and(participant_1_id.eq.${userId},participant_2_id.eq.${recipientId}),and(participant_1_id.eq.${recipientId},participant_2_id.eq.${userId})`)
                  .limit(1)
                  .maybeSingle()
                
                if (anyConv) {
                  conversationId = anyConv.id
                  console.log('✅ Using existing conversation (wrong context):', conversationId)
                }
              }
            }
          }
          
          if (!conversationId) {
            return c.json({ 
              error: 'Failed to create conversation', 
              details: createError.message,
              code: createError.code 
            }, 500)
          }
        } else {
          conversationId = newConv.id
          console.log('✅ Created new conversation:', conversationId)
        }
      }

      // Insert message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          recipient_id: recipientId,
          content: content.trim()
        })
        .select()
        .single()

      if (messageError) {
        console.error('❌ Error inserting message:', messageError)
        return c.json({ error: 'Failed to send message', details: messageError.message }, 500)
      }

      console.log('✅ Message sent:', message.id)

      // Get conversation details for response
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      return c.json({
        success: true,
        message: {
          id: message.id,
          conversation_id: message.conversation_id,
          sender_id: message.sender_id,
          recipient_id: message.recipient_id,
          content: message.content,
          created_at: message.created_at,
          read_at: message.read_at
        },
        conversation: conversation || { id: conversationId }
      })
    } catch (error: any) {
      console.error('❌ Error in send message endpoint:', error)
      return c.json({ error: 'Failed to send message', details: error.message }, 500)
    }
  })

  // ============================================
  // GET CONVERSATIONS LIST
  // ============================================
  app.get('/make-server-053bcd80/messages/conversations', requireAuth, async (c: any) => {
    try {
      const userId = c.get('userId')
      const includeArchived = c.req.query('includeArchived') === 'true'
      const contextType = c.req.query('contextType') // Filter by context type

      console.log('📋 Fetching conversations for user:', userId, 'contextType:', contextType)

      // Query conversations where user is a participant
      let query = supabase
        .from('conversations')
        .select('*')
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false })

      // Filter by context type if provided
      if (contextType) {
        query = query.eq('context_type', contextType)
      }

      const { data: conversations, error: convError } = await query

      if (convError) {
        console.error('❌ Error fetching conversations:', convError)
        return c.json({ error: 'Failed to fetch conversations', details: convError.message }, 500)
      }

      console.log('✅ Found', conversations?.length || 0, 'conversations')

      // Get metadata for each conversation (archived status)
      const conversationIds = conversations?.map(c => c.id) || []
      const { data: metadata } = await supabase
        .from('conversation_metadata')
        .select('*')
        .eq('user_id', userId)
        .in('conversation_id', conversationIds)

      const metadataMap = new Map(metadata?.map(m => [m.conversation_id, m]) || [])

      // Filter archived if needed
      let filteredConversations = conversations || []
      if (!includeArchived) {
        filteredConversations = filteredConversations.filter(conv => {
          const meta = metadataMap.get(conv.id)
          return !meta?.archived
        })
      }

      // Get other participant details for each conversation
      const otherParticipantIds = filteredConversations.map(conv => 
        conv.participant_1_id === userId ? conv.participant_2_id : conv.participant_1_id
      )

      // Fetch user profiles for participants
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', otherParticipantIds)

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])

      // Get unread count for each conversation
      const { data: unreadCounts } = await supabase
        .from('messages')
        .select('conversation_id, id')
        .eq('recipient_id', userId)
        .is('read_at', null)
        .eq('deleted', false)
        .in('conversation_id', conversationIds)

      const unreadMap = new Map()
      unreadCounts?.forEach(msg => {
        const count = unreadMap.get(msg.conversation_id) || 0
        unreadMap.set(msg.conversation_id, count + 1)
      })

      // Fetch place names for place conversations
      const placeContextIds = filteredConversations
        .filter(conv => conv.context_type === 'place' && conv.context_id)
        .map(conv => conv.context_id)
      
      let placeNamesMap = new Map()
      if (placeContextIds.length > 0) {
        const { data: places } = await supabase
          .from('places')
          .select('id, name')
          .in('id', placeContextIds)
        
        placeNamesMap = new Map(places?.map(p => [p.id, p.name]) || [])
      }

      // Transform conversations to response format
      const transformedConversations = filteredConversations.map(conv => {
        const otherParticipantId = conv.participant_1_id === userId ? conv.participant_2_id : conv.participant_1_id
        const profile = profileMap.get(otherParticipantId)
        const meta = metadataMap.get(conv.id)

        return {
          id: conv.id,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          last_message_at: conv.last_message_at,
          last_message_preview: conv.last_message_preview,
          context_type: conv.context_type || 'personal',
          context_id: conv.context_id || '',
          context_name: conv.context_type === 'place' && conv.context_id 
            ? placeNamesMap.get(conv.context_id) || null 
            : null,
          unread_count: unreadMap.get(conv.id) || 0,
          archived: meta?.archived || false,
          muted: meta?.muted || false,
          other_participant: {
            id: otherParticipantId,
            display_name: profile?.display_name || 'Unknown User',
            avatar_url: profile?.avatar_url || null
          }
        }
      })

      console.log('✅ Returning', transformedConversations.length, 'conversations')

      return c.json({ conversations: transformedConversations })
    } catch (error: any) {
      console.error('❌ Error in conversations list endpoint:', error)
      return c.json({ error: 'Failed to fetch conversations', details: error.message }, 500)
    }
  })

  // ============================================
  // GET MESSAGE THREAD
  // ============================================
  app.get('/make-server-053bcd80/messages/thread/:conversationId', requireAuth, async (c: any) => {
    try {
      const userId = c.get('userId')
      const conversationId = c.req.param('conversationId')
      const limit = parseInt(c.req.query('limit') || '50')
      const before = c.req.query('before') // message ID for pagination

      console.log('💬 Fetching thread for conversation:', conversationId)

      // Guard against fake "new_" conversation IDs from frontend
      if (conversationId.startsWith('new_')) {
        console.log('⚠️  Ignoring request for fake conversation ID:', conversationId)
        return c.json({ messages: [], has_more: false })
      }

      // Verify user is participant in this conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .single()

      if (convError || !conversation) {
        console.error('❌ Unauthorized or conversation not found:', convError)
        return c.json({ error: 'Conversation not found or unauthorized' }, 404)
      }

      // Build query for messages
      let query = supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit)

      // Pagination support
      if (before) {
        const { data: beforeMessage } = await supabase
          .from('messages')
          .select('created_at')
          .eq('id', before)
          .single()
        
        if (beforeMessage) {
          query = query.lt('created_at', beforeMessage.created_at)
        }
      }

      const { data: messages, error: msgError } = await query

      if (msgError) {
        console.error('❌ Error fetching messages:', msgError)
        return c.json({ error: 'Failed to fetch messages', details: msgError.message }, 500)
      }

      console.log('✅ Fetched', messages?.length || 0, 'messages')

      // Reverse to show oldest first
      const orderedMessages = (messages || []).reverse()

      return c.json({
        messages: orderedMessages.map(msg => ({
          id: msg.id,
          conversation_id: msg.conversation_id,
          sender_id: msg.sender_id,
          recipient_id: msg.recipient_id,
          content: msg.content,
          created_at: msg.created_at,
          read_at: msg.read_at,
          deleted: msg.deleted
        })),
        has_more: messages && messages.length === limit
      })
    } catch (error: any) {
      console.error('❌ Error in message thread endpoint:', error)
      return c.json({ error: 'Failed to fetch thread', details: error.message }, 500)
    }
  })

  // ============================================
  // MARK CONVERSATION AS READ
  // ============================================
  app.post('/make-server-053bcd80/messages/mark-read/:conversationId', requireAuth, async (c: any) => {
    try {
      const userId = c.get('userId')
      const conversationId = c.req.param('conversationId')

      console.log('✅ Marking conversation as read:', conversationId)

      // Guard against fake "new_" conversation IDs from frontend
      if (conversationId.startsWith('new_')) {
        console.log('⚠️  Ignoring mark-read for fake conversation ID:', conversationId)
        return c.json({ success: true, marked_count: 0 })
      }

      // Verify user is participant
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .single()

      if (convError || !conversation) {
        return c.json({ error: 'Conversation not found or unauthorized' }, 404)
      }

      // Mark messages as read — try RPC first, fall back to direct UPDATE
      let markedCount = 0
      const { data: rpcCount, error: markError } = await supabase
        .rpc('mark_conversation_as_read', {
          conversation_uuid: conversationId,
          user_uuid: userId
        })

      if (markError) {
        console.warn('⚠️ RPC mark_conversation_as_read unavailable, using direct UPDATE:', markError.message)
        const { error: updateError, count } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .eq('recipient_id', userId)
          .is('read_at', null)
          .eq('deleted', false)
        if (updateError) {
          console.error('❌ Fallback mark-read failed:', updateError)
          return c.json({ error: 'Failed to mark as read', details: updateError.message }, 500)
        }
        markedCount = count || 0
      } else {
        markedCount = rpcCount || 0
      }

      console.log('✅ Marked', markedCount, 'messages as read')

      return c.json({ success: true, marked_count: markedCount })
    } catch (error: any) {
      console.error('❌ Error in mark-read endpoint:', error)
      return c.json({ error: 'Failed to mark as read', details: error.message }, 500)
    }
  })

  // ============================================
  // GET UNREAD COUNT
  // ============================================
  app.get('/make-server-053bcd80/messages/unread-count', requireAuth, async (c: any) => {
    try {
      const userId = c.get('userId')

      console.log('📊 Fetching unread count for user:', userId)

      // Get unread count — try RPC first, fall back to direct COUNT
      const { data: rpcCount, error: rpcError } = await supabase
        .rpc('get_unread_count', { user_uuid: userId })

      if (rpcError) {
        console.warn('⚠️ RPC get_unread_count unavailable, using direct COUNT:', rpcError.message)
        const { count, error: countError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', userId)
          .is('read_at', null)
          .eq('deleted', false)
        if (countError) {
          console.error('❌ Fallback count failed:', countError)
          return c.json({ error: 'Failed to fetch unread count', details: countError.message }, 500)
        }
        console.log('✅ Unread count (fallback):', count || 0)
        return c.json({ unread_count: count || 0 })
      }

      console.log('✅ Unread count:', rpcCount)
      return c.json({ unread_count: rpcCount || 0 })
    } catch (error: any) {
      console.error('❌ Error in unread-count endpoint:', error)
      return c.json({ error: 'Failed to fetch unread count', details: error.message }, 500)
    }
  })

  // ============================================
  // ARCHIVE CONVERSATION
  // ============================================
  app.post('/make-server-053bcd80/messages/conversation/:conversationId/archive', requireAuth, async (c: any) => {
    try {
      const userId = c.get('userId')
      const conversationId = c.req.param('conversationId')

      console.log('📦 Archiving conversation:', conversationId)

      // Verify user is participant
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .single()

      if (convError || !conversation) {
        return c.json({ error: 'Conversation not found or unauthorized' }, 404)
      }

      // Upsert metadata (create or update)
      const { error: metaError } = await supabase
        .from('conversation_metadata')
        .upsert({
          conversation_id: conversationId,
          user_id: userId,
          archived: true
        }, {
          onConflict: 'user_id,conversation_id'
        })

      if (metaError) {
        console.error('❌ Error archiving conversation:', metaError)
        return c.json({ error: 'Failed to archive conversation', details: metaError.message }, 500)
      }

      console.log('✅ Conversation archived')

      return c.json({ success: true })
    } catch (error: any) {
      console.error('❌ Error in archive endpoint:', error)
      return c.json({ error: 'Failed to archive conversation', details: error.message }, 500)
    }
  })

  // ============================================
  // UNARCHIVE CONVERSATION
  // ============================================
  app.post('/make-server-053bcd80/messages/conversation/:conversationId/unarchive', requireAuth, async (c: any) => {
    try {
      const userId = c.get('userId')
      const conversationId = c.req.param('conversationId')

      console.log('📤 Unarchiving conversation:', conversationId)

      // Update metadata
      const { error: metaError } = await supabase
        .from('conversation_metadata')
        .update({ archived: false })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)

      if (metaError) {
        console.error('❌ Error unarchiving conversation:', metaError)
        return c.json({ error: 'Failed to unarchive conversation', details: metaError.message }, 500)
      }

      console.log('✅ Conversation unarchived')

      return c.json({ success: true })
    } catch (error: any) {
      console.error('❌ Error in unarchive endpoint:', error)
      return c.json({ error: 'Failed to unarchive conversation', details: error.message }, 500)
    }
  })

  // ============================================
  // DELETE MESSAGE (SOFT DELETE)
  // ============================================
  app.delete('/make-server-053bcd80/messages/:messageId', requireAuth, async (c: any) => {
    try {
      const userId = c.get('userId')
      const messageId = c.req.param('messageId')

      console.log('🗑️  Deleting message:', messageId)

      // Verify user owns this message
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .eq('sender_id', userId)
        .single()

      if (msgError || !message) {
        return c.json({ error: 'Message not found or unauthorized' }, 404)
      }

      // Soft delete
      const { error: deleteError } = await supabase
        .from('messages')
        .update({ deleted: true })
        .eq('id', messageId)

      if (deleteError) {
        console.error('❌ Error deleting message:', deleteError)
        return c.json({ error: 'Failed to delete message', details: deleteError.message }, 500)
      }

      console.log('✅ Message deleted')

      return c.json({ success: true })
    } catch (error: any) {
      console.error('❌ Error in delete message endpoint:', error)
      return c.json({ error: 'Failed to delete message', details: error.message }, 500)
    }
  })

  // ============================================
  // GET CONVERSATION BY CONTEXT
  // Used by inline messaging to fetch messages for a specific place/context
  // ============================================
  app.get('/make-server-053bcd80/messages/conversation', requireAuth, async (c: any) => {
    try {
      const userId = c.get('userId')
      const contextType = c.req.query('contextType')
      const contextId = c.req.query('contextId')

      console.log('🔍 Fetching conversation by context:', { userId, contextType, contextId })

      if (!contextType || !contextId) {
        return c.json({ error: 'contextType and contextId are required' }, 400)
      }

      // Find conversation with this context
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .eq('context_type', contextType)
        .eq('context_id', contextId)
        .limit(1)

      if (!conversations || conversations.length === 0) {
        console.log('ℹ️  No conversation found for this context')
        return c.json({ messages: [] })
      }

      const conversationId = conversations[0].id

      // Fetch messages for this conversation
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('deleted', false)
        .order('created_at', { ascending: true })
        .limit(100)

      if (msgError) {
        console.error('❌ Error fetching messages:', msgError)
        return c.json({ error: 'Failed to fetch messages', details: msgError.message }, 500)
      }

      // Get sender profiles for message display
      const senderIds = [...new Set(messages?.map(m => m.sender_id) || [])]
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', senderIds)

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])

      // Attach sender info to messages
      const messagesWithSenders = (messages || []).map(msg => {
        const profile = profileMap.get(msg.sender_id)
        return {
          id: msg.id,
          conversation_id: msg.conversation_id,
          sender_id: msg.sender_id,
          content: msg.content,
          created_at: msg.created_at,
          sender: profile ? {
            display_name: profile.display_name,
            avatar_url: profile.avatar_url
          } : null
        }
      })

      console.log('✅ Returning', messagesWithSenders.length, 'messages')

      return c.json({ 
        messages: messagesWithSenders,
        conversationId: conversationId
      })
    } catch (error: any) {
      console.error('❌ Error in conversation by context endpoint:', error)
      return c.json({ error: 'Failed to fetch conversation', details: error.message }, 500)
    }
  })

  console.log('✅ Messaging routes setup complete')
}