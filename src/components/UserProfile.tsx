import { useEffect, useState } from 'react'
import { createClient } from '../utils/supabase/client'
import { ProfileHeader } from './profile/ProfileHeader'
import { ProfileStats } from './profile/ProfileStats'
import { ProfileTabs } from './profile/ProfileTabs'
import { EditProfileModal } from './profile/EditProfileModal'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface UserProfileProps {
  userId?: string // Optional: if not provided, shows current user's profile
  onClose?: () => void // Optional: for modal/drawer usage
}

export function UserProfile({ userId: propUserId, onClose }: UserProfileProps) {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [userProgress, setUserProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [propUserId])

  async function loadProfile() {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Starting profile load...')

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ Not authenticated')
        setError('Not authenticated')
        setLoading(false)
        return
      }

      console.log('✅ Authenticated user:', user.id)
      setCurrentUserId(user.id)

      // Determine which profile to load
      const profileIdToLoad = propUserId || user.id
      setIsOwnProfile(profileIdToLoad === user.id)

      console.log('🔍 Loading profile for user_id:', profileIdToLoad)

      // Fetch profile with roles and interests
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles (role),
          user_interests (interest)
        `)
        .eq('user_id', profileIdToLoad)
        .single()

      console.log('📊 Profile query result:', { profileData, profileError })

      if (profileError) {
        console.error('❌ Error loading profile:', profileError)
        console.error('Profile error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        })
        
        // If no profile exists, this might be a new user
        if (profileError.code === 'PGRST116') {
          setError('Profile not set up yet. Please run the SQL script in /RUN_THIS_NOW.sql')
        } else {
          setError(`Failed to load profile: ${profileError.message}`)
        }
        return
      }

      if (!profileData) {
        console.warn('⚠️ No profile data returned for user:', profileIdToLoad)
        setError('Profile not found. Please run the SQL script in /RUN_THIS_NOW.sql')
        return
      }

      console.log('✅ Profile loaded successfully:', profileData)
      setProfile(profileData)

      // Fetch user progress (optional - might not exist for new users)
      console.log('🔍 Loading user progress...')
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', profileIdToLoad)
        .single()

      if (progressError) {
        if (progressError.code === 'PGRST116') {
          // No progress yet - this is ok for new users
          console.log('ℹ️ No user progress yet (new user)')
          setUserProgress(null)
        } else {
          console.error('❌ Error loading user progress:', progressError)
        }
      } else {
        console.log('✅ User progress loaded:', progressData)
        setUserProgress(progressData)
      }
    } catch (err) {
      console.error('❌ Error in loadProfile:', err)
      setError('An unexpected error occurred. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdated = () => {
    setEditModalOpen(false)
    loadProfile() // Reload profile data
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground mb-6">{error || 'This profile does not exist.'}</p>
          {onClose && (
            <Button onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEditClick={() => setEditModalOpen(true)}
        userProgress={userProgress}
      />

      {/* Profile Stats */}
      <ProfileStats 
        profile={profile} 
        userProgress={userProgress}
        swapsCompleted={0}
      />

      {/* Profile Tabs */}
      <ProfileTabs 
        isOwnProfile={isOwnProfile}
        userProgress={userProgress}
        profile={profile}
      />

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          profile={profile}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  )
}