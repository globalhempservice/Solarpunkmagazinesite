import { useState, useEffect } from 'react'
import { Building2, MapPin, Globe, Mail, Phone, Calendar, Briefcase, Users, Award, Share2, ArrowLeft, ExternalLink, Shield, Crown, Star, ShoppingBag, FileText, Sparkles, Leaf, CheckCircle2 } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ImageWithFallback } from './figma/ImageWithFallback'

interface OrganizationProfilePageProps {
  companyId: string
  serverUrl: string
  userId?: string
  accessToken?: string
  onClose: () => void
}

interface Company {
  id: string
  name: string
  description: string
  category: any
  is_association: boolean
  logo_url: string | null
  cover_image_url: string | null
  location: string | null
  website: string | null
  contact_email: string | null
  contact_phone: string | null
  founded_year: string | null
  company_size: string | null
  linkedin_url: string | null
  twitter_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  badges: any[]
  owner_id: string
  members: string[]
  is_published: boolean
  created_at: string
  updated_at: string
}

export function OrganizationProfilePage({ companyId, serverUrl, userId, accessToken, onClose }: OrganizationProfilePageProps) {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'about' | 'swag' | 'publications'>('about')

  useEffect(() => {
    fetchCompany()
  }, [companyId])

  const fetchCompany = async () => {
    try {
      const { publicAnonKey } = await import('../utils/supabase/info')
      const response = await fetch(`${serverUrl}/companies/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCompany(data)
      } else {
        console.error('Failed to fetch company:', await response.text())
      }
    } catch (error) {
      console.error('Error fetching company:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBadgeIcon = (iconType: string) => {
    switch (iconType) {
      case 'Shield':
        return Shield
      case 'Crown':
        return Crown
      case 'Star':
        return Star
      default:
        return Award
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950 flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-40 right-20 w-[32rem] h-[32rem] bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Spinner */}
        <div className="relative">
          <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6 inline-block">
            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
            <div className="relative bg-emerald-950/80 p-8 rounded-3xl border-2 border-emerald-500/30">
              <Building2 className="w-16 h-16 mx-auto text-emerald-400/50" />
            </div>
          </div>
          <h2 className="font-black text-2xl text-white mb-3">Organization Not Found</h2>
          <p className="text-emerald-200/60 mb-6 max-w-md mx-auto">
            We couldn't find this organization. It may have been removed or doesn't exist.
          </p>
          <Button 
            onClick={onClose}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black px-8 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950 overflow-auto relative pb-24">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Organic glow orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-[32rem] h-[32rem] bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-green-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Floating hemp leaves - hide on mobile */}
        <div className="hidden md:block absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-5"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `floatLeaf ${15 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            >
              <Leaf className="w-16 h-16 text-emerald-300" style={{
                transform: `rotate(${Math.random() * 360}deg)`
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Header - Sticky with Glassmorphism */}
      <div className="sticky top-0 z-50 border-b-2 border-emerald-500/10">
        {/* Backdrop blur */}
        <div className="absolute inset-0 bg-emerald-950/95 backdrop-blur-2xl" />
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Button 
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 border border-emerald-500/20 hover:border-emerald-400/40 rounded-lg px-3 py-2 transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-black text-sm">Back</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 border border-emerald-500/20 hover:border-emerald-400/40 rounded-lg px-3 py-2 transition-all group"
            >
              <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-black text-sm hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section - Compact on Mobile */}
      <div className="relative h-32 sm:h-48 md:h-64 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 overflow-hidden">
        {company.cover_image_url ? (
          <ImageWithFallback 
            src={company.cover_image_url}
            alt={company.name}
            className="w-full h-full object-cover"
          />
        ) : (
          // Default pattern if no cover image
          <div className="absolute inset-0">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '80px 80px'
            }} />
          </div>
        )}
        
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/60 to-transparent" />
      </div>

      {/* Organization Header Card - Mobile Optimized */}
      <div className="relative -mt-16 sm:-mt-20 md:-mt-24 px-3 sm:px-4 md:px-8 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 rounded-2xl md:rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-all duration-500" />
            
            {/* Main card */}
            <div className="relative bg-gradient-to-br from-emerald-950/98 via-teal-950/98 to-emerald-950/98 backdrop-blur-2xl border-2 border-emerald-400/30 rounded-2xl md:rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-2xl">
              {/* Halftone texture overlay */}
              <div className="absolute inset-0 opacity-5 rounded-2xl md:rounded-[2rem]" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(16,185,129,0.5) 1px, transparent 0)`,
                backgroundSize: '16px 16px'
              }} />
              
              <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4">
                {/* Logo - Smaller on Mobile */}
                <div className="flex-shrink-0 relative group/logo">
                  {/* Logo glow */}
                  <div className="absolute -inset-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl blur-lg opacity-0 group-hover/logo:opacity-50 transition-all duration-500" />
                  
                  {company.logo_url ? (
                    <ImageWithFallback
                      src={company.logo_url}
                      alt={company.name}
                      className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl object-cover border-3 border-emerald-400/40 shadow-2xl group-hover/logo:scale-105 group-hover/logo:border-emerald-400/60 transition-all duration-300"
                    />
                  ) : (
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-green-500 flex items-center justify-center border-3 border-emerald-400/40 shadow-2xl group-hover/logo:scale-105 transition-all duration-300">
                      <Building2 className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" strokeWidth={2.5} />
                    </div>
                  )}
                </div>

                {/* Name & Info */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                    <h1 className="font-black text-2xl sm:text-3xl md:text-4xl text-white leading-tight">
                      {company.name}
                    </h1>
                    {company.is_association && (
                      <Badge className="gap-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 text-amber-200 px-2 py-0.5 shadow-lg shadow-amber-500/10 text-xs">
                        <Shield className="w-3 h-3" />
                        <span className="font-black hidden sm:inline">Association</span>
                      </Badge>
                    )}
                  </div>
                  
                  {/* Info Pills - Compact on Mobile */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-emerald-200/80 mb-3">
                    {company.category && (
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 rounded-lg px-2 py-1 border border-emerald-400/20">
                        <Building2 className="w-3 h-3 text-emerald-400" />
                        <span className="font-black text-xs">
                          {typeof company.category === 'object' ? company.category.name : company.category}
                        </span>
                      </div>
                    )}
                    {company.location && (
                      <div className="flex items-center gap-1.5 bg-teal-500/10 rounded-lg px-2 py-1 border border-teal-400/20">
                        <MapPin className="w-3 h-3 text-teal-400" />
                        <span className="font-black text-xs">{company.location}</span>
                      </div>
                    )}
                    {company.founded_year && (
                      <div className="flex items-center gap-1.5 bg-green-500/10 rounded-lg px-2 py-1 border border-green-400/20">
                        <Calendar className="w-3 h-3 text-green-400" />
                        <span className="font-black text-xs">Est. {company.founded_year}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick stats pills - Smaller on Mobile */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                    {company.members && company.members.length > 0 && (
                      <div className="flex items-center gap-1 bg-purple-500/10 rounded-full px-2 py-0.5 border border-purple-400/20">
                        <Users className="w-3 h-3 text-purple-400" />
                        <span className="text-xs font-black text-purple-200">{company.members.length}</span>
                      </div>
                    )}
                    {company.badges && company.badges.length > 0 && (
                      <div className="flex items-center gap-1 bg-pink-500/10 rounded-full px-2 py-0.5 border border-pink-400/20">
                        <Award className="w-3 h-3 text-pink-400" />
                        <span className="text-xs font-black text-pink-200">{company.badges.length}</span>
                      </div>
                    )}
                    {company.is_published && (
                      <div className="flex items-center gap-1 bg-emerald-500/10 rounded-full px-2 py-0.5 border border-emerald-400/20">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs font-black text-emerald-200">Verified</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Website Button - Full Width on Mobile */}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto group/btn relative overflow-hidden px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border-2 border-emerald-400/30 hover:border-emerald-400/50 text-emerald-200 font-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 text-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-emerald-400/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                    <Globe className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Visit Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 pb-8">
        {/* Tabs - Mobile Optimized */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex gap-1 sm:gap-2 p-1.5 sm:p-2 bg-emerald-950/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border-2 border-emerald-500/20 shadow-2xl w-full sm:w-auto max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab('about')}
              className={`relative px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm transition-all overflow-hidden group whitespace-nowrap flex-1 sm:flex-initial ${
                activeTab === 'about'
                  ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-white border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/20'
                  : 'text-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-900/30 border-2 border-transparent'
              }`}
            >
              {activeTab === 'about' && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-emerald-400/0 animate-pulse" />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                About
              </span>
            </button>
            <button
              onClick={() => setActiveTab('swag')}
              className={`relative px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm transition-all overflow-hidden group whitespace-nowrap flex-1 sm:flex-initial ${
                activeTab === 'swag'
                  ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-white border-2 border-amber-400/50 shadow-lg shadow-amber-500/20'
                  : 'text-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-900/30 border-2 border-transparent'
              }`}
            >
              {activeTab === 'swag' && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/20 to-amber-400/0 animate-pulse" />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Swag Shop</span>
                <span className="sm:hidden">Swag</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('publications')}
              className={`relative px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm transition-all overflow-hidden group whitespace-nowrap flex-1 sm:flex-initial ${
                activeTab === 'publications'
                  ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border-2 border-purple-400/50 shadow-lg shadow-purple-500/20'
                  : 'text-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-900/30 border-2 border-transparent'
              }`}
            >
              {activeTab === 'publications' && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/20 to-purple-400/0 animate-pulse" />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Publications</span>
                <span className="sm:hidden">Pubs</span>
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            {/* About Section */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl sm:rounded-[2rem] blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500" />
              <div className="relative bg-gradient-to-br from-emerald-950/70 via-teal-950/70 to-emerald-950/70 backdrop-blur-xl border-2 border-emerald-400/30 rounded-xl sm:rounded-[2rem] p-5 sm:p-8 md:p-10 shadow-2xl">
                <div className="absolute inset-0 opacity-5 rounded-xl sm:rounded-[2rem]" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(16,185,129,0.5) 1px, transparent 0)`,
                  backgroundSize: '16px 16px'
                }} />
                
                <div className="relative flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-black text-xl sm:text-2xl md:text-3xl text-white mb-1.5 sm:mb-2">About {company.name}</h2>
                    <div className="h-1 w-16 sm:w-20 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
                  </div>
                </div>
                <p className="relative text-emerald-100/90 leading-relaxed text-base sm:text-lg">{company.description}</p>
              </div>
            </div>

            {/* Contact & Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {company.contact_email && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-0 group-hover:opacity-40 transition-all duration-300" />
                  <div className="relative bg-gradient-to-br from-emerald-950/70 via-teal-950/70 to-emerald-950/70 backdrop-blur-xl border-2 border-emerald-400/20 hover:border-emerald-400/40 rounded-xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4 transition-all duration-300 group-hover:scale-[1.02]">
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-400/30 shadow-lg flex-shrink-0">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-emerald-300/60 font-black mb-1 sm:mb-1.5 uppercase tracking-wider">Email</p>
                      <a href={`mailto:${company.contact_email}`} className="text-sm sm:text-base text-emerald-100 hover:text-emerald-300 font-bold break-all transition-colors">
                        {company.contact_email}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {company.contact_phone && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-0 group-hover:opacity-40 transition-all duration-300" />
                  <div className="relative bg-gradient-to-br from-emerald-950/70 via-teal-950/70 to-emerald-950/70 backdrop-blur-xl border-2 border-emerald-400/20 hover:border-emerald-400/40 rounded-xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4 transition-all duration-300 group-hover:scale-[1.02]">
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-400/30 shadow-lg flex-shrink-0">
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-emerald-300/60 font-black mb-1 sm:mb-1.5 uppercase tracking-wider">Phone</p>
                      <a href={`tel:${company.contact_phone}`} className="text-sm sm:text-base text-emerald-100 hover:text-emerald-300 font-bold transition-colors">
                        {company.contact_phone}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {company.company_size && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl blur opacity-0 group-hover:opacity-40 transition-all duration-300" />
                  <div className="relative bg-gradient-to-br from-emerald-950/70 via-teal-950/70 to-emerald-950/70 backdrop-blur-xl border-2 border-emerald-400/20 hover:border-emerald-400/40 rounded-xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4 transition-all duration-300 group-hover:scale-[1.02]">
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-2 border-teal-400/30 shadow-lg flex-shrink-0">
                      <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-emerald-300/60 font-black mb-1 sm:mb-1.5 uppercase tracking-wider">Company Size</p>
                      <p className="text-sm sm:text-base text-emerald-100 font-bold">{company.company_size} employees</p>
                    </div>
                  </div>
                </div>
              )}

              {company.members && company.members.length > 0 && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-40 transition-all duration-300" />
                  <div className="relative bg-gradient-to-br from-emerald-950/70 via-teal-950/70 to-emerald-950/70 backdrop-blur-xl border-2 border-emerald-400/20 hover:border-emerald-400/40 rounded-xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4 transition-all duration-300 group-hover:scale-[1.02]">
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400/30 shadow-lg flex-shrink-0">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-emerald-300/60 font-black mb-1 sm:mb-1.5 uppercase tracking-wider">Team Members</p>
                      <p className="text-sm sm:text-base text-emerald-100 font-bold">{company.members.length} active members</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Association Badges Section */}
            {company.badges && company.badges.length > 0 && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 rounded-xl sm:rounded-[2rem] blur-xl sm:blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-500" />
                <div className="relative bg-gradient-to-br from-purple-950/70 via-pink-950/70 to-purple-950/70 backdrop-blur-xl border-2 border-purple-400/30 rounded-xl sm:rounded-[2rem] p-5 sm:p-8 md:p-10 shadow-2xl">
                  <div className="absolute inset-0 opacity-5 rounded-xl sm:rounded-[2rem]" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(168,85,247,0.5) 1px, transparent 0)`,
                    backgroundSize: '16px 16px'
                  }} />
                  
                  <div className="relative flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
                      <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-black text-xl sm:text-2xl md:text-3xl text-white mb-1.5 sm:mb-2">Association Badges</h2>
                      <div className="h-1 w-16 sm:w-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
                    </div>
                  </div>
                  
                  <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {company.badges.map((badge: any, index: number) => {
                      const BadgeIcon = getBadgeIcon(badge.icon_type || 'Award')
                      return (
                        <div
                          key={index}
                          className="group/badge relative"
                        >
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur opacity-0 group-hover/badge:opacity-60 transition-all duration-300" />
                          <div className="relative bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-sm border-2 border-purple-400/40 hover:border-purple-400/60 rounded-xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4 transition-all duration-300 group-hover/badge:scale-[1.02]">
                            <div className="relative p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl flex-shrink-0">
                              <div className="absolute inset-0 bg-white/20 rounded-lg sm:rounded-xl blur" />
                              <BadgeIcon className="relative w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-black text-base sm:text-lg text-white mb-0.5 sm:mb-1">{badge.association_name}</h3>
                              <p className="text-xs sm:text-sm text-purple-200/80 font-bold mb-1 sm:mb-2">{badge.badge_type}</p>
                              {badge.issued_date && (
                                <p className="text-xs text-purple-300/60 flex items-center gap-1 sm:gap-1.5">
                                  <Calendar className="w-3 h-3" />
                                  Issued {new Date(badge.issued_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Social Links */}
            {(company.linkedin_url || company.twitter_url || company.instagram_url || company.facebook_url) && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl sm:rounded-[2rem] blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500" />
                <div className="relative bg-gradient-to-br from-emerald-950/70 via-teal-950/70 to-emerald-950/70 backdrop-blur-xl border-2 border-emerald-400/30 rounded-xl sm:rounded-[2rem] p-5 sm:p-8 md:p-10 shadow-2xl">
                  <div className="absolute inset-0 opacity-5 rounded-xl sm:rounded-[2rem]" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(16,185,129,0.5) 1px, transparent 0)`,
                    backgroundSize: '16px 16px'
                  }} />
                  
                  <div className="relative flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
                      <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-black text-xl sm:text-2xl md:text-3xl text-white mb-1.5 sm:mb-2">Connect With Us</h2>
                      <div className="h-1 w-16 sm:w-20 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
                    </div>
                  </div>
                  
                  <div className="relative grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4">
                    {company.linkedin_url && (
                      <a
                        href={company.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link relative overflow-hidden px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border-2 border-blue-400/30 hover:border-blue-400/50 text-blue-200 font-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg text-xs sm:text-base"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 translate-x-[-100%] group-hover/link:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative z-10">LinkedIn</span>
                        <ExternalLink className="relative z-10 w-3 h-3 sm:w-4 sm:h-4" />
                      </a>
                    )}
                    {company.twitter_url && (
                      <a
                        href={company.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link relative overflow-hidden px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-sky-500/20 to-sky-600/20 hover:from-sky-500/30 hover:to-sky-600/30 border-2 border-sky-400/30 hover:border-sky-400/50 text-sky-200 font-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg text-xs sm:text-base"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-400/0 via-sky-400/20 to-sky-400/0 translate-x-[-100%] group-hover/link:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative z-10">Twitter</span>
                        <ExternalLink className="relative z-10 w-3 h-3 sm:w-4 sm:h-4" />
                      </a>
                    )}
                    {company.instagram_url && (
                      <a
                        href={company.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link relative overflow-hidden px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 hover:from-pink-500/30 hover:to-fuchsia-500/30 border-2 border-pink-400/30 hover:border-pink-400/50 text-pink-200 font-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg text-xs sm:text-base"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-400/0 via-pink-400/20 to-pink-400/0 translate-x-[-100%] group-hover/link:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative z-10">Instagram</span>
                        <ExternalLink className="relative z-10 w-3 h-3 sm:w-4 sm:h-4" />
                      </a>
                    )}
                    {company.facebook_url && (
                      <a
                        href={company.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link relative overflow-hidden px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-500/20 to-blue-600/20 hover:from-indigo-500/30 hover:to-blue-600/30 border-2 border-indigo-400/30 hover:border-indigo-400/50 text-indigo-200 font-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg text-xs sm:text-base"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-indigo-400/20 to-indigo-400/0 translate-x-[-100%] group-hover/link:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative z-10">Facebook</span>
                        <ExternalLink className="relative z-10 w-3 h-3 sm:w-4 sm:h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'swag' && (
          <div className="animate-fadeIn">
            <div className="relative group max-w-2xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 rounded-xl sm:rounded-[2rem] blur-xl sm:blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-500" />
              <div className="relative bg-gradient-to-br from-amber-950/70 via-yellow-950/70 to-amber-950/70 backdrop-blur-xl border-2 border-amber-400/30 rounded-xl sm:rounded-[2rem] p-8 sm:p-12 md:p-16 text-center shadow-2xl">
                <div className="absolute inset-0 opacity-5 rounded-xl sm:rounded-[2rem]" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(245,158,11,0.5) 1px, transparent 0)`,
                  backgroundSize: '16px 16px'
                }} />
                
                <div className="relative mb-6 inline-block">
                  <div className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full" />
                  <div className="relative p-4 sm:p-6 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl sm:rounded-3xl shadow-2xl">
                    <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                
                <h2 className="font-black text-2xl sm:text-3xl md:text-4xl text-white mb-3 sm:mb-4">Swag Shop Coming Soon</h2>
                <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full mx-auto mb-4 sm:mb-6" />
                <p className="text-amber-100/80 text-base sm:text-lg leading-relaxed max-w-md mx-auto px-4">
                  This organization's exclusive swag shop will be available here. Members will be able to browse and purchase unique hemp merchandise.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'publications' && (
          <div className="animate-fadeIn">
            <div className="relative group max-w-2xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 rounded-xl sm:rounded-[2rem] blur-xl sm:blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-500" />
              <div className="relative bg-gradient-to-br from-purple-950/70 via-pink-950/70 to-purple-950/70 backdrop-blur-xl border-2 border-purple-400/30 rounded-xl sm:rounded-[2rem] p-8 sm:p-12 md:p-16 text-center shadow-2xl">
                <div className="absolute inset-0 opacity-5 rounded-xl sm:rounded-[2rem]" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(168,85,247,0.5) 1px, transparent 0)`,
                  backgroundSize: '16px 16px'
                }} />
                
                <div className="relative mb-6 inline-block">
                  <div className="absolute inset-0 bg-purple-400/20 blur-2xl rounded-full" />
                  <div className="relative p-4 sm:p-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl shadow-2xl">
                    <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                
                <h2 className="font-black text-2xl sm:text-3xl md:text-4xl text-white mb-3 sm:mb-4">Publications Coming Soon</h2>
                <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4 sm:mb-6" />
                <p className="text-purple-100/80 text-base sm:text-lg leading-relaxed max-w-md mx-auto px-4">
                  Articles, RSS feeds, and publications from <span className="font-black text-white">{company.name}</span> will appear here. Stay tuned for industry insights and updates.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes floatLeaf {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.03;
          }
          50% {
            transform: translateY(-80px) translateX(60px) rotate(180deg);
            opacity: 0.08;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}