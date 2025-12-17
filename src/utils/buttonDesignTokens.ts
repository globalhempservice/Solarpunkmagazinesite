/**
 * HEMP'IN BUTTON DESIGN SYSTEM
 * Solarpunk Futuristic Gamified UI Tokens
 * 
 * Core Principles:
 * 1. ORGANIC: Nature-inspired curves, breathing animations
 * 2. DEPTH: Layered shadows, 3D feeling, tactile
 * 3. LUMINOUS: Glow effects, light sources, radiance
 * 4. RESPONSIVE: Spring physics, magnetic interactions
 * 5. CLEAR: High contrast, accessible, intentional
 */

// ================================================
// ANIMATION CONFIGS
// ================================================

export const SPRING_CONFIGS = {
  // Gentle, organic movement
  gentle: {
    type: "spring" as const,
    stiffness: 200,
    damping: 20,
    mass: 0.5,
  },
  
  // Bouncy, playful movement
  bouncy: {
    type: "spring" as const,
    stiffness: 300,
    damping: 15,
    mass: 0.8,
  },
  
  // Snappy, responsive movement
  snappy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 25,
    mass: 0.5,
  },
  
  // Smooth, butter movement
  smooth: {
    type: "spring" as const,
    stiffness: 150,
    damping: 20,
    mass: 1,
  },
} as const

export const ANIMATION_DURATIONS = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  leisurely: 0.8,
} as const

export const EASING = {
  easeOut: [0.16, 1, 0.3, 1],
  easeIn: [0.7, 0, 0.84, 0],
  easeInOut: [0.65, 0, 0.35, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
} as const

// ================================================
// GLOW & SHADOW SYSTEM
// ================================================

export const GLOW_LAYERS = {
  // Subtle ambient glow
  ambient: {
    blur: '12px',
    spread: '0px',
    opacity: 0.15,
  },
  
  // Medium interaction glow
  interaction: {
    blur: '20px',
    spread: '2px',
    opacity: 0.3,
  },
  
  // Strong active glow
  active: {
    blur: '28px',
    spread: '4px',
    opacity: 0.5,
  },
  
  // Intense focus glow
  intense: {
    blur: '40px',
    spread: '6px',
    opacity: 0.6,
  },
} as const

export const INNER_SHADOWS = {
  // Subtle depth
  subtle: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
  
  // Medium engraved
  medium: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)',
  
  // Deep carved
  deep: 'inset 0 3px 6px rgba(0, 0, 0, 0.2)',
  
  // Glass reflection
  glass: 'inset 0 1px 1px rgba(255, 255, 255, 0.1), inset 0 -1px 1px rgba(0, 0, 0, 0.1)',
} as const

export const DROP_SHADOWS = {
  // Floating elevation
  float: '0 4px 12px rgba(0, 0, 0, 0.15)',
  
  // Elevated above surface
  elevated: '0 8px 20px rgba(0, 0, 0, 0.2)',
  
  // Dramatic lift
  dramatic: '0 12px 28px rgba(0, 0, 0, 0.25)',
  
  // Pressed into surface
  pressed: '0 1px 3px rgba(0, 0, 0, 0.12)',
} as const

// ================================================
// BORDER & RADIUS SYSTEM
// ================================================

export const BORDER_STYLES = {
  // Thin accent border
  thin: {
    width: '1px',
    style: 'solid',
  },
  
  // Medium border
  medium: {
    width: '2px',
    style: 'solid',
  },
  
  // Thick statement border
  thick: {
    width: '3px',
    style: 'solid',
  },
  
  // Glass border (semi-transparent)
  glass: {
    width: '1px',
    style: 'solid',
    opacity: 0.2,
  },
} as const

export const BORDER_RADIUS = {
  // Organic squircle-like curves
  organic: {
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    full: '9999px',
  },
  
  // Sharp modern edges
  sharp: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
} as const

// ================================================
// ICON SYSTEM
// ================================================

export const ICON_STYLES = {
  // Stroke weights for different states
  strokeWeight: {
    idle: 2,
    hover: 2.5,
    active: 3,
  },
  
  // Icon sizes for different button sizes
  sizes: {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
    '3xl': 'w-12 h-12',
  },
  
  // Drop shadow for icons
  shadow: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
} as const

// ================================================
// BUTTON SIZE SYSTEM
// ================================================

