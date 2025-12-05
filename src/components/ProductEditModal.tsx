import { useState, useEffect } from 'react'
import { X, Package, Save, Loader } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { toast } from 'sonner@2.0.3'
import { motion } from 'motion/react'

interface ProductEditModalProps {
  product: any
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  accessToken: string | null
  serverUrl: string
}

// Product categories
const PRODUCT_CATEGORIES = [
  { value: 'apparel', label: 'Apparel', icon: '👕' },
  { value: 'accessories', label: 'Accessories', icon: '🎒' },
  { value: 'seeds', label: 'Seeds & Cultivation', icon: '🌱' },
  { value: 'education', label: 'Education & Media', icon: '📚' },
  { value: 'other', label: 'Other', icon: '✨' }
]

// Currency options
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NADA']

// External shop platforms
const SHOP_PLATFORMS = ['Shopify', 'WooCommerce', 'Etsy', 'Amazon', 'Custom', 'Other']

// Country list (abbreviated)
const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 
  'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark',
  'Australia', 'New Zealand', 'Japan', 'South Korea', 'China', 'India', 'Brazil',
  'Mexico', 'Argentina', 'Chile', 'Colombia', 'Portugal', 'Ireland', 'Poland',
  'Other'
].sort()

export function ProductEditModal({
  product,
  isOpen,
  onClose,
  onSuccess,
  accessToken,
  serverUrl
}: ProductEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    excerpt: '',
    slug: '',
    price: '',
    currency: 'USD',
    primary_image_url: '',
    images: [] as string[],
    inventory: '',
    in_stock: true,
    category: '',
    tags: [] as string[],
    external_shop_url: '',
    external_shop_platform: '',
    requires_badge: false,
    is_active: true,
    is_featured: false,
    is_published: false,
    made_in_country: '',
    materials: '',
    dimensions: '',
    weight: '',
    color_options: [] as string[],
    size_options: [] as string[],
    certifications: [] as string[],
    provenance_verified: false,
    provenance_details: '',
    conscious_score: '',
    sustainability_notes: '',
    shipping_info: '',
    return_policy: ''
  })
  
  const [tagsInput, setTagsInput] = useState('')
  const [colorInput, setColorInput] = useState('')
  const [sizeInput, setSizeInput] = useState('')
  const [certificationsInput, setCertificationsInput] = useState('')
  const [imagesInput, setImagesInput] = useState('')
  const [saving, setSaving] = useState(false)

  // Populate form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        excerpt: product.excerpt || '',
        slug: product.slug || '',
        price: product.price?.toString() || '',
        currency: product.currency || 'USD',
        primary_image_url: product.primary_image_url || '',
        images: product.images || [],
        inventory: product.inventory?.toString() || '',
        in_stock: product.in_stock ?? true,
        category: product.category || '',
        tags: product.tags || [],
        external_shop_url: product.external_shop_url || '',
        external_shop_platform: product.external_shop_platform || '',
        requires_badge: product.requires_badge || false,
        is_active: product.is_active ?? true,
        is_featured: product.is_featured || false,
        is_published: product.is_published || false,
        made_in_country: product.made_in_country || '',
        materials: product.materials || '',
        dimensions: product.dimensions || '',
        weight: product.weight || '',
        color_options: product.color_options || [],
        size_options: product.size_options || [],
        certifications: product.certifications || [],
        provenance_verified: product.provenance_verified || false,
        provenance_details: product.provenance_details || '',
        conscious_score: product.conscious_score?.toString() || '',
        sustainability_notes: product.sustainability_notes || '',
        shipping_info: product.shipping_info || '',
        return_policy: product.return_policy || ''
      })
      
      // Set input strings
      setTagsInput((product.tags || []).join(', '))
      setColorInput((product.color_options || []).join(', '))
      setSizeInput((product.size_options || []).join(', '))
      setCertificationsInput((product.certifications || []).join(', '))
      setImagesInput((product.images || []).join('\n'))
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Product name is required')
      return
    }

    setSaving(true)
    
    try {
      // Parse arrays from input strings
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      const color_options = colorInput.split(',').map(c => c.trim()).filter(Boolean)
      const size_options = sizeInput.split(',').map(s => s.trim()).filter(Boolean)
      const certifications = certificationsInput.split(',').map(c => c.trim()).filter(Boolean)
      const images = imagesInput.split('\n').map(i => i.trim()).filter(Boolean)

      const response = await fetch(`${serverUrl}/admin/swag-products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
          inventory: formData.inventory ? parseInt(formData.inventory) : null,
          conscious_score: formData.conscious_score ? parseInt(formData.conscious_score) : null,
          tags,
          color_options,
          size_options,
          certifications,
          images
        })
      })

      if (response.ok) {
        toast.success('Product updated successfully!')
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Error updating product')
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
        className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit Product</h2>
              <p className="text-sm text-slate-400">{product?.name}</p>
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
                  <label className="text-slate-400 font-semibold">Product ID</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-600">
                    <code className="text-amber-400 font-mono text-xs flex-1 break-all">
                      {product?.id || 'N/A'}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(product?.id || '')
                        toast.success('Product ID copied!')
                      }}
                      className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Company ID</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-600">
                    <code className="text-emerald-400 font-mono text-xs flex-1 break-all">
                      {product?.company_id || 'N/A'}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(product?.company_id || '')
                        toast.success('Company ID copied!')
                      }}
                      className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Company Name</label>
                  <div className="bg-slate-950 p-2 rounded border border-slate-600">
                    <p className="text-white font-mono text-xs">
                      {product?.company?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Created By</label>
                  <div className="bg-slate-950 p-2 rounded border border-slate-600">
                    <code className="text-blue-400 font-mono text-xs break-all">
                      {product?.created_by || 'N/A'}
                    </code>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Created At</label>
                  <div className="bg-slate-950 p-2 rounded border border-slate-600">
                    <p className="text-white font-mono text-xs">
                      {product?.created_at 
                        ? new Date(product.created_at).toLocaleString('en-US', {
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
                      {product?.updated_at 
                        ? new Date(product.updated_at).toLocaleString('en-US', {
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
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="text-white">
                    Product Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="Hemp T-Shirt"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description" className="text-white">
                    Full Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white min-h-[120px]"
                    placeholder="Detailed product description..."
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="excerpt" className="text-white">
                    Short Excerpt
                  </Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleChange('excerpt', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white min-h-[60px]"
                    placeholder="Brief summary..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug" className="text-white">
                    URL Slug
                  </Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="hemp-t-shirt"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-white">
                    Category
                  </Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select category</option>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
                Pricing & Inventory
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price" className="text-white">
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="29.99"
                  />
                </div>
                
                <div>
                  <Label htmlFor="currency" className="text-white">
                    Currency
                  </Label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="inventory" className="text-white">
                    Inventory
                  </Label>
                  <Input
                    id="inventory"
                    type="number"
                    value={formData.inventory}
                    onChange={(e) => handleChange('inventory', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
                Images
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="primary_image_url" className="text-white">
                    Primary Image URL
                  </Label>
                  <Input
                    id="primary_image_url"
                    value={formData.primary_image_url}
                    onChange={(e) => handleChange('primary_image_url', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="images" className="text-white">
                    Additional Images (one URL per line)
                  </Label>
                  <Textarea
                    id="images"
                    value={imagesInput}
                    onChange={(e) => setImagesInput(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white min-h-[100px] font-mono text-xs"
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  />
                </div>
              </div>
            </div>

            {/* External Shop */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
                External Shop
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="external_shop_url" className="text-white">
                    Shop URL
                  </Label>
                  <Input
                    id="external_shop_url"
                    value={formData.external_shop_url}
                    onChange={(e) => handleChange('external_shop_url', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="https://shop.example.com/product"
                  />
                </div>
                
                <div>
                  <Label htmlFor="external_shop_platform" className="text-white">
                    Platform
                  </Label>
                  <select
                    id="external_shop_platform"
                    value={formData.external_shop_platform}
                    onChange={(e) => handleChange('external_shop_platform', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select platform</option>
                    {SHOP_PLATFORMS.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
                Product Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="made_in_country" className="text-white">
                    Made In
                  </Label>
                  <select
                    id="made_in_country"
                    value={formData.made_in_country}
                    onChange={(e) => handleChange('made_in_country', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="materials" className="text-white">
                    Materials
                  </Label>
                  <Input
                    id="materials"
                    value={formData.materials}
                    onChange={(e) => handleChange('materials', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="100% Hemp"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dimensions" className="text-white">
                    Dimensions
                  </Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => handleChange('dimensions', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="10 x 5 x 2 inches"
                  />
                </div>
                
                <div>
                  <Label htmlFor="weight" className="text-white">
                    Weight
                  </Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="200g"
                  />
                </div>
                
                <div>
                  <Label htmlFor="color_options" className="text-white">
                    Color Options (comma separated)
                  </Label>
                  <Input
                    id="color_options"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="Black, White, Green"
                  />
                </div>
                
                <div>
                  <Label htmlFor="size_options" className="text-white">
                    Size Options (comma separated)
                  </Label>
                  <Input
                    id="size_options"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="S, M, L, XL"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="tags" className="text-white">
                    Tags (comma separated)
                  </Label>
                  <Input
                    id="tags"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="hemp, organic, sustainable"
                  />
                </div>
              </div>
            </div>

            {/* Sustainability */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
                Sustainability & Provenance
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="conscious_score" className="text-white">
                    Conscious Score (1-10)
                  </Label>
                  <Input
                    id="conscious_score"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.conscious_score}
                    onChange={(e) => handleChange('conscious_score', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="8"
                  />
                </div>
                
                <div>
                  <Label htmlFor="certifications" className="text-white">
                    Certifications (comma separated)
                  </Label>
                  <Input
                    id="certifications"
                    value={certificationsInput}
                    onChange={(e) => setCertificationsInput(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="Organic, Fair Trade"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="provenance_details" className="text-white">
                    Provenance Details
                  </Label>
                  <Textarea
                    id="provenance_details"
                    value={formData.provenance_details}
                    onChange={(e) => handleChange('provenance_details', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white min-h-[80px]"
                    placeholder="Details about product origin and supply chain..."
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="sustainability_notes" className="text-white">
                    Sustainability Notes
                  </Label>
                  <Textarea
                    id="sustainability_notes"
                    value={formData.sustainability_notes}
                    onChange={(e) => handleChange('sustainability_notes', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white min-h-[80px]"
                    placeholder="Environmental impact, sustainable practices..."
                  />
                </div>
              </div>
            </div>

            {/* Shipping & Policies */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
                Shipping & Policies
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="shipping_info" className="text-white">
                    Shipping Information
                  </Label>
                  <Textarea
                    id="shipping_info"
                    value={formData.shipping_info}
                    onChange={(e) => handleChange('shipping_info', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white min-h-[60px]"
                    placeholder="Ships within 2-3 business days..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="return_policy" className="text-white">
                    Return Policy
                  </Label>
                  <Textarea
                    id="return_policy"
                    value={formData.return_policy}
                    onChange={(e) => handleChange('return_policy', e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white min-h-[60px]"
                    placeholder="30-day return policy..."
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
                Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => handleChange('is_published', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-2 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-white font-semibold">Published</span>
                    <p className="text-xs text-slate-400">Visible to the public</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-2 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-white font-semibold">Active</span>
                    <p className="text-xs text-slate-400">Available for purchase</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => handleChange('is_featured', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-2 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-white font-semibold">Featured</span>
                    <p className="text-xs text-slate-400">Show in featured section</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.in_stock}
                    onChange={(e) => handleChange('in_stock', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-2 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-white font-semibold">In Stock</span>
                    <p className="text-xs text-slate-400">Currently available</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_badge}
                    onChange={(e) => handleChange('requires_badge', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-2 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-white font-semibold">Requires Badge</span>
                    <p className="text-xs text-slate-400">Members only</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.provenance_verified}
                    onChange={(e) => handleChange('provenance_verified', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-2 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-white font-semibold">Provenance Verified</span>
                    <p className="text-xs text-slate-400">Origin authenticated</p>
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
            disabled={saving || !formData.name}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
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
