/**
 * Utility to clear authentication session
 * Use this if you encounter refresh token errors
 */

export function clearAuthSession() {
  try {
    // Clear all auth-related items from localStorage
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.includes('auth') || 
        key.includes('token') || 
        key.includes('supabase') ||
        key.includes('dewii')
      )) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`Cleared: ${key}`)
    })
    
    console.log('✅ Auth session cleared successfully')
    console.log('ℹ️ Please refresh the page to log in again')
    
    return true
  } catch (error) {
    console.error('Error clearing auth session:', error)
    return false
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearAuthSession = clearAuthSession
}
