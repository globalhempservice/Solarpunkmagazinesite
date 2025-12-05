// Countries and Cities Data for Location Forms
// Prioritized list of countries with hemp/cannabis industries

export interface Country {
  code: string
  name: string
  emoji: string
}

export interface City {
  name: string
  country: string
}

// Top countries with hemp/cannabis industries (prioritized)
export const COUNTRIES: Country[] = [
  // North America
  { code: 'US', name: 'United States', emoji: '🇺🇸' },
  { code: 'CA', name: 'Canada', emoji: '🇨🇦' },
  { code: 'MX', name: 'Mexico', emoji: '🇲🇽' },
  
  // Europe
  { code: 'NL', name: 'Netherlands', emoji: '🇳🇱' },
  { code: 'DE', name: 'Germany', emoji: '🇩🇪' },
  { code: 'ES', name: 'Spain', emoji: '🇪🇸' },
  { code: 'FR', name: 'France', emoji: '🇫🇷' },
  { code: 'IT', name: 'Italy', emoji: '🇮🇹' },
  { code: 'GB', name: 'United Kingdom', emoji: '🇬🇧' },
  { code: 'CH', name: 'Switzerland', emoji: '🇨🇭' },
  { code: 'PT', name: 'Portugal', emoji: '🇵🇹' },
  { code: 'CZ', name: 'Czech Republic', emoji: '🇨🇿' },
  { code: 'PL', name: 'Poland', emoji: '🇵🇱' },
  { code: 'DK', name: 'Denmark', emoji: '🇩🇰' },
  { code: 'SE', name: 'Sweden', emoji: '🇸🇪' },
  { code: 'NO', name: 'Norway', emoji: '🇳🇴' },
  { code: 'AT', name: 'Austria', emoji: '🇦🇹' },
  { code: 'BE', name: 'Belgium', emoji: '🇧🇪' },
  { code: 'IE', name: 'Ireland', emoji: '🇮🇪' },
  
  // South America
  { code: 'UY', name: 'Uruguay', emoji: '🇺🇾' },
  { code: 'CO', name: 'Colombia', emoji: '🇨🇴' },
  { code: 'BR', name: 'Brazil', emoji: '🇧🇷' },
  { code: 'AR', name: 'Argentina', emoji: '🇦🇷' },
  { code: 'CL', name: 'Chile', emoji: '🇨🇱' },
  
  // Asia-Pacific
  { code: 'AU', name: 'Australia', emoji: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', emoji: '🇳🇿' },
  { code: 'TH', name: 'Thailand', emoji: '🇹🇭' },
  { code: 'IL', name: 'Israel', emoji: '🇮🇱' },
  { code: 'CN', name: 'China', emoji: '🇨🇳' },
  { code: 'IN', name: 'India', emoji: '🇮🇳' },
  { code: 'JP', name: 'Japan', emoji: '🇯🇵' },
  { code: 'KR', name: 'South Korea', emoji: '🇰🇷' },
  
  // Africa
  { code: 'ZA', name: 'South Africa', emoji: '🇿🇦' },
  { code: 'MA', name: 'Morocco', emoji: '🇲🇦' },
  { code: 'LS', name: 'Lesotho', emoji: '🇱🇸' },
  
  // Caribbean
  { code: 'JM', name: 'Jamaica', emoji: '🇯🇲' },
  
  // Other
  { code: 'OTHER', name: 'Other', emoji: '🌍' }
]

// Major cities by country (sample data for autocomplete)
export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'US': [
    'Los Angeles', 'San Francisco', 'Oakland', 'San Diego', 'San Jose',
    'Denver', 'Boulder', 'Colorado Springs',
    'Portland', 'Eugene', 'Salem',
    'Seattle', 'Spokane', 'Tacoma',
    'Las Vegas', 'Reno',
    'Phoenix', 'Tucson',
    'New York', 'Brooklyn', 'Buffalo',
    'Boston', 'Cambridge', 'Worcester',
    'Chicago', 'Springfield',
    'Detroit', 'Ann Arbor',
    'Miami', 'Tampa', 'Orlando',
    'Austin', 'Houston', 'Dallas', 'San Antonio',
    'Atlanta', 'Savannah',
    'Nashville', 'Memphis',
    'Philadelphia', 'Pittsburgh',
    'Minneapolis', 'St. Paul',
    'St. Louis', 'Kansas City',
    'Albuquerque', 'Santa Fe',
    'Anchorage',
    'Honolulu'
  ],
  'CA': [
    'Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton',
    'Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Victoria',
    'Calgary', 'Edmonton', 'Red Deer',
    'Montreal', 'Quebec City', 'Laval', 'Gatineau',
    'Winnipeg', 'Brandon',
    'Saskatoon', 'Regina',
    'Halifax', 'Dartmouth',
    'St. John\'s',
    'Charlottetown',
    'Fredericton',
    'Whitehorse',
    'Yellowknife',
    'Iqaluit'
  ],
  'MX': [
    'Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana',
    'León', 'Juárez', 'Zapopan', 'Mérida', 'San Luis Potosí',
    'Querétaro', 'Morelia', 'Aguascalientes', 'Toluca', 'Cancún'
  ],
  'NL': [
    'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven',
    'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen'
  ],
  'DE': [
    'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt',
    'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig',
    'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg'
  ],
  'ES': [
    'Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza',
    'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'
  ],
  'FR': [
    'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice',
    'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'
  ],
  'IT': [
    'Rome', 'Milan', 'Naples', 'Turin', 'Palermo',
    'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania'
  ],
  'GB': [
    'London', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow',
    'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh',
    'Cardiff', 'Belfast', 'Leicester', 'Coventry', 'Bradford'
  ],
  'CH': [
    'Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern',
    'Winterthur', 'Lucerne', 'St. Gallen', 'Lugano', 'Biel'
  ],
  'PT': [
    'Lisbon', 'Porto', 'Braga', 'Coimbra', 'Funchal',
    'Setúbal', 'Almada', 'Aveiro', 'Évora', 'Faro'
  ],
  'AU': [
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide',
    'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Hobart'
  ],
  'NZ': [
    'Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga',
    'Dunedin', 'Palmerston North', 'Napier', 'Nelson', 'Rotorua'
  ],
  'BR': [
    'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza',
    'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'
  ],
  'AR': [
    'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata',
    'San Miguel de Tucumán', 'Mar del Plata', 'Salta', 'Santa Fe', 'San Juan'
  ],
  'UY': [
    'Montevideo', 'Salto', 'Ciudad de la Costa', 'Paysandú', 'Las Piedras',
    'Rivera', 'Maldonado', 'Tacuarembó', 'Melo', 'Mercedes'
  ],
  'CO': [
    'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
    'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué'
  ],
  'CL': [
    'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta',
    'Temuco', 'Rancagua', 'Talca', 'Arica', 'Chillán'
  ],
  'TH': [
    'Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Nakhon Ratchasima',
    'Hat Yai', 'Udon Thani', 'Surat Thani', 'Khon Kaen', 'Nakhon Si Thammarat'
  ],
  'IL': [
    'Jerusalem', 'Tel Aviv', 'Haifa', 'Rishon LeZion', 'Petah Tikva',
    'Ashdod', 'Netanya', 'Beersheba', 'Holon', 'Bnei Brak'
  ],
  'ZA': [
    'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
    'Bloemfontein', 'East London', 'Nelspruit', 'Polokwane', 'Kimberley'
  ],
  'JM': [
    'Kingston', 'Spanish Town', 'Portmore', 'Montego Bay', 'May Pen',
    'Mandeville', 'Ocho Rios', 'Port Antonio', 'Negril', 'Savanna-la-Mar'
  ]
}

// Get cities for a country (with fallback to empty array)
export function getCitiesForCountry(countryCode: string): string[] {
  return CITIES_BY_COUNTRY[countryCode] || []
}

// Search cities by query (case-insensitive)
export function searchCities(countryCode: string, query: string): string[] {
  const cities = getCitiesForCountry(countryCode)
  if (!query || query.length < 1) return cities
  
  const lowerQuery = query.toLowerCase()
  return cities.filter(city => city.toLowerCase().includes(lowerQuery))
}

// Validate if a city exists in our database for a country
export function isValidCity(countryCode: string, cityName: string): boolean {
  const cities = getCitiesForCountry(countryCode)
  return cities.some(city => city.toLowerCase() === cityName.toLowerCase())
}

// Get country by code
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code)
}

// Get country by name
export function getCountryByName(name: string): Country | undefined {
  return COUNTRIES.find(c => c.name.toLowerCase() === name.toLowerCase())
}
