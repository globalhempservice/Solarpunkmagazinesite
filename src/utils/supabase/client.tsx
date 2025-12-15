import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (!supabaseInstance) {
    const supabaseUrl = `https://${projectId}.supabase.co`
    supabaseInstance = createSupabaseClient(supabaseUrl, publicAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'dewii-auth-token',
      }
    })

    // Handle refresh token errors gracefully
    supabaseInstance.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully')
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
      } else if (event === 'USER_UPDATED') {
        console.log('User updated')
      }
    })

    // Clear invalid sessions on startup
    supabaseInstance.auth.getSession().catch((error) => {
      if (error?.message?.includes('Invalid Refresh Token') || 
          error?.message?.includes('Refresh Token Not Found')) {
        console.warn('Invalid refresh token detected, clearing session...')
        supabaseInstance?.auth.signOut({ scope: 'local' })
        localStorage.removeItem('dewii-auth-token')
      }
    })
  }
  return supabaseInstance
}