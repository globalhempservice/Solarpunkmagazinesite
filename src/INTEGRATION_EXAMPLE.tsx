// ========================================
// EXAMPLE: How to integrate HomeAppLauncher into App.tsx
// ========================================
// This is a reference file showing how to use the HomeAppLauncher component
// Copy the relevant parts into your actual /App.tsx file

import { useState, useEffect } from 'react'
import { createClient } from './utils/supabase/client'
import { HomeAppLauncher } from './components/home/HomeAppLauncher'

function App() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [currentView, setCurrentView] = useState('home') // 'home', 'mag', 'swipe', etc.

  // Load user and their data
  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    // Get authenticated user
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    setUser(authUser)

    // Load user profile with gamification data
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    if (profile) {
      setUserData(profile)
    }
  }

  // Calculate next level XP
  const calculateNextLevelXP = (level: number): number => {
    return Math.ceil((100 * Math.pow(level, 1.5)) / 50) * 50
  }

  // Handle app navigation
  const handleAppClick = (appKey: string) => {
    console.log(`User clicked app: ${appKey}`)
    
    // Log app usage
    logAppUsage(appKey)
    
    // Navigate to app
    setCurrentView(appKey)
    
    // Or use React Router:
    // navigate(`/${appKey}`)
  }

  // Log app usage to analytics
  const logAppUsage = async (appKey: string) => {
    if (!user) return

    try {
      await supabase
        .from('app_usage_logs')
        .insert({
          user_id: user.id,
          app_key: appKey,
          session_duration: null
        })
    } catch (error) {
      console.error('Error logging app usage:', error)
    }
  }

  // Show loading state
  if (!user || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  // Render based on current view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation based on current view */}
      {currentView === 'home' && (
        <HomeAppLauncher
          userId={user.id}
          displayName={userData.display_name || 'User'}
          userLevel={userData.user_level || 1}
          currentXP={userData.current_xp || 0}
          nextLevelXP={calculateNextLevelXP(userData.user_level || 1)}
          onAppClick={handleAppClick}
        />
      )}

      {currentView === 'mag' && (
        <div>
          {/* Your MAG component */}
          <button onClick={() => setCurrentView('home')}>← Back to Home</button>
          <h1>MAG - Articles & Stories</h1>
        </div>
      )}

      {currentView === 'swipe' && (
        <div>
          {/* Your SWIPE component */}
          <button onClick={() => setCurrentView('home')}>← Back to Home</button>
          <h1>SWIPE - Discovery</h1>
        </div>
      )}

      {currentView === 'places' && (
        <div>
          {/* Your PLACES component */}
          <button onClick={() => setCurrentView('home')}>← Back to Home</button>
          <h1>PLACES - Hemp Spots</h1>
        </div>
      )}

      {currentView === 'swap' && (
        <div>
          {/* Your SWAP component */}
          <button onClick={() => setCurrentView('home')}>← Back to Home</button>
          <h1>SWAP - Marketplace</h1>
        </div>
      )}

      {currentView === 'forum' && (
        <div>
          {/* Your FORUM component */}
          <button onClick={() => setCurrentView('home')}>← Back to Home</button>
          <h1>FORUM - Community</h1>
        </div>
      )}

      {currentView === 'globe' && (
        <div>
          {/* Your GLOBE component */}
          <button onClick={() => setCurrentView('home')}>← Back to Home</button>
          <h1>GLOBE - Global Network</h1>
        </div>
      )}
    </div>
  )
}

export default App


// ========================================
// EXAMPLE: Award XP from server
// ========================================
// In /supabase/functions/server/index.tsx

/*
import { createClient } from 'jsr:@supabase/supabase-js@2'

// When user publishes an article
app.post('/make-server-053bcd80/articles', async (c) => {
  const userId = c.get('userId') // from auth middleware
  
  // Create article...
  // ...
  
  // Award XP
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )
  
  const { data: xpResult } = await supabase.rpc('award_xp', {
    p_user_id: userId,
    p_xp_amount: 50,
    p_reason: 'Published article',
    p_action_key: 'create_article'
  })
  
  if (xpResult?.leveled_up) {
    console.log(`User leveled up to ${xpResult.new_level}!`)
    // Send push notification, show modal, etc.
  }
  
  return c.json({ 
    success: true,
    xp_awarded: 50,
    leveled_up: xpResult?.leveled_up
  })
})
*/


// ========================================
// EXAMPLE: Update app badge
// ========================================

/*
// When user gets a new forum notification
const updateForumBadge = async (userId: string) => {
  const { data } = await supabase.rpc('update_app_badge', {
    p_user_id: userId,
    p_app_key: 'forum',
    p_increment: 1
  })
  
  console.log(`Forum badge count: ${data}`)
}

// When user views forum
const clearForumBadge = async (userId: string) => {
  await supabase.rpc('clear_app_badge', {
    p_user_id: userId,
    p_app_key: 'forum'
  })
}
*/


// ========================================
// EXAMPLE: Fetch user progress
// ========================================

/*
const fetchUserProgress = async (userId: string) => {
  const { data } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  return {
    level: data.user_level,
    currentXP: data.current_xp,
    nextLevelXP: data.next_level_xp,
    progressPercentage: data.progress_percentage
  }
}
*/


// ========================================
// EXAMPLE: Get XP history
// ========================================

/*
const getXPHistory = async (userId: string, limit = 10) => {
  const { data } = await supabase
    .from('xp_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return data // Array of XP transactions
}
*/


// ========================================
// EXAMPLE: Get app usage stats
// ========================================

/*
const getAppStats = async (userId: string) => {
  const { data } = await supabase
    .from('user_app_stats')
    .select('*')
    .eq('user_id', userId)
    .order('usage_count', { ascending: false })
  
  return data // Array of {app_key, usage_count, total_duration, last_used}
}
*/


// ========================================
// EXAMPLE: Award XP for daily login
// ========================================

/*
const awardDailyLoginXP = async (userId: string) => {
  // Check if user already got daily login XP today
  const today = new Date().toISOString().split('T')[0]
  
  const { data: existingLog } = await supabase
    .from('xp_history')
    .select('*')
    .eq('user_id', userId)
    .eq('action_key', 'daily_login')
    .gte('created_at', `${today}T00:00:00`)
    .single()
  
  if (existingLog) {
    return { success: false, message: 'Already claimed today' }
  }
  
  // Award XP
  const { data } = await supabase.rpc('award_xp', {
    p_user_id: userId,
    p_xp_amount: 10,
    p_reason: 'Daily login bonus',
    p_action_key: 'daily_login'
  })
  
  return { success: true, xp_awarded: 10, leveled_up: data.leveled_up }
}
*/
