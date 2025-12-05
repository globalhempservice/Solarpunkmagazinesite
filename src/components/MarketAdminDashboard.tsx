import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Pencil, Trash2, Search, Building2, MapPin, Package, X, Filter, ArrowUpDown, BarChart3, TrendingUp, Clock, MousePointerClick, CheckCircle, XCircle, Link2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { toast } from 'sonner@2.0.3'
import { motion, AnimatePresence } from 'motion/react'
import { OrganizationEditModal } from './OrganizationEditModal'
import { ProductEditModal } from './ProductEditModal'
import { PlaceEditModal } from './PlaceEditModal'
import { SearchAnalyticsView } from './SearchAnalyticsView'
import { PlaceRelationshipsAdminView } from './PlaceRelationshipsAdminView'
import { OrgRelationshipsAdminView } from './OrgRelationshipsAdminView'

interface MarketAdminDashboardProps {
  userId: string | null
  accessToken: string | null
  serverUrl: string
  onBack: () => void
}

type TabType = 'organizations' | 'products' | 'places' | 'place-relationships' | 'org-relationships' | 'analytics'
type SortField = 'name' | 'created' | 'updated'
type SortDirection = 'asc' | 'desc'

interface Organization {
  id: string
  name: string
  description: string
  logo_url?: string
  website?: string
  location?: string
  country?: string
  created_at: string
  updated_at: string
  owner_id: string
  owner_email?: string
  category_id?: string
  category?: {
    id: string
    name: string
    icon?: string
  }
  badges?: any[]
  is_published?: boolean
  founded_year?: number
  company_size?: string
  contact_email?: string
}

