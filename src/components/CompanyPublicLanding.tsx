import { useState, useEffect } from 'react'
import { 
  Building2, MapPin, Users, Calendar, Globe, Mail, Phone, 
  Award, ExternalLink, Sparkles, Lock, LogIn, UserPlus,
  Linkedin, Twitter, Instagram, Facebook, Eye
} from 'lucide-react'
import { Button } from './ui/button'
import { publicAnonKey } from '../utils/supabase/info'

interface CompanyPublicLandingProps {
  companyId: string
  serverUrl: string
  onSignUp: () => void
  onSignIn: () => void
}

export function CompanyPublicLanding({ companyId, serverUrl, onSignUp, onSignIn }: CompanyPublicLandingProps) {
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCompany()
  }, [companyId])

  const fetchCompany = async () => {
    try {
      const response = await fetch(`${serverUrl}/companies/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCompany(data)
        setError(null)
      } else {
        setError('Failed to load company')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-hemp-primary border-t-transparent animate-spin"></div>
          <p className="text-sm md:text-lg font-black uppercase tracking-widest text-white">Loading</p>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-red-400 opacity-50" />
          <h3 className="font-black text-2xl mb-2 text-red-400">Organization Not Found</h3>
          <p className="text-sm text-white/70 mb-6">This organization may have been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(150)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Top CTA Bar */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-hemp-primary via-hemp-secondary to-hemp-primary backdrop-blur-xl border-b-2 border-amber-500/50 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-xs md:text-sm font-black uppercase tracking-wider text-white">
                Hemp'in Network
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onSignIn}
                variant="ghost"
                size="sm"
                className="gap-2 text-white hover:bg-white/20"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
              <Button
                onClick={onSignUp}
                size="sm"
                className="gap-2 bg-white hover:bg-white/90 text-emerald-950 font-black shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                <span>Join Free</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 md:py-12">
        {/* Hero Business Card */}
        <div className="mb-8 md:mb-12 bg-gradient-to-br from-emerald-950/95 via-teal-900/95 to-green-950/95 backdrop-blur-xl border-2 border-hemp-primary rounded-3xl shadow-2xl shadow-hemp-primary/50 overflow-hidden relative">
          {/* Holographic overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-hemp-primary/5 via-transparent to-amber-500/5 pointer-events-none"></div>
          
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-hemp-primary/30 rounded-tl-3xl"></div>
          <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-hemp-primary/30 rounded-tr-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-amber-500/30 rounded-bl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-amber-500/30 rounded-br-3xl"></div>

          {/* Header */}
          <div className="relative bg-gradient-to-r from-hemp-primary via-hemp-secondary to-hemp-primary p-6 md:p-8 lg:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50"></div>
            
            <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              {/* Logo */}
              {company.logo_url ? (
                <div className="relative shrink-0">
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-24 h-24 md:w-32 lg:w-40 md:h-32 lg:h-40 rounded-2xl object-cover border-4 border-white/30 shadow-2xl"
                  />
                  <div className="absolute inset-0 rounded-2xl shadow-lg shadow-white/20"></div>
                </div>
              ) : (
                <div className="relative shrink-0">
                  <div className="w-24 h-24 md:w-32 lg:w-40 md:h-32 lg:h-40 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center border-4 border-white/30 shadow-2xl">
                    <Building2 className="w-12 h-12 md:w-16 lg:w-20 md:h-16 lg:h-20 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl shadow-lg shadow-amber-500/30"></div>
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <Eye className="w-5 h-5 text-white/80" />
                  <span className="text-xs uppercase tracking-widest text-white/90 font-black">
                    Public Preview
                  </span>
                </div>
                
                <h1 className="font-black text-3xl md:text-4xl lg:text-5xl text-white drop-shadow-lg mb-4">
                  {company.name}
                </h1>

                {/* Badges */}
                <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                  {company.category && (
                    <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-sm shadow-lg">
                      {typeof company.category === 'object' ? company.category.name : company.category}
                    </div>
                  )}
                  {company.is_association && (
                    <div className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black text-sm shadow-lg">
                      Association
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Public Info */}
          <div className="relative p-6 md:p-8 lg:p-12 space-y-8">
            {/* About */}
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider text-hemp-primary mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-hemp-primary/50 to-transparent"></div>
                <span>About</span>
                <div className="h-px flex-1 bg-gradient-to-l from-hemp-primary/50 to-transparent"></div>
              </h3>
              <p className="text-base md:text-lg text-white/80 leading-relaxed">
                {company.description || 'This organization is part of the Hemp\'in Network.'}
              </p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {company.location && (
                <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-hemp-primary/30 rounded-xl p-4 text-center">
                  <MapPin className="w-6 h-6 text-hemp-primary mx-auto mb-2" />
                  <p className="text-xs uppercase text-hemp-primary/90 font-black mb-1">Location</p>
                  <p className="text-sm text-white font-semibold">{company.location}</p>
                </div>
              )}
              {company.company_size && (
                <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-hemp-primary/30 rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 text-hemp-primary mx-auto mb-2" />
                  <p className="text-xs uppercase text-hemp-primary/90 font-black mb-1">Team Size</p>
                  <p className="text-sm text-white font-semibold">{company.company_size}</p>
                </div>
              )}
              {company.founded_year && (
                <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-hemp-primary/30 rounded-xl p-4 text-center">
                  <Calendar className="w-6 h-6 text-hemp-primary mx-auto mb-2" />
                  <p className="text-xs uppercase text-hemp-primary/90 font-black mb-1">Founded</p>
                  <p className="text-sm text-white font-semibold">{company.founded_year}</p>
                </div>
              )}
              {company.website && (
                <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-hemp-primary/30 rounded-xl p-4 text-center">
                  <Globe className="w-6 h-6 text-hemp-primary mx-auto mb-2" />
                  <p className="text-xs uppercase text-hemp-primary/90 font-black mb-1">Website</p>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-hemp-primary font-semibold hover:text-hemp-secondary transition-colors"
                  >
                    Visit
                  </a>
                </div>
              )}
            </div>

            {/* Badges */}
            {company.badges && company.badges.length > 0 && (
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-amber-500/50 to-transparent"></div>
                  <span>Verified Badges</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-amber-500/50 to-transparent"></div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {company.badges.slice(0, 4).map((badge: any) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-3 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-500/30 rounded-xl px-4 py-3 shadow-lg"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shrink-0 shadow-lg">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white">{badge.badge_type}</div>
                        <div className="text-xs text-amber-300/60">Verified</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Locked Content Teaser */}
        <div className="mb-8 bg-gradient-to-br from-purple-950/80 to-pink-950/80 backdrop-blur-xl border-2 border-purple-500/50 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10"></div>
          
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg">
              <Lock className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            
            <h2 className="font-black text-2xl md:text-3xl text-white mb-3">
              Want to See More?
            </h2>
            <p className="text-base md:text-lg text-white/80 mb-6 max-w-2xl mx-auto">
              Join the Hemp'in Network to unlock full contact details, exclusive member connections, verified reviews, and direct messaging with organizations.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={onSignUp}
                size="lg"
                className="gap-3 bg-gradient-to-r from-hemp-primary to-hemp-secondary hover:from-hemp-primary/90 hover:to-hemp-secondary/90 text-white font-black text-lg px-8 py-6 shadow-2xl shadow-hemp-primary/50"
              >
                <UserPlus className="w-5 h-5" />
                Create Free Account
              </Button>
              <Button
                onClick={onSignIn}
                size="lg"
                variant="outline"
                className="gap-3 bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 font-black text-lg px-8 py-6"
              >
                <LogIn className="w-5 h-5" />
                I Have an Account
              </Button>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-hemp-primary/30 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-hemp-primary/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-hemp-primary" />
            </div>
            <h3 className="font-black text-white mb-2">Direct Contact</h3>
            <p className="text-sm text-white/70">Access email, phone, and social links</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-hemp-primary/30 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-hemp-primary/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-hemp-primary" />
            </div>
            <h3 className="font-black text-white mb-2">Network Access</h3>
            <p className="text-sm text-white/70">Connect with verified organizations</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-hemp-primary/30 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-hemp-primary/20 flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-hemp-primary" />
            </div>
            <h3 className="font-black text-white mb-2">Verified Profiles</h3>
            <p className="text-sm text-white/70">See badges, reviews, and ratings</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white/50 text-sm">
          <p>© 2024 Hemp'in Network. A sustainable future starts here. 🌱</p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