export const BUTTON_SIZES = {
  xs: {
    width: 'w-8 h-8',
    padding: 'p-2',
    iconSize: ICON_STYLES.sizes.xs,
  },
  sm: {
    width: 'w-10 h-10',
    padding: 'p-2.5',
    iconSize: ICON_STYLES.sizes.sm,
  },
  md: {
    width: 'w-12 h-12',
    padding: 'p-3',
    iconSize: ICON_STYLES.sizes.md,
  },
  lg: {
    width: 'w-16 h-16',
    padding: 'p-4',
    iconSize: ICON_STYLES.sizes.lg,
  },
  xl: {
    width: 'w-20 h-20',
    padding: 'p-5',
    iconSize: ICON_STYLES.sizes.xl,
  },
  '2xl': {
    width: 'w-24 h-24',
    padding: 'p-6',
    iconSize: ICON_STYLES.sizes['2xl'],
  },
} as const

// ================================================
// BUTTON THEME PALETTES
// ================================================

export const BUTTON_THEMES = {
  // Admin - Authority/Warning (Red/Orange)
  admin: {
    gradient: {
      from: '#ef4444', // red-500
      via: '#f97316',  // orange-500
      to: '#fb923c',   // orange-400
    },
    glow: 'rgba(239, 68, 68, 0.4)',
    border: 'rgba(254, 202, 202, 0.3)', // red-200
    text: '#ffffff',
    shadow: 'rgba(239, 68, 68, 0.5)',
  },
  
  // Market Admin - Cyan/Blue (Professional)
  marketAdmin: {
    gradient: {
      from: '#06b6d4', // cyan-500
      via: '#0ea5e9',  // sky-500
      to: '#3b82f6',   // blue-500
    },
    glow: 'rgba(6, 182, 212, 0.4)',
    border: 'rgba(165, 243, 252, 0.3)', // cyan-200
    text: '#ffffff',
    shadow: 'rgba(6, 182, 212, 0.5)',
  },
  
  // Home/Explore - Emerald/Teal (Primary)
  home: {
    gradient: {
      from: '#34d399', // emerald-400
      via: '#14b8a6',  // teal-500
      to: '#10b981',   // emerald-500
    },
    glow: 'rgba(16, 185, 129, 0.4)',
    border: 'rgba(167, 243, 208, 0.3)', // emerald-200
    text: '#ffffff',
    shadow: 'rgba(16, 185, 129, 0.5)',
  },
  
  // ME Button - Multi-gradient (Special)
  me: {
    gradient: {
      from: '#0ea5e9', // sky-500
      via: '#a855f7',  // purple-500
      to: '#ec4899',   // pink-500
    },
    glow: 'rgba(168, 85, 247, 0.5)',
    border: 'rgba(233, 213, 255, 0.3)', // purple-200
    text: '#ffffff',
    shadow: 'rgba(168, 85, 247, 0.6)',
  },
  
  // Contextual Plus - Dynamic (Changes per context)
  plus: {
    article: {
      gradient: {
        from: '#34d399', // emerald-400
        via: '#14b8a6',  // teal-500
        to: '#06b6d4',   // cyan-500
      },
      glow: 'rgba(20, 184, 166, 0.4)',
      border: 'rgba(153, 246, 228, 0.3)', // teal-200
      text: '#ffffff',
      shadow: 'rgba(20, 184, 166, 0.5)',
    },
    swap: {
      gradient: {
        from: '#fbbf24', // amber-400
        via: '#f59e0b',  // amber-500
        to: '#f97316',   // orange-500
      },
      glow: 'rgba(251, 191, 36, 0.4)',
      border: 'rgba(253, 230, 138, 0.3)', // amber-200
      text: '#ffffff',
      shadow: 'rgba(251, 191, 36, 0.5)',
    },
    swag: {
      gradient: {
        from: '#c084fc', // purple-400
        via: '#ec4899',  // pink-500
        to: '#f43f5e',   // rose-500
      },
      glow: 'rgba(168, 85, 247, 0.4)',
      border: 'rgba(233, 213, 255, 0.3)', // purple-200
      text: '#ffffff',
      shadow: 'rgba(168, 85, 247, 0.5)',
    },
    places: {
      gradient: {
        from: '#60a5fa', // blue-400
        via: '#06b6d4',  // cyan-500
        to: '#14b8a6',   // teal-500
      },
      glow: 'rgba(59, 130, 246, 0.4)',
      border: 'rgba(191, 219, 254, 0.3)', // blue-200
      text: '#ffffff',
      shadow: 'rgba(59, 130, 246, 0.5)',
    },
    rfp: {
      gradient: {
        from: '#3b82f6', // blue-500
        via: '#6366f1',  // indigo-500
        to: '#8b5cf6',   // violet-500
      },
      glow: 'rgba(79, 70, 229, 0.4)',
      border: 'rgba(199, 210, 254, 0.3)', // indigo-200
      text: '#ffffff',
      shadow: 'rgba(79, 70, 229, 0.5)',
    },
  },
  
  // Back Button - Utility (Emerald)
  back: {
    gradient: {
      from: '#10b981', // emerald-500
      via: '#14b8a6',  // teal-500
      to: '#06b6d4',   // cyan-500
    },
    glow: 'rgba(16, 185, 129, 0.3)',
    border: 'rgba(167, 243, 208, 0.3)', // emerald-200
    text: '#ffffff',
    shadow: 'rgba(16, 185, 129, 0.4)',
  },
  
  // Wallet - Status/Currency (Emerald/Teal)
  wallet: {
    gradient: {
      from: '#10b981', // emerald-500
      via: '#14b8a6',  // teal-500
      to: '#0d9488',   // teal-600
    },
    glow: 'rgba(16, 185, 129, 0.4)',
    border: 'rgba(167, 243, 208, 0.3)', // emerald-200
    text: '#ffffff',
    shadow: 'rgba(16, 185, 129, 0.5)',
  },
  
  // Messages - Communication (Violet/Purple)
  messages: {
    gradient: {
      from: '#8b5cf6', // violet-500
      via: '#a855f7',  // purple-500
      to: '#c084fc',   // purple-400
    },
    glow: 'rgba(139, 92, 246, 0.4)',
    border: 'rgba(221, 214, 254, 0.3)', // violet-200
    text: '#ffffff',
    shadow: 'rgba(139, 92, 246, 0.5)',
  },
  
  // Wiki - Knowledge/Documentation (Blue/Cyan)
  wiki: {
    gradient: {
      from: '#3b82f6', // blue-500
      via: '#06b6d4',  // cyan-500
      to: '#0ea5e9',   // sky-500
    },
    glow: 'rgba(59, 130, 246, 0.5)',
    border: 'rgba(191, 219, 254, 0.3)', // blue-200
    text: '#ffffff',
    shadow: 'rgba(59, 130, 246, 0.6)',
  },
  
  // Theme Bubbles - Light (Sky/Blue)
  themeLight: {
    gradient: {
      from: '#38bdf8', // sky-400
      via: '#0ea5e9',  // sky-500
      to: '#3b82f6',   // blue-500
    },
    glow: 'rgba(56, 189, 248, 0.5)',
    border: 'rgba(186, 230, 253, 0.3)', // sky-200
    text: '#ffffff',
    shadow: 'rgba(56, 189, 248, 0.6)',
  },
  
  // Theme Bubbles - Dark (Emerald/Teal)
  themeDark: {
    gradient: {
      from: '#34d399', // emerald-400
      via: '#10b981',  // emerald-500
      to: '#14b8a6',   // teal-500
    },
    glow: 'rgba(52, 211, 153, 0.5)',
    border: 'rgba(167, 243, 208, 0.3)', // emerald-200
    text: '#ffffff',
    shadow: 'rgba(52, 211, 153, 0.6)',
  },
  
  // Theme Bubbles - Hemp'in (Amber/Orange)
  themeHempin: {
    gradient: {
      from: '#fbbf24', // amber-400
      via: '#f59e0b',  // amber-500
      to: '#f97316',   // orange-500
    },
    glow: 'rgba(251, 191, 36, 0.5)',
    border: 'rgba(253, 230, 138, 0.3)', // amber-200
    text: '#ffffff',
    shadow: 'rgba(251, 191, 36, 0.6)',
  },
  
  // Locked State - Warning/Unlock (Amber/Orange)
  locked: {
    gradient: {
      from: '#fbbf24', // amber-400
      via: '#f59e0b',  // amber-500
      to: '#ef4444',   // red-500
    },
    glow: 'rgba(251, 191, 36, 0.5)',
    border: 'rgba(254, 243, 199, 0.4)', // amber-100
    text: '#ffffff',
    shadow: 'rgba(251, 191, 36, 0.6)',
  },
  
  // Neutral/Glass - Subtle utility
  glass: {
    gradient: {
      from: 'rgba(255, 255, 255, 0.1)',
      via: 'rgba(255, 255, 255, 0.05)',
      to: 'rgba(255, 255, 255, 0.1)',
    },
    glow: 'rgba(255, 255, 255, 0.2)',
    border: 'rgba(255, 255, 255, 0.2)',
    text: 'currentColor',
    shadow: 'rgba(0, 0, 0, 0.2)',
  },
} as const

