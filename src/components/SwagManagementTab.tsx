import { useState, useEffect } from 'react'
import { ShoppingBag, Plus, Edit, Trash2, Eye, EyeOff, Star, Package, DollarSign, ExternalLink, Lock } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

interface SwagProduct {
  id: string
  company_id: string
  name: string
  description: string | null
  excerpt: string | null
  price: number | null
  currency: string
  primary_image_url: string | null
  images: string[]
  inventory: number | null
  in_stock: boolean
  category: string | null
  tags: string[]
  external_shop_url: string | null
  external_shop_platform: string | null
  requires_badge: boolean
  is_active: boolean
  is_featured: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

interface SwagManagementTabProps {
  companyId: string
  accessToken: string
  serverUrl: string
}

export function SwagManagementTab({ companyId, accessToken, serverUrl }: SwagManagementTabProps) {
  const [products, setProducts] = useState<SwagProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<SwagProduct | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'featured' | 'badge-gated'>('all')

  useEffect(() => {
    fetchProducts()
  }, [companyId])

  const fetchProducts = async () => {
    try {
      console.log('🛍️ Fetching swag products for company:', companyId)
      console.log('🔗 Full URL:', `${serverUrl}/make-server-053bcd80/swag-products/my/${companyId}`)
      console.log('🔑 Access token:', accessToken ? 'Present' : 'Missing')
      
      const response = await fetch(`${serverUrl}/make-server-053bcd80/swag-products/my/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      console.log('📡 Response status:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Fetched products:', data)
        setProducts(data.products || [])
      } else {
        // Try to parse as JSON first, fall back to text
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          console.error('❌ Failed to fetch products:', errorData)
        } else {
          const errorText = await response.text()
          console.error('❌ Failed to fetch products. Status:', response.status, 'Response:', errorText)
        }
        setProducts([])
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`${serverUrl}/make-server-053bcd80/swag-products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        console.log('✅ Product deleted')
        fetchProducts()
      } else {
        const error = await response.json()
        console.error('❌ Failed to delete product:', error)
        alert('Failed to delete product')
      }
    } catch (error) {
      console.error('❌ Error deleting product:', error)
      alert('Error deleting product')
    }
  }

  const handleTogglePublish = async (product: SwagProduct) => {
    try {
      const response = await fetch(`${serverUrl}/make-server-053bcd80/swag-products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          is_published: !product.is_published
        })
      })

      if (response.ok) {
        console.log('✅ Product publish status toggled')
        fetchProducts()
      } else {
        const error = await response.json()
        console.error('❌ Failed to toggle publish:', error)
        alert('Failed to toggle publish status')
      }
    } catch (error) {
      console.error('❌ Error toggling publish:', error)
      alert('Error toggling publish status')
    }
  }

  const handleToggleFeatured = async (product: SwagProduct) => {
    try {
      const response = await fetch(`${serverUrl}/make-server-053bcd80/swag-products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          is_featured: !product.is_featured
        })
      })

