// ========================================
// HOME LAUNCHER - UTILITY FUNCTIONS
// ========================================
// Shared utilities for the home launcher system

/**
 * Color map for Tailwind color names to hex values
 * Used for gradient generation in glass morphism effects
 */
export const colorMap: Record<string, string> = {
  // Blues & Indigos
  'sky-500': '#0ea5e9',
  'blue-500': '#3b82f6',
  'indigo-500': '#6366f1',
  'violet-500': '#8b5cf6',
  'cyan-500': '#06b6d4',
  
  // Purples & Pinks
  'purple-500': '#a855f7',
  'fuchsia-500': '#d946ef',
  'pink-500': '#ec4899',
  'rose-500': '#f43f5e',
  
  // Greens
  'emerald-500': '#10b981',
  'teal-500': '#14b8a6',
  'green-500': '#22c55e',
  'lime-500': '#84cc16',
  
  // Yellows & Oranges
  'amber-500': '#f59e0b',
  'yellow-500': '#eab308',
  'orange-500': '#f97316',
  
  // Reds
  'red-500': '#ef4444',
  
  // Grays
  'slate-500': '#64748b',
  'gray-500': '#6b7280',
  'zinc-500': '#71717a',
}

/**
 * Convert Tailwind gradient string to CSS linear-gradient
 * @param gradient - Tailwind gradient string (e.g., "from-blue-500 via-purple-500 to-pink-500")
 * @returns CSS linear-gradient string
 */
export function getTailwindGradient(gradient: string): string {
  const colors = gradient.match(/(?:from|via|to)-([\w-]+)/g)?.map(match => {
    const color = match.replace(/^(?:from|via|to)-/, '')
    return colorMap[color] || '#3b82f6'
  }) || ['#3b82f6', '#8b5cf6', '#ec4899']
  
  return `linear-gradient(135deg, ${colors.join(', ')})`
}

/**
 * Calculate XP required for next level
 * Formula: CEIL(100 * level^1.5 / 50) * 50
 * @param level - Current user level
 * @returns XP required for next level
 */
export function calculateNextLevelXP(level: number): number {
  return Math.ceil((100 * Math.pow(level, 1.5)) / 50) * 50
}

/**
 * Calculate XP progress percentage
 * @param currentXP - Current XP towards next level
 * @param nextLevelXP - Total XP needed for next level
 * @returns Progress percentage (0-100)
 */
export function calculateXPProgress(currentXP: number, nextLevelXP: number): number {
  return Math.min(Math.round((currentXP / nextLevelXP) * 100), 100)
}

/**
 * Get greeting based on time of day
 * @returns Greeting string
 */
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

/**
 * Get current time segment for theming
 * @returns Time segment ('dawn', 'day', 'dusk', 'night')
 */
export function getTimeSegment(): 'dawn' | 'day' | 'dusk' | 'night' {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 8) return 'dawn'
  if (hour >= 8 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'dusk'
  return 'night'
}

/**
 * Format session duration (seconds to human readable)
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "5m 30s", "1h 20m")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

/**
 * Format XP amount with commas
 * @param xp - XP amount
 * @returns Formatted string (e.g., "1,234")
 */
export function formatXP(xp: number): string {
  return xp.toLocaleString()
}

/**
 * Get level display string
 * @param level - User level
 * @returns Formatted string (e.g., "Level 7", "Max Level")
 */
export function getLevelDisplay(level: number, maxLevel: number = 100): string {
  if (level >= maxLevel) return 'Max Level'
  return `Level ${level}`
}

/**
 * App key validation
 * @param key - App key to validate
 * @returns true if valid app key
 */
export function isValidAppKey(key: string): boolean {
  const validKeys = ['mag', 'swipe', 'places', 'swap', 'forum', 'globe', 'swag', 'compass', 'wiki']
  return validKeys.includes(key)
}

/**
 * Get app route from key
 * @param appKey - App key
 * @returns Route string (e.g., "/mag")
 */
export function getAppRoute(appKey: string): string {
  if (!isValidAppKey(appKey)) return '/'
  return `/${appKey}`
}

/**
 * Generate random gradient for placeholder/demo
 * @returns Random Tailwind gradient string
 */
