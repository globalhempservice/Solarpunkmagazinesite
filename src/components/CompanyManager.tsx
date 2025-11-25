import { useState, useEffect } from 'react'
import { Building2, Plus, Settings, Eye, EyeOff, Edit, Trash2, Award, Send } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

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

export function CompanyManager({ userId, accessToken, serverUrl, onClose }: CompanyManagerProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

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
        fetchCompanies()
      } else {
        const error = await response.json()
        console.error('Failed to toggle publish:', error)
      }
    } catch (error) {
      console.error('Error toggling publish status:', error)
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

  if (view === 'create') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button onClick={() => setView('list')} variant="ghost" className="mb-4">
          ← Back to Companies
        </Button>
        <CompanyForm
          userId={userId}
          accessToken={accessToken}
          serverUrl={serverUrl}
          onSuccess={() => {
            setView('list')
            fetchCompanies()
          }}
          onCancel={() => setView('list')}
        />
      </div>
    )
  }

  if (view === 'edit' && selectedCompany) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button onClick={() => setView('list')} variant="ghost" className="mb-4">
          ← Back to Companies
        </Button>
        <CompanyForm
          userId={userId}
          accessToken={accessToken}
          serverUrl={serverUrl}
          company={selectedCompany}
          onSuccess={() => {
            setView('list')
            fetchCompanies()
          }}
          onCancel={() => setView('list')}
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-hemp-primary to-hemp-secondary">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-black">My Companies</h1>
            <p className="text-sm text-muted-foreground">Create and manage your business pages</p>
          </div>
        </div>
        <Button onClick={() => setView('create')} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Company
        </Button>
      </div>

      {/* Companies List */}
      {companies.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-2xl border-2 border-dashed border-muted">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-black mb-2">No companies yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first company page to get started
          </p>
          <Button onClick={() => setView('create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Company
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-card border-2 border-border rounded-2xl p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Company Info */}
                <div className="flex items-start gap-4 flex-1">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-hemp-primary to-hemp-secondary flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black">{company.name}</h3>
                      {company.isAssociation && (
                        <Badge variant="secondary" className="text-xs">
                          Association
                        </Badge>
                      )}
                      {!company.isPublished && (
                        <Badge variant="outline" className="text-xs">
                          Draft
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {company.description}
                    </p>
                    
                    {/* Badges */}
                    {company.badges && company.badges.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {company.badges.map((badge: any) => (
                          <Badge key={badge.id} variant="default" className="gap-1">
                            <Award className="w-3 h-3" />
                            {badge.type}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Badge Requests */}
                    {company.badgeRequests && company.badgeRequests.filter((br: any) => br.status === 'pending').length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Send className="w-3 h-3" />
                        {company.badgeRequests.filter((br: any) => br.status === 'pending').length} pending badge request(s)
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTogglePublish(company)}
                    title={company.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {company.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedCompany(company)
                      setView('edit')
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteCompany(company.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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

        {/* Is Association */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isAssociation"
            checked={formData.isAssociation}
            onChange={(e) => setFormData({ ...formData, isAssociation: e.target.checked })}
            className="w-4 h-4 rounded border-border"
          />
          <label htmlFor="isAssociation" className="text-sm font-bold">
            This is an Association / Non-Profit
          </label>
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