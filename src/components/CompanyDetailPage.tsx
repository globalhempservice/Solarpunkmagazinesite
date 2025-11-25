import { useState, useEffect } from 'react'
import { 
  Building2, MapPin, Users, Calendar, Globe, Mail, Phone, 
  Award, ExternalLink, Share2, ArrowLeft,
  Linkedin, Twitter, Instagram, Facebook, Edit, Save, X, Sparkles, QrCode
} from 'lucide-react'
import { Button } from './ui/button'
import { publicAnonKey } from '../utils/supabase/info'
import { CompanyShareDialog } from './CompanyShareDialog'

interface CompanyDetailPageProps {
  companyId: string
  serverUrl: string
  userId?: string
  accessToken?: string
  onClose: () => void
}

export function CompanyDetailPage({ companyId, serverUrl, userId, accessToken, onClose }: CompanyDetailPageProps) {
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editedData, setEditedData] = useState<any>({})

  useEffect(() => {
    fetchCompany()
  }, [companyId])

  const fetchCompany = async () => {
    try {
      console.log('🏢 Fetching company details:', companyId)
      const response = await fetch(`${serverUrl}/companies/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      console.log('🏢 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🏢 Company data:', data)
        setCompany(data)
        setEditedData(data)
        setError(null)
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to fetch company:', response.status, errorText)
        setError(`Failed to load company details: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Error fetching company:', error)
      setError('Network error while loading company details')
    } finally {
      setLoading(false)
    }
  }

  const isOwner = userId && company?.owner_id === userId

  // Use custom domain for share links
  const shareUrl = `https://mag.hempin.org?company=${companyId}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenShareDialog = () => {
    console.log('🔗 Opening share dialog for company:', company?.name)
    setShowShareDialog(true)
  }

  const handleSaveChanges = async () => {
    if (!accessToken) return
    
    setSaving(true)
    try {
      const response = await fetch(`${serverUrl}/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editedData.name,
          description: editedData.description,
          website: editedData.website,
          location: editedData.location,
          company_size: editedData.company_size,
          founded_year: editedData.founded_year,
          contact_email: editedData.contact_email,
          contact_phone: editedData.contact_phone,
          linkedin_url: editedData.linkedin_url,
          twitter_url: editedData.twitter_url,
          instagram_url: editedData.instagram_url,
          facebook_url: editedData.facebook_url
        })
      })

      if (response.ok) {
        const updated = await response.json()
        setCompany(updated)
        setEditedData(updated)
        setEditMode(false)
      } else {
        console.error('Failed to update company')
        alert('Failed to save changes. Please try again.')
      }
    } catch (error) {
      console.error('Error updating company:', error)
      alert('Network error while saving changes')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedData(company)
    setEditMode(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-hemp-primary border-t-transparent animate-spin"></div>
          <p className="text-sm md:text-lg font-black uppercase tracking-widest text-white">Loading Organization</p>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <Button 
            onClick={onClose} 
            variant="ghost" 
            className="gap-2 mb-6 text-white bg-black/20 backdrop-blur-sm hover:bg-black/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          
          <div className="text-center py-12 bg-gradient-to-br from-red-950/50 to-red-900/50 backdrop-blur-xl rounded-3xl border-2 border-red-500/30">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-red-400 opacity-50" />
            <h3 className="font-black text-xl md:text-2xl mb-2 text-red-400">
              {error ? 'Error Loading Organization' : 'Organization Not Found'}
            </h3>
            <p className="text-sm text-white/70 mb-6 px-4">
              {error || 'This organization does not exist or has been removed.'}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap px-4">
              <Button 
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/30"
              >
                Go Back
              </Button>
              {error && (
                <Button 
                  onClick={() => {
                    setLoading(true)
                    setError(null)
                    fetchCompany()
                  }}
                  className="bg-gradient-to-r from-hemp-primary to-hemp-secondary text-white"
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const displayData = editMode ? editedData : company

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 relative overflow-hidden pb-20 md:pb-6">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Sticky Mobile-Optimized Navbar */}
      <div className="sticky top-0 z-50 bg-gradient-to-br from-emerald-950/95 via-teal-900/95 to-green-950/95 backdrop-blur-xl border-b-2 border-hemp-primary/50 shadow-2xl shadow-hemp-primary/20">
        <div className="max-w-6xl mx-auto px-3 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Back Button */}
            <Button 
              onClick={onClose} 
              variant="ghost" 
              size="sm"
              className="gap-2 text-white bg-black/20 backdrop-blur-sm hover:bg-black/30 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            {/* Center: Title (hidden on mobile when editing) */}
            <div className={`flex-1 text-center ${editMode ? 'hidden sm:block' : 'block'}`}>
              <h2 className="font-black text-sm md:text-base text-white truncate px-2">
                {displayData.name}
              </h2>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {!editMode && (
                <Button
                  onClick={handleOpenShareDialog}
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-white bg-black/20 backdrop-blur-sm hover:bg-black/30"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden md:inline">Share</span>
                </Button>
              )}

              {isOwner && !editMode && (
                <Button
                  onClick={() => setEditMode(true)}
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 backdrop-blur-xl border-2 border-amber-500/50 hover:border-amber-500 text-white"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}

              {isOwner && editMode && (
                <>
                  <Button
                    onClick={handleCancelEdit}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-white bg-black/20 backdrop-blur-sm hover:bg-black/30"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    size="sm"
                    className="gap-2 bg-gradient-to-r from-hemp-primary to-hemp-secondary hover:from-hemp-primary/90 hover:to-hemp-secondary/90 text-white shadow-lg shadow-hemp-primary/30"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-3 md:px-6 pt-4 md:pt-6 space-y-4 md:space-y-6">
        {/* Premium Business Card */}
        <div className="bg-gradient-to-br from-emerald-950/95 via-teal-900/95 to-green-950/95 backdrop-blur-xl border-2 border-hemp-primary rounded-2xl md:rounded-3xl shadow-2xl shadow-hemp-primary/50 overflow-hidden relative">
          {/* Holographic overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-hemp-primary/5 via-transparent to-amber-500/5 pointer-events-none"></div>
          
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-hemp-primary/30 rounded-tl-2xl md:rounded-tl-3xl"></div>
          <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-hemp-primary/30 rounded-tr-2xl md:rounded-tr-3xl"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-amber-500/30 rounded-bl-2xl md:rounded-bl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-amber-500/30 rounded-br-2xl md:rounded-br-3xl"></div>

          {/* Cover Image */}
          {company.cover_image_url && (
            <div className="h-32 md:h-48 lg:h-64 relative">
              <img
                src={company.cover_image_url}
                alt={company.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 to-transparent"></div>
            </div>
          )}

          {/* Header Section - Business Card Front */}
          <div className="relative bg-gradient-to-r from-hemp-primary via-hemp-secondary to-hemp-primary p-4 md:p-6 lg:p-8">
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50"></div>
            
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
              {/* Logo */}
              <div className="shrink-0">
                {company.logo_url ? (
                  <div className="relative">
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="w-20 h-20 md:w-24 lg:w-32 md:h-24 lg:h-32 rounded-xl md:rounded-2xl object-cover border-4 border-white/30 shadow-2xl"
                    />
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-xl md:rounded-2xl shadow-lg shadow-white/20"></div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-20 h-20 md:w-24 lg:w-32 md:h-24 lg:h-32 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center border-4 border-white/30 shadow-2xl">
                      <Building2 className="w-10 h-10 md:w-12 lg:w-16 md:h-12 lg:h-16 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-xl md:rounded-2xl shadow-lg shadow-amber-500/30"></div>
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 md:mb-3">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white/80" />
                  <span className="text-xs uppercase tracking-widest text-white/90 font-black">
                    Organization Profile
                  </span>
                </div>
                
                {editMode ? (
                  <input
                    type="text"
                    value={editedData.name}
                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                    className="font-black text-2xl md:text-3xl lg:text-4xl text-white drop-shadow-lg bg-white/10 border-2 border-white/30 rounded-xl px-3 md:px-4 py-2 w-full mb-2 md:mb-3"
                  />
                ) : (
                  <h1 className="font-black text-2xl md:text-3xl lg:text-4xl text-white drop-shadow-lg mb-2 md:mb-3 break-words">
                    {displayData.name}
                  </h1>
                )}

                {/* Badges */}
                <div className="flex items-center justify-center sm:justify-start gap-2 md:gap-3 flex-wrap">
                  {displayData.category && (
                    <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs md:text-sm shadow-lg">
                      {typeof displayData.category === 'object' ? displayData.category.name : displayData.category}
                    </div>
                  )}
                  {displayData.is_association && (
                    <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black text-xs md:text-sm shadow-lg">
                      Association
                    </div>
                  )}
                  {isOwner && (
                    <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-white/20 border border-white/40 text-white font-black text-xs md:text-sm shadow-lg">
                      You Own This
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="relative p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
            {/* About Section */}
            <div>
              <h3 className="font-black text-xs md:text-sm uppercase tracking-wider text-hemp-primary mb-3 md:mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-hemp-primary/50 to-transparent"></div>
                <span>About</span>
                <div className="h-px flex-1 bg-gradient-to-l from-hemp-primary/50 to-transparent"></div>
              </h3>
              {editMode ? (
                <textarea
                  value={editedData.description || ''}
                  onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                  rows={4}
                  className="text-sm md:text-base text-white/80 leading-relaxed bg-emerald-900/30 border-2 border-hemp-primary/30 rounded-xl px-3 md:px-4 py-2 md:py-3 w-full"
                  placeholder="Describe your organization..."
                />
              ) : (
                <p className="text-sm md:text-base text-white/80 leading-relaxed">
                  {displayData.description || 'No description provided.'}
                </p>
              )}
            </div>

            {/* Quick Info Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {/* Location */}
              <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-hemp-primary/30 rounded-xl p-3 md:p-4 shadow-lg hover:shadow-hemp-primary/20 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-hemp-primary" />
                  <span className="text-xs uppercase tracking-wider text-hemp-primary/90 font-black">Location</span>
                </div>
                {editMode ? (
                  <input
                    type="text"
                    value={editedData.location || ''}
                    onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                    className="text-sm text-white font-semibold bg-white/10 border border-white/20 rounded-lg px-2 md:px-3 py-1.5 md:py-2 w-full"
                    placeholder="City, Country"
                  />
                ) : (
                  <p className="text-sm md:text-base text-white font-semibold truncate">{displayData.location || 'Not specified'}</p>
                )}
              </div>

              {/* Company Size */}
              <div className="col-span-1 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-hemp-primary/30 rounded-xl p-3 md:p-4 shadow-lg hover:shadow-hemp-primary/20 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-hemp-primary" />
                  <span className="text-xs uppercase tracking-wider text-hemp-primary/90 font-black hidden sm:inline">Team</span>
                </div>
                {editMode ? (
                  <select
                    value={editedData.company_size || ''}
                    onChange={(e) => setEditedData({ ...editedData, company_size: e.target.value })}
                    className="text-sm text-white font-semibold bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 w-full"
                  >
                    <option value="">Select</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="500+">500+</option>
                  </select>
                ) : (
                  <p className="text-sm md:text-base text-white font-semibold">{displayData.company_size || 'N/A'}</p>
                )}
              </div>

              {/* Founded Year */}
              <div className="col-span-1 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-hemp-primary/30 rounded-xl p-3 md:p-4 shadow-lg hover:shadow-hemp-primary/20 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-hemp-primary" />
                  <span className="text-xs uppercase tracking-wider text-hemp-primary/90 font-black hidden sm:inline">Est.</span>
                </div>
                {editMode ? (
                  <input
                    type="number"
                    value={editedData.founded_year || ''}
                    onChange={(e) => setEditedData({ ...editedData, founded_year: parseInt(e.target.value) || null })}
                    className="text-sm text-white font-semibold bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 w-full"
                    placeholder="YYYY"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                ) : (
                  <p className="text-sm md:text-base text-white font-semibold">{displayData.founded_year || 'N/A'}</p>
                )}
              </div>

              {/* Website */}
              <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-hemp-primary/30 rounded-xl p-3 md:p-4 shadow-lg hover:shadow-hemp-primary/20 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 md:w-5 md:h-5 text-hemp-primary" />
                  <span className="text-xs uppercase tracking-wider text-hemp-primary/90 font-black">Website</span>
                </div>
                {editMode ? (
                  <input
                    type="url"
                    value={editedData.website || ''}
                    onChange={(e) => setEditedData({ ...editedData, website: e.target.value })}
                    className="text-sm text-white font-semibold bg-white/10 border border-white/20 rounded-lg px-2 md:px-3 py-1.5 md:py-2 w-full"
                    placeholder="https://..."
                  />
                ) : displayData.website ? (
                  <a
                    href={displayData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm md:text-base text-hemp-primary font-semibold hover:text-hemp-secondary transition-colors flex items-center gap-2"
                  >
                    Visit
                    <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                  </a>
                ) : (
                  <p className="text-sm text-white/50 font-semibold">N/A</p>
                )}
              </div>
            </div>

            {/* Contact Section */}
            <div>
              <h3 className="font-black text-xs md:text-sm uppercase tracking-wider text-amber-400 mb-3 md:mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-amber-500/50 to-transparent"></div>
                <span>Contact</span>
                <div className="h-px flex-1 bg-gradient-to-l from-amber-500/50 to-transparent"></div>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Email */}
                <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-500/30 rounded-xl p-3 md:p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                    <span className="text-xs uppercase tracking-wider text-amber-400/90 font-black">Email</span>
                  </div>
                  {editMode ? (
                    <input
                      type="email"
                      value={editedData.contact_email || ''}
                      onChange={(e) => setEditedData({ ...editedData, contact_email: e.target.value })}
                      className="text-sm text-white font-semibold bg-white/10 border border-white/20 rounded-lg px-2 md:px-3 py-1.5 md:py-2 w-full"
                      placeholder="contact@example.com"
                    />
                  ) : displayData.contact_email ? (
                    <a
                      href={`mailto:${displayData.contact_email}`}
                      className="text-sm md:text-base text-white font-semibold hover:text-amber-400 transition-colors break-all"
                    >
                      {displayData.contact_email}
                    </a>
                  ) : (
                    <p className="text-sm text-white/50 font-semibold">Not specified</p>
                  )}
                </div>

                {/* Phone */}
                <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-500/30 rounded-xl p-3 md:p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                    <span className="text-xs uppercase tracking-wider text-amber-400/90 font-black">Phone</span>
                  </div>
                  {editMode ? (
                    <input
                      type="tel"
                      value={editedData.contact_phone || ''}
                      onChange={(e) => setEditedData({ ...editedData, contact_phone: e.target.value })}
                      className="text-sm text-white font-semibold bg-white/10 border border-white/20 rounded-lg px-2 md:px-3 py-1.5 md:py-2 w-full"
                      placeholder="+1 (555) 000-0000"
                    />
                  ) : displayData.contact_phone ? (
                    <a
                      href={`tel:${displayData.contact_phone}`}
                      className="text-sm md:text-base text-white font-semibold hover:text-amber-400 transition-colors"
                    >
                      {displayData.contact_phone}
                    </a>
                  ) : (
                    <p className="text-sm text-white/50 font-semibold">Not specified</p>
                  )}
                </div>
              </div>
            </div>

            {/* Social Media Icons */}
            <div>
              <h3 className="font-black text-xs md:text-sm uppercase tracking-wider text-hemp-primary mb-3 md:mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-hemp-primary/50 to-transparent"></div>
                <span>Connect</span>
                <div className="h-px flex-1 bg-gradient-to-l from-hemp-primary/50 to-transparent"></div>
              </h3>
              
              {editMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-hemp-primary font-bold mb-1 block">LinkedIn</label>
                    <input
                      type="url"
                      value={editedData.linkedin_url || ''}
                      onChange={(e) => setEditedData({ ...editedData, linkedin_url: e.target.value })}
                      className="text-sm text-white font-semibold bg-white/10 border border-white/20 rounded-lg px-3 py-2 w-full"
                      placeholder="https://linkedin.com/..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-hemp-primary font-bold mb-1 block">Twitter</label>
                    <input
                      type="url"
                      value={editedData.twitter_url || ''}
                      onChange={(e) => setEditedData({ ...editedData, twitter_url: e.target.value })}
                      className="text-sm text-white font-semibold bg-white/10 border border-white/20 rounded-lg px-3 py-2 w-full"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-hemp-primary font-bold mb-1 block">Instagram</label>
                    <input
                      type="url"
                      value={editedData.instagram_url || ''}
                      onChange={(e) => setEditedData({ ...editedData, instagram_url: e.target.value })}
                      className="text-sm text-white font-semibold bg-white/10 border border-white/20 rounded-lg px-3 py-2 w-full"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-hemp-primary font-bold mb-1 block">Facebook</label>
                    <input
                      type="url"
                      value={editedData.facebook_url || ''}
                      onChange={(e) => setEditedData({ ...editedData, facebook_url: e.target.value })}
                      className="text-sm text-white font-semibold bg-white/10 border border-white/20 rounded-lg px-3 py-2 w-full"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  {displayData.linkedin_url && (
                    <a
                      href={displayData.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-hemp-primary/30 hover:border-hemp-primary hover:bg-hemp-primary/20 transition-all shadow-lg hover:shadow-hemp-primary/30 group"
                    >
                      <Linkedin className="w-5 h-5 md:w-6 md:h-6 text-hemp-primary group-hover:text-white transition-colors" />
                    </a>
                  )}
                  {displayData.twitter_url && (
                    <a
                      href={displayData.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-hemp-primary/30 hover:border-hemp-primary hover:bg-hemp-primary/20 transition-all shadow-lg hover:shadow-hemp-primary/30 group"
                    >
                      <Twitter className="w-5 h-5 md:w-6 md:h-6 text-hemp-primary group-hover:text-white transition-colors" />
                    </a>
                  )}
                  {displayData.instagram_url && (
                    <a
                      href={displayData.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-hemp-primary/30 hover:border-hemp-primary hover:bg-hemp-primary/20 transition-all shadow-lg hover:shadow-hemp-primary/30 group"
                    >
                      <Instagram className="w-5 h-5 md:w-6 md:h-6 text-hemp-primary group-hover:text-white transition-colors" />
                    </a>
                  )}
                  {displayData.facebook_url && (
                    <a
                      href={displayData.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-hemp-primary/30 hover:border-hemp-primary hover:bg-hemp-primary/20 transition-all shadow-lg hover:shadow-hemp-primary/30 group"
                    >
                      <Facebook className="w-5 h-5 md:w-6 md:h-6 text-hemp-primary group-hover:text-white transition-colors" />
                    </a>
                  )}
                  {!displayData.linkedin_url && !displayData.twitter_url && !displayData.instagram_url && !displayData.facebook_url && (
                    <p className="text-sm text-white/50">No social media links provided</p>
                  )}
                </div>
              )}
            </div>

            {/* Badges Section */}
            {displayData.badges && displayData.badges.length > 0 && (
              <div>
                <h3 className="font-black text-xs md:text-sm uppercase tracking-wider text-amber-400 mb-3 md:mb-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-amber-500/50 to-transparent"></div>
                  <span>Verified Badges</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-amber-500/50 to-transparent"></div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {displayData.badges.map((badge: any) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-3 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-500/30 rounded-xl px-3 md:px-4 py-3 backdrop-blur-sm shadow-lg hover:shadow-amber-500/20 transition-all"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shrink-0 shadow-lg">
                        <Award className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm md:text-base text-white">{badge.badge_type}</div>
                        {badge.issued_date && (
                          <div className="text-xs text-amber-300/60">
                            {new Date(badge.issued_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share Footer on Mobile */}
            {!editMode && (
              <div className="md:hidden pt-4 border-t border-hemp-primary/30">
                <Button
                  onClick={handleOpenShareDialog}
                  className="w-full gap-2 bg-gradient-to-r from-hemp-primary/20 to-hemp-secondary/20 hover:from-hemp-primary/30 hover:to-hemp-secondary/30 border-2 border-hemp-primary/50 hover:border-hemp-primary text-white shadow-lg"
                >
                  <QrCode className="w-5 h-5" />
                  <span className="font-black uppercase tracking-wider">Share Business Card</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <CompanyShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        shareUrl={shareUrl}
        companyName={company.name}
        companyLogo={company.logo_url}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}