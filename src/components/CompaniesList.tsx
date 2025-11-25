import { useState, useEffect } from 'react'
import { Building2, Plus, Filter } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { CompanyCard } from './CompanyCard'
import { publicAnonKey } from '../utils/supabase/info'

interface CompaniesListProps {
  serverUrl: string
  userId?: string
  accessToken?: string
  onOpenManager?: () => void
  onViewCompany: (companyId: string) => void
}

export function CompaniesList({ serverUrl, userId, accessToken, onOpenManager, onViewCompany }: CompaniesListProps) {
  const [companies, setCompanies] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchCompanies()
    fetchCategories()
  }, [])

  const fetchCompanies = async () => {
    try {
      console.log('🏢 Fetching companies from:', `${serverUrl}/companies`)
      const response = await fetch(`${serverUrl}/companies`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      console.log('🏢 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🏢 Fetched companies:', data.length)
        setCompanies(data)
        setError(null)
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to fetch companies:', response.status, errorText)
        setError(`Failed to fetch companies: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('❌ Error fetching companies:', error)
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      console.log('📂 Fetching categories from:', `${serverUrl}/companies/categories`)
      const response = await fetch(`${serverUrl}/companies/categories`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('📂 Fetched categories:', data?.length || 0)
        setCategories(data || [])
      } else {
        console.error('❌ Failed to fetch categories:', response.status)
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error)
    }
  }

  const filteredCompanies = selectedCategory === 'all'
    ? companies
    : companies.filter(c => c.category?.name === selectedCategory)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hemp-primary"></div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-hemp-primary to-hemp-secondary">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black">Hemp Companies</h2>
              <p className="text-sm text-muted-foreground">
                Discover businesses in the hemp industry
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12 bg-destructive/10 rounded-2xl border-2 border-destructive/30">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-destructive opacity-50" />
          <h3 className="font-black mb-2 text-destructive">Error Loading Companies</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            {error}
          </p>
          <Button onClick={() => {
            setLoading(true)
            setError(null)
            fetchCompanies()
          }} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-hemp-primary to-hemp-secondary">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-black">Hemp Companies</h2>
            <p className="text-sm text-muted-foreground">
              Discover businesses in the hemp industry
            </p>
          </div>
        </div>
        {userId && accessToken && onOpenManager && (
          <Button onClick={onOpenManager} className="gap-2">
            <Plus className="w-4 h-4" />
            Manage Companies
          </Button>
        )}
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-hemp-primary text-white'
                : 'bg-muted hover:bg-muted-foreground/10'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors shrink-0 ${
                selectedCategory === category.name
                  ? 'bg-hemp-primary text-white'
                  : 'bg-muted hover:bg-muted-foreground/10'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-2xl border-2 border-dashed border-muted">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-black mb-2">No companies yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {selectedCategory !== 'all'
              ? `No companies found in ${selectedCategory} category`
              : 'Be the first to add your company to the directory'}
          </p>
          {userId && accessToken && onOpenManager && (
            <Button onClick={onOpenManager}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your Company
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onClick={() => onViewCompany(company.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}