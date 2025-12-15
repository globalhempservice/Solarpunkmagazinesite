import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Loader2, Upload, Check } from 'lucide-react'
import { createClient } from '../../utils/supabase/client'
import { Button } from '../ui/button'
import { toast } from 'sonner@2.0.3'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: any
  onProfileUpdated: () => void
}

const ROLE_OPTIONS = [
  { value: 'consumer', label: 'Consumer' },
  { value: 'professional', label: 'Professional' },
  { value: 'founder', label: 'Founder / Entrepreneur' },
  { value: 'designer', label: 'Designer' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'farmer', label: 'Farmer / Cultivator' },
  { value: 'buyer', label: 'Buyer / Procurement' },
  { value: 'other', label: 'Other' }
]

const INTEREST_OPTIONS = [
  { value: 'textiles', label: 'Textiles & Fashion' },
  { value: 'construction', label: 'Construction Materials' },
  { value: 'food', label: 'Food & Nutrition' },
  { value: 'personal_care', label: 'Personal Care & Wellness' },
  { value: 'cultivation', label: 'Cultivation & Farming' },
  { value: 'research', label: 'Research & Education' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'sustainability', label: 'Sustainability' }
]

export function EditProfileModal({ isOpen, onClose, profile, onProfileUpdated }: EditProfileModalProps) {
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Form state
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [city, setCity] = useState('')
  const [professionalBio, setProfessionalBio] = useState('')
  const [lookingFor, setLookingFor] = useState('')
  const [canOffer, setCanOffer] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (profile && isOpen) {
      setDisplayName(profile.display_name || '')
      setBio(profile.bio || '')
      setCountry(profile.country || '')
      setRegion(profile.region || '')
      setCity(profile.city || '')
      setProfessionalBio(profile.professional_bio || '')
      setLookingFor(profile.looking_for || '')
      setCanOffer(profile.can_offer || '')
      setAvatarUrl(profile.avatar_url || null)
      setAvatarPreview(profile.avatar_url || null)
      setSelectedRoles(profile.user_roles?.map((r: any) => r.role) || [])
      setSelectedInterests(profile.user_interests?.map((i: any) => i.interest) || [])
    }
  }, [profile, isOpen])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Avatar must be less than 2MB')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!displayName.trim()) {
      toast.error('Display name is required')
      return
    }

    setSaving(true)
    const supabase = createClient()

    try {
      let finalAvatarUrl = avatarUrl

      // Upload avatar if changed
      if (avatarFile) {
        setUploadingAvatar(true)
        
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${profile.user_id}-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true })

        if (uploadError) {
          console.error('Avatar upload error:', uploadError)
          
          // Provide helpful error message based on error type
          if (uploadError.message.includes('row-level security')) {
            toast.error('Storage not set up. Please run /SETUP_AVATAR_STORAGE.sql in Supabase')
          } else if (uploadError.message.includes('Bucket not found')) {
            toast.error('Avatars bucket missing. Please run /SETUP_AVATAR_STORAGE.sql')
          } else {
            toast.error(`Upload failed: ${uploadError.message}`)
          }
          
          setUploadingAvatar(false)
          setSaving(false)
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        finalAvatarUrl = publicUrl
        setUploadingAvatar(false)
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          display_name: displayName,
          bio: bio || null,
          country: country || null,
          region: region || null,
          city: city || null,
          professional_bio: professionalBio || null,
          looking_for: lookingFor || null,
          can_offer: canOffer || null,
          avatar_url: finalAvatarUrl
        })
        .eq('id', profile.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        toast.error('Failed to update profile')
        setSaving(false)
        return
      }

      // Update roles
      // Delete existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', profile.id)

      // Insert new roles
      if (selectedRoles.length > 0) {
        const rolesToInsert = selectedRoles.map(role => ({
          user_id: profile.id,
          role
        }))

        const { error: rolesError } = await supabase
          .from('user_roles')
          .insert(rolesToInsert)

        if (rolesError) {
          console.error('Roles update error:', rolesError)
        }
      }

      // Update interests
      // Delete existing interests
      await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', profile.id)

      // Insert new interests
      if (selectedInterests.length > 0) {
        const interestsToInsert = selectedInterests.map(interest => ({
          user_id: profile.id,
          interest
        }))

        const { error: interestsError } = await supabase
          .from('user_interests')
          .insert(interestsToInsert)

        if (interestsError) {
          console.error('Interests update error:', interestsError)
        }
      }

      toast.success('Profile updated successfully!')
      onProfileUpdated()
    } catch (err) {
      console.error('Error updating profile:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    )
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-card rounded-2xl shadow-2xl border-2 border-border z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold">Edit Profile</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium mb-3">Profile Picture</label>
                <div className="flex items-center gap-6">
                  {/* Avatar preview */}
                  <div className="relative">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center border-2 border-border">
                        <span className="text-white font-bold text-3xl">
                          {displayName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Upload button */}
                  <div>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Change Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Max 2MB. JPG, PNG, or WebP</p>
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">{bio.length}/500</p>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="US"
                    maxLength={2}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
                  />
                  <p className="text-xs text-muted-foreground mt-1">ISO code (e.g. US, FR)</p>
                </div>
                <div>
                  <label htmlFor="region" className="block text-sm font-medium mb-2">
                    Region / State
                  </label>
                  <input
                    type="text"
                    id="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="California"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="San Francisco"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Roles */}
              <div>
                <label className="block text-sm font-medium mb-3">Roles</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map(role => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => toggleRole(role.value)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all text-left
                        ${selectedRoles.includes(role.value)
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-background hover:border-primary/50'
                        }
                      `}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedRoles.includes(role.value) ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                        {selectedRoles.includes(role.value) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm">{role.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium mb-3">Interests</label>
                <div className="grid grid-cols-2 gap-2">
                  {INTEREST_OPTIONS.map(interest => (
                    <button
                      key={interest.value}
                      type="button"
                      onClick={() => toggleInterest(interest.value)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all text-left
                        ${selectedInterests.includes(interest.value)
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-background hover:border-primary/50'
                        }
                      `}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedInterests.includes(interest.value) ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                        {selectedInterests.includes(interest.value) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm">{interest.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Professional Info (collapsible section) */}
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium mb-2 list-none flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span>Professional Information (Optional)</span>
                  <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="space-y-4 mt-4">
                  <div>
                    <label htmlFor="professionalBio" className="block text-sm font-medium mb-2">
                      Professional Bio
                    </label>
                    <textarea
                      id="professionalBio"
                      value={professionalBio}
                      onChange={(e) => setProfessionalBio(e.target.value)}
                      rows={3}
                      placeholder="Your professional background..."
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="lookingFor" className="block text-sm font-medium mb-2">
                      What I'm Looking For
                    </label>
                    <textarea
                      id="lookingFor"
                      value={lookingFor}
                      onChange={(e) => setLookingFor(e.target.value)}
                      rows={2}
                      placeholder="Products, services, or connections..."
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="canOffer" className="block text-sm font-medium mb-2">
                      What I Can Offer
                    </label>
                    <textarea
                      id="canOffer"
                      value={canOffer}
                      onChange={(e) => setCanOffer(e.target.value)}
                      rows={2}
                      placeholder="Your skills, products, or services..."
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </details>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={saving || uploadingAvatar}
                className="min-w-[120px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}