import { useState, useEffect } from 'react'
import { X, MapPin, Save } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { toast } from 'sonner@2.0.3'
import { motion } from 'motion/react'

interface PlaceEditModalProps {
  place: any | null // null means creating new place
  onClose: () => void
  onSave: () => void
  accessToken: string | null
  serverUrl: string
}

// Place type options
const PLACE_TYPES = [
  // Agriculture
  { value: 'field', label: 'Field', category: 'agriculture' },
  { value: 'farm', label: 'Farm', category: 'agriculture' },
  { value: 'greenhouse', label: 'Greenhouse', category: 'agriculture' },
  { value: 'seed_bank', label: 'Seed Bank', category: 'agriculture' },
  
  // Processing & Manufacturing
  { value: 'processing', label: 'Processing Facility', category: 'processing' },
  { value: 'manufacturing', label: 'Manufacturing Plant', category: 'processing' },
  { value: 'extraction', label: 'Extraction Facility', category: 'processing' },
  { value: 'textile_mill', label: 'Textile Mill', category: 'processing' },
  
  // Storage & Distribution
  { value: 'warehouse', label: 'Warehouse', category: 'storage' },
  { value: 'distribution', label: 'Distribution Center', category: 'storage' },
  { value: 'cold_storage', label: 'Cold Storage', category: 'storage' },
  
  // Retail
  { value: 'farm_shop', label: 'Farm Shop', category: 'retail' },
  { value: 'street_shop', label: 'Street Shop', category: 'retail' },
  { value: 'dispensary', label: 'Dispensary', category: 'retail' },
  { value: 'online_store', label: 'Online Store', category: 'retail' },
  
  // Medical & Research
  { value: 'medical_facility', label: 'Medical Facility', category: 'medical' },
  { value: 'research_lab', label: 'Research Lab', category: 'medical' },
  { value: 'testing_facility', label: 'Testing Facility', category: 'medical' },
  
  // Other
  { value: 'corporate_office', label: 'Corporate Office', category: 'other' },
  { value: 'education_center', label: 'Education Center', category: 'other' },
  { value: 'advocacy_org', label: 'Advocacy Organization', category: 'other' },
]

