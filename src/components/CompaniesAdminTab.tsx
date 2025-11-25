import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Building2, Plus, Trash2, Users, Award, Check, X, Pencil } from 'lucide-react'
import { Skeleton } from './ui/skeleton'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

interface Company {
  id: string
  name: string
  description: string
  website: string | null
  logo_url: string | null
  category_id: string
  category_name: string
  location: string | null
  is_published: boolean
  is_association: boolean
  owner_id: string
  owner_email: string
  created_at: string
  badges: any[]
  category?: {
    id: string
    name: string
    icon: string
  }
}

interface Category {
  id: string
  name: string
  description: string
  icon: string
  created_at: string
}

interface CompanyStats {
  totalCompanies: number
  publishedCompanies: number
  draftCompanies: number
  associations: number
  totalCategories: number
  companiesWithBadges: number
}

interface CompaniesAdminTabProps {
  accessToken: string
  serverUrl: string
}

export function CompaniesAdminTab({ accessToken, serverUrl }: CompaniesAdminTabProps) {
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'stats' | 'companies' | 'categories'>('stats')
  
  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const [submittingCategory, setSubmittingCategory] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [companiesRes, categoriesRes] = await Promise.all([
        fetch(`${serverUrl}/admin/companies`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${serverUrl}/admin/categories`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
      ])

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json()
        setCompanies(companiesData)
        
        // Calculate stats
        const stats: CompanyStats = {
          totalCompanies: companiesData.length,
          publishedCompanies: companiesData.filter((c: Company) => c.is_published).length,
          draftCompanies: companiesData.filter((c: Company) => !c.is_published).length,
          associations: companiesData.filter((c: Company) => c.is_association).length,
          totalCategories: 0,
          companiesWithBadges: companiesData.filter((c: Company) => c.badges && c.badges.length > 0).length
        }
        setStats(stats)
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
        
        // Update stats with category count
        if (stats) {
          setStats({ ...stats, totalCategories: categoriesData.length })
        }
      }
    } catch (error) {
      console.error('Error fetching companies data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      alert('Category name is required')
      return
    }

    setSubmittingCategory(true)
    try {
      const response = await fetch(`${serverUrl}/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: categoryName.trim(),
          description: categoryDescription.trim() || null
        })
      })

      if (response.ok) {
        alert('✅ Category created successfully!')
        setCategoryName('')
        setCategoryDescription('')
        setShowCategoryForm(false)
        fetchData() // Refresh data
      } else {
        const error = await response.text()
        alert(`Failed to create category: ${error}`)
      }
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Error creating category')
    } finally {
      setSubmittingCategory(false)
    }
  }

  const handleUpdateCategory = async (categoryId: string) => {
    if (!categoryName.trim()) {
      alert('Category name is required')
      return
    }

    setSubmittingCategory(true)
    try {
      const response = await fetch(`${serverUrl}/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: categoryName.trim(),
          description: categoryDescription.trim() || null
        })
      })

      if (response.ok) {
        alert('✅ Category updated successfully!')
        setCategoryName('')
        setCategoryDescription('')
        setEditingCategoryId(null)
        setShowCategoryForm(false)
        fetchData() // Refresh data
      } else {
        const error = await response.text()
        alert(`Failed to update category: ${error}`)
      }
    } catch (error) {
      console.error('Error updating category:', error)
      alert('Error updating category')
    } finally {
      setSubmittingCategory(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`${serverUrl}/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })

      if (response.ok) {
        alert('✅ Category deleted successfully!')
        fetchData()
      } else {
        const error = await response.text()
        alert(`Failed to delete category: ${error}`)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error deleting category')
    }
  }

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category.id)
    setCategoryName(category.name)
    setCategoryDescription(category.description || '')
    setShowCategoryForm(true)
  }

  const cancelEdit = () => {
    setEditingCategoryId(null)
    setCategoryName('')
    setCategoryDescription('')
    setShowCategoryForm(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* View Tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { id: 'stats', label: '📊 Overview' },
          { id: 'companies', label: '🏢 Companies' },
          { id: 'categories', label: '📂 Categories' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeView === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats View */}
      {activeView === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Companies */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Companies</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalCompanies}</p>
                </div>
                <Building2 className="w-10 h-10 text-emerald-500" />
              </div>
            </Card>

            {/* Published Companies */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-3xl font-bold mt-2 text-green-500">{stats.publishedCompanies}</p>
                </div>
                <Check className="w-10 h-10 text-green-500" />
              </div>
            </Card>

            {/* Draft Companies */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                  <p className="text-3xl font-bold mt-2 text-amber-500">{stats.draftCompanies}</p>
                </div>
                <Pencil className="w-10 h-10 text-amber-500" />
              </div>
            </Card>

            {/* Associations */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Associations</p>
                  <p className="text-3xl font-bold mt-2 text-blue-500">{stats.associations}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </Card>

            {/* Categories */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-3xl font-bold mt-2 text-purple-500">{stats.totalCategories}</p>
                </div>
                <Building2 className="w-10 h-10 text-purple-500" />
              </div>
            </Card>

            {/* Companies with Badges */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">With Badges</p>
                  <p className="text-3xl font-bold mt-2 text-amber-500">{stats.companiesWithBadges}</p>
                </div>
                <Award className="w-10 h-10 text-amber-500" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Companies List View */}
      {activeView === 'companies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">All Companies</h3>
            <Badge variant="secondary">{companies.length} total</Badge>
          </div>

          <div className="space-y-3">
            {companies.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">No companies yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Users can create companies via the Company Manager in Community Market
                </p>
              </Card>
            ) : (
              companies.map(company => (
                <Card key={company.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-lg">{company.name}</h4>
                        {company.is_association && (
                          <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                            Association
                          </Badge>
                        )}
                        {company.is_published ? (
                          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                            Published
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                            Draft
                          </Badge>
                        )}
                        {company.badges && company.badges.length > 0 && (
                          <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30">
                            <Award className="w-3 h-3 mr-1" />
                            {company.badges.length} {company.badges.length === 1 ? 'Badge' : 'Badges'}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {company.description}
                      </p>

                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-muted-foreground">Owner:</span>{' '}
                          <span className="font-medium">{company.owner_email}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Category:</span>{' '}
                          <Badge variant="outline">{company.category?.name || company.category_name || 'Uncategorized'}</Badge>
                        </div>
                        {company.location && (
                          <div>
                            <span className="text-muted-foreground">Location:</span>{' '}
                            <span className="font-medium">{company.location}</span>
                          </div>
                        )}
                      </div>

                      {company.website && (
                        <div className="mt-2">
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {company.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Categories Management View */}
      {activeView === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Category Management</h3>
            <Button
              onClick={() => {
                setShowCategoryForm(!showCategoryForm)
                if (showCategoryForm) {
                  cancelEdit()
                }
              }}
              className="gap-2"
            >
              {showCategoryForm ? (
                <>
                  <X className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Category
                </>
              )}
            </Button>
          </div>

          {/* Category Form */}
          {showCategoryForm && (
            <Card className="p-6 bg-muted/50">
              <h4 className="font-bold mb-4">
                {editingCategoryId ? 'Edit Category' : 'Create New Category'}
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Category Name *
                  </label>
                  <Input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g., Hemp Products, CBD, Textiles, Construction"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Description (optional)
                  </label>
                  <Textarea
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Brief description of this category..."
                    className="w-full"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={editingCategoryId ? () => handleUpdateCategory(editingCategoryId) : handleCreateCategory}
                    disabled={submittingCategory || !categoryName.trim()}
                    className="gap-2"
                  >
                    {submittingCategory ? (
                      'Saving...'
                    ) : editingCategoryId ? (
                      <>
                        <Check className="w-4 h-4" />
                        Update Category
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Category
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Categories List */}
          <div className="space-y-3">
            {categories.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">No categories yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create your first category to allow users to organize their companies
                </p>
              </Card>
            ) : (
              categories.map(category => (
                <Card key={category.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">{category.name}</h4>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {category.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(category.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditCategory(category)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}