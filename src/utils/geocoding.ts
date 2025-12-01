// Simple geocoding utility with country-level coordinates
// In production, this should use a real geocoding API (Google Maps, Mapbox, etc.)

interface Coordinates {
  lat: number
  lng: number
}

// Country capital coordinates as fallback geocoding
const COUNTRY_COORDS: { [key: string]: Coordinates } = {
  // North America
  'United States of America': { lat: 38.9072, lng: -77.0369 }, // Washington DC
  'United States': { lat: 38.9072, lng: -77.0369 },
  'USA': { lat: 38.9072, lng: -77.0369 },
  'US': { lat: 38.9072, lng: -77.0369 },
  'Canada': { lat: 45.4215, lng: -75.6972 }, // Ottawa
  'Mexico': { lat: 19.4326, lng: -99.1332 }, // Mexico City
  
  // South America
  'Brazil': { lat: -15.8267, lng: -47.9218 }, // Brasília
  'Argentina': { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
  'Chile': { lat: -33.4489, lng: -70.6693 }, // Santiago
  'Colombia': { lat: 4.7110, lng: -74.0721 }, // Bogotá
  'Peru': { lat: -12.0464, lng: -77.0428 }, // Lima
  'Venezuela': { lat: 10.4806, lng: -66.9036 }, // Caracas
  'Uruguay': { lat: -34.9011, lng: -56.1645 }, // Montevideo
  'Ecuador': { lat: -0.1807, lng: -78.4678 }, // Quito
  
  // Europe
  'France': { lat: 48.8566, lng: 2.3522 }, // Paris
  'Germany': { lat: 52.5200, lng: 13.4050 }, // Berlin
  'Spain': { lat: 40.4168, lng: -3.7038 }, // Madrid
  'Italy': { lat: 41.9028, lng: 12.4964 }, // Rome
  'United Kingdom': { lat: 51.5074, lng: -0.1278 }, // London
  'UK': { lat: 51.5074, lng: -0.1278 },
  'Netherlands': { lat: 52.3676, lng: 4.9041 }, // Amsterdam
  'Belgium': { lat: 50.8503, lng: 4.3517 }, // Brussels
  'Switzerland': { lat: 46.9480, lng: 7.4474 }, // Bern
  'Austria': { lat: 48.2082, lng: 16.3738 }, // Vienna
  'Sweden': { lat: 59.3293, lng: 18.0686 }, // Stockholm
  'Norway': { lat: 59.9139, lng: 10.7522 }, // Oslo
  'Denmark': { lat: 55.6761, lng: 12.5683 }, // Copenhagen
  'Finland': { lat: 60.1695, lng: 24.9354 }, // Helsinki
  'Poland': { lat: 52.2297, lng: 21.0122 }, // Warsaw
  'Czech Republic': { lat: 50.0755, lng: 14.4378 }, // Prague
  'Hungary': { lat: 47.4979, lng: 19.0402 }, // Budapest
  'Romania': { lat: 44.4268, lng: 26.1025 }, // Bucharest
  'Greece': { lat: 37.9838, lng: 23.7275 }, // Athens
  'Portugal': { lat: 38.7223, lng: -9.1393 }, // Lisbon
  'Ireland': { lat: 53.3498, lng: -6.2603 }, // Dublin
  'Russia': { lat: 55.7558, lng: 37.6173 }, // Moscow
  'Ukraine': { lat: 50.4501, lng: 30.5234 }, // Kyiv
  'Turkey': { lat: 39.9334, lng: 32.8597 }, // Ankara
  
  // Asia
  'Japan': { lat: 35.6762, lng: 139.6503 }, // Tokyo
  'China': { lat: 39.9042, lng: 116.4074 }, // Beijing
  'India': { lat: 28.6139, lng: 77.2090 }, // New Delhi
  'South Korea': { lat: 37.5665, lng: 126.9780 }, // Seoul
  'Thailand': { lat: 13.7563, lng: 100.5018 }, // Bangkok
  'Vietnam': { lat: 21.0285, lng: 105.8542 }, // Hanoi
  'Philippines': { lat: 14.5995, lng: 120.9842 }, // Manila
  'Indonesia': { lat: -6.2088, lng: 106.8456 }, // Jakarta
  'Malaysia': { lat: 3.1390, lng: 101.6869 }, // Kuala Lumpur
  'Singapore': { lat: 1.3521, lng: 103.8198 }, // Singapore
  'Taiwan': { lat: 25.0330, lng: 121.5654 }, // Taipei
  'Israel': { lat: 32.0853, lng: 34.7818 }, // Tel Aviv
  'United Arab Emirates': { lat: 24.4539, lng: 54.3773 }, // Abu Dhabi
  'Saudi Arabia': { lat: 24.7136, lng: 46.6753 }, // Riyadh
  
  // Africa
  'South Africa': { lat: -25.7479, lng: 28.2293 }, // Pretoria
  'Egypt': { lat: 30.0444, lng: 31.2357 }, // Cairo
  'Morocco': { lat: 33.9716, lng: -6.8498 }, // Rabat
  'Kenya': { lat: -1.2864, lng: 36.8172 }, // Nairobi
  'Nigeria': { lat: 9.0765, lng: 7.3986 }, // Abuja
  
  // Oceania
  'Australia': { lat: -35.2809, lng: 149.1300 }, // Canberra
  'New Zealand': { lat: -41.2865, lng: 174.7762 }, // Wellington
}

// City coordinates for common cities
const CITY_COORDS: { [key: string]: Coordinates } = {
  // USA Cities
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'Seattle': { lat: 47.6062, lng: -122.3321 },
  'Denver': { lat: 39.7392, lng: -104.9903 },
  'Austin': { lat: 30.2672, lng: -97.7431 },
  'Portland': { lat: 45.5152, lng: -122.6784 },
  'Boston': { lat: 42.3601, lng: -71.0589 },
  'Miami': { lat: 25.7617, lng: -80.1918 },
  
  // Canada Cities
  'Toronto': { lat: 43.6532, lng: -79.3832 },
  'Vancouver': { lat: 49.2827, lng: -123.1207 },
  'Montreal': { lat: 45.5017, lng: -73.5673 },
  
  // Europe Cities
  'London': { lat: 51.5074, lng: -0.1278 },
  'Paris': { lat: 48.8566, lng: 2.3522 },
  'Berlin': { lat: 52.5200, lng: 13.4050 },
  'Amsterdam': { lat: 52.3676, lng: 4.9041 },
  'Barcelona': { lat: 41.3851, lng: 2.1734 },
  'Madrid': { lat: 40.4168, lng: -3.7038 },
  'Rome': { lat: 41.9028, lng: 12.4964 },
  'Vienna': { lat: 48.2082, lng: 16.3738 },
  
  // Asia Cities
  'Tokyo': { lat: 35.6762, lng: 139.6503 },
  'Beijing': { lat: 39.9042, lng: 116.4074 },
  'Shanghai': { lat: 31.2304, lng: 121.4737 },
  'Hong Kong': { lat: 22.3193, lng: 114.1694 },
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'Bangkok': { lat: 13.7563, lng: 100.5018 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
  
  // Australia Cities
  'Sydney': { lat: -33.8688, lng: 151.2093 },
  'Melbourne': { lat: -37.8136, lng: 144.9631 },
}

/**
 * Parse a location string and return coordinates
 * Format: "City, Country" or "Country"
 */
export function parseLocation(location: string): Coordinates | null {
  if (!location) return null
  
  const parts = location.split(',').map(s => s.trim())
  
  // Try exact city match first
  if (parts.length > 1) {
    const city = parts[0]
    if (CITY_COORDS[city]) {
      return CITY_COORDS[city]
    }
  }
  
  // Try exact country match
  const countryPart = parts[parts.length - 1]
  if (COUNTRY_COORDS[countryPart]) {
    return COUNTRY_COORDS[countryPart]
  }
  
  // Try partial matches for country
  const countryMatch = Object.keys(COUNTRY_COORDS).find(key => 
    key.toLowerCase().includes(countryPart.toLowerCase()) ||
    countryPart.toLowerCase().includes(key.toLowerCase())
  )
  
  if (countryMatch) {
    return COUNTRY_COORDS[countryMatch]
  }
  
  // If all else fails, add some randomness to the country capital
  // This spreads out markers that would otherwise overlap
  const baseCoords = COUNTRY_COORDS['United States'] // Fallback
  const hash = location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  return {
    lat: baseCoords.lat + ((hash % 100) - 50) / 100,
    lng: baseCoords.lng + ((hash % 100) - 50) / 100
  }
}

/**
 * Add a small random offset to coordinates to prevent exact overlaps
 */
export function addJitter(coords: Coordinates, seed: string): Coordinates {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  return {
    lat: coords.lat + ((hash % 10) - 5) / 50, // ±0.1 degree jitter
    lng: coords.lng + ((hash % 10) - 5) / 50
  }
}

/**
 * Get all available country names for autocomplete/search
 */
export function getCountryList(): string[] {
  return Object.keys(COUNTRY_COORDS).sort()
}

/**
 * Get all available city names for autocomplete/search
 */
export function getCityList(): string[] {
  return Object.keys(CITY_COORDS).sort()
}
