import { useState, useEffect } from 'react'
import { Building2, ArrowLeft, Edit, Eye, EyeOff, Save, X, MapPin, Globe as GlobeIcon, Mail, Phone, Calendar, Users, Link as LinkIcon, Award, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { COUNTRIES } from '../utils/countries'

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
  socialLinks: {
    linkedin?: string
    twitter?: string
    instagram?: string
    facebook?: string
  }
  badges: any[]
  ownerId: string
  members: string[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface ManageOrganizationProps {
  userId: string
  accessToken: string
  serverUrl: string
  onClose: () => void
}

export function ManageOrganization({ userId, accessToken, serverUrl, onClose }: ManageOrganizationProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    city: '',
    country: '',
    website: '',
    email: '',
    phone: '',
    founded: '',
    companySize: '',
    linkedin: '',
    twitter: '',
    instagram: '',
    facebook: '',
  })

  useEffect(() => {
    fetchCompanies()
    fetchCategories()
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
          categoryId: company.category_id || '', // Use category_id instead of category.id
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
          ownerId: company.owner_id,
          members: company.members || [],
          isPublished: company.is_published || false,
          createdAt: company.created_at,
          updatedAt: company.updated_at
        }))
        setCompanies(transformedCompanies)
      } else {
        console.error('Error fetching companies:', data)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { publicAnonKey } = await import('../utils/supabase/info')
      const response = await fetch(`${serverUrl}/companies/categories`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleEdit = (company: Company) => {
    setEditingCompany(company)
    
    // Parse location
    const locationParts = company.location?.split(',').map(s => s.trim()) || []
    const city = locationParts.length > 1 ? locationParts[0] : ''
    const country = locationParts.length > 1 ? locationParts[1] : locationParts[0] || ''

    console.log('Editing company:', company.name)
    console.log('Category ID:', company.categoryId)
    console.log('Available categories:', categories)

    setFormData({
      name: company.name,
      description: company.description,
      categoryId: company.categoryId,
      city: city,
      country: country,
      website: company.website || '',
      email: company.email || '',
      phone: company.phone || '',
      founded: company.founded || '',
      companySize: company.companySize || '',
      linkedin: company.socialLinks.linkedin || '',
      twitter: company.socialLinks.twitter || '',
      instagram: company.socialLinks.instagram || '',
      facebook: company.socialLinks.facebook || '',
    })
  }

  const handleSave = async () => {
    if (!editingCompany) return

    // Validation
    if (!formData.categoryId) {
      alert('Please select a category')
      return
    }

    setSaving(true)

    try {
      // Construct location string: "City, Country"
      const location = formData.city && formData.country 
        ? `${formData.city}, ${formData.country}`
        : formData.country || ''

      const updatePayload = {
        name: formData.name,
        description: formData.description,
        category_id: formData.categoryId, // This must be a valid UUID
        location: location,
        website: formData.website || null,
        contact_email: formData.email || null,
        contact_phone: formData.phone || null,
        founded_year: formData.founded || null,
        company_size: formData.companySize || null,
        linkedin_url: formData.linkedin || null,
        twitter_url: formData.twitter || null,
        instagram_url: formData.instagram || null,
        facebook_url: formData.facebook || null,
      }

      console.log('Saving company with payload:', updatePayload)

      const response = await fetch(`${serverUrl}/companies/${editingCompany.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      })

      if (response.ok) {
        await fetchCompanies()
        setEditingCompany(null)
      } else {
        const error = await response.json()
        console.error('Failed to update company:', error)
        alert('Failed to update organization: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating company:', error)
      alert('Error updating organization')
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async (company: Company) => {
    try {
      const response = await fetch(`${serverUrl}/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_published: !company.isPublished
        })
      })

      if (response.ok) {
        await fetchCompanies()
      }
    } catch (error) {
      console.error('Error toggling publish status:', error)
    }
  }

  const handleDelete = async (company: Company) => {
    if (!confirm(`Are you sure you want to delete "${company.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`${serverUrl}/companies/${company.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        await fetchCompanies()
      } else {
        const error = await response.json()
        alert('Failed to delete organization: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting company:', error)
      alert('Error deleting organization')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-hemp-primary animate-pulse" />
          <p className="text-lg font-black uppercase tracking-widest text-white">Loading Organizations</p>
        </div>
      </div>
    )
  }

  // Editing view
  if (editingCompany) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-hemp-primary via-hemp-secondary to-hemp-primary border-b-4 border-hemp-primary/30 backdrop-blur-xl shadow-lg shadow-hemp-primary/20 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setEditingCompany(null)}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  disabled={saving}
                >
                  <X className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="font-black text-2xl text-white uppercase tracking-wider">Edit Organization</h1>
                  <p className="text-sm text-white/80 font-semibold">{editingCompany.name}</p>
                </div>
              </div>
              <Button
                onClick={handleSave}
                size="icon"
                className="bg-white text-hemp-primary hover:bg-white/90 font-black relative"
                disabled={saving}
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-hemp-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto p-6 mt-8 pb-32">
          <div className="bg-gradient-to-br from-emerald-900/90 via-teal-900/90 to-green-900/90 backdrop-blur-xl border-2 border-hemp-primary/30 rounded-3xl p-8 shadow-2xl shadow-hemp-primary/20">
            
            {/* Basic Info */}
            <div className="mb-8">
              <h3 className="font-black text-xl text-hemp-primary uppercase tracking-wider mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Basic Information
              </h3>
              
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-black text-white/90 mb-2 uppercase tracking-wider">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-emerald-950/50 border-2 border-hemp-primary/30 focus:border-hemp-primary rounded-xl px-4 py-3 text-white placeholder-white/40 font-semibold transition-all"
                    placeholder="Your organization name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-black text-white/90 mb-2 uppercase tracking-wider">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full bg-emerald-950/50 border-2 border-hemp-primary/30 focus:border-hemp-primary rounded-xl px-4 py-3 text-white placeholder-white/40 font-semibold transition-all resize-none"
                    placeholder="Tell us about your organization..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-black text-white/90 mb-2 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-emerald-950/50 border-2 border-hemp-primary/30 focus:border-hemp-primary rounded-xl px-4 py-3 text-white font-semibold transition-all"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-emerald-950">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mb-8 pt-8 border-t border-hemp-primary/30">
              <h3 className="font-black text-xl text-hemp-primary uppercase tracking-wider mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* City */}
                <div>
                  <label className="block text-sm font-black text-white/90 mb-2 uppercase tracking-wider">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-emerald-950/50 border-2 border-hemp-primary/30 focus:border-hemp-primary rounded-xl px-4 py-3 text-white placeholder-white/40 font-semibold transition-all"
                    placeholder="e.g., Paris, Amsterdam, Denver"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-black text-white/90 mb-2 uppercase tracking-wider">
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-emerald-950/50 border-2 border-hemp-primary/30 focus:border-hemp-primary rounded-xl px-4 py-3 text-white font-semibold transition-all"
                  >
                    <option value="">Select a country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country} className="bg-emerald-950">
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 p-4 bg-hemp-primary/10 border border-hemp-primary/30 rounded-xl">
                <p className="text-xs text-hemp-primary font-bold flex items-center gap-2">
                  <GlobeIcon className="w-4 h-4" />
                  Your organization will appear on the Hemp Atlas at: 
                  <span className="font-black">
                    {formData.city && formData.country ? `${formData.city}, ${formData.country}` : 
                     formData.country ? formData.country : 'Not specified'}
                  </span>
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mb-8 pt-8 border-t border-hemp-primary/30">
              <h3 className="font-black text-xl text-hemp-primary uppercase tracking-wider mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </h3>
              
              <div className="space-y-6">
                {/* Website */}
                <div>
                  <label className="block text-sm font-black text-white/90 mb-2 uppercase tracking-wider">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-emerald-950/50 border-2 border-hemp-primary/30 focus:border-hemp-primary rounded-xl px-4 py-3 text-white placeholder-white/40 font-semibold transition-all"
                    placeholder="https://your-website.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-black text-white/90 mb-2 uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-emerald-950/50 border-2 border-hemp-primary/30 focus:border-hemp-primary rounded-xl px-4 py-3 text-white placeholder-white/40 font-semibold transition-all"
                      placeholder="contact@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-black text-white/90 mb-2 uppercase tracking-wider">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-emerald-950/50 border-2 border-hemp-primary/30 focus:border-hemp-primary rounded-xl px-4 py-3 text-white placeholder-white/40 font-semibold transition-all"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="mb-8 pt-8 border-t border-hemp-primary/30">
              <h3 className="font-black text-xl text-hemp-primary uppercase tracking-wider mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Founded Year */}
                <div>
                  <label className="block text-sm font-black text-white/90 mb-2 uppercase tracking-wider">
                    Founded Year
                  </label>
                  <input
                    type="text"
                    value={formData.founded}
                    onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                    className="w-full bg-emerald-950/50 border-2 border-hemp-primary/30 focus:border-hemp-primary rounded-xl px-4 py-3 text-white placeholder-white/40 font-semibold transition-all"
                    placeholder="e.g., 2020"
                  />
                </div>

                {/* Company Size */}
                <div>
                  <label className="block text-sm font-black text-white/90 mb-2 uppercase tracking-wider">
                    Company Size
                  </label>
                  <select
                    value={formData.companySize}
                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                    className="w-full bg-emerald-950/50 border-2 border-hemp-primary/30 focus:border-hemp-primary rounded-xl px-4 py-3 text-white font-semibold transition-all"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501+">501+ employees</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-8 border-t border-hemp-primary/30">
              <h3 className="font-black text-xl text-hemp-primary uppercase tracking-wider mb-6 flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Social Media
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LinkedIn */}
                <div>
                  <label className="block text-sm font-black text-white/90 mb-2 uppercase tracking-wider">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full bg-emerald-950/50 border-2 border-hemp-primary/30 focus:border-hemp-primary rounded-xl px-4 py-3 text-white placeholder-white/40 font-semibold transition-all"
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>

                {/* Twitter */}
                <div>
                  <label className="block text-sm font-black text-white/90 mb-2 uppercase tracking-wider">
                    Twitter / X
                  </label>
                  <input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="w-full bg-emerald-950/50 border-2 border-hemp-primary/30 focus:border-hemp-primary rounded-xl px-4 py-3 text-white placeholder-white/40 font-semibold transition-all"
                    placeholder="https://twitter.com/..."
                  />
                </div>

                {/* Instagram */}
                <div>
                  <label className="block text-sm font-black text-white/90 mb-2 uppercase tracking-wider">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full bg-emerald-950/50 border-2 border-hemp-primary/30 focus:border-hemp-primary rounded-xl px-4 py-3 text-white placeholder-white/40 font-semibold transition-all"
                    placeholder="https://instagram.com/..."
                  />
                </div>

                {/* Facebook */}
                <div>
                  <label className="block text-sm font-black text-white/90 mb-2 uppercase tracking-wider">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    className="w-full bg-emerald-950/50 border-2 border-hemp-primary/30 focus:border-hemp-primary rounded-xl px-4 py-3 text-white placeholder-white/40 font-semibold transition-all"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Bottom Save Button */}
            <div className="mt-8 pt-8 border-t border-hemp-primary/30 flex justify-center">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full md:w-auto bg-gradient-to-r from-hemp-primary to-hemp-secondary text-white hover:from-hemp-primary/90 hover:to-hemp-secondary/90 font-black text-lg py-6 px-12 rounded-2xl shadow-xl shadow-hemp-primary/30 hover:shadow-2xl hover:shadow-hemp-primary/40 transition-all gap-3"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Organization</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // List view
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-hemp-primary via-hemp-secondary to-hemp-primary border-b-4 border-hemp-primary/30 backdrop-blur-xl shadow-lg shadow-hemp-primary/20 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-black text-2xl text-white uppercase tracking-wider">My Organizations</h1>
                <p className="text-sm text-white/80 font-semibold">
                  {companies.length} {companies.length === 1 ? 'organization' : 'organizations'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Companies List */}
      <div className="max-w-6xl mx-auto p-6 mt-8">
        {companies.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-20 h-20 mx-auto mb-6 text-hemp-primary/50" />
            <h2 className="font-black text-2xl text-white mb-4">No Organizations Yet</h2>
            <p className="text-white/70 mb-6">You haven't created any organizations yet.</p>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-hemp-primary to-hemp-secondary text-white font-black"
            >
              Add Your First Organization
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-gradient-to-br from-emerald-900/60 via-teal-900/60 to-green-900/60 backdrop-blur-2xl border-4 border-hemp-primary/40 rounded-3xl overflow-hidden shadow-2xl shadow-hemp-primary/30 hover:shadow-hemp-primary/50 hover:border-hemp-primary/60 transition-all duration-300 group"
              >
                {/* Cover Image */}
                {company.coverImage ? (
                  <div 
                    className="h-48 bg-gradient-to-br from-hemp-primary/20 to-hemp-secondary/20 bg-cover bg-center relative overflow-hidden"
                    style={{ backgroundImage: `url(${company.coverImage})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-hemp-primary/30 via-hemp-secondary/20 to-hemp-primary/30 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(16,185,129,0.3),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_rgba(20,184,166,0.2),transparent_50%)]" />
                    <Building2 className="w-20 h-20 text-hemp-primary/50 relative z-10" />
                  </div>
                )}

                {/* Content */}
                <div className="p-6 relative">
                  {/* Status Badge - Floating */}
                  <div className="absolute -top-4 right-6">
                    {company.isPublished ? (
                      <div className="bg-gradient-to-r from-hemp-primary to-hemp-secondary px-4 py-2 rounded-full border-3 border-emerald-900/60 shadow-xl shadow-hemp-primary/40 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-white" />
                        <span className="text-white font-black text-xs uppercase tracking-widest">Live</span>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 rounded-full border-3 border-emerald-900/60 shadow-xl shadow-amber-500/40 flex items-center gap-2">
                        <EyeOff className="w-4 h-4 text-white" />
                        <span className="text-white font-black text-xs uppercase tracking-widest">Draft</span>
                      </div>
                    )}
                  </div>

                  {/* Name & Description */}
                  <h3 className="font-black text-2xl text-white uppercase tracking-wide mb-3 mt-4 leading-tight">
                    {company.name}
                  </h3>
                  <p className="text-white/80 font-semibold text-sm mb-6 line-clamp-3 leading-relaxed">
                    {company.description}
                  </p>

                  {/* Meta Info Grid */}
                  <div className="space-y-3 mb-6">
                    {/* Location */}
                    {company.location && (
                      <div className="flex items-center gap-3 bg-hemp-primary/10 border-2 border-hemp-primary/30 rounded-xl px-4 py-2.5">
                        <MapPin className="w-5 h-5 text-hemp-primary flex-shrink-0" />
                        <span className="text-hemp-primary font-bold text-sm tracking-wide">{company.location}</span>
                      </div>
                    )}

                    {/* Badges */}
                    {company.badges.length > 0 && (
                      <div className="flex items-center gap-3 bg-amber-500/10 border-2 border-amber-500/30 rounded-xl px-4 py-2.5">
                        <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        <span className="text-amber-400 font-bold text-sm tracking-wide">
                          {company.badges.length} {company.badges.length === 1 ? 'Badge' : 'Badges'} Earned
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-6 border-t-2 border-hemp-primary/30">
                    <Button
                      onClick={() => handleEdit(company)}
                      className="flex-1 bg-gradient-to-r from-hemp-primary to-hemp-secondary hover:from-hemp-primary/90 hover:to-hemp-secondary/90 text-white font-black text-sm uppercase tracking-wider py-6 gap-2 shadow-lg shadow-hemp-primary/30 hover:shadow-xl hover:shadow-hemp-primary/40 transition-all border-2 border-hemp-primary/40"
                    >
                      <Edit className="w-5 h-5" />
                      Edit
                    </Button>
                    
                    <Button
                      onClick={() => handleTogglePublish(company)}
                      className="border-3 border-hemp-primary/50 bg-hemp-primary/20 hover:bg-hemp-primary/30 text-hemp-primary font-black py-6 px-4 transition-all"
                      title={company.isPublished ? "Unpublish" : "Publish"}
                    >
                      {company.isPublished ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>

                    <Button
                      onClick={() => handleDelete(company)}
                      className="border-3 border-red-500/50 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-black py-6 px-4 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}