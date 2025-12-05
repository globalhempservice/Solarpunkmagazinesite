// Dummy script to insert 3 sample places: farm, shop, factory
// Run this once to populate the database with test data

import { projectId, publicAnonKey } from './supabase/info'

const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80`

// Sample places data
const dummyPlaces = [
  // 1. Farm in California
  {
    name: "Sunshine Hemp Farm",
    type: "farm",
    category: "agriculture",
    description: "Organic hemp farm specializing in CBD-rich strains and sustainable farming practices. Family-owned since 2015.",
    status: "active",
    latitude: 38.5816,
    longitude: -121.4944,
    address_line1: "4250 Hemp Valley Road",
    city: "Sacramento",
    state_province: "California",
    postal_code: "95814",
    country: "United States",
    phone: "+1 916 555 0101",
    email: "info@sunshinehempfarm.com",
    website: "https://sunshinehempfarm.com",
    owner_name: "Sarah Martinez",
    manager_name: "John Green",
    year_established: 2015,
    specialties: ["CBD", "organic", "fiber"],
    certifications: {
      organic: true,
      license_number: "CA-HEMP-2015-001"
    }
  },
  
  // 2. Shop in Colorado
  {
    name: "Green Valley Hemp Shop",
    type: "street_shop",
    category: "retail",
    description: "Premier hemp and CBD retail store offering a wide selection of products including oils, edibles, topicals, and hemp textiles.",
    status: "active",
    latitude: 39.7392,
    longitude: -104.9903,
    address_line1: "1520 Blake Street",
    city: "Denver",
    state_province: "Colorado",
    postal_code: "80202",
    country: "United States",
    phone: "+1 303 555 0202",
    email: "contact@greenvalleyshop.com",
    website: "https://greenvalleyshop.com",
    owner_name: "Michael Chen",
    manager_name: "Lisa Johnson",
    year_established: 2018,
    operating_hours: {
      monday: "9:00-20:00",
      tuesday: "9:00-20:00",
      wednesday: "9:00-20:00",
      thursday: "9:00-20:00",
      friday: "9:00-21:00",
      saturday: "10:00-21:00",
      sunday: "11:00-18:00"
    }
  },
  
  // 3. Factory in Oregon
  {
    name: "Pacific Hemp Processing Plant",
    type: "manufacturing",
    category: "processing",
    description: "State-of-the-art hemp processing facility specializing in extraction, refinement, and product manufacturing. USDA certified.",
    status: "active",
    latitude: 45.5152,
    longitude: -122.6784,
    address_line1: "8900 Industrial Parkway",
    city: "Portland",
    state_province: "Oregon",
    postal_code: "97220",
    country: "United States",
    phone: "+1 503 555 0303",
    email: "operations@pacifichempplant.com",
    website: "https://pacifichempplant.com",
    owner_name: "Pacific Hemp Industries LLC",
    manager_name: "David Rodriguez",
    year_established: 2019,
    products_services: ["extraction", "refinement", "wholesale"],
    specialties: ["CBD extraction", "industrial hemp", "manufacturing"],
    certifications: {
      usda_certified: true,
      iso_9001: true,
      license_number: "OR-PROC-2019-042"
    }
  }
]

export async function insertDummyPlaces(accessToken: string) {
  console.log('🌍 Inserting dummy places...')
  
  for (const place of dummyPlaces) {
    try {
      const response = await fetch(`${serverUrl}/admin/places`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(place)
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Created place: ${place.name}`)
      } else {
        const error = await response.json()
        console.error(`❌ Failed to create ${place.name}:`, error)
      }
    } catch (error) {
      console.error(`❌ Error creating ${place.name}:`, error)
    }
  }
  
  console.log('✅ Done inserting dummy places!')
}

// This is a utility script - it doesn't export a React component
// To use: Call insertDummyPlaces(accessToken) from your app when logged in as admin