export function generateRandomGradient(): string {
  const colors = Object.keys(colorMap)
  const from = colors[Math.floor(Math.random() * colors.length)]
  const via = colors[Math.floor(Math.random() * colors.length)]
  const to = colors[Math.floor(Math.random() * colors.length)]
  
  return `from-${from} via-${via} to-${to}`
}

/**
 * Default home layout configuration
 */
export const DEFAULT_HOME_LAYOUT = {
  appOrder: ['mag', 'swipe', 'places', 'swap', 'forum', 'globe', 'swag', 'compass', 'wiki'],
  hiddenApps: [],
  favorites: [],
  quickActions: [],
  gridColumns: 3,
  iconSize: 'large' as const,
  showStats: true,
  showRecentApps: false
}

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  HOME_LAYOUT: 'home-layout-config',
  ME_MODAL: 'me-modal-customization',
  THEME: 'dewii-theme',
  USER_PREFS: 'dewii-user-preferences'
} as const

/**
 * App icon sizes
 */
export const ICON_SIZES = {
  small: 64,
  medium: 80,
  large: 96,
  xlarge: 128
} as const

/**
 * Grid column options
 */
export const GRID_COLUMNS = {
  mobile: 3,
  tablet: 4,
  desktop: 5,
  ultrawide: 6
} as const

/**
 * XP color thresholds for visual feedback
 */
export const XP_COLORS = {
  low: '#ef4444',      // Red (0-33%)
  medium: '#f59e0b',   // Orange (34-66%)
  high: '#10b981',     // Green (67-100%)
  max: '#3b82f6'       // Blue (level maxed)
} as const

/**
 * Get XP bar color based on progress
 * @param percentage - Progress percentage (0-100)
 * @returns Hex color string
 */
export function getXPBarColor(percentage: number): string {
  if (percentage <= 33) return XP_COLORS.low
  if (percentage <= 66) return XP_COLORS.medium
  return XP_COLORS.high
}

/**
 * Achievement categories
 */
export const ACHIEVEMENT_CATEGORIES = {
  SOCIAL: 'social',
  CREATIVE: 'creative',
  EXPLORER: 'explorer',
  TRADER: 'trader',
  COMMUNITY: 'community',
  SPECIAL: 'special'
} as const

/**
 * Badge animation variants for Motion
 */
export const BADGE_ANIMATION = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: [1, 1.2, 1],
    opacity: 1,
    transition: {
      duration: 0.3,
      times: [0, 0.5, 1]
    }
  },
  exit: { scale: 0, opacity: 0 }
}

/**
 * Icon wiggle animation for edit mode
 */
export const WIGGLE_ANIMATION = {
  rotate: [-2, 2, -2],
  transition: {
    repeat: Infinity,
    duration: 0.3,
    ease: "easeInOut"
  }
}

/**
 * Stagger timing for sequential animations
 */
export const STAGGER_DELAY = 0.05 // 50ms between each item

/**
 * Debounce delay for save operations
 */
export const SAVE_DEBOUNCE_MS = 1000 // 1 second

/**
 * Hemp'in canonical colors (for reference)
 */
export const HEMPIN_COLORS = {
  PRIMARY: '#E8FF00',      // Hemp yellow
  EMERALD: '#10b981',      // Green
  CYAN: '#06b6d4',         // Cyan
  BLUE: '#3b82f6',         // Blue
  VIOLET: '#8b5cf6',       // Violet
  FUCHSIA: '#d946ef',      // Fuchsia
  WHITE: '#ffffff',        // White
  BLACK: '#000000'         // Black
} as const

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  return window.innerWidth < 768
}

/**
 * Check if device is tablet
 */
export function isTablet(): boolean {
  return window.innerWidth >= 768 && window.innerWidth < 1024
}

/**
 * Check if device is desktop
 */
export function isDesktop(): boolean {
  return window.innerWidth >= 1024
}

/**
 * Get optimal grid columns based on screen width
 */
export function getOptimalGridColumns(): number {
  if (isMobile()) return GRID_COLUMNS.mobile
  if (isTablet()) return GRID_COLUMNS.tablet
  return GRID_COLUMNS.desktop
}
