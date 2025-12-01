import React, { useState, useCallback } from 'react'
import { X, Upload, Download, FileText, CheckCircle2, AlertCircle, Loader2, Package } from 'lucide-react'
import Papa from 'papaparse'

interface CSVImporterProps {
  isOpen: boolean
  onClose: () => void
  companyId: string
  accessToken: string
  serverUrl: string
  onImportComplete: () => void
}

interface ProductRow {
  name: string
  description?: string
  excerpt?: string
  price?: string
  currency?: string
  primary_image_url?: string
  category?: string
  tags?: string
  external_shop_url?: string
  external_shop_platform?: string
  in_stock?: string
  inventory?: string
  requires_badge?: string
  required_badge_type?: string
  is_featured?: string
}

interface ParsedProduct {
  name: string
  description?: string
  excerpt?: string
  price?: number
  currency: string
  primary_image_url?: string
  category?: string
  tags?: string[]
  external_shop_url?: string
  external_shop_platform?: string
  in_stock: boolean
  inventory?: number
  requires_badge: boolean
  required_badge_type?: string
  is_featured: boolean
}

interface ValidationError {
  row: number
  field: string
  message: string
}

export function SwagProductCSVImporter({
  isOpen,
  onClose,
  companyId,
  accessToken,
  serverUrl,
  onImportComplete
}: CSVImporterProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })
  const [importComplete, setImportComplete] = useState(false)
  const [importResults, setImportResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 })

  const downloadTemplate = () => {
    const link = document.createElement('a')
    link.href = '/swag_products_template.csv'
    link.download = 'swag_products_template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const parseCSV = useCallback((file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('📄 CSV parsed:', results.data.length, 'rows')
        
        const products: ParsedProduct[] = []
        const errors: ValidationError[] = []

        results.data.forEach((row: any, index: number) => {
          const rowNumber = index + 2 // +2 because Excel starts at 1 and we have header row

          // Validate required fields
          if (!row.name || row.name.trim() === '') {
            errors.push({ row: rowNumber, field: 'name', message: 'Name is required' })
            return
          }

          // Parse price
          let price: number | undefined = undefined
          if (row.price && row.price.trim() !== '') {
            const parsedPrice = parseFloat(row.price)
            if (isNaN(parsedPrice) || parsedPrice < 0) {
              errors.push({ row: rowNumber, field: 'price', message: 'Invalid price' })
            } else {
              price = parsedPrice
            }
          }

          // Parse inventory
          let inventory: number | undefined = undefined
          if (row.inventory && row.inventory.trim() !== '') {
            const parsedInventory = parseInt(row.inventory)
            if (isNaN(parsedInventory) || parsedInventory < 0) {
              errors.push({ row: rowNumber, field: 'inventory', message: 'Invalid inventory' })
            } else {
              inventory = parsedInventory
            }
          }

          // Parse tags (comma-separated string to array)
          let tags: string[] | undefined = undefined
          if (row.tags && row.tags.trim() !== '') {
            tags = row.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag !== '')
          }

          // Parse boolean fields
          const parseBool = (value: any): boolean => {
            if (typeof value === 'boolean') return value
            if (typeof value === 'string') {
              const lower = value.toLowerCase().trim()
              return lower === 'true' || lower === 'yes' || lower === '1'
            }
            return false
          }

          const product: ParsedProduct = {
            name: row.name.trim(),
            description: row.description?.trim(),
            excerpt: row.excerpt?.trim(),
            price,
            currency: row.currency?.trim() || 'USD',
            primary_image_url: row.primary_image_url?.trim(),
            category: row.category?.trim(),
            tags,
            external_shop_url: row.external_shop_url?.trim(),
            external_shop_platform: row.external_shop_platform?.trim() || 'custom',
            in_stock: row.in_stock ? parseBool(row.in_stock) : true,
            inventory,
            requires_badge: row.requires_badge ? parseBool(row.requires_badge) : false,
            required_badge_type: row.required_badge_type?.trim(),
            is_featured: row.is_featured ? parseBool(row.is_featured) : false
          }

          products.push(product)
        })

        console.log('✅ Parsed products:', products.length)
        console.log('❌ Validation errors:', errors.length)
        
        setParsedProducts(products)
        setValidationErrors(errors)
      },
      error: (error) => {
        console.error('❌ CSV parse error:', error)
        alert('Failed to parse CSV file. Please check the file format.')
      }
    })
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type === 'text/csv') {
      parseCSV(file)
    } else {
      alert('Please upload a CSV file')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      parseCSV(file)
    }
  }

  const handleImport = async () => {
    if (parsedProducts.length === 0 || validationErrors.length > 0) return

    setImporting(true)
    setImportProgress({ current: 0, total: parsedProducts.length })

    let successCount = 0
    let failedCount = 0

    // Import products one by one (could be optimized to batch later)
    for (let i = 0; i < parsedProducts.length; i++) {
      const product = parsedProducts[i]
      setImportProgress({ current: i + 1, total: parsedProducts.length })

      try {
        const response = await fetch(`${serverUrl}/swag-products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            company_id: companyId,
            name: product.name,
            description: product.description,
            excerpt: product.excerpt,
            price: product.price,
            currency: product.currency,
            primary_image_url: product.primary_image_url,
            category: product.category,
            tags: product.tags,
            external_shop_url: product.external_shop_url,
            external_shop_platform: product.external_shop_platform,
            in_stock: product.in_stock,
            inventory: product.inventory,
            requires_badge: product.requires_badge,
            required_badge_type: product.required_badge_type,
            is_featured: product.is_featured,
            is_published: false // Import as draft by default
          })
        })

        if (response.ok) {
          successCount++
        } else {
          failedCount++
          console.error(`Failed to import product ${i + 1}:`, await response.text())
        }
      } catch (error) {
        failedCount++
        console.error(`Error importing product ${i + 1}:`, error)
      }
    }

    setImportResults({ success: successCount, failed: failedCount })
    setImporting(false)
    setImportComplete(true)

    console.log(`✅ Import complete: ${successCount} success, ${failedCount} failed`)
  }

  const handleClose = () => {
    if (importComplete && importResults.success > 0) {
      onImportComplete() // Refresh product list
    }
    setParsedProducts([])
    setValidationErrors([])
    setImporting(false)
    setImportProgress({ current: 0, total: 0 })
    setImportComplete(false)
    setImportResults({ success: 0, failed: 0 })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950 border-2 border-hemp-primary/30 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="relative p-6 border-b border-hemp-primary/20">
          <div className="absolute inset-0 bg-gradient-to-r from-hemp-primary/10 to-transparent" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-hemp-primary to-hemp-secondary rounded-xl">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-xl text-white">Import Products from CSV</h2>
                <p className="text-sm text-emerald-300/60 font-semibold">Bulk upload your product catalog</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          
          {!parsedProducts.length && !importComplete && (
            <>
              {/* Download Template */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-400/30 rounded-2xl">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-black text-white mb-1">Step 1: Download Template</h3>
                    <p className="text-sm text-white/70 mb-3">
                      Start with our CSV template to ensure all fields are formatted correctly.
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download CSV Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div className="mb-6">
                <h3 className="font-black text-white mb-3">Step 2: Upload Your CSV</h3>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-2xl p-8 text-center transition-all
                    ${isDragging 
                      ? 'border-hemp-primary bg-hemp-primary/10' 
                      : 'border-hemp-primary/30 hover:border-hemp-primary/50 bg-black/20'
                    }
                  `}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-hemp-primary' : 'text-hemp-primary/60'}`} />
                  <p className="font-bold text-white mb-2">
                    {isDragging ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
                  </p>
                  <p className="text-sm text-white/60 mb-4">or</p>
                  <label className="inline-block px-6 py-3 bg-gradient-to-r from-hemp-primary to-hemp-secondary text-white font-bold rounded-xl cursor-pointer hover:scale-105 transition-transform">
                    Browse Files
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* CSV Format Guide */}
              <div className="p-4 bg-black/20 border border-hemp-primary/20 rounded-xl">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-hemp-primary" />
                  CSV Format Requirements
                </h4>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• <strong className="text-white">name</strong> - Product name (required)</li>
                  <li>• <strong className="text-white">price</strong> - Price in decimal format (e.g., 29.99)</li>
                  <li>• <strong className="text-white">category</strong> - apparel, accessories, food, wellness, seeds, education, other</li>
                  <li>• <strong className="text-white">tags</strong> - Comma-separated tags (e.g., "organic,sustainable,hemp")</li>
                  <li>• <strong className="text-white">requires_badge</strong> - true/false for badge-gated products</li>
                  <li>• <strong className="text-white">external_shop_url</strong> - Link to Shopify, Lazada, Shopee, etc.</li>
                </ul>
              </div>
            </>
          )}

          {/* Preview Table */}
          {parsedProducts.length > 0 && !importComplete && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-white">Preview Products</h3>
                  <p className="text-sm text-emerald-300/60">
                    {parsedProducts.length} products ready to import
                  </p>
                </div>
                {validationErrors.length > 0 && (
                  <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-400 font-bold">
                      {validationErrors.length} validation errors
                    </p>
                  </div>
                )}
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-red-400 mb-2">Fix these errors before importing:</h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {validationErrors.map((error, index) => (
                          <p key={index} className="text-sm text-red-300">
                            Row {error.row}: <strong>{error.field}</strong> - {error.message}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Preview Table */}
              <div className="overflow-x-auto bg-black/20 rounded-xl border border-hemp-primary/20">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-hemp-primary/20">
                      <th className="text-left p-3 font-bold text-white">Name</th>
                      <th className="text-left p-3 font-bold text-white">Price</th>
                      <th className="text-left p-3 font-bold text-white">Category</th>
                      <th className="text-left p-3 font-bold text-white">Stock</th>
                      <th className="text-left p-3 font-bold text-white">Badge Gated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedProducts.slice(0, 10).map((product, index) => (
                      <tr key={index} className="border-b border-hemp-primary/10 hover:bg-white/5">
                        <td className="p-3 text-white font-semibold">{product.name}</td>
                        <td className="p-3 text-emerald-300">
                          {product.price ? `${product.currency} ${product.price.toFixed(2)}` : 'N/A'}
                        </td>
                        <td className="p-3 text-white/70">{product.category || 'other'}</td>
                        <td className="p-3 text-white/70">
                          {product.in_stock ? (product.inventory || 'Unlimited') : 'Out of Stock'}
                        </td>
                        <td className="p-3">
                          {product.requires_badge ? (
                            <span className="px-2 py-1 bg-purple-500/20 border border-purple-400/30 rounded text-xs text-purple-300 font-bold">
                              {product.required_badge_type || 'Badge Required'}
                            </span>
                          ) : (
                            <span className="text-white/40">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedProducts.length > 10 && (
                  <div className="p-3 text-center text-sm text-white/60 border-t border-hemp-primary/10">
                    Showing 10 of {parsedProducts.length} products
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Import Progress */}
          {importing && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-hemp-primary animate-spin mx-auto mb-4" />
              <p className="font-bold text-white mb-2">Importing Products...</p>
              <p className="text-sm text-emerald-300/60">
                {importProgress.current} of {importProgress.total} products
              </p>
              <div className="mt-4 max-w-md mx-auto bg-black/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-hemp-primary to-hemp-secondary h-full transition-all duration-300"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Import Complete */}
          {importComplete && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="font-black text-2xl text-white mb-2">Import Complete!</h3>
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-black text-green-400">{importResults.success}</p>
                  <p className="text-sm text-white/60">Imported</p>
                </div>
                {importResults.failed > 0 && (
                  <div className="text-center">
                    <p className="text-3xl font-black text-red-400">{importResults.failed}</p>
                    <p className="text-sm text-white/60">Failed</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-emerald-300/70 mb-4">
                Products have been imported as drafts. Review and publish them from the SWAG tab.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!importing && !importComplete && (
          <div className="p-6 border-t border-hemp-primary/20 flex items-center justify-between">
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            {parsedProducts.length > 0 && (
              <button
                onClick={handleImport}
                disabled={validationErrors.length > 0}
                className={`
                  px-6 py-3 font-bold rounded-xl transition-all flex items-center gap-2
                  ${validationErrors.length > 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-hemp-primary to-hemp-secondary text-white hover:scale-105'
                  }
                `}
              >
                <Upload className="w-4 h-4" />
                Import {parsedProducts.length} Products
              </button>
            )}
          </div>
        )}

        {importComplete && (
          <div className="p-6 border-t border-hemp-primary/20">
            <button
              onClick={handleClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-hemp-primary to-hemp-secondary text-white font-bold rounded-xl hover:scale-105 transition-transform"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