// ================================================
// BUTTON STATE STYLES
// ================================================

export const BUTTON_STATES = {
  // Idle state - subtle breathing animation
  idle: {
    scale: 1,
    opacity: 1,
    glowIntensity: GLOW_LAYERS.ambient.opacity,
    shadowIntensity: 0.15,
  },
  
  // Hover state - lift and enhance
  hover: {
    scale: 1.05,
    opacity: 1,
    glowIntensity: GLOW_LAYERS.interaction.opacity,
    shadowIntensity: 0.25,
    y: -2,
  },
  
  // Active/Current state - persistent glow
  active: {
    scale: 1,
    opacity: 1,
    glowIntensity: GLOW_LAYERS.active.opacity,
    shadowIntensity: 0.4,
  },
  
  // Pressed state - push down
  pressed: {
    scale: 0.95,
    opacity: 0.9,
    glowIntensity: GLOW_LAYERS.interaction.opacity,
    shadowIntensity: 0.1,
    y: 1,
  },
  
  // Disabled state - desaturated
  disabled: {
    scale: 1,
    opacity: 0.4,
    glowIntensity: 0,
    shadowIntensity: 0.05,
  },
  
  // Loading state - pulsing
  loading: {
    scale: 1,
    opacity: 0.7,
    glowIntensity: GLOW_LAYERS.ambient.opacity,
    shadowIntensity: 0.15,
  },
} as const

