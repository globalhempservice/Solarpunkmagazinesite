// Country flag component using flag-icons library or fallback to country code
// We'll use flag-icons CSS library which provides SVG flags

interface CountryFlagProps {
  countryCode: string // ISO 3166-1 alpha-2 code (e.g., "US", "FR", "PT")
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CountryFlag({ countryCode, size = 'md', className = '' }: CountryFlagProps) {
  if (!countryCode) return null

  const code = countryCode.toLowerCase()

  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-6 h-4',
    lg: 'w-8 h-6'
  }

  // Using inline SVG as fallback - we'll load flag-icons CSS separately
  // For now, render a colored rectangle with country code
  return (
    <span 
      className={`inline-flex items-center justify-center ${sizeClasses[size]} rounded border border-border/30 bg-muted text-[8px] font-bold ${className}`}
      title={getCountryName(code)}
    >
      {countryCode.toUpperCase()}
    </span>
  )
}

// Helper function to get country name from code
function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    'us': 'United States',
    'ca': 'Canada',
    'gb': 'United Kingdom',
    'fr': 'France',
    'de': 'Germany',
    'es': 'Spain',
    'it': 'Italy',
    'pt': 'Portugal',
    'nl': 'Netherlands',
    'be': 'Belgium',
    'ch': 'Switzerland',
    'at': 'Austria',
    'se': 'Sweden',
    'no': 'Norway',
    'dk': 'Denmark',
    'fi': 'Finland',
    'ie': 'Ireland',
    'pl': 'Poland',
    'cz': 'Czech Republic',
    'au': 'Australia',
    'nz': 'New Zealand',
    'jp': 'Japan',
    'cn': 'China',
    'in': 'India',
    'br': 'Brazil',
    'mx': 'Mexico',
    'ar': 'Argentina',
    'cl': 'Chile',
    'za': 'South Africa',
    'ke': 'Kenya',
    'ng': 'Nigeria',
    'eg': 'Egypt',
    'il': 'Israel',
    'ae': 'United Arab Emirates',
    'sa': 'Saudi Arabia',
    'tr': 'Turkey',
    'ru': 'Russia',
    'ua': 'Ukraine',
    'kr': 'South Korea',
    'th': 'Thailand',
    'vn': 'Vietnam',
    'id': 'Indonesia',
    'my': 'Malaysia',
    'sg': 'Singapore',
    'ph': 'Philippines',
  }

  return countries[code.toLowerCase()] || code.toUpperCase()
}

// Export helper for use in other components
export { getCountryName }
