import { useState, useEffect } from 'react'
import { Building2, Save, X, MapPin, Globe as GlobeIcon, Mail, Phone, Calendar, Users, Link as LinkIcon, Award, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { COUNTRIES } from '../utils/countries'

interface AddOrganizationProps {
  userId: string
  accessToken: string
  serverUrl: string
  onClose: () => void
  onSuccess?: () => void
}

export function AddOrganization({ userId, accessToken, serverUrl, onClose, onSuccess }: AddOrganizationProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    isAssociation: false,
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
    fetchCategories()
  }, [])

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
        console.log('Categories loaded:', data)
        setCategories(data)
      } else {
        console.error('Failed to fetch categories:', await response.text())
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      alert('Please enter an organization name')
      return
    }
    if (!formData.description.trim()) {
      alert('Please enter a description')
      return
    }
    if (!formData.categoryId) {
      alert('Please select a category')
      return
    }
    if (!formData.country) {
      alert('Please select a country')
      return
    }

    console.log('Form data before submit:', formData)

    setSaving(true)

    try {
      // Construct location string: "City, Country"
      const location = formData.city && formData.country 
        ? `${formData.city}, ${formData.country}`
        : formData.country || ''

      // Find the category name from the ID
      const selectedCategory = categories.find(cat => cat.id === formData.categoryId)
      if (!selectedCategory) {
        alert('Invalid category selected')
        setSaving(false)
        return
      }

      const createPayload = {
        name: formData.name,
        description: formData.description,
        category: selectedCategory.name, // Send category name, not ID
        is_association: formData.isAssociation,
        location: location,
        country: formData.country, // Add country separately for map highlighting
        website: formData.website || null,
        contact_email: formData.email || null,
        contact_phone: formData.phone || null,
        founded_year: formData.founded || null,
        company_size: formData.companySize || null,
        linkedin_url: formData.linkedin || null,
        twitter_url: formData.twitter || null,
        instagram_url: formData.instagram || null,
        facebook_url: formData.facebook || null,
        is_published: false, // Start as draft
      }

      console.log('Creating company with payload:', createPayload)

      const response = await fetch(`${serverUrl}/companies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createPayload)
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Company created:', data)
        if (onSuccess) {
          onSuccess()
        }
        onClose()
      } else {
        const error = await response.json()
        console.error('Failed to create company:', error)
        alert('Failed to create organization: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating company:', error)
      alert('Error creating organization')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-hemp-primary via-hemp-secondary to-hemp-primary border-b-4 border-hemp-primary/30 backdrop-blur-xl shadow-lg shadow-hemp-primary/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                disabled={saving}
              >
                <X className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-black text-2xl text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Add New Organization
                </h1>
                <p className="text-sm text-white/80 font-semibold">Join the Hemp Atlas community</p>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
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
          
          {/* Info Banner */}
          <div className="mb-8 p-6 bg-gradient-to-r from-hemp-primary/20 to-hemp-secondary/20 border-2 border-hemp-primary/40 rounded-2xl">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-hemp-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-black text-lg text-hemp-primary uppercase tracking-wider mb-2">Welcome to the Hemp Atlas!</h3>
                <p className="text-white/90 font-semibold text-sm leading-relaxed">
                  Add your organization to the global hemp directory. Your listing will be saved as a draft and you can publish it once you're ready. Organizations can earn association badges and connect with the community.
                </p>
              </div>
            </div>
          </div>

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

              {/* Is Association - Enhanced with emphasis */}
              <div className="p-5 rounded-xl border-2 border-amber-400/40 bg-amber-500/10">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="isAssociation"
                    checked={formData.isAssociation}
                    onChange={(e) => setFormData({ ...formData, isAssociation: e.target.checked })}
                    className="w-5 h-5 rounded border-amber-400/50 mt-0.5 bg-emerald-950/50"
                  />
                  <div className="flex-1">
                    <label htmlFor="isAssociation" className="text-sm font-black text-amber-300 uppercase tracking-wider block mb-2 cursor-pointer">
                      Legal Association / Non-Profit Organization
                    </label>
                    <p className="text-xs text-white/80 leading-relaxed font-semibold">
                      Check this box to confirm your organization is a registered association, non-profit, or official industry body. 
                      Associations can validate member companies and issue official badges.
                    </p>
                  </div>
                </div>
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

          {/* Bottom Submit Button */}
          <div className="mt-8 pt-8 border-t border-hemp-primary/30 flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full md:w-auto bg-gradient-to-r from-hemp-primary to-hemp-secondary text-white hover:from-hemp-primary/90 hover:to-hemp-secondary/90 font-black text-lg py-6 px-12 rounded-2xl shadow-xl shadow-hemp-primary/30 hover:shadow-2xl hover:shadow-hemp-primary/40 transition-all gap-3"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Organization...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Create Organization</span>
                </>
              )}
            </Button>
          </div>

          {/* Draft Notice */}
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <p className="text-xs text-amber-400 font-bold text-center">
              Your organization will be created as a draft. You can publish it later from "Manage My Org".
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}