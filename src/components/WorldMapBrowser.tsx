import { useState, useEffect } from 'react'
import { Building2, MapPin, Globe, ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { CompanyCard } from './CompanyCard'

interface WorldMapBrowserProps {
  serverUrl: string
  userId?: string
  accessToken?: string
  onClose: () => void
  onViewCompany: (companyId: string) => void
}

interface LocationData {
  country: string
  cities: {
    [city: string]: any[]
  }
}

export function WorldMapBrowser({ serverUrl, userId, accessToken, onClose, onViewCompany }: WorldMapBrowserProps) {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [locationData, setLocationData] = useState<{ [country: string]: LocationData }>({})

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const { publicAnonKey } = await import('../utils/supabase/info')
      const response = await fetch(`${serverUrl}/companies`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
        processLocationData(data)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const processLocationData = (companies: any[]) => {
    const locations: { [country: string]: LocationData } = {}
    
    companies.forEach(company => {
      if (company.location) {
        // Parse location - assuming format like "Paris, France" or "Paris" or "France"
        const parts = company.location.split(',').map((s: string) => s.trim())
        const country = parts.length > 1 ? parts[parts.length - 1] : parts[0]
        const city = parts.length > 1 ? parts[0] : 'Other'
        
        if (!locations[country]) {
          locations[country] = {
            country,
            cities: {}
          }
        }
        
        if (!locations[country].cities[city]) {
          locations[country].cities[city] = []
        }
        
        locations[country].cities[city].push(company)
      }
    })
    
    setLocationData(locations)
  }

  // Define country positions on our artistic map (centered coordinates in percentages)
  const countryPositions: { [key: string]: { x: number, y: number, pulse?: boolean } } = {
    'France': { x: 48, y: 32, pulse: true },
    'Germany': { x: 52, y: 30 },
    'Spain': { x: 45, y: 38 },
    'Italy': { x: 52, y: 38 },
    'United Kingdom': { x: 46, y: 28 },
    'USA': { x: 20, y: 35 },
    'Canada': { x: 18, y: 25 },
    'Brazil': { x: 32, y: 62 },
    'Japan': { x: 85, y: 35 },
    'China': { x: 78, y: 32 },
    'India': { x: 72, y: 42 },
    'Australia': { x: 82, y: 68 },
    'South Africa': { x: 54, y: 70 },
    'Netherlands': { x: 50, y: 29 },
    'Switzerland': { x: 50, y: 33 },
    'Sweden': { x: 52, y: 22 },
    'Norway': { x: 50, y: 20 },
    'Denmark': { x: 51, y: 26 },
  }

  const getCountryPosition = (country: string) => {
    return countryPositions[country] || { x: 50, y: 50 }
  }

  const getCompanyCountForCountry = (country: string) => {
    return locationData[country] 
      ? Object.values(locationData[country].cities).flat().length 
      : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Globe className="w-16 h-16 mx-auto mb-4 text-hemp-primary animate-spin" />
          <p className="text-lg">Loading world map...</p>
        </div>
      </div>
    )
  }

  // Show city list when country is selected
  if (selectedCountry && !selectedCity) {
    const countryData = locationData[selectedCountry]
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 p-8">
        <div className="max-w-4xl mx-auto">
          <Button onClick={() => setSelectedCountry(null)} variant="ghost" className="mb-6 gap-2 text-white">
            <ArrowLeft className="w-4 h-4" />
            Back to World Map
          </Button>

          <div className="bg-card/90 backdrop-blur border-2 border-hemp-primary/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-hemp-primary to-hemp-secondary">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-black">{selectedCountry}</h2>
                <p className="text-sm text-muted-foreground">
                  {Object.keys(countryData.cities).length} {Object.keys(countryData.cities).length === 1 ? 'location' : 'locations'}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {Object.entries(countryData.cities).map(([city, cityCompanies]) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className="group p-6 bg-muted/50 hover:bg-hemp-primary/10 border-2 border-border hover:border-hemp-primary rounded-xl transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-hemp-primary" />
                      <div>
                        <h3 className="font-black group-hover:text-hemp-primary transition-colors">{city}</h3>
                        <p className="text-sm text-muted-foreground">
                          {cityCompanies.length} {cityCompanies.length === 1 ? 'company' : 'companies'}
                        </p>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 rotate-180 text-muted-foreground group-hover:text-hemp-primary transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show company list when city is selected
  if (selectedCountry && selectedCity) {
    const cityCompanies = locationData[selectedCountry].cities[selectedCity]
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Button onClick={() => setSelectedCity(null)} variant="ghost" className="gap-2 text-white">
              <ArrowLeft className="w-4 h-4" />
              Back to {selectedCountry}
            </Button>
          </div>

          <div className="mb-6">
            <h2 className="font-black text-white mb-2">{selectedCity}, {selectedCountry}</h2>
            <p className="text-emerald-200">
              {cityCompanies.length} {cityCompanies.length === 1 ? 'company' : 'companies'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cityCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onClick={() => onViewCompany(company.id)}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Main world map view
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 overflow-hidden relative">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-8">
        <Button onClick={onClose} variant="ghost" className="mb-6 gap-2 text-white">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-hemp-primary animate-pulse" />
            <h1 className="font-black text-white">Hemp Companies Worldwide</h1>
            <Sparkles className="w-8 h-8 text-hemp-primary animate-pulse" />
          </div>
          <p className="text-emerald-200 text-lg">
            Click on a country to explore hemp businesses around the world
          </p>
        </div>
      </div>

      {/* Artistic World Map - Enhanced */}
      <div className="relative w-full min-h-[700px] flex items-center justify-center py-12">
        {/* Planet container with 3D perspective */}
        <div className="relative w-full max-w-4xl aspect-square flex items-center justify-center">
          {/* Outer space glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-emerald-400/20 via-teal-500/10 to-transparent blur-[100px] scale-150"></div>
          
          {/* Planet shadow on space */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[90%] h-[90%] rounded-full bg-black/30 blur-3xl transform translate-x-8 translate-y-8"></div>
          </div>

          {/* Main planet sphere */}
          <div className="relative w-[85%] aspect-square max-w-[650px]">
            {/* Planet atmosphere glow */}
            <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-cyan-400/30 via-emerald-400/20 to-teal-500/30 blur-2xl animate-pulse"></div>
            
            {/* Planet core with enhanced SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl relative z-10" style={{ filter: 'drop-shadow(0 0 40px rgba(16, 185, 129, 0.3))' }}>
              {/* Gradients and filters */}
              <defs>
                {/* Ocean gradient - more realistic */}
                <radialGradient id="oceanGradient" cx="40%" cy="40%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="40%" stopColor="#0891b2" />
                  <stop offset="70%" stopColor="#0e7490" />
                  <stop offset="100%" stopColor="#155e75" />
                </radialGradient>

                {/* Land gradient */}
                <radialGradient id="landGradient" cx="40%" cy="40%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </radialGradient>

                {/* Atmosphere gradient */}
                <radialGradient id="atmosphereGradient" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>

                {/* Shadow gradient */}
                <radialGradient id="shadowGradient" cx="70%" cy="70%">
                  <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                  <stop offset="70%" stopColor="rgba(0,0,0,0.3)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
                </radialGradient>

                {/* Cloud pattern */}
                <filter id="cloudBlur">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
                </filter>
              </defs>

              {/* Base ocean sphere */}
              <circle cx="50" cy="50" r="48" fill="url(#oceanGradient)" />

              {/* More realistic continents */}
              <g opacity="1" fill="url(#landGradient)" stroke="#047857" strokeWidth="0.3">
                {/* North America */}
                <path d="M15,25 Q12,28 13,32 L14,35 Q16,38 18,40 Q20,42 22,43 Q24,45 23,48 L22,52 Q20,54 21,57 L23,60 Q25,62 27,62 L29,61 Q28,58 26,56 L25,53 Q24,50 26,48 Q28,46 28,43 L27,40 Q25,37 27,35 Q29,32 28,29 L26,26 Q23,24 20,25 Q17,26 15,25 Z" />
                
                {/* South America */}
                <path d="M28,55 Q30,57 29,60 L28,65 Q27,68 28,71 Q29,74 27,76 L25,77 Q23,76 24,73 L25,70 Q24,67 25,64 L26,61 Q27,58 28,55 Z" />
                
                {/* Europe */}
                <path d="M45,20 Q47,22 48,25 L49,28 Q50,30 52,30 L54,29 Q55,27 54,25 L52,23 Q50,21 48,22 L45,20 Z M46,28 Q48,30 47,32 L45,33 Q44,31 46,28 Z" />
                
                {/* Africa */}
                <path d="M47,32 Q49,34 50,37 L51,42 Q52,47 50,52 L49,56 Q48,60 49,64 Q50,67 48,69 L46,70 Q44,68 45,65 L46,61 Q45,57 46,53 L47,48 Q46,43 47,39 L48,35 Q47,33 47,32 Z" />
                
                {/* Asia */}
                <path d="M55,22 Q58,23 61,25 L65,28 Q68,30 71,32 Q74,34 76,37 L78,40 Q79,43 77,45 L75,47 Q73,48 71,47 L68,45 Q65,43 63,45 L60,47 Q58,48 56,47 L54,45 Q53,42 54,39 L56,36 Q57,33 59,31 L61,28 Q59,26 57,25 L55,22 Z M72,48 Q75,50 77,52 L78,55 Q77,57 75,56 L72,54 Q71,51 72,48 Z" />
                
                {/* Australia */}
                <path d="M75,62 Q78,63 80,65 L82,68 Q83,70 81,72 L79,73 Q76,72 75,70 L74,67 Q73,64 75,62 Z" />
                
                {/* Greenland */}
                <path d="M32,12 Q35,13 37,16 L38,19 Q37,21 35,20 L32,18 Q30,15 32,12 Z" />

                {/* Antarctica hint at bottom */}
                <path d="M20,85 Q30,87 40,86 L50,85 Q60,86 70,87 Q75,86 70,84 L50,83 Q30,84 20,85 Z" opacity="0.6" />

                {/* Islands and details */}
                <circle cx="82" cy="45" r="1.5" opacity="0.8" /> {/* Japan islands */}
                <circle cx="84" cy="47" r="1" opacity="0.8" />
                <circle cx="15" cy="52" r="1" opacity="0.7" /> {/* Caribbean */}
                <circle cx="17" cy="53" r="0.8" opacity="0.7" />
                <circle cx="70" cy="58" r="1.2" opacity="0.7" /> {/* Indonesia */}
                <circle cx="72" cy="59" r="1" opacity="0.7" />
                <circle cx="74" cy="60" r="0.9" opacity="0.7" />
              </g>

              {/* Clouds layer with animation */}
              <g opacity="0.3" fill="white" filter="url(#cloudBlur)">
                <ellipse cx="25" cy="35" rx="8" ry="4" className="animate-drift-slow" />
                <ellipse cx="60" cy="25" rx="10" ry="5" className="animate-drift-medium" />
                <ellipse cx="70" cy="55" rx="7" ry="3.5" className="animate-drift-fast" />
                <ellipse cx="35" cy="65" rx="9" ry="4.5" className="animate-drift-slow" style={{ animationDelay: '2s' }} />
                <ellipse cx="80" cy="40" rx="6" ry="3" className="animate-drift-medium" style={{ animationDelay: '1s' }} />
              </g>

              {/* Atmosphere shine effect */}
              <circle cx="50" cy="50" r="48" fill="url(#atmosphereGradient)" />

              {/* Terminator line (day/night) - subtle */}
              <ellipse cx="50" cy="50" rx="48" ry="48" fill="url(#shadowGradient)" />

              {/* Specular highlight */}
              <ellipse cx="35" cy="30" rx="18" ry="14" fill="white" opacity="0.15" />
              <ellipse cx="33" cy="28" rx="10" ry="8" fill="white" opacity="0.25" />

              {/* Outer rim highlight */}
              <circle cx="50" cy="50" r="47.5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            </svg>

            {/* Country markers - positioned on the planet */}
            {Object.keys(locationData).map(country => {
              const pos = getCountryPosition(country)
              const count = getCompanyCountForCountry(country)
              const isHovered = hoveredCountry === country
              
              return (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  onMouseEnter={() => setHoveredCountry(country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  className="absolute group transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-20"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                  }}
                >
                  {/* Pulse animation for countries with companies */}
                  {pos.pulse && (
                    <div className="absolute inset-0 -m-3">
                      <div className="w-10 h-10 rounded-full bg-hemp-primary/40 animate-ping"></div>
                    </div>
                  )}
                  
                  {/* Connection line to planet surface */}
                  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-t from-hemp-primary to-transparent transition-all duration-300 ${isHovered ? 'h-8 opacity-100' : 'h-4 opacity-50'}`}></div>
                  
                  {/* Marker pin with 3D effect */}
                  <div className={`relative transition-all duration-300 ${isHovered ? 'scale-150 -translate-y-2' : 'scale-100'}`}>
                    {/* Pin shadow */}
                    <div className="absolute inset-0 translate-y-1 blur-sm">
                      <div className="w-10 h-10 rounded-full bg-black/40"></div>
                    </div>
                    
                    {/* Pin gradient border */}
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-hemp-primary via-hemp-secondary to-emerald-600 p-0.5 shadow-2xl shadow-hemp-primary/50">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-hemp-primary to-hemp-secondary flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white drop-shadow-lg" />
                      </div>
                    </div>
                    
                    {/* Counter badge with glow */}
                    <div className="absolute -top-1 -right-1">
                      <div className="absolute inset-0 bg-orange-500 rounded-full blur-md opacity-60"></div>
                      <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white text-xs font-black text-white flex items-center justify-center shadow-lg">
                        {count}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Tooltip */}
                  {isHovered && (
                    <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 whitespace-nowrap z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Tooltip arrow */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-hemp-primary/80"></div>
                      
                      {/* Tooltip content */}
                      <div className="relative bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl border-2 border-hemp-primary/50 rounded-xl px-4 py-3 shadow-2xl shadow-hemp-primary/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-hemp-primary/10 to-hemp-secondary/10 rounded-xl"></div>
                        <div className="relative">
                          <p className="font-black text-base mb-1">{country}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {count} {count === 1 ? 'company' : 'companies'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats Footer - Sticky */}
      <div className="sticky bottom-0 z-10 text-center py-8 bg-gradient-to-t from-emerald-950 via-emerald-950/80 to-transparent backdrop-blur-sm">
        <div className="inline-flex items-center gap-8 bg-card/90 backdrop-blur-xl border-2 border-hemp-primary/40 rounded-2xl px-10 py-5 shadow-2xl shadow-hemp-primary/20">
          <div className="text-center">
            <div className="font-black text-3xl bg-gradient-to-r from-hemp-primary to-hemp-secondary bg-clip-text text-transparent mb-1">
              {Object.keys(locationData).length}
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Countries</div>
          </div>
          <div className="w-px h-14 bg-gradient-to-b from-transparent via-border to-transparent"></div>
          <div className="text-center">
            <div className="font-black text-3xl bg-gradient-to-r from-hemp-primary to-hemp-secondary bg-clip-text text-transparent mb-1">
              {companies.length}
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Companies</div>
          </div>
        </div>
      </div>

      {/* Decorative floating hemp leaves */}
      <div className="absolute top-20 left-20 w-16 h-16 rounded-full bg-hemp-primary/5 blur-2xl animate-pulse"></div>
      <div className="absolute bottom-32 right-20 w-24 h-24 rounded-full bg-hemp-secondary/5 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-10 w-20 h-20 rounded-full bg-emerald-400/5 blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* CSS Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes drift-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(5px); }
        }

        @keyframes drift-medium {
          0% { transform: translateX(0); }
          100% { transform: translateX(-4px); }
        }

        @keyframes drift-fast {
          0% { transform: translateX(0); }
          100% { transform: translateX(6px); }
        }

        .animate-drift-slow {
          animation: drift-slow 20s ease-in-out infinite alternate;
        }

        .animate-drift-medium {
          animation: drift-medium 15s ease-in-out infinite alternate;
        }

        .animate-drift-fast {
          animation: drift-fast 12s ease-in-out infinite alternate;
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  )
}