      if (response.ok) {
        console.log('✅ Product featured status toggled')
        fetchProducts()
      } else {
        const error = await response.json()
        console.error('❌ Failed to toggle featured:', error)
        alert('Failed to toggle featured status')
      }
    } catch (error) {
      console.error('❌ Error toggling featured:', error)
      alert('Error toggling featured status')
    }
  }

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true
    if (filter === 'active') return product.is_active && product.is_published
    if (filter === 'featured') return product.is_featured
    if (filter === 'badge-gated') return product.requires_badge
    return true
  })

  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active && p.is_published).length,
    featured: products.filter(p => p.is_featured).length,
    badgeGated: products.filter(p => p.requires_badge).length
  }

  if (showProductForm) {
    return (
      <div>
        <Button
          onClick={() => {
            setShowProductForm(false)
            setEditingProduct(null)
          }}
          variant="ghost"
          className="mb-4 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
        >
          ← Back to Products
        </Button>
        <ProductForm
          companyId={companyId}
          product={editingProduct}
          accessToken={accessToken}
          serverUrl={serverUrl}
          onSuccess={() => {
            setShowProductForm(false)
            setEditingProduct(null)
            fetchProducts()
          }}
          onCancel={() => {
            setShowProductForm(false)
            setEditingProduct(null)
          }}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-emerald-900/30 border border-emerald-500/10">
          <p className="text-xs text-emerald-300/60 font-bold mb-1">Total Products</p>
          <p className="text-2xl font-black text-emerald-100">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-900/30 border border-emerald-500/10">
          <p className="text-xs text-emerald-300/60 font-bold mb-1">Active</p>
          <p className="text-2xl font-black text-emerald-100">{stats.active}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-900/30 border border-emerald-500/10">
          <p className="text-xs text-emerald-300/60 font-bold mb-1">Featured</p>
          <p className="text-2xl font-black text-emerald-100">{stats.featured}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-900/30 border border-emerald-500/10">
          <p className="text-xs text-emerald-300/60 font-bold mb-1">Badge-Gated</p>
          <p className="text-2xl font-black text-emerald-100">{stats.badgeGated}</p>
        </div>
      </div>

      {/* Filter & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
              filter === 'all'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                : 'text-emerald-400/60 hover:bg-emerald-900/50 hover:text-emerald-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
              filter === 'active'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                : 'text-emerald-400/60 hover:bg-emerald-900/50 hover:text-emerald-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
              filter === 'featured'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                : 'text-emerald-400/60 hover:bg-emerald-900/50 hover:text-emerald-300'
            }`}
          >
            Featured
          </button>
          <button
            onClick={() => setFilter('badge-gated')}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
              filter === 'badge-gated'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                : 'text-emerald-400/60 hover:bg-emerald-900/50 hover:text-emerald-300'
            }`}
          >
            Badge-Gated
          </button>
        </div>

        <Button
          onClick={() => {
            setEditingProduct(null)
            setShowProductForm(true)
          }}
          className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition-all hover:scale-105 active:scale-95 shadow-lg border-2 border-emerald-400/30 text-white font-black"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-emerald-900/20 rounded-2xl border-2 border-dashed border-emerald-500/20">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-emerald-400/50" />
          <h3 className="font-black mb-2 text-white">No Products Yet</h3>
          <p className="text-sm text-emerald-200/60 mb-4">
            Start adding swag products to your shop
          </p>
          <Button
            onClick={() => setShowProductForm(true)}
            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition-all hover:scale-105 active:scale-95 border-2 border-emerald-400/30 text-white font-black"
          >
            <Plus className="w-4 h-4" />
            Add Your First Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-emerald-900/30 border-2 border-emerald-500/10 rounded-2xl overflow-hidden hover:border-emerald-400/30 transition-all duration-200 hover:scale-[1.02]"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-emerald-950/50">
                {product.primary_image_url ? (
                  <img
                    src={product.primary_image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-emerald-400/30" />
                  </div>
                )}
                
                {/* Badges Overlay */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                  {product.is_featured && (
                    <Badge variant="default" className="bg-amber-500/90 border-amber-400/50 text-white text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {product.requires_badge && (
                    <Badge variant="default" className="bg-purple-500/90 border-purple-400/50 text-white text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      Members Only
                    </Badge>
                  )}
                  {!product.is_published && (
                    <Badge variant="outline" className="bg-amber-500/90 border-amber-400/50 text-white text-xs">
                      Draft
                    </Badge>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-black text-white mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-emerald-200/60 line-clamp-2">{product.excerpt || product.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    {product.price ? (
                      <p className="font-black text-lg text-emerald-100">
                        {product.currency} {product.price}
                      </p>
                    ) : (
                      <p className="text-sm text-emerald-300/60">Contact for price</p>
                    )}
                    {product.category && (
                      <p className="text-xs text-emerald-400/60">{product.category}</p>
                    )}
                  </div>
                  
                  {product.external_shop_url && (
                    <a
                      href={product.external_shop_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2 border-t border-emerald-500/10">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTogglePublish(product)}
                    className="flex-1 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
                  >
                    {product.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleFeatured(product)}
                    className="flex-1 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200"
                  >
                    <Star className={`w-3.5 h-3.5 ${product.is_featured ? 'fill-amber-300' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingProduct(product)
                      setShowProductForm(true)
                    }}
                    className="flex-1 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="flex-1 text-red-300 hover:bg-red-500/20 hover:text-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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

// Product Form Component
interface ProductFormProps {
  companyId: string
  product: SwagProduct | null
  accessToken: string
  serverUrl: string
  onSuccess: () => void
  onCancel: () => void
}

function ProductForm({ companyId, product, accessToken, serverUrl, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    excerpt: product?.excerpt || '',
    price: product?.price?.toString() || '',
    currency: product?.currency || 'USD',
    primary_image_url: product?.primary_image_url || '',
    inventory: product?.inventory?.toString() || '',
    in_stock: product?.in_stock ?? true,
    category: product?.category || '',
    external_shop_url: product?.external_shop_url || '',
    external_shop_platform: product?.external_shop_platform || '',
    requires_badge: product?.requires_badge || false,
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured || false,
    is_published: product?.is_published || false,
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = product
        ? `${serverUrl}/make-server-053bcd80/swag-products/${product.id}`
        : `${serverUrl}/make-server-053bcd80/swag-products`

      console.log('🔗 Constructed URL:', url)
      console.log('🏢 Server URL:', serverUrl)
      console.log('📝 Product ID:', product?.id)
      console.log('📋 Method:', product ? 'PUT' : 'POST')

      const requestBody = {
        company_id: companyId,
        name: formData.name,
        description: formData.description || null,
        excerpt: formData.excerpt || null,
        price: formData.price ? parseFloat(formData.price) : null,
        currency: formData.currency,
        primary_image_url: formData.primary_image_url || null,
        inventory: formData.inventory ? parseInt(formData.inventory) : null,
        in_stock: formData.in_stock,
        category: formData.category || null,
        external_shop_url: formData.external_shop_url || null,
        external_shop_platform: formData.external_shop_platform || null,
        requires_badge: formData.requires_badge,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        is_published: formData.is_published,
      }

      console.log('📤 Submitting product:', requestBody)

      const response = await fetch(url, {
        method: product ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        console.log('✅ Product saved successfully')
        onSuccess()
      } else {
        // Try to parse as JSON first, fall back to text
        const contentType = response.headers.get('content-type')
        let errorMessage = 'Failed to save product'
        
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json()
          console.error('❌ Failed to save product:', error)
          errorMessage = error.error || errorMessage
        } else {
          const errorText = await response.text()
          console.error('❌ Failed to save product. Status:', response.status, 'Response:', errorText)
        }
        
        alert(errorMessage)
      }
    } catch (error) {
      console.error('❌ Error saving product:', error)
      alert(`Error saving product: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const categories = ['apparel', 'accessories', 'seeds', 'education', 'other']
  const platforms = ['shopify', 'lazada', 'shopee', 'custom']

  return (
    <form onSubmit={handleSubmit} className="bg-emerald-900/30 border-2 border-emerald-500/10 rounded-2xl p-6 space-y-6">
      <div>
        <h3 className="font-black text-xl text-white mb-2">{product ? 'Edit Product' : 'Add New Product'}</h3>
        <p className="text-sm text-emerald-200/70">
          Fill in the details for your swag product
        </p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-emerald-200 mb-2">Product Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border-2 border-emerald-500/20 bg-emerald-950/50 text-white placeholder-emerald-400/40"
            placeholder="Hemp T-Shirt"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-emerald-200 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border-2 border-emerald-500/20 bg-emerald-950/50 text-white placeholder-emerald-400/40 min-h-24"
            placeholder="Detailed product description..."
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-bold text-emerald-200 mb-2">Short Description (Excerpt)</label>
          <input
            type="text"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border-2 border-emerald-500/20 bg-emerald-950/50 text-white placeholder-emerald-400/40"
            placeholder="A brief summary for product cards"
          />
        </div>

        {/* Price & Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-emerald-200 mb-2">Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-emerald-500/20 bg-emerald-950/50 text-white placeholder-emerald-400/40"
              placeholder="29.99"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-emerald-200 mb-2">Currency</label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-emerald-500/20 bg-emerald-950/50 text-white placeholder-emerald-400/40"
              placeholder="USD"
            />
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-bold text-emerald-200 mb-2">Product Image URL</label>
          <input
            type="url"
            value={formData.primary_image_url}
            onChange={(e) => setFormData({ ...formData, primary_image_url: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border-2 border-emerald-500/20 bg-emerald-950/50 text-white placeholder-emerald-400/40"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Category & Inventory */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-emerald-200 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-emerald-500/20 bg-emerald-950/50 text-white"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-emerald-200 mb-2">Inventory</label>
            <input
              type="number"
              value={formData.inventory}
              onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-emerald-500/20 bg-emerald-950/50 text-white placeholder-emerald-400/40"
              placeholder="Leave empty for unlimited"
            />
          </div>
        </div>

        {/* External Shop */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-emerald-200 mb-2">External Shop URL</label>
            <input
              type="url"
              value={formData.external_shop_url}
              onChange={(e) => setFormData({ ...formData, external_shop_url: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-emerald-500/20 bg-emerald-950/50 text-white placeholder-emerald-400/40"
              placeholder="https://shop.example.com/product"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-emerald-200 mb-2">Platform</label>
            <select
              value={formData.external_shop_platform}
              onChange={(e) => setFormData({ ...formData, external_shop_platform: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-emerald-500/20 bg-emerald-950/50 text-white"
            >
              <option value="">Select platform</option>
              {platforms.map(platform => (
                <option key={platform} value={platform}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/10">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.in_stock}
              onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
              className="w-5 h-5 rounded border-emerald-500/30"
            />
            <span className="text-sm text-emerald-200">In Stock</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.requires_badge}
              onChange={(e) => setFormData({ ...formData, requires_badge: e.target.checked })}
              className="w-5 h-5 rounded border-emerald-500/30"
            />
            <span className="text-sm text-emerald-200">Requires Badge (Members Only)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-emerald-500/30"
            />
            <span className="text-sm text-emerald-200">Active</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="w-5 h-5 rounded border-emerald-500/30"
            />
            <span className="text-sm text-emerald-200">Featured Product</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-5 h-5 rounded border-emerald-500/30"
            />
            <span className="text-sm text-emerald-200">Published (Visible to public)</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-emerald-500/10">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          className="flex-1 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={saving} 
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black"
        >
          {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}