export function PlaceEditModal({ place, onClose, onSave, accessToken, serverUrl }: PlaceEditModalProps) {
  const isCreating = !place
  
  // Form state
  const [formData, setFormData] = useState({
    name: place?.name || '',
    type: place?.type || '',
    category: place?.category || '',
    description: place?.description || '',
    status: place?.status || 'active',
    
    // Location
    latitude: place?.latitude || '',
    longitude: place?.longitude || '',
    
    // Address
    address_line1: place?.address_line1 || '',
    address_line2: place?.address_line2 || '',
    city: place?.city || '',
    state_province: place?.state_province || '',
    postal_code: place?.postal_code || '',
    country: place?.country || '',
    
    // Contact
    phone: place?.phone || '',
    email: place?.email || '',
    website: place?.website || '',
    
    // Association
    company_id: place?.company_id || '',
    owner_name: place?.owner_name || '',
    manager_name: place?.manager_name || '',
    
    // Operating details
    year_established: place?.year_established || '',
    
    // NEW: Advanced fields
    seasonal_info: place?.seasonal_info || '',
    logo_url: place?.logo_url || '',
  })
  
  const [saving, setSaving] = useState(false)
  
  // Auto-set category when type changes
  useEffect(() => {
    if (formData.type) {
      const selectedType = PLACE_TYPES.find(t => t.value === formData.type)
      if (selectedType && selectedType.category !== formData.category) {
        setFormData(prev => ({ ...prev, category: selectedType.category }))
      }
    }
  }, [formData.type])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Place name is required')
      return
    }
    if (!formData.type) {
      toast.error('Place type is required')
      return
    }
    if (!formData.country.trim()) {
      toast.error('Country is required')
      return
    }
    if (!formData.latitude || !formData.longitude) {
      toast.error('Latitude and longitude are required')
      return
    }
    
    setSaving(true)
    
    try {
      const endpoint = isCreating 
        ? `${serverUrl}/admin/places`
        : `${serverUrl}/admin/places/${place.id}`
      
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        category: formData.category,
        description: formData.description.trim() || null,
        status: formData.status,
        latitude: parseFloat(formData.latitude as string),
        longitude: parseFloat(formData.longitude as string),
        address_line1: formData.address_line1.trim() || null,
        address_line2: formData.address_line2.trim() || null,
        city: formData.city.trim() || null,
        state_province: formData.state_province.trim() || null,
        postal_code: formData.postal_code.trim() || null,
        country: formData.country.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        website: formData.website.trim() || null,
        company_id: formData.company_id || null,
        owner_name: formData.owner_name.trim() || null,
        manager_name: formData.manager_name.trim() || null,
        year_established: formData.year_established ? parseInt(formData.year_established as string) : null,
        seasonal_info: formData.seasonal_info.trim() || null,
        logo_url: formData.logo_url.trim() || null,
      }
      
      const response = await fetch(endpoint, {
        method: isCreating ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        toast.success(`Place ${isCreating ? 'created' : 'updated'} successfully!`)
        onSave()
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save place')
      }
    } catch (error) {
      console.error('Error saving place:', error)
      toast.error('Error saving place')
    } finally {
      setSaving(false)
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl shadow-2xl w-full max-w-4xl border border-slate-700 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isCreating ? 'Create New Place' : 'Edit Place'}
              </h2>
              <p className="text-sm text-slate-400">
                {isCreating ? 'Add a new location to the directory' : 'Update location information'}
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Place Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Green Valley Hemp Farm"
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white"
                  required
                >
                  <option value="">Select type...</option>
                  {PLACE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Category (Auto-filled)
                </label>
                <Input
                  value={formData.category}
                  readOnly
                  className="bg-slate-900 border-slate-700 text-slate-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white"
                >
                  <option value="active">Active</option>
                  <option value="planned">Planned</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Year Established
                </label>
                <Input
                  type="number"
                  value={formData.year_established}
                  onChange={(e) => setFormData({ ...formData, year_established: e.target.value })}
                  placeholder="e.g., 2020"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the place..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white resize-none"
                />
              </div>
            </div>
          </div>
          
          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
              Location Coordinates
            </h3>
            <p className="text-xs text-slate-400">
              💡 Tip: Use <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">Google Maps</a> to find exact coordinates. Right-click on the location and select the coordinates to copy them.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Latitude *
                </label>
                <Input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="e.g., 45.5231"
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Longitude *
                </label>
                <Input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="e.g., -122.6765"
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
              Address
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Address Line 1
                </label>
                <Input
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  placeholder="Street address"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Address Line 2
                </label>
                <Input
                  value={formData.address_line2}
                  onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                  placeholder="Apt, suite, building, etc."
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  City
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  State/Province
                </label>
                <Input
                  value={formData.state_province}
                  onChange={(e) => setFormData({ ...formData, state_province: e.target.value })}
                  placeholder="State or province"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Postal Code
                </label>
                <Input
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  placeholder="Postal/ZIP code"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Country *
                </label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g., United States"
                  className="bg-slate-800 border-slate-700 text-white"
                  required
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
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Phone
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@example.com"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Website
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
          </div>
          
          {/* Association */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
              Association
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Company ID (Optional)
                </label>
                <Input
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  placeholder="UUID of associated company"
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Link this place to a company in the directory
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Owner Name
                </label>
                <Input
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  placeholder="Name of owner"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Manager Name
                </label>
                <Input
                  value={formData.manager_name}
                  onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                  placeholder="Name of manager"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
          </div>
          
          {/* Advanced Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
              Advanced Fields
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Seasonal Information
                </label>
                <textarea
                  value={formData.seasonal_info}
                  onChange={(e) => setFormData({ ...formData, seasonal_info: e.target.value })}
                  placeholder="Information about seasonal operations..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white resize-none"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Logo URL
                </label>
                <Input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="bg-slate-800 border-slate-700 text-white"
                />
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
            className="border-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isCreating ? 'Create Place' : 'Save Changes'}
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}