interface Product {
  id: string
  name: string
  description: string
  primary_image_url?: string
  image_url?: string
  images?: string[]
  price?: number
  currency?: string
  made_in_country?: string
  company_id?: string
  company?: {
    id: string
    name: string
    logo_url?: string
    owner_id?: string
  }
  category?: string
  is_published?: boolean
  is_active?: boolean
  is_featured?: boolean
  requires_badge?: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

interface Place {
  id: string
  name: string
  type: string
  category: string
  description?: string
  status: 'active' | 'planned' | 'closed'
  location?: any
  area_boundary?: any
  area_hectares?: number
  address_line1?: string
  address_line2?: string
  city?: string
  state_province?: string
  postal_code?: string
  country: string
  phone?: string
  email?: string
  website?: string
  social_media?: any
  company_id?: string
  company?: {
    id: string
    name: string
    logo_url?: string
  }
  owner_name?: string
  manager_name?: string
  products_services?: string[]
  specialties?: string[]
  certifications?: any
  operating_hours?: any
  seasonal_info?: string
  year_established?: number
  photos?: string[]
  videos?: string[]
  logo_url?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export function MarketAdminDashboard({
  userId,
  accessToken,
  serverUrl,
  onBack
}: MarketAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('organizations')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('created')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  // Data states
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  
  // Edit/Delete modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  
  // Fetch data on mount and when tab changes
  useEffect(() => {
    // Skip fetchData for analytics tab since it has its own data fetching
    if (accessToken && activeTab !== 'analytics') {
      fetchData()
    }
  }, [activeTab, accessToken])
  
  const fetchData = async () => {
    setLoading(true)
    try {
      let endpoint = ''
      if (activeTab === 'organizations') {
        endpoint = '/admin/companies'  // Admin endpoint to get ALL companies
      } else if (activeTab === 'products') {
        endpoint = '/admin/swag-products'  // Admin endpoint to get ALL products
      } else if (activeTab === 'places') {
        endpoint = '/admin/places'  // Admin endpoint to get ALL places
      } else {
        // No endpoint for analytics or unknown tabs
        setLoading(false)
        return
      }
      
      const response = await fetch(`${serverUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Admin data fetched:', { tab: activeTab, count: Array.isArray(data) ? data.length : 'N/A' })
        
        if (activeTab === 'organizations') {
          // Admin endpoint returns array directly
          setOrganizations(Array.isArray(data) ? data : [])
        } else if (activeTab === 'products') {
          setProducts(Array.isArray(data) ? data : data.products || [])
        } else if (activeTab === 'places') {
          setPlaces(Array.isArray(data) ? data : data.places || [])
        }
      } else {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        toast.error(`Failed to load ${activeTab}`)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }
  
  const handleDelete = async (id: string) => {
    try {
      let endpoint = ''
      if (activeTab === 'organizations') {
        endpoint = `/admin/companies/${id}`  // Admin endpoint for company deletion
      } else if (activeTab === 'products') {
        endpoint = `/admin/swag-products/${id}`  // Admin endpoint for product deletion
      } else if (activeTab === 'places') {
        endpoint = `/admin/places/${id}`  // Admin endpoint (will need to create)
      }
      
      console.log('🗑️ Deleting:', { tab: activeTab, id, endpoint })
      
      const response = await fetch(`${serverUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        toast.success(`${activeTab.slice(0, -1)} deleted successfully!`)
        fetchData()
        setShowDeleteConfirm(false)
        setSelectedItem(null)
      } else {
        const errorText = await response.text()
        console.error('Delete error:', errorText)
        toast.error('Failed to delete')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Error deleting item')
    }
  }
  
  // Filter and sort data
  const getFilteredAndSortedData = () => {
    let data: any[] = []
    
    if (activeTab === 'organizations') {
      data = organizations
    } else if (activeTab === 'products') {
      data = products
    } else if (activeTab === 'places') {
      data = places
    }
    
    // Filter by search query
    if (searchQuery) {
      data = data.filter(item => 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Sort
    data.sort((a, b) => {
      let aVal = ''
      let bVal = ''
      
      if (sortField === 'name') {
        aVal = a.name || ''
        bVal = b.name || ''
      } else if (sortField === 'created') {
        aVal = a.created_at || ''
        bVal = b.created_at || ''
      } else if (sortField === 'updated') {
        aVal = a.updated_at || ''
        bVal = b.updated_at || ''
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
    
    return data
  }
  
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }
  
  const filteredData = getFilteredAndSortedData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Market Admin Dashboard</h1>
                <p className="text-sm text-slate-400">Manage all organizations, products, and places</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {activeTab === 'places' && places.length === 0 && (
                <Button
                  onClick={async () => {
                    // Quick insert dummy places
                    const dummyPlaces = [
                      { name: "Sunshine Hemp Farm", type: "farm", category: "agriculture", description: "Organic hemp farm in California", status: "active", latitude: 38.5816, longitude: -121.4944, city: "Sacramento", state_province: "California", country: "United States", year_established: 2015 },
                      { name: "Green Valley Hemp Shop", type: "street_shop", category: "retail", description: "Hemp retail store in Denver", status: "active", latitude: 39.7392, longitude: -104.9903, city: "Denver", state_province: "Colorado", country: "United States", year_established: 2018 },
                      { name: "Pacific Hemp Processing Plant", type: "manufacturing", category: "processing", description: "Hemp processing facility in Portland", status: "active", latitude: 45.5152, longitude: -122.6784, city: "Portland", state_province: "Oregon", country: "United States", year_established: 2019 }
                    ]
                    
                    toast.info('Creating sample places...')
                    
                    for (const place of dummyPlaces) {
                      try {
                        await fetch(`${serverUrl}/admin/places`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                          },
                          body: JSON.stringify(place)
                        })
                      } catch (error) {
                        console.error('Error creating place:', error)
                      }
                    }
                    
                    toast.success('Sample places created!')
                    fetchData()
                  }}
                  size="sm"
                  variant="outline"
                  className="gap-2 border-pink-500/50 text-pink-400"
                >
                  <Plus className="w-4 h-4" />
                  Add Sample Data
                </Button>
              )}
              <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                SUPERADMIN
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="sticky top-[73px] z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            <Button
              onClick={() => setActiveTab('organizations')}
              variant={activeTab === 'organizations' ? 'default' : 'ghost'}
              className={`gap-2 ${
                activeTab === 'organizations'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                  : ''
              }`}
            >
              <Building2 className="w-4 h-4" />
              Organizations ({organizations.length})
            </Button>
            
            <Button
              onClick={() => setActiveTab('products')}
              variant={activeTab === 'products' ? 'default' : 'ghost'}
              className={`gap-2 ${
                activeTab === 'products'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : ''
              }`}
            >
              <Package className="w-4 h-4" />
              Products ({products.length})
            </Button>
            
            <Button
              onClick={() => setActiveTab('places')}
              variant={activeTab === 'places' ? 'default' : 'ghost'}
              className={`gap-2 ${
                activeTab === 'places'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                  : ''
              }`}
            >
              <MapPin className="w-4 h-4" />
              Places ({places.length})
            </Button>
            
            <Button
              onClick={() => setActiveTab('place-relationships')}
              variant={activeTab === 'place-relationships' ? 'default' : 'ghost'}
              className={`gap-2 ${
                activeTab === 'place-relationships'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : ''
              }`}
            >
              <Link2 className="w-4 h-4" />
              Place Links
            </Button>
            
            <Button
              onClick={() => setActiveTab('org-relationships')}
              variant={activeTab === 'org-relationships' ? 'default' : 'ghost'}
              className={`gap-2 ${
                activeTab === 'org-relationships'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : ''
              }`}
            >
              <Link2 className="w-4 h-4" />
              Org Connections
            </Button>
            
            <Button
              onClick={() => setActiveTab('analytics')}
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              className={`gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                  : ''
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Search Analytics
            </Button>
          </div>
        </div>
      </div>
      
      {/* Search and Controls */}
      <div className="container mx-auto px-4 py-6">
        {activeTab !== 'analytics' && activeTab !== 'place-relationships' && activeTab !== 'org-relationships' && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => {
                  setSelectedItem(null)
                  setShowEditModal(true)
                }}
                size="sm"
                className={`gap-2 ${
                  activeTab === 'organizations' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : activeTab === 'products'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-pink-500 to-rose-500'
                } text-white`}
              >
                <Plus className="w-4 h-4" />
                Create New
              </Button>
              
              <Button
                onClick={() => toggleSort('name')}
                variant="outline"
                size="sm"
                className="gap-2 border-slate-700"
              >
                <ArrowUpDown className="w-4 h-4" />
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Button>
              
              <Button
                onClick={() => toggleSort('created')}
                variant="outline"
                size="sm"
                className="gap-2 border-slate-700"
              >
                <ArrowUpDown className="w-4 h-4" />
                Created {sortField === 'created' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Button>
              
              <Button
                onClick={() => toggleSort('updated')}
                variant="outline"
                size="sm"
                className="gap-2 border-slate-700"
              >
                <ArrowUpDown className="w-4 h-4" />
                Updated {sortField === 'updated' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Button>
            </div>
          </div>
        )}
        
        {/* Conditional Content: Analytics, Relationships, or Data Table */}
        {activeTab === 'analytics' ? (
          <SearchAnalyticsView
            serverUrl={serverUrl}
            accessToken={accessToken}
          />
        ) : activeTab === 'place-relationships' ? (
          <PlaceRelationshipsAdminView
            serverUrl={serverUrl}
            accessToken={accessToken}
          />
        ) : activeTab === 'org-relationships' ? (
          <OrgRelationshipsAdminView
            serverUrl={serverUrl}
            accessToken={accessToken}
          />
        ) : (
          <>
            {/* Data Table */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-700 border-t-emerald-500" />
                <p className="text-slate-400 mt-4">Loading...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">No {activeTab} found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredData.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-white truncate">{item.name}</h3>
                          {item.logo_url && (
                            <img src={item.logo_url} alt="" className="w-8 h-8 rounded object-cover" />
                          )}
                          {item.image_url && (
                            <img src={item.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                          )}
                        </div>
                        
                        {/* System IDs - Admin Metadata for Organizations */}
                        {activeTab === 'organizations' && (
                          <div className="mb-3 p-2 bg-slate-950/50 rounded border border-slate-700/50 space-y-1.5">
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <span className="text-slate-500 font-semibold block mb-0.5">Company ID</span>
                                <code className="text-emerald-400 font-mono block truncate">
                                  {item.id}
                                </code>
                              </div>
                              <div>
                                <span className="text-slate-500 font-semibold block mb-0.5">Owner ID</span>
                                <code className="text-blue-400 font-mono block truncate">
                                  {item.owner_id}
                                </code>
                              </div>
                              {item.category_id && (
                                <div className="col-span-2">
                                  <span className="text-slate-500 font-semibold block mb-0.5">Category ID</span>
                                  <code className="text-purple-400 font-mono block truncate">
                                    {item.category_id}
                                  </code>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-700/50 text-[10px]">
                              <div>
                                <span className="text-slate-500 font-semibold block mb-0.5">Created</span>
                                <span className="text-slate-400 font-mono block">
                                  {new Date(item.created_at).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 font-semibold block mb-0.5">Updated</span>
                                <span className="text-slate-400 font-mono block">
                                  {item.updated_at ? new Date(item.updated_at).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : 'Never'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* System IDs - Admin Metadata for Products */}
                        {activeTab === 'products' && (
                          <div className="mb-3 p-2 bg-slate-950/50 rounded border border-slate-700/50 space-y-1.5">
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <span className="text-slate-500 font-semibold block mb-0.5">Product ID</span>
                                <code className="text-amber-400 font-mono block truncate">
                                  {item.id}
                                </code>
                              </div>
                              <div>
                                <span className="text-slate-500 font-semibold block mb-0.5">Company ID</span>
                                <code className="text-emerald-400 font-mono block truncate">
                                  {item.company_id}
                                </code>
                              </div>
                              {item.created_by && (
                                <div className="col-span-2">
                                  <span className="text-slate-500 font-semibold block mb-0.5">Created By (User ID)</span>
                                  <code className="text-blue-400 font-mono block truncate">
                                    {item.created_by}
                                  </code>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-700/50 text-[10px]">
                              <div>
                                <span className="text-slate-500 font-semibold block mb-0.5">Created</span>
                                <span className="text-slate-400 font-mono block">
                                  {new Date(item.created_at).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 font-semibold block mb-0.5">Updated</span>
                                <span className="text-slate-400 font-mono block">
                                  {item.updated_at ? new Date(item.updated_at).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : 'Never'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* System IDs - Admin Metadata for Places */}
                        {activeTab === 'places' && (
                          <div className="mb-3 p-2 bg-slate-950/50 rounded border border-slate-700/50 space-y-1.5">
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <span className="text-slate-500 font-semibold block mb-0.5">Place ID</span>
                                <code className="text-pink-400 font-mono block truncate">
                                  {item.id}
                                </code>
                              </div>
                              {item.company_id && (
                                <div>
                                  <span className="text-slate-500 font-semibold block mb-0.5">Company ID</span>
                                  <code className="text-emerald-400 font-mono block truncate">
                                    {item.company_id}
                                  </code>
                                </div>
                              )}
                              {item.created_by && (
                                <div className="col-span-2">
                                  <span className="text-slate-500 font-semibold block mb-0.5">Created By (User ID)</span>
                                  <code className="text-blue-400 font-mono block truncate">
                                    {item.created_by}
                                  </code>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-700/50 text-[10px]">
                              <div>
                                <span className="text-slate-500 font-semibold block mb-0.5">Created</span>
                                <span className="text-slate-400 font-mono block">
                                  {new Date(item.created_at).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 font-semibold block mb-0.5">Updated</span>
                                <span className="text-slate-400 font-mono block">
                                  {item.updated_at ? new Date(item.updated_at).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : 'Never'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{item.description}</p>
                        
                        <div className="flex flex-wrap gap-2 text-xs">
                          {/* Organization specific fields */}
                          {item.owner_email && activeTab === 'organizations' && (
                            <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                              👤 {item.owner_email}
                            </Badge>
                          )}
                          {item.category && activeTab === 'organizations' && (
                            <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                              {item.category.icon} {item.category.name}
                            </Badge>
                          )}
                          {item.is_published !== undefined && activeTab === 'organizations' && (
                            <Badge 
                              variant="outline" 
                              className={item.is_published 
                                ? "border-green-500/50 text-green-400" 
                                : "border-yellow-500/50 text-yellow-400"
                              }
                            >
                              {item.is_published ? '✅ Published' : '⏳ Draft'}
                            </Badge>
                          )}
                          {item.badges && item.badges.length > 0 && activeTab === 'organizations' && (
                            <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                              🎖️ {item.badges.length} badge{item.badges.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                          
                          {/* Places specific fields */}
                          {activeTab === 'places' && (
                            <>
                              {item.type && (
                                <Badge variant="outline" className="border-pink-500/50 text-pink-400">
                                  {item.type.replace(/_/g, ' ').toUpperCase()}
                                </Badge>
                              )}
                              {item.category && (
                                <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                                  📂 {item.category}
                                </Badge>
                              )}
                              {item.status && (
                                <Badge 
                                  variant="outline" 
                                  className={
                                    item.status === 'active' 
                                      ? "border-green-500/50 text-green-400" 
                                      : item.status === 'planned'
                                      ? "border-yellow-500/50 text-yellow-400"
                                      : "border-red-500/50 text-red-400"
                                  }
                                >
                                  {item.status === 'active' && '✅'}
                                  {item.status === 'planned' && '🔜'}
                                  {item.status === 'closed' && '🔴'} 
                                  {item.status.toUpperCase()}
                                </Badge>
                              )}
                              {item.area_hectares && (
                                <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                                  🌾 {item.area_hectares.toFixed(2)} hectares
                                </Badge>
                              )}
                              {item.company && (
                                <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                                  🏢 {item.company.name}
                                </Badge>
                              )}
                            </>
                          )}
                          
                          {/* Common fields */}
                          {item.country && (
                            <Badge variant="outline" className="border-slate-600">
                              🌍 {item.country}
                            </Badge>
                          )}
                          {item.location && activeTab === 'organizations' && (
                            <Badge variant="outline" className="border-slate-600">
                              📍 {item.location}
                            </Badge>
                          )}
                          {item.city && (activeTab === 'products' || activeTab === 'places') && (
                            <Badge variant="outline" className="border-slate-600">
                              📍 {item.city}
                            </Badge>
                          )}
                          {item.made_in_country && (
                            <Badge variant="outline" className="border-slate-600">
                              🏭 Made in {item.made_in_country}
                            </Badge>
                          )}
                          {item.price && (
                            <Badge variant="outline" className="border-slate-600">
                              💰 {item.price} NADA
                            </Badge>
                          )}
                          <Badge variant="outline" className="border-slate-600 text-slate-500">
                            Created {new Date(item.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedItem(item)
                            setShowEditModal(true)
                          }}
                          size="sm"
                          variant="outline"
                          className="border-slate-600 hover:bg-slate-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          onClick={() => {
                            setSelectedItem(item)
                            setShowDeleteConfirm(true)
                          }}
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700"
            >
              <h3 className="text-xl font-bold text-white mb-2">Confirm Delete</h3>
              <p className="text-slate-400 mb-6">
                Are you sure you want to delete "{selectedItem.name}"? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="flex-1 border-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDelete(selectedItem.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Edit Modal - Organization */}
      {activeTab === 'organizations' && (
        <OrganizationEditModal
          organization={selectedItem}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedItem(null)
          }}
          onSuccess={() => {
            fetchData() // Refresh the list
          }}
          accessToken={accessToken}
          serverUrl={serverUrl}
        />
      )}
      
      {/* Edit Modal - Product */}
      {activeTab === 'products' && (
        <ProductEditModal
          product={selectedItem}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedItem(null)
          }}
          onSuccess={() => {
            fetchData() // Refresh the list
          }}
          accessToken={accessToken}
          serverUrl={serverUrl}
        />
      )}
      
      {/* Edit Modal - Place */}
      <AnimatePresence>
        {activeTab === 'places' && showEditModal && (
          <PlaceEditModal
            place={selectedItem}
            onClose={() => {
              setShowEditModal(false)
              setSelectedItem(null)
            }}
            onSave={() => {
              fetchData() // Refresh the list
            }}
            accessToken={accessToken}
            serverUrl={serverUrl}
          />
        )}
      </AnimatePresence>
      
      {/* Edit Modal Placeholder for other tabs */}
      <AnimatePresence>
        {showEditModal && selectedItem && activeTab !== 'organizations' && activeTab !== 'products' && activeTab !== 'places' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Edit {activeTab.slice(0, -1)}</h3>
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-slate-400 mb-4">
                Editing: {selectedItem.name}
              </p>
              
              <p className="text-sm text-slate-500 italic">
                Edit functionality for {activeTab} will be available soon.
              </p>
              
              <Button
                onClick={() => setShowEditModal(false)}
                className="mt-6 w-full"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}