// ================================================
// SPECIAL EFFECTS
// ================================================

export const SPECIAL_EFFECTS = {
  // Shimmer sweep animation
  shimmer: {
    duration: 3,
    delay: 2,
    gradient: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
  },
  
  // Ripple effect on click
  ripple: {
    duration: 0.6,
    scale: [0, 2],
    opacity: [0.5, 0],
  },
  
  // Breathing idle animation
  breathing: {
    scale: [1, 1.02, 1],
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
  
  // Magnetic hover (button pulls toward cursor)
  magnetic: {
    strength: 8, // pixels
    damping: 20,
  },
  
  // Particle burst on unlock
  particleBurst: {
    count: 12,
    duration: 0.8,
    spread: 60,
  },
  
  // Noise texture overlay
  noiseTexture: {
    opacity: 0.03,
    blend: 'overlay' as const,
    url: 'data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noise)" /%3E%3C/svg%3E',
  },
  
  // Aurora flowing gradient
  aurora: {
    duration: 8,
    positions: ['0% 0%', '100% 100%', '0% 0%'],
    ease: "linear" as const,
  },
} as const

// ================================================
// ACCESSIBILITY
// ================================================

export const ACCESSIBILITY = {
  // Focus ring styles
  focusRing: {
    width: '2px',
    offset: '2px',
    opacity: 0.5,
  },
  
  // Minimum touch target size (iOS/Android guidelines)
  minTouchTarget: {
    width: 44,
    height: 44,
  },
  
  // Contrast ratios (WCAG AA)
  contrast: {
    normal: 4.5,
    large: 3,
  },
} as const

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Generate box shadow string from glow config
 */
export function createGlowShadow(
  color: string,
  intensity: number = GLOW_LAYERS.ambient.opacity,
  layer: keyof typeof GLOW_LAYERS = 'ambient'
): string {
  const { blur, spread } = GLOW_LAYERS[layer]
  const rgbaColor = color.replace(/[\d.]+\)$/g, `${intensity})`)
  return `0 0 ${blur} ${spread} ${rgbaColor}`
}

/**
 * Generate gradient background string
 */
export function createGradient(
  gradient: { from: string; via: string; to: string },
  direction: string = 'to bottom right'
): string {
  return `linear-gradient(${direction}, ${gradient.from}, ${gradient.via}, ${gradient.to})`
}

/**
 * Get theme colors by button type and context
 */
export function getButtonTheme(
  type: 'admin' | 'marketAdmin' | 'home' | 'me' | 'back' | 'wallet' | 'messages' | 'locked' | 'glass',
  context?: 'article' | 'swap' | 'swag' | 'places' | 'rfp'
) {
  if (type === 'plus' && context) {
    return BUTTON_THEMES.plus[context]
  }
  return BUTTON_THEMES[type]
}

/**
 * Calculate magnetic offset based on cursor position
 */
export function calculateMagneticOffset(
  buttonRect: DOMRect,
  cursorX: number,
  cursorY: number,
  strength: number = SPECIAL_EFFECTS.magnetic.strength
): { x: number; y: number } {
  const buttonCenterX = buttonRect.left + buttonRect.width / 2
  const buttonCenterY = buttonRect.top + buttonRect.height / 2
  
  const deltaX = cursorX - buttonCenterX
  const deltaY = cursorY - buttonCenterY
  
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  const maxDistance = buttonRect.width
  
  if (distance > maxDistance) {
    return { x: 0, y: 0 }
  }
  
  const factor = (maxDistance - distance) / maxDistance
  
  return {
    x: (deltaX / distance) * strength * factor,
    y: (deltaY / distance) * strength * factor,
  }
}