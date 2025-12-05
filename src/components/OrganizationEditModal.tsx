import { useState, useEffect } from 'react'
import { X, Building2, Save, Loader } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { toast } from 'sonner@2.0.3'
import { motion } from 'motion/react'

interface OrganizationEditModalProps {
  organization: any
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  accessToken: string | null
  serverUrl: string
}

// Country list
const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 
  'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark',
  'Australia', 'New Zealand', 'Japan', 'South Korea', 'China', 'India', 'Brazil',
  'Mexico', 'Argentina', 'Chile', 'Colombia', 'Portugal', 'Ireland', 'Poland',
  'Czech Republic', 'Greece', 'Israel', 'South Africa', 'Thailand', 'Singapore',
  'Malaysia', 'Indonesia', 'Philippines', 'Vietnam', 'Turkey', 'United Arab Emirates',
  'Other'
].sort()

// Company size options
const COMPANY_SIZES = [
  '2-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5001+'
]

export function OrganizationEditModal({
  organization,
  isOpen,
  onClose,
  onSuccess,
  accessToken,
  serverUrl
}: OrganizationEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    logo_url: '',
    category_id: '',
    location: '',
    country: '',
    founded_year: '',
    company_size: '',
    contact_email: '',
    contact_phone: '',
    linkedin_url: '',
    twitter_url: '',
    instagram_url: '',
    facebook_url: '',
    is_association: false,
    is_published: false
  })
  
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch categories on mount
  useEffect(() => {
    if (isOpen && accessToken) {
      fetchCategories()
    }
  }, [isOpen, accessToken])

  // Populate form when organization changes
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        description: organization.description || '',
        website: organization.website || '',
        logo_url: organization.logo_url || '',
        category_id: organization.category_id || (organization.category?.id || ''),
        location: organization.location || '',
        country: organization.country || '',
        founded_year: organization.founded_year?.toString() || '',
        company_size: organization.company_size || '',
        contact_email: organization.contact_email || '',
        contact_phone: organization.contact_phone || '',
        linkedin_url: organization.linkedin_url || '',
        twitter_url: organization.twitter_url || '',
        instagram_url: organization.instagram_url || '',
        facebook_url: organization.facebook_url || '',
        is_association: organization.is_association || false,
        is_published: organization.is_published || false
      })
    }
  }, [organization])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${serverUrl}/companies/categories`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Organization name is required')
      return
    }
    
    if (!formData.description.trim()) {
      toast.error('Description is required')
      return
    }
    
    if (!formData.category_id) {
      toast.error('Category is required')
      return
    }

    setSaving(true)
    
    try {
      const response = await fetch(`${serverUrl}/admin/companies/${organization.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          ...formData,
          founded_year: formData.founded_year ? parseInt(formData.founded_year) : null
        })
      })

      if (response.ok) {
        toast.success('Organization updated successfully!')
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update organization')
      }
    } catch (error) {
      console.error('Error updating organization:', error)
      toast.error('Error updating organization')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit Organization</h2>
              <p className="text-sm text-slate-400">{organization?.name}</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* System Metadata - Read Only */}
            <div className="space-y-4 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
                System Metadata
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Company ID</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-600">
                    <code className="text-emerald-400 font-mono text-xs flex-1 break-all">
                      {organization?.id || 'N/A'}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(organization?.id || '')
                        toast.success('Company ID copied!')
                      }}
                      className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Owner ID</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-600">
                    <code className="text-blue-400 font-mono text-xs flex-1 break-all">
                      {organization?.owner_id || 'N/A'}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(organization?.owner_id || '')
                        toast.success('Owner ID copied!')
                      }}
                      className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Owner Email</label>
                  <div className="bg-slate-950 p-2 rounded border border-slate-600">
                    <p className="text-white font-mono text-xs">
                      {organization?.owner_email || 'Unknown'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Category ID</label>
                  <div className="bg-slate-950 p-2 rounded border border-slate-600">
                    <code className="text-purple-400 font-mono text-xs break-all">
                      {organization?.category_id || 'N/A'}
                    </code>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Created At</label>
                  <div className="bg-slate-950 p-2 rounded border border-slate-600">
                    <p className="text-white font-mono text-xs">
                      {organization?.created_at 
                        ? new Date(organization.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Last Updated</label>
                  <div className="bg-slate-950 p-2 rounded border border-slate-600">
                    <p className="text-white font-mono text-xs">
                      {organization?.updated_at 
                        ? new Date(organization.updated_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Badge Count */}
              {organization?.badges && organization.badges.length > 0 && (
                <div className="pt-2 border-t border-slate-700">
                  <label className="text-slate-400 font-semibold text-sm">Badges</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {organization.badges.map((badge: any, index: number) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-xs text-amber-300 flex items-center gap-1"
                      >
                        <span>🎖️</span>
                        <span>{badge.badge_name || badge.badge_type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="text-white">
                    Organization Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="Hemp Industries Association"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description" className="text-white">
                    Description <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white min-h-[100px]"
                    placeholder="Describe your organization..."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-white">
                    Category <span className="text-red-400">*</span>
                  </Label>
                  <select
                    id="category"
                    value={formData.category_id}
                    onChange={(e) => handleChange('category_id', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="logo_url" className="text-white">
                    Logo URL
                  </Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => handleChange('logo_url', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
                Location
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country" className="text-white">
                    Country
                  </Label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select a country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="location" className="text-white">
                    City/Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="Los Angeles, CA"
                  />
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
                Company Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="founded_year" className="text-white">
                    Founded Year
                  </Label>
                  <Input
                    id="founded_year"
                    type="number"
                    value={formData.founded_year}
                    onChange={(e) => handleChange('founded_year', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="2020"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
                
                <div>
                  <Label htmlFor="company_size" className="text-white">
                    Company Size
                  </Label>
                  <select
                    id="company_size"
                    value={formData.company_size}
                    onChange={(e) => handleChange('company_size', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select size</option>
                    {COMPANY_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size} employees
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="website" className="text-white">
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email" className="text-white">
                    Contact Email
                  </Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="contact@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_phone" className="text-white">
                    Contact Phone
                  </Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
                Social Media
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedin_url" className="text-white">
                    LinkedIn URL
                  </Label>
                  <Input
                    id="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleChange('linkedin_url', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="twitter_url" className="text-white">
                    Twitter/X URL
                  </Label>
                  <Input
                    id="twitter_url"
                    value={formData.twitter_url}
                    onChange={(e) => handleChange('twitter_url', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="https://twitter.com/..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="instagram_url" className="text-white">
                    Instagram URL
                  </Label>
                  <Input
                    id="instagram_url"
                    value={formData.instagram_url}
                    onChange={(e) => handleChange('instagram_url', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="facebook_url" className="text-white">
                    Facebook URL
                  </Label>
                  <Input
                    id="facebook_url"
                    value={formData.facebook_url}
                    onChange={(e) => handleChange('facebook_url', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
                Settings
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => handleChange('is_published', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-2 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-white font-semibold">Published</span>
                    <p className="text-sm text-slate-400">Make this organization visible to the public</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_association}
                    onChange={(e) => handleChange('is_association', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-2 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-white font-semibold">Association</span>
                    <p className="text-sm text-slate-400">Mark as an association/non-profit organization</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700 bg-slate-900/50">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="border-slate-600 hover:bg-slate-700"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !formData.name || !formData.description || !formData.category_id}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
