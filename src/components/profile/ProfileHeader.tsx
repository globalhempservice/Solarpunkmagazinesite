import { useState } from 'react'
import { Edit2, MapPin, CheckCircle, Plug } from 'lucide-react'
import { Button } from '../ui/button'
import { TrustScoreBadge } from './TrustScoreBadge'
import { RolePill } from './RolePill'
import { CountryFlag, getCountryName } from './CountryFlag'

interface ProfileHeaderProps {
  profile: {
    id?: string
    user_id?: string
    display_name?: string | null
    avatar_url?: string | null
    banner_url?: string | null
    bio?: string | null
    city?: string | null
    region?: string | null
    country?: string | null
    trust_score?: number
    id_verified?: boolean
    phone_verified?: boolean
    user_roles?: Array<{ role: string }>
  }
  isOwnProfile: boolean
  onEditClick?: () => void
  onPluginStoreClick?: () => void
  userProgress?: {
    profileBannerUrl?: string | null
  } | null
}

export function ProfileHeader({ profile, isOwnProfile, onEditClick, onPluginStoreClick, userProgress }: ProfileHeaderProps) {
  // Generate default banner gradient if no banner_url
  const defaultBanner = 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)'
  
  // Priority: user_progress.profileBannerUrl (shop plugin) > user_profiles.banner_url > default gradient
  const bannerUrl = userProgress?.profileBannerUrl || profile.banner_url
  
  // Safe defaults
  const displayName = profile.display_name || 'Anonymous User'
  const trustScore = profile.trust_score ?? 0
  const idVerified = profile.id_verified ?? false

  return (
    <div className="relative">
      {/* Banner */}
      <div 
        className="h-48 md:h-64 relative overflow-hidden"
        style={{
          background: bannerUrl ? `url(${bannerUrl})` : defaultBanner,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
      </div>

      {/* Profile content */}
      <div className="relative px-4 md:px-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-20">
          {/* Avatar */}
          <div className="relative group">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background shadow-2xl object-cover"
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center border-4 border-background shadow-2xl">
                <span className="text-white font-bold text-5xl md:text-6xl">
                  {profile.display_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}

            {/* Verified badge overlay */}
            {idVerified && (
              <div className="absolute bottom-2 right-2 w-10 h-10 bg-cyan-500 rounded-full border-4 border-background shadow-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" fill="currentColor" />
              </div>
            )}
          </div>

          {/* Info section */}
          <div className="flex-1 md:mb-6">
            {/* Name and edit button */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-1">{displayName}</h1>
                
                {/* Location */}
                {(profile.city || profile.country) && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="flex items-center gap-2">
                      {profile.city && <span>{profile.city}</span>}
                      {profile.city && profile.country && <span>,</span>}
                      {profile.country && (
                        <>
                          <CountryFlag countryCode={profile.country} size="sm" />
                          <span>{getCountryName(profile.country)}</span>
                        </>
                      )}
                    </span>
                  </div>
                )}

                {/* Roles */}
                {profile.user_roles && profile.user_roles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profile.user_roles.map((userRole) => (
                      <RolePill key={userRole.role} role={userRole.role} />
                    ))}
                  </div>
                )}

                {/* Trust Score */}
                <div className="mt-3">
                  <TrustScoreBadge score={trustScore} size="md" />
                </div>
              </div>

              {/* Edit button (only for own profile) */}
              {isOwnProfile && (
                <div className="flex gap-2">
                  <Button
                    onClick={onEditClick}
                    className="shrink-0"
                    variant="outline"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    onClick={onPluginStoreClick}
                    className="shrink-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 hover:from-blue-600 hover:via-indigo-600 hover:to-violet-600 text-white border-0"
                  >
                    <Plug className="w-4 h-4 mr-2" />
                    Plugin Store
                  </Button>
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mt-4 p-4 bg-card/50 border border-border/50 rounded-xl">
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}