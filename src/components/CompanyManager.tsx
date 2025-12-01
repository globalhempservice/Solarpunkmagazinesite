import { useState, useEffect } from 'react'
import { Building2, Plus, Settings, Eye, EyeOff, Edit, Trash2, Award, Send, Users, CheckCircle2, Clock, X, Shield, Crown, Star, MapPin, Globe, Mail, Phone, Calendar, Briefcase, Share2, FileText, ChevronRight, ShoppingBag, BookOpen } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { motion, AnimatePresence } from 'motion/react'
import { SwagManagementTab } from './SwagManagementTab'
import { OrganizationPublicationsTab } from './OrganizationPublicationsTab'
import OrganizationMembersTab from './OrganizationMembersTab'
import OrganizationBadgesTab from './OrganizationBadgesTab'

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

interface CompanyManagerProps {
  userId: string
  accessToken: string
  serverUrl: string
  onClose: () => void
}

type NavigationLevel = 
  | { level: 'organizations' }
  | { level: 'organization-menu', companyId: string }
  | { level: 'organization-detail', companyId: string, view: 'preview' | 'share' | 'overview' | 'badges' | 'members' | 'settings' }
  | { level: 'create-organization' }

export function CompanyManager({ userId, accessToken, serverUrl, onClose }: CompanyManagerProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [navigationLevel, setNavigationLevel] = useState<NavigationLevel>({ level: 'organizations' })
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'swag' | 'publications' | 'badges' | 'members'>('overview')
  const [publishingIds, setPublishingIds] = useState<Set<string>>(new Set())
  const [successIds, setSuccessIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    // Auto-select first company if none selected and companies exist
    if (companies.length > 0 && navigationLevel.level === 'organizations') {
      setNavigationLevel({ level: 'organization-menu', companyId: companies[0].id })
    }
  }, [companies, navigationLevel])

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${serverUrl}/companies/my`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        // Transform backend data to frontend format
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
          badgeRequests: [], // Will be fetched separately if needed
          ownerId: company.owner_id,
          members: company.members || [],
          isPublished: company.is_published || false,
          createdAt: company.created_at,
          updatedAt: company.updated_at
        }))
        setCompanies(transformedCompanies)
      } else {
        console.error('Failed to fetch companies:', data)
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
        setSuccessIds(prev => new Set(prev.add(company.id)))
        await fetchCompanies()
        // Clear success animation after 2 seconds
        setTimeout(() => {
          setSuccessIds(prev => {
            const newSet = new Set(prev)
            newSet.delete(company.id)
            return newSet
          })
        }, 2000)
      } else {
        const error = await response.json()
        console.error('Failed to toggle publish:', error)
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

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`${serverUrl}/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        fetchCompanies()
      }
    } catch (error) {
      console.error('Error deleting company:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (navigationLevel.level === 'create-organization') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950 p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={() => setNavigationLevel({ level: 'organizations' })} 
            variant="ghost" 
            className="mb-4 hover:scale-105 active:scale-95 transition-transform text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
          >
            ← Back to Dashboard
          </Button>
          <CompanyForm
            userId={userId}
            accessToken={accessToken}
            serverUrl={serverUrl}
            onSuccess={() => {
              setNavigationLevel({ level: 'organizations' })
              fetchCompanies()
            }}
            onCancel={() => setNavigationLevel({ level: 'organizations' })}
          />
        </div>
      </div>
    )
  }

  if (navigationLevel.level === 'organization-detail' && navigationLevel.view === 'settings') {
    const selectedCompany = companies.find(c => c.id === navigationLevel.companyId)
    if (!selectedCompany) return null
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950 p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={() => setNavigationLevel({ level: 'organization-menu', companyId: selectedCompany.id })} 
            variant="ghost" 
            className="mb-4 hover:scale-105 active:scale-95 transition-transform text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
          >
            ← Back to Dashboard
          </Button>
          <CompanyForm
            userId={userId}
            accessToken={accessToken}
            serverUrl={serverUrl}
            company={selectedCompany}
            onSuccess={() => {
              setNavigationLevel({ level: 'organizations' })
              fetchCompanies()
            }}
            onCancel={() => setNavigationLevel({ level: 'organizations' })}
          />
        </div>
      </div>
    )
  }

  // Dashboard View - Sidebar + Detail Panel
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl border-2 border-emerald-400/30">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-xl" />
              <Building2 className="w-7 h-7 text-white relative z-10" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-black text-2xl text-white">Organization Dashboard</h1>
              <p className="text-sm text-emerald-200/70">Manage your companies, members, and badge requests</p>
            </div>
          </div>
          <Button 
            onClick={() => setNavigationLevel({ level: 'create-organization' })} 
            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition-all hover:scale-105 active:scale-95 shadow-lg border-2 border-emerald-400/30 text-white font-black"
          >
            <Plus className="w-4 h-4" />
            New Organization
          </Button>
        </div>

        {/* Empty State */}
        {companies.length === 0 ? (
          <div className="bg-emerald-950/50 border-2 border-dashed border-emerald-500/30 rounded-3xl p-12 text-center backdrop-blur-sm">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-600/30 flex items-center justify-center border-2 border-emerald-400/30 shadow-2xl">
              <Building2 className="w-12 h-12 text-emerald-400" strokeWidth={2.5} />
            </div>
            <h3 className="font-black text-xl mb-2 text-white">No Organizations Yet</h3>
            <p className="text-sm text-emerald-200/60 mb-6 max-w-md mx-auto">
              Create your first organization to start managing members, issuing badges, and building your community.
            </p>
            <Button 
              onClick={() => setNavigationLevel({ level: 'create-organization' })}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition-all hover:scale-105 active:scale-95 border-2 border-emerald-400/30 text-white font-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Organization
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar - Organization List */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-emerald-950/50 border-2 border-emerald-500/20 rounded-3xl p-4 space-y-2 backdrop-blur-sm shadow-2xl">
                <div className="px-2 mb-3">
                  <h2 className="font-black text-sm uppercase tracking-wide text-emerald-300">Your Organizations</h2>
                </div>
                
                {companies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => {
                      setNavigationLevel({ level: 'organization-menu', companyId: company.id })
                    }}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                      navigationLevel.level === 'organization-menu' && navigationLevel.companyId === company.id
                        ? 'bg-gradient-to-br from-emerald-600/30 to-teal-600/30 border-2 border-emerald-400/50 shadow-lg'
                        : 'bg-emerald-900/30 hover:bg-emerald-900/50 border-2 border-emerald-500/10 hover:border-emerald-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 border-2 border-emerald-400/30 shadow-lg">
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
                            <Badge 
                              variant="default" 
                              className={`text-xs bg-emerald-500 hover:bg-emerald-600 transition-all border border-emerald-400/50 ${
                                successIds.has(company.id) ? 'animate-pulse' : ''
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                Live
                              </div>
                            </Badge>
                          ) : (
                            <Badge 
                              variant="outline" 
                              className={`text-xs border-amber-500/50 text-amber-400 bg-amber-500/10 ${
                                successIds.has(company.id) ? 'animate-pulse' : ''
                              }`}
                            >
                              Draft
                            </Badge>
                          )}
                          
                          {company.badgeRequests && company.badgeRequests.filter((br: any) => br.status === 'pending').length > 0 && (
                            <Badge variant="secondary" className="text-xs bg-purple-500/20 border-purple-400/50 text-purple-300">
                              {company.badgeRequests.filter((br: any) => br.status === 'pending').length} Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Panel - Organization Detail */}
            <div className="col-span-12 lg:col-span-8">
              {navigationLevel.level === 'organization-menu' ? (
                (() => {
                  const selectedCompany = companies.find(c => c.id === navigationLevel.companyId)
                  if (!selectedCompany) return null
                  
                  return (
                <div className="bg-emerald-950/50 border-2 border-emerald-500/20 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
                  {/* Company Header */}
                  <div className="relative h-32 bg-gradient-to-br from-emerald-600 to-teal-700">
                    {selectedCompany.coverImage && (
                      <img 
                        src={selectedCompany.coverImage} 
                        alt="" 
                        className="w-full h-full object-cover opacity-40"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent"></div>
                  </div>
                  
                  <div className="px-6 pb-6">
                    {/* Company Info & Actions */}
                    <div className="flex items-end justify-between -mt-10 mb-6">
                      <div className="flex items-end gap-4">
                        {selectedCompany.logo ? (
                          <img
                            src={selectedCompany.logo}
                            alt={selectedCompany.name}
                            className="w-20 h-20 rounded-2xl object-cover border-4 border-emerald-950/50 shadow-2xl"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center border-4 border-emerald-950/50 shadow-2xl">
                            <Building2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                          </div>
                        )}
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="font-black text-xl text-white">{selectedCompany.name}</h2>
                            {selectedCompany.isAssociation && (
                              <Badge variant="secondary" className="gap-1 bg-amber-500/20 border-amber-400/50 text-amber-300">
                                <Shield className="w-3 h-3" />
                                Association
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-emerald-200/70">{selectedCompany.categoryId}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={selectedCompany.isPublished ? "default" : "outline"}
                          onClick={() => handleTogglePublish(selectedCompany)}
                          disabled={publishingIds.has(selectedCompany.id)}
                          className={`gap-2 transition-all duration-200 ${
                            selectedCompany.isPublished 
                              ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-400/50 text-white'
                              : 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10'
                          } ${
                            publishingIds.has(selectedCompany.id) 
                              ? 'scale-95 opacity-70' 
                              : 'hover:scale-105 active:scale-95'
                          }`}
                        >
                          {publishingIds.has(selectedCompany.id) ? (
                            <>
                              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current"></div>
                              Processing...
                            </>
                          ) : selectedCompany.isPublished ? (
                            <>
                              <Eye className="w-4 h-4" />
                              Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4" />
                              Draft
                            </>
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setNavigationLevel({ level: 'organization-detail', companyId: selectedCompany.id, view: 'settings' })
                          }}
                          className="hover:scale-105 active:scale-95 transition-transform text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 p-1 bg-emerald-900/30 rounded-2xl border border-emerald-500/10 overflow-x-auto">
                      <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-black text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap ${
                          activeTab === 'overview'
                            ? 'bg-emerald-500/20 shadow-sm text-emerald-200 border border-emerald-400/30'
                            : 'hover:bg-emerald-900/50 text-emerald-400/60 hover:text-emerald-300'
                        }`}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-black text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex items-center justify-center gap-2 ${
                          activeTab === 'profile'
                            ? 'bg-emerald-500/20 shadow-sm text-emerald-200 border border-emerald-400/30'
                            : 'hover:bg-emerald-900/50 text-emerald-400/60 hover:text-emerald-300'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        Profile
                      </button>
                      <button
                        onClick={() => setActiveTab('swag')}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-black text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex items-center justify-center gap-2 ${
                          activeTab === 'swag'
                            ? 'bg-emerald-500/20 shadow-sm text-emerald-200 border border-emerald-400/30'
                            : 'hover:bg-emerald-900/50 text-emerald-400/60 hover:text-emerald-300'
                        }`}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Swag Shop
                      </button>
                      <button
                        onClick={() => setActiveTab('publications')}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-black text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex items-center justify-center gap-2 ${
                          activeTab === 'publications'
                            ? 'bg-emerald-500/20 shadow-sm text-emerald-200 border border-emerald-400/30'
                            : 'hover:bg-emerald-900/50 text-emerald-400/60 hover:text-emerald-300'
                        }`}
                      >
                        <BookOpen className="w-4 h-4" />
                        Publications
                      </button>
                      <button
                        onClick={() => setActiveTab('badges')}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-black text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap ${
                          activeTab === 'badges'
                            ? 'bg-emerald-500/20 shadow-sm text-emerald-200 border border-emerald-400/30'
                            : 'hover:bg-emerald-900/50 text-emerald-400/60 hover:text-emerald-300'
                        }`}
                      >
                        Badges
                      </button>
                      <button
                        onClick={() => setActiveTab('members')}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-black text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap ${
                          activeTab === 'members'
                            ? 'bg-emerald-500/20 shadow-sm text-emerald-200 border border-emerald-400/30'
                            : 'hover:bg-emerald-900/50 text-emerald-400/60 hover:text-emerald-300'
                        }`}
                      >
                        Members
                      </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-black text-sm uppercase tracking-wide text-emerald-300 mb-3">About</h3>
                          <p className="text-sm leading-relaxed text-emerald-100/80">{selectedCompany.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {selectedCompany.location && (
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-900/30 border border-emerald-500/10">
                              <MapPin className="w-4 h-4 text-emerald-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-emerald-300/60 font-bold mb-0.5">Location</p>
                                <p className="text-sm text-emerald-100">{selectedCompany.location}</p>
                              </div>
                            </div>
                          )}
                          
                          {selectedCompany.website && (
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-900/30 border border-emerald-500/10">
                              <Globe className="w-4 h-4 text-emerald-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-emerald-300/60 font-bold mb-0.5">Website</p>
                                <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-400 hover:text-teal-300 hover:underline">
                                  Visit Site
                                </a>
                              </div>
                            </div>
                          )}
                          
                          {selectedCompany.email && (
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-900/30 border border-emerald-500/10">
                              <Mail className="w-4 h-4 text-emerald-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-emerald-300/60 font-bold mb-0.5">Email</p>
                                <p className="text-sm text-emerald-100">{selectedCompany.email}</p>
                              </div>
                            </div>
                          )}
                          
                          {selectedCompany.phone && (
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-900/30 border border-emerald-500/10">
                              <Phone className="w-4 h-4 text-emerald-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-emerald-300/60 font-bold mb-0.5">Phone</p>
                                <p className="text-sm text-emerald-100">{selectedCompany.phone}</p>
                              </div>
                            </div>
                          )}
                          
                          {selectedCompany.founded && (
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-900/30 border border-emerald-500/10">
                              <Calendar className="w-4 h-4 text-emerald-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-emerald-300/60 font-bold mb-0.5">Founded</p>
                                <p className="text-sm text-emerald-100">{selectedCompany.founded}</p>
                              </div>
                            </div>
                          )}
                          
                          {selectedCompany.companySize && (
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-900/30 border border-emerald-500/10">
                              <Briefcase className="w-4 h-4 text-emerald-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-emerald-300/60 font-bold mb-0.5">Size</p>
                                <p className="text-sm text-emerald-100">{selectedCompany.companySize} employees</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {selectedCompany.badges && selectedCompany.badges.length > 0 && (
                          <div>
                            <h3 className="font-black text-sm uppercase tracking-wide text-emerald-300 mb-3">Badges</h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedCompany.badges.map((badge: any) => (
                                <Badge key={badge.id} variant="default" className="gap-1.5 bg-purple-500/20 border-purple-400/50 text-purple-300">
                                  <Award className="w-3.5 h-3.5" />
                                  {badge.type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'badges' && (
                      <div className="space-y-4">
                        <OrganizationBadgesTab
                          companyId={selectedCompany.id}
                          companyName={selectedCompany.name}
                          currentUserId={userId}
                          isOwner={selectedCompany.ownerId === userId}
                          userRole={selectedCompany.ownerId === userId ? 'owner' : null}
                          canManageBadges={selectedCompany.ownerId === userId}
                        />
                      </div>
                    )}

                    {activeTab === 'members' && (
                      <div className="space-y-4">
                        <OrganizationMembersTab
                          companyId={selectedCompany.id}
                          companyName={selectedCompany.name}
                          currentUserId={userId}
                          isOwner={selectedCompany.ownerId === userId}
                          userRole={selectedCompany.ownerId === userId ? 'owner' : null}
                          canManageMembers={selectedCompany.ownerId === userId}
                        />
                      </div>
                    )}

                    {activeTab === 'swag' && (
                      <div className="space-y-4">
                        <SwagManagementTab
                          companyId={selectedCompany.id}
                          accessToken={accessToken}
                          serverUrl={serverUrl}
                        />
                      </div>
                    )}

                    {activeTab === 'profile' && (
                      <div className="space-y-4">
                        <CompanyForm
                          userId={userId}
                          accessToken={accessToken}
                          serverUrl={serverUrl}
                          company={selectedCompany}
                          onSuccess={() => {
                            fetchCompanies()
                          }}
                          onCancel={() => setActiveTab('overview')}
                        />
                      </div>
                    )}

                    {activeTab === 'publications' && (
                      <div className="space-y-4">
                        <OrganizationPublicationsTab
                          companyId={selectedCompany.id}
                          userId={userId}
                          accessToken={accessToken}
                          serverUrl={serverUrl}
                          userRole="owner"
                        />
                      </div>
                    )}
                  </div>
                </div>
                  )
                })()
              ) : (
                <div className="bg-emerald-950/50 border-2 border-emerald-500/20 rounded-3xl p-12 text-center backdrop-blur-sm">
                  <Building2 className="w-16 h-16 mx-auto mb-4 text-emerald-400/50" />
                  <h3 className="font-black mb-2 text-white">Select an Organization</h3>
                  <p className="text-sm text-emerald-200/60">
                    Choose an organization from the sidebar to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Company Form Component (Create/Edit)
interface CompanyFormProps {
  userId: string
  accessToken: string
  serverUrl: string
  company?: Company
  onSuccess: () => void
  onCancel: () => void
}

function CompanyForm({ userId, accessToken, serverUrl, company, onSuccess, onCancel }: CompanyFormProps) {
  const [categories, setCategories] = useState<any[]>([])
  
  // Sanitize company size before setting initial state
  const getSanitizedCompanySize = (size: string | null | undefined) => {
    if (size === '1-10') return '2-10'
    return size || ''
  }
  
  const [formData, setFormData] = useState({
    name: company?.name || '',
    description: company?.description || '',
    categoryId: company?.categoryId || '',
    isAssociation: company?.isAssociation || false,
    logo: company?.logo || '',
    coverImage: company?.coverImage || '',
    location: company?.location || '',
    website: company?.website || '',
    email: company?.email || '',
    phone: company?.phone || '',
    founded: company?.founded || '',
    companySize: getSanitizedCompanySize(company?.companySize),
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${serverUrl}/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        // Map to format expected by the form
        const formattedCategories = data.map((cat: any) => ({
          id: cat.name,
          name: cat.name,
          icon: 'Building2'
        }))
        setCategories(formattedCategories)
      } else {
        console.error('Failed to fetch categories')
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = company
        ? `${serverUrl}/companies/${company.id}`
        : `${serverUrl}/companies`
      
      // Sanitize and validate company size if provided
      let sanitizedCompanySize = formData.companySize
      const validSizes = ['solo', '2-10', '11-50', '51-200', '201-500', '500+']
      
      // Handle legacy value mapping
      if (sanitizedCompanySize === '1-10') {
        sanitizedCompanySize = '2-10'
      }
      
      if (sanitizedCompanySize && !validSizes.includes(sanitizedCompanySize)) {
        alert(`Invalid company size "${sanitizedCompanySize}". Please select a valid option from the dropdown.`)
        setSaving(false)
        return
      }
      
      // Map frontend field names to backend expected names
      const requestBody = {
        name: formData.name,
        description: formData.description,
        category: formData.categoryId, // Backend expects 'category', not 'categoryId'
        is_association: formData.isAssociation,
        website: formData.website || null,
        contact_email: formData.email || null,
        contact_phone: formData.phone || null,
        location: formData.location || null,
        founded_year: formData.founded || null,
        company_size: sanitizedCompanySize || null,
        logo_url: formData.logo || null,
        cover_image_url: formData.coverImage || null,
      }
      
      console.log('Submitting company with data:', requestBody)
      
      const response = await fetch(url, {
        method: company ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        console.error('Server error:', error)
        alert(error.error || error.message || 'Failed to save company')
      }
    } catch (error) {
      console.error('Error saving company:', error)
      alert('Failed to save company')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border-2 border-border rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="font-black mb-2">{company ? 'Edit Company' : 'Create Company'}</h2>
        <p className="text-sm text-muted-foreground">
          Fill in the details about your company or organization
        </p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-bold mb-2">Company Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background"
            placeholder="Hemp Industries Ltd."
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background min-h-24"
            placeholder="Tell us about your company..."
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-bold mb-2">Industry Category *</label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Is Association - Enhanced with emphasis */}
        <div className="p-4 rounded-lg border-2 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="isAssociation"
              checked={formData.isAssociation}
              onChange={(e) => setFormData({ ...formData, isAssociation: e.target.checked })}
              className="w-5 h-5 rounded border-border mt-0.5"
            />
            <div className="flex-1">
              <label htmlFor="isAssociation" className="text-sm font-bold text-foreground block mb-1 cursor-pointer">
                This is a Legal Association / Non-Profit Organization
              </label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Check this box to confirm your organization is a registered association, non-profit, or official industry body. 
                Associations can validate member companies and issue official badges.
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-bold mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background"
            placeholder="City, Country"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-bold mb-2">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background"
            placeholder="https://example.com"
          />
        </div>

        {/* Grid for smaller fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background"
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Founded Year</label>
            <input
              type="text"
              value={formData.founded}
              onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background"
              placeholder="2020"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Company Size</label>
            <select
              value={formData.companySize}
              onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background"
            >
              <option value="">Select size</option>
              <option value="solo">Solo / 1 employee</option>
              <option value="2-10">2-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? 'Saving...' : company ? 'Save Changes' : 'Create Company'}
        </Button>
      </div>
    </form>
  )
}