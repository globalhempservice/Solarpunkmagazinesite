import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { 
  ShoppingBag, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Package,
  Palette,
  Award,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface SwagShopAdminProps {
  accessToken: string
  onBack: () => void
}

interface SwagItem {
  id: string
  name: string
  description: string
  price: number
  category: 'merch' | 'theme' | 'badge' | 'feature'
  gradient: string
  icon: string
  limited?: boolean
  stock?: number | null
  active: boolean
}

export function SwagShopAdmin({ accessToken, onBack }: SwagShopAdminProps) {
  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80`
  
  const [items, setItems] = useState<SwagItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<SwagItem | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<Partial<SwagItem>>({
    id: '',
    name: '',
    description: '',
    price: 0,
    category: 'merch',
    gradient: 'from-emerald-500 to-teal-500',
    icon: 'Package',
    limited: false,
    stock: null,
    active: true
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${serverUrl}/admin/swag-items`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      } else {
        setError('Failed to load items')
      }
    } catch (err) {
      console.error('Error fetching items:', err)
      setError('Error loading items')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setIsCreating(true)
    setEditingItem(null)
    setFormData({
      id: '',
      name: '',
      description: '',
      price: 0,
      category: 'merch',
      gradient: 'from-emerald-500 to-teal-500',
      icon: 'Package',
      limited: false,
      stock: null,
      active: true
    })
  }

  const handleEdit = (item: SwagItem) => {
    setEditingItem(item)
    setIsCreating(false)
    setFormData(item)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const url = isCreating
        ? `${serverUrl}/admin/swag-items`
        : `${serverUrl}/admin/swag-items/${editingItem?.id}`

      const response = await fetch(url, {
        method: isCreating ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess(isCreating ? 'Item created!' : 'Item updated!')
        setIsCreating(false)
        setEditingItem(null)
        fetchItems()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save item')
      }
    } catch (err) {
      console.error('Error saving item:', err)
      setError('Error saving item')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`${serverUrl}/admin/swag-items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        setSuccess('Item deleted!')
        fetchItems()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError('Failed to delete item')
      }
    } catch (err) {
      console.error('Error deleting item:', err)
      setError('Error deleting item')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'theme': return <Palette className="w-4 h-4" />
      case 'badge': return <Award className="w-4 h-4" />
      case 'feature': return <Sparkles className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'theme': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
      case 'badge': return 'bg-purple-500/10 text-purple-500 border-purple-500/30'
      case 'feature': return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
      default: return 'bg-orange-500/10 text-orange-500 border-orange-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
                <div className="relative bg-gradient-to-br from-primary to-primary/70 rounded-xl p-2.5">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black">Swag Shop Admin</h1>
                <p className="text-sm text-muted-foreground">Manage store items and products</p>
              </div>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-primary to-primary/70 font-bold gap-2"
            >
              <Plus className="w-4 h-4" />
              New Item
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-destructive/10 border-2 border-destructive/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-emerald-600 dark:text-emerald-400">{success}</p>
          </div>
        )}

        {/* Edit/Create Form */}
        {(isCreating || editingItem) && (
          <Card className="p-6 mb-6 border-2 border-primary/30">
            <h3 className="text-xl font-bold mb-4">
              {isCreating ? 'Create New Item' : 'Edit Item'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Item ID</label>
                  <Input
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="theme-solarpunk"
                    disabled={!isCreating}
                    className="font-mono"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                  >
                    <option value="merch">Merch</option>
                    <option value="theme">Theme</option>
                    <option value="badge">Badge</option>
                    <option value="feature">Feature</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Solarpunk Dreams"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Emerald forests meet golden sun"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Price (NADA)</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    placeholder="150"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">Icon Name</label>
                  <Input
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="Palette"
                    className="font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Gradient Classes</label>
                <Input
                  value={formData.gradient}
                  onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                  placeholder="from-emerald-500 to-teal-500"
                  className="font-mono"
                />
                <div className={`mt-2 h-12 rounded-lg bg-gradient-to-r ${formData.gradient}`} />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.limited}
                    onChange={(e) => setFormData({ ...formData, limited: e.target.checked })}
                    className="w-4 h-4 rounded border-input"
                  />
                  <span className="text-sm font-semibold">Limited Edition</span>
                </label>

                {formData.limited && (
                  <div>
                    <Input
                      type="number"
                      value={formData.stock || ''}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Stock count"
                      className="w-32"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded border-input"
                  />
                  <span className="text-sm font-semibold">Active</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/70 font-bold gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Item
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setIsCreating(false)
                    setEditingItem(null)
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Items List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.id} className="p-4 hover:border-primary/50 transition-colors">
                <div className="space-y-3">
                  {/* Gradient Preview */}
                  <div className={`h-24 rounded-xl bg-gradient-to-r ${item.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10" />
                    {!item.active && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <Badge variant="outline" className="bg-destructive/20 border-destructive text-white">
                          Inactive
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold truncate">{item.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                      </div>
                      <Badge className={getCategoryColor(item.category)}>
                        {getCategoryIcon(item.category)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span className="font-bold text-emerald-500">{item.price} NADA</span>
                      {item.limited && (
                        <Badge variant="outline" className="text-xs">
                          Limited {item.stock && `(${item.stock})`}
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground font-mono mb-3">{item.id}</p>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(item)}
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(item.id)}
                        variant="outline"
                        size="sm"
                        className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No items yet. Create your first item!</p>
          </div>
        )}
      </div>
    </div>
  )
}
