/**
 * TEST UTILITY FOR SWAG API
 * 
 * This file helps you test the swag API endpoints.
 * You can run these tests in your browser console or create a test page.
 */

// Configuration - Update these with your actual values
const CONFIG = {
  projectId: 'YOUR_PROJECT_ID', // From Supabase dashboard
  publicAnonKey: 'YOUR_ANON_KEY', // From Supabase dashboard
  accessToken: 'YOUR_ACCESS_TOKEN', // Get from login
  companyId: 'YOUR_COMPANY_ID', // A company you own
  serverUrl: 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-053bcd80'
}

// Test 1: Get all published products (public, no auth)
export async function testGetAllProducts() {
  console.log('🧪 Test 1: GET all products')
  
  const response = await fetch(`${CONFIG.serverUrl}/swag-products`, {
    headers: {
      'Authorization': `Bearer ${CONFIG.publicAnonKey}`
    }
  })
  
  const data = await response.json()
  console.log('✅ Response:', data)
  return data
}

// Test 2: Get single product by ID (public)
export async function testGetProduct(productId: string) {
  console.log('🧪 Test 2: GET single product')
  
  const response = await fetch(`${CONFIG.serverUrl}/swag-products/${productId}`, {
    headers: {
      'Authorization': `Bearer ${CONFIG.publicAnonKey}`
    }
  })
  
  const data = await response.json()
  console.log('✅ Response:', data)
  return data
}

// Test 3: Get products by company (public)
export async function testGetProductsByCompany(companyId?: string) {
  console.log('🧪 Test 3: GET products by company')
  
  const cId = companyId || CONFIG.companyId
  const response = await fetch(`${CONFIG.serverUrl}/swag-products/by-company/${cId}`, {
    headers: {
      'Authorization': `Bearer ${CONFIG.publicAnonKey}`
    }
  })
  
  const data = await response.json()
  console.log('✅ Response:', data)
  return data
}

// Test 4: Get my company's products (requires auth)
export async function testGetMyProducts(companyId?: string) {
  console.log('🧪 Test 4: GET my products (includes unpublished)')
  
  const cId = companyId || CONFIG.companyId
  const response = await fetch(`${CONFIG.serverUrl}/swag-products/my/${cId}`, {
    headers: {
      'Authorization': `Bearer ${CONFIG.accessToken}`
    }
  })
  
  const data = await response.json()
  console.log('✅ Response:', data)
  return data
}

// Test 5: Create a product (requires auth)
export async function testCreateProduct(productData?: any) {
  console.log('🧪 Test 5: CREATE product')
  
  const defaultProduct = {
    company_id: CONFIG.companyId,
    name: 'Test Hemp T-Shirt',
    description: 'A beautiful organic hemp t-shirt for testing',
    excerpt: 'Organic hemp tee',
    price: 29.99,
    currency: 'USD',
    category: 'apparel',
    tags: ['hemp', 'organic', 'clothing'],
    inventory: 100,
    in_stock: true,
    is_active: true,
    is_featured: false,
    is_published: true
  }
  
  const product = productData || defaultProduct
  
  const response = await fetch(`${CONFIG.serverUrl}/swag-products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(product)
  })
  
  const data = await response.json()
  console.log('✅ Response:', data)
  return data
}

// Test 6: Update a product (requires auth)
export async function testUpdateProduct(productId: string, updates: any) {
  console.log('🧪 Test 6: UPDATE product')
  
  const response = await fetch(`${CONFIG.serverUrl}/swag-products/${productId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CONFIG.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  })
  
  const data = await response.json()
  console.log('✅ Response:', data)
  return data
}

// Test 7: Delete a product (requires auth)
export async function testDeleteProduct(productId: string) {
  console.log('🧪 Test 7: DELETE product')
  
  const response = await fetch(`${CONFIG.serverUrl}/swag-products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${CONFIG.accessToken}`
    }
  })
  
  const data = await response.json()
  console.log('✅ Response:', data)
  return data
}

// Test 8: Upload image (requires auth)
export async function testUploadImage(file: File) {
  console.log('🧪 Test 8: UPLOAD image')
  
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(`${CONFIG.serverUrl}/swag-products/upload-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.accessToken}`
    },
    body: formData
  })
  
  const data = await response.json()
  console.log('✅ Response:', data)
  return data
}

// Test 9: Get categories with counts
export async function testGetCategories() {
  console.log('🧪 Test 9: GET categories')
  
  const response = await fetch(`${CONFIG.serverUrl}/swag-products/meta/categories`, {
    headers: {
      'Authorization': `Bearer ${CONFIG.publicAnonKey}`
    }
  })
  
  const data = await response.json()
  console.log('✅ Response:', data)
  return data
}

// Test 10: Search products
export async function testSearchProducts(query: string, category?: string) {
  console.log('🧪 Test 10: SEARCH products')
  
  let url = `${CONFIG.serverUrl}/swag-products?search=${encodeURIComponent(query)}`
  if (category) {
    url += `&category=${encodeURIComponent(category)}`
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${CONFIG.publicAnonKey}`
    }
  })
  
  const data = await response.json()
  console.log('✅ Response:', data)
  return data
}

// Run all tests in sequence
export async function runAllTests() {
  console.log('🚀 Running all swag API tests...\n')
  
  try {
    // Public tests (no auth required)
    await testGetAllProducts()
    await testGetCategories()
    await testSearchProducts('hemp')
    
    // Authenticated tests (requires valid token)
    if (CONFIG.accessToken && CONFIG.accessToken !== 'YOUR_ACCESS_TOKEN') {
      await testGetMyProducts()
      
      // Create a test product
      const created = await testCreateProduct()
      
      if (created && created.id) {
        // Update it
        await testUpdateProduct(created.id, {
          price: 39.99,
          is_featured: true
        })
        
        // Get it by ID
        await testGetProduct(created.id)
        
        // Delete it (cleanup)
        await testDeleteProduct(created.id)
      }
    } else {
      console.log('⚠️ Skipping authenticated tests - no access token provided')
    }
    
    console.log('\n✅ All tests completed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Browser console helper
if (typeof window !== 'undefined') {
  ;(window as any).swagTests = {
    config: CONFIG,
    testGetAllProducts,
    testGetProduct,
    testGetProductsByCompany,
    testGetMyProducts,
    testCreateProduct,
    testUpdateProduct,
    testDeleteProduct,
    testUploadImage,
    testGetCategories,
    testSearchProducts,
    runAllTests
  }
  
  console.log('🧪 Swag API Tests loaded!')
  console.log('Update window.swagTests.config with your values, then run:')
  console.log('  window.swagTests.runAllTests()')
  console.log('Or run individual tests:')
  console.log('  window.swagTests.testGetAllProducts()')
}
