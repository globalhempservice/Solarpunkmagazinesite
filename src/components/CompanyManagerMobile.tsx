import { useState, useEffect } from 'react'
import { Building2, Plus, Eye, Share2, FileText, Award, Users, Settings, ChevronRight, Shield, MapPin, Globe, Mail, Phone, Calendar, Briefcase, EyeOff, ArrowLeft, ShoppingBag, BookOpen } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { motion, AnimatePresence, PanInfo } from 'motion/react'
import { SwagManagementTab } from './SwagManagementTab'

interface Company {
  id: string
  name: string
  description: string
  categoryId: string
  isAssociation: boolean
  logo: string | null
  coverImage: string | null
  location: string | null
  website: string | null
  email: string | null
  phone: string | null
  founded: string | null
  companySize: string | null
  socialLinks: any
  badges: any[]
  badgeRequests: any[]
  ownerId: string
  members: string[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface CompanyManagerMobileProps {
  userId: string
  accessToken: string
  serverUrl: string
  onClose: () => void
}

type NavigationState = 
  | { level: 1 }
  | { level: 2, companyId: string }
  | { level: 3, companyId: string, view: 'overview' | 'profile' | 'swag' | 'publications' | 'badges' | 'members' }

export function CompanyManagerMobile({ userId, accessToken, serverUrl, onClose }: CompanyManagerMobileProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [navigation, setNavigation] = useState<NavigationState>({ level: 1 })
  const [publishingIds, setPublishingIds] = useState<Set<string>>(new Set())
  const [dragDirection, setDragDirection] = useState(0)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${serverUrl}/companies/my`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        const transformedCompanies = data.map((company: any) => ({
          id: company.id,
          name: company.name,
          description: company.description,
          categoryId: company.category?.name || '',
          isAssociation: company.is_association || false,
          logo: company.logo_url,
          coverImage: company.cover_image_url,
          location: company.location,
          website: company.website,
          email: company.contact_email,
          phone: company.contact_phone,
          founded: company.founded_year,
          companySize: company.company_size,
          socialLinks: {
            linkedin: company.linkedin_url,
            twitter: company.twitter_url,
            instagram: company.instagram_url,
            facebook: company.facebook_url
          },
          badges: company.badges || [],
          badgeRequests: [],
          ownerId: company.owner_id,
          members: company.members || [],
          isPublished: company.is_published || false,
          createdAt: company.created_at,
          updatedAt: company.updated_at
        }))
        setCompanies(transformedCompanies)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublish = async (company: Company) => {
    setPublishingIds(prev => new Set(prev.add(company.id)))
    try {
      const response = await fetch(`${serverUrl}/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ is_published: !company.isPublished })
      })

      if (response.ok) {
        await fetchCompanies()
      }
    } catch (error) {
      console.error('Error toggling publish status:', error)
    } finally {
      setPublishingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(company.id)
        return newSet
      })
    }
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 100
    if (info.offset.x > swipeThreshold) {
      // Swipe right - go back
      handleBack()
    }
  }

  const handleBack = () => {
    if (navigation.level === 3) {
      setNavigation({ level: 2, companyId: navigation.companyId })
    } else if (navigation.level === 2) {
      setNavigation({ level: 1 })
    }
  }

  const getSelectedCompany = () => {
    if (navigation.level === 1) return null
    return companies.find(c => c.id === navigation.companyId) || null
  }

  const selectedCompany = getSelectedCompany()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950">
        <div className="w-12 h-12 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950 overflow-hidden">
      {/* Level 1: Organization List */}
      <AnimatePresence mode="wait">
        {navigation.level === 1 && (
          <motion.div
            key="level-1"
            initial={{ x: dragDirection < 0 ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: dragDirection < 0 ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="h-full flex flex-col"
          >
            <div className="p-4 border-b-2 border-emerald-500/20 bg-emerald-950/30 backdrop-blur-sm">
              <h2 className="font-black text-lg text-white">Your Organizations</h2>
              <p className="text-xs text-emerald-200/60">Select to manage</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {companies.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-emerald-400/50" />
                  <p className="text-sm text-emerald-200/60 mb-4">No organizations yet</p>
                </div>
              ) : (
                companies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => {
                      setDragDirection(-1)
                      setNavigation({ level: 2, companyId: company.id })
                    }}
                    className="w-full text-left p-4 rounded-xl bg-emerald-900/20 hover:bg-emerald-900/40 border-2 border-emerald-500/10 active:bg-emerald-900/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-12 h-12 rounded-lg object-cover border-2 border-emerald-400/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center border-2 border-emerald-400/30">
                          <Building2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-black text-sm truncate text-white">{company.name}</h3>
                          {company.isAssociation && (
                            <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {company.isPublished ? (
                            <Badge className="text-xs bg-emerald-500 border-emerald-400/50">
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                Live
                              </div>
                            </Badge>
                          ) : (
                            <Badge className="text-xs border-amber-500/50 text-amber-400 bg-amber-500/10">
                              Draft
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-emerald-400/50 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </button>
                ))
              )}
              
              {/* Add New Organization Button */}
              <button
                onClick={() => {/* TODO: Navigate to create */}}
                className="w-full p-4 rounded-xl border-2 border-dashed border-emerald-500/30 active:border-emerald-500/50 bg-emerald-900/10 active:bg-emerald-900/20 transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
                  <span className="font-black text-sm text-emerald-300">Add Organization</span>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* Level 2: Organization Menu */}
        {navigation.level >= 2 && selectedCompany && navigation.level === 2 && (
          <motion.div
            key="level-2"
            initial={{ x: dragDirection < 0 ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: dragDirection < 0 ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="h-full flex flex-col"
          >
            <div className="p-4 border-b-2 border-emerald-500/20 bg-emerald-950/30 backdrop-blur-sm">
              <button
                onClick={() => {
                  setDragDirection(1)
                  setNavigation({ level: 1 })
                }}
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-3 font-bold group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm">Back</span>
              </button>
              <div className="flex items-center gap-3">
                {selectedCompany.logo ? (
                  <img src={selectedCompany.logo} alt="" className="w-10 h-10 rounded-lg object-cover border-2 border-emerald-400/30" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center border-2 border-emerald-400/30">
                    <Building2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                )}
                <div>
                  <h2 className="font-black text-white">{selectedCompany.name}</h2>
                  <p className="text-xs text-emerald-200/60">{selectedCompany.categoryId}</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <MenuItem
                icon={FileText}
                label="Overview"
                onClick={() => {
                  setDragDirection(-1)
                  setNavigation({ level: 3, companyId: selectedCompany.id, view: 'overview' })
                }}
              />
              <MenuItem
                icon={Settings}
                label="Profile"
                onClick={() => {
                  setDragDirection(-1)
                  setNavigation({ level: 3, companyId: selectedCompany.id, view: 'profile' })
                }}
              />
              <MenuItem
                icon={ShoppingBag}
                label="Swag Shop"
                onClick={() => {
                  setDragDirection(-1)
                  setNavigation({ level: 3, companyId: selectedCompany.id, view: 'swag' })
                }}
              />
              <MenuItem
                icon={BookOpen}
                label="Publications"
                onClick={() => {
                  setDragDirection(-1)
                  setNavigation({ level: 3, companyId: selectedCompany.id, view: 'publications' })
                }}
              />
              <MenuItem
                icon={Award}
                label="Badges"
                badge={selectedCompany.badgeRequests?.length || 0}
                onClick={() => {
                  setDragDirection(-1)
                  setNavigation({ level: 3, companyId: selectedCompany.id, view: 'badges' })
                }}
              />
              <MenuItem
                icon={Users}
                label="Members"
                badge={selectedCompany.members?.length || 0}
                onClick={() => {
                  setDragDirection(-1)
                  setNavigation({ level: 3, companyId: selectedCompany.id, view: 'members' })
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Level 3: Detail Content */}
        {navigation.level === 3 && selectedCompany && (
          <motion.div
            key="level-3"
            initial={{ x: dragDirection < 0 ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: dragDirection < 0 ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="h-full flex flex-col"
          >
            <div className="p-4 border-b-2 border-emerald-500/20 bg-emerald-950/30 backdrop-blur-sm">
              <button
                onClick={() => {
                  setDragDirection(1)
                  setNavigation({ level: 2, companyId: selectedCompany.id })
                }}
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm">Back</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {navigation.view === 'overview' && <OverviewView company={selectedCompany} />}
              {navigation.view === 'profile' && (
                <ProfileView 
                  company={selectedCompany}
                  userId={userId}
                  accessToken={accessToken}
                  serverUrl={serverUrl}
                  onUpdate={fetchCompanies}
                />
              )}
              {navigation.view === 'swag' && (
                <SwagManagementTab
                  companyId={selectedCompany.id}
                  accessToken={accessToken}
                  serverUrl={serverUrl}
                />
              )}
              {navigation.view === 'publications' && <PublicationsView company={selectedCompany} />}
              {navigation.view === 'badges' && <BadgesView company={selectedCompany} />}
              {navigation.view === 'members' && <MembersView company={selectedCompany} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Menu Item Component
interface MenuItemProps {
  icon: any
  label: string
  badge?: number
  onClick: () => void
}

function MenuItem({ icon: Icon, label, badge, onClick }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-emerald-900/30 active:bg-emerald-900/50 border-2 border-transparent transition-all group"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
        <span className="font-black text-sm text-white">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge !== undefined && badge > 0 && (
          <Badge className="text-xs bg-purple-500/20 border-purple-400/50 text-purple-300">
            {badge}
          </Badge>
        )}
        <ChevronRight className="w-4 h-4 text-emerald-400/50 group-hover:text-emerald-400 transition-colors" />
      </div>
    </button>
  )
}

// Detail View Components
function OverviewView({ company }: { company: Company }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-black text-2xl text-white mb-1">Overview</h2>
        <p className="text-sm text-emerald-200/70">Company information and details</p>
      </div>
      
      <div>
        <h3 className="font-black text-sm uppercase tracking-wide text-emerald-300 mb-3">About</h3>
        <p className="text-sm leading-relaxed text-emerald-100/80">{company.description}</p>
      </div>

      <div className="space-y-4">
        {company.location && (
          <DetailCard icon={MapPin} label="Location" value={company.location} />
        )}
        {company.website && (
          <DetailCard icon={Globe} label="Website" value={company.website} link />
        )}
        {company.email && (
          <DetailCard icon={Mail} label="Email" value={company.email} />
        )}
        {company.phone && (
          <DetailCard icon={Phone} label="Phone" value={company.phone} />
        )}
        {company.founded && (
          <DetailCard icon={Calendar} label="Founded" value={company.founded} />
        )}
        {company.companySize && (
          <DetailCard icon={Briefcase} label="Size" value={`${company.companySize} employees`} />
        )}
      </div>
    </div>
  )
}

function ProfileView({ company, userId, accessToken, serverUrl, onUpdate }: { 
  company: Company
  userId: string
  accessToken: string
  serverUrl: string
  onUpdate: () => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-black text-2xl text-white mb-1">Profile</h2>
        <p className="text-sm text-emerald-200/70">Edit organization profile and settings</p>
      </div>
      
      <div className="text-center py-12 bg-emerald-900/20 rounded-2xl border-2 border-dashed border-emerald-500/20">
        <Settings className="w-12 h-12 mx-auto mb-3 text-emerald-400/50" />
        <h3 className="font-black mb-2 text-white">Profile Editor</h3>
        <p className="text-sm text-emerald-200/60">
          Profile editing features coming soon
        </p>
      </div>
    </div>
  )
}

function PublicationsView({ company }: { company: Company }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-black text-2xl text-white mb-1">Publications</h2>
        <p className="text-sm text-emerald-200/70">Manage organization publications and articles</p>
      </div>
      
      <div className="text-center py-12 bg-emerald-900/20 rounded-2xl border-2 border-dashed border-emerald-500/20">
        <BookOpen className="w-12 h-12 mx-auto mb-3 text-emerald-400/50" />
        <h3 className="font-black mb-2 text-white">No Publications</h3>
        <p className="text-sm text-emerald-200/60">
          Organization publications will appear here
        </p>
      </div>
    </div>
  )
}

function BadgesView({ company }: { company: Company }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-black text-2xl text-white mb-1">Badges</h2>
        <p className="text-sm text-emerald-200/70">Manage member badge applications</p>
      </div>
      
      <div className="text-center py-12 bg-emerald-900/20 rounded-2xl border-2 border-dashed border-emerald-500/20">
        <Award className="w-12 h-12 mx-auto mb-3 text-emerald-400/50" />
        <h3 className="font-black mb-2 text-white">No Badge Requests</h3>
        <p className="text-sm text-emerald-200/60">
          Badge requests from members will appear here
        </p>
      </div>
    </div>
  )
}

function MembersView({ company }: { company: Company }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-black text-2xl text-white mb-1">Members</h2>
        <p className="text-sm text-emerald-200/70">Manage organization members</p>
      </div>
      
      <div className="text-center py-12 bg-emerald-900/20 rounded-2xl border-2 border-dashed border-emerald-500/20">
        <Users className="w-12 h-12 mx-auto mb-3 text-emerald-400/50" />
        <h3 className="font-black mb-2 text-white">No Members Yet</h3>
        <p className="text-sm text-emerald-200/60">
          Organization members will appear here
        </p>
      </div>
    </div>
  )
}

function SettingsView({ company, onTogglePublish, isPublishing }: { company: Company, onTogglePublish: () => void, isPublishing: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-black text-2xl text-white mb-1">Settings</h2>
        <p className="text-sm text-emerald-200/70">Manage organization settings</p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-emerald-950/50 border-2 border-emerald-500/20 rounded-2xl p-6">
          <h3 className="font-black text-sm uppercase tracking-wide text-emerald-300 mb-4">Publishing</h3>
          <div className="space-y-3">
            <div>
              <p className="font-bold text-white mb-1">Publication Status</p>
              <p className="text-xs text-emerald-200/60">
                {company.isPublished ? 'Your organization is visible in the Hemp Atlas' : 'Your organization is hidden from public view'}
              </p>
            </div>
            <Button
              onClick={onTogglePublish}
              disabled={isPublishing}
              className={`w-full gap-2 ${
                company.isPublished 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-2 border-amber-500/50'
              }`}
            >
              {isPublishing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Processing...
                </>
              ) : company.isPublished ? (
                <>
                  <Eye className="w-4 h-4" />
                  Published
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  Publish Now
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="bg-emerald-950/50 border-2 border-emerald-500/20 rounded-2xl p-6">
          <p className="text-sm text-emerald-200/60">More settings coming soon...</p>
        </div>
      </div>
    </div>
  )
}

function DetailCard({ icon: Icon, label, value, link }: { icon: any, label: string, value: string, link?: boolean }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-900/30 border border-emerald-500/10">
      <Icon className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-emerald-300/60 font-bold mb-1">{label}</p>
        {link ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-400 hover:text-teal-300 hover:underline break-all">
            Visit Site
          </a>
        ) : (
          <p className="text-sm text-emerald-100 break-words">{value}</p>
        )}
      </div>
    </div>
  )
}