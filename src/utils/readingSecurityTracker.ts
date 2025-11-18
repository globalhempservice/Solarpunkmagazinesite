// Client-side reading behavior tracker for security
// Tracks scroll, mouse, focus to prove legitimate reading

export class ReadingSecurityTracker {
  private articleId: string
  private startTime: number
  private readToken: string | null = null
  
  private scrollDepth: number = 0
  private scrollEvents: number = 0
  private mouseMovements: number = 0
  private focusTime: number = 0
  
  private lastFocusChange: number
  private isFocused: boolean = true
  private fingerprint: string
  
  private scrollListener: (() => void) | null = null
  private mouseListener: (() => void) | null = null
  private focusListener: (() => void) | null = null
  private blurListener: (() => void) | null = null

  constructor(articleId: string) {
    this.articleId = articleId
    this.startTime = Date.now()
    this.lastFocusChange = this.startTime
    this.fingerprint = this.generateFingerprint()
    
    this.initializeTracking()
  }

  private generateFingerprint(): string {
    // Generate a device fingerprint based on browser characteristics
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('fingerprint', 2, 2)
    }
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL()
    }
    
    // Simple hash
    const str = JSON.stringify(fingerprint)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    return hash.toString(36)
  }

  private initializeTracking() {
    // Track scroll depth and events
    this.scrollListener = () => {
      this.scrollEvents++
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      
      const scrollPercentage = ((scrollTop + windowHeight) / documentHeight) * 100
      this.scrollDepth = Math.max(this.scrollDepth, Math.min(100, scrollPercentage))
    }
    
    // Track mouse movements
    this.mouseListener = () => {
      this.mouseMovements++
    }
    
    // Track focus time
    this.focusListener = () => {
      if (!this.isFocused) {
        this.isFocused = true
        this.lastFocusChange = Date.now()
      }
    }
    
    this.blurListener = () => {
      if (this.isFocused) {
        this.focusTime += Date.now() - this.lastFocusChange
        this.isFocused = false
        this.lastFocusChange = Date.now()
      }
    }
    
    // Add event listeners
    window.addEventListener('scroll', this.scrollListener, { passive: true })
    window.addEventListener('mousemove', this.mouseListener, { passive: true })
    window.addEventListener('focus', this.focusListener)
    window.addEventListener('blur', this.blurListener)
    
    // Initial scroll check
    this.scrollListener()
  }

  async startReading(serverUrl: string, accessToken: string): Promise<void> {
    try {
      const response = await fetch(`${serverUrl}/articles/${this.articleId}/start-reading`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        this.readToken = data.readToken
        console.log('🔐 Read token obtained')
      }
    } catch (error) {
      console.error('Failed to start reading session:', error)
    }
  }

  getMetrics() {
    // Calculate final focus time
    let totalFocusTime = this.focusTime
    if (this.isFocused) {
      totalFocusTime += Date.now() - this.lastFocusChange
    }
    
    return {
      readToken: this.readToken,
      readingStartTime: this.startTime,
      scrollDepth: Math.round(this.scrollDepth),
      scrollEvents: this.scrollEvents,
      mouseMovements: this.mouseMovements,
      focusTime: totalFocusTime,
      fingerprint: this.fingerprint
    }
  }

  cleanup() {
    // Remove event listeners
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener)
    }
    if (this.mouseListener) {
      window.removeEventListener('mousemove', this.mouseListener)
    }
    if (this.focusListener) {
      window.removeEventListener('focus', this.focusListener)
    }
    if (this.blurListener) {
      window.removeEventListener('blur', this.blurListener)
    }
  }
}
