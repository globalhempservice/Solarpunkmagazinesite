import { MiniAppMetadata } from '../types/mini-app'
import { 
  BookOpen, Flame, MapPin, Repeat, MessageCircle, 
  Globe, ShoppingBag, Compass 
} from 'lucide-react'

/**
 * Metadata for all mini-apps in DEWII OS
 * Defines branding, colors, and identity
 */

export const MINI_APPS_METADATA: Record<string, MiniAppMetadata> = {
  mag: {
    id: 'mag',
    name: 'HEMP MAG',
    tagline: 'Discover Stories from the Hemp Universe',
    icon: <BookOpen size={48} strokeWidth={2.5} />,
    brandColors: {
      primary: '#7c3aed', // purple-600
      secondary: '#a78bfa', // purple-400
      accent: '#E8FF00', // hempin yellow
      background: '#1e1b4b' // purple-950
    },
    description: 'Browse curated hemp articles and stories',
    tips: [
      'Swipe right to save articles for later',
      'Build your reading streak for bonus XP',
      'Discover content from verified hemp organizations'
    ]
  },

  swipe: {
    id: 'swipe',
    name: 'HEMP SWIPE',
    tagline: 'Swipe Your Way Through Hemp Content',
    icon: <Flame size={48} strokeWidth={2.5} />,
    brandColors: {
      primary: '#dc2626', // red-600
      secondary: '#f87171', // red-400
      accent: '#E8FF00',
      background: '#7f1d1d' // red-950
    },
    description: 'Tinder-style content discovery',
    tips: [
      'Swipe right to match, left to pass',
      'Your matches power your personalized feed',
      'Daily swipes earn you NADA points'
    ]
  },

  places: {
    id: 'places',
    name: 'HEMP PLACES',
    tagline: 'Explore Hemp Locations Worldwide',
    icon: <MapPin size={48} strokeWidth={2.5} />,
    brandColors: {
      primary: '#059669', // emerald-600
      secondary: '#34d399', // emerald-400
      accent: '#E8FF00',
      background: '#064e3b' // emerald-950
    },
    description: 'Find hemp shops, farms, and organizations',
    tips: [
      'Add your favorite hemp spots',
      'View locations on the 3D globe',
      'Connect with the global hemp community'
    ]
  },

  swap: {
    id: 'swap',
    name: 'HEMP SWAP',
    tagline: 'Community C2C Marketplace',
    icon: <Repeat size={48} strokeWidth={2.5} />,
    brandColors: {
      primary: '#0891b2', // cyan-600
      secondary: '#22d3ee', // cyan-400
      accent: '#E8FF00',
      background: '#164e63' // cyan-950
    },
    description: 'Trade hemp products peer-to-peer',
    tips: [
      'List items you want to swap',
      'Browse community offerings',
      'Build trust through verified trades'
    ]
  },

  forum: {
    id: 'forum',
    name: 'HEMP FORUM',
    tagline: 'Shape the Future of Hemp',
    icon: <MessageCircle size={48} strokeWidth={2.5} />,
    brandColors: {
      primary: '#7c3aed', // purple-600
      secondary: '#a78bfa', // purple-400
      accent: '#E8FF00',
      background: '#4c1d95' // purple-950
    },
    description: 'Vote on features and share ideas',
    tips: [
      'Vote with NADA points to shape priorities',
      'Submit your own feature ideas',
      'Connect with the Hemp\'in community'
    ]
  },

  globe: {
    id: 'globe',
    name: 'HEMP GLOBE',
    tagline: 'Explore Hemp in 3D',
    icon: <Globe size={48} strokeWidth={2.5} />,
    brandColors: {
      primary: '#0284c7', // sky-600
      secondary: '#38bdf8', // sky-400
      accent: '#E8FF00',
      background: '#0c4a6e' // sky-950
    },
    description: 'Interactive 3D world map of hemp',
    tips: [
      'Rotate the globe to explore regions',
      'Click markers to see locations',
      'Discover hemp hotspots worldwide'
    ]
  },

  swag: {
    id: 'swag',
    name: 'HEMP SWAG',
    tagline: 'Official Hemp Organization Merch',
    icon: <ShoppingBag size={48} strokeWidth={2.5} />,
    brandColors: {
      primary: '#059669', // emerald-600
      secondary: '#10b981', // emerald-500
      accent: '#E8FF00',
      background: '#064e3b' // emerald-950
    },
    description: 'Exclusive products from verified organizations',
    tips: [
      'Support hemp organizations worldwide',
      'Unlock exclusive items with badges',
      'Track provenance and sustainability'
    ]
  },

  compass: {
    id: 'compass',
    name: 'TERPENE HUNTER',
    tagline: 'Pokemon GO for Cannabis Terpenes',
    icon: <Compass size={48} strokeWidth={2.5} />,
    brandColors: {
      primary: '#f59e0b', // amber-500
      secondary: '#fbbf24', // amber-400
      accent: '#E8FF00',
      background: '#78350f' // amber-950
    },
    description: 'Hunt and collect terpenes in Bangkok',
    tips: [
      'Scan QR codes at partner shops',
      'Build your terpene herbarium',
      'Earn XP and NADA points'
    ]
  }
}

/**
 * Get metadata for a mini-app by ID
 */
export function getMiniAppMetadata(appId: string): MiniAppMetadata | undefined {
  return MINI_APPS_METADATA[appId]
}
