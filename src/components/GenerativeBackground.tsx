import { useMemo } from 'react'

interface GenerativeBackgroundProps {
  seed: string // Article title or ID
  className?: string
}

export function GenerativeBackground({ seed, className = '' }: GenerativeBackgroundProps) {
  // Generate consistent values from seed string
  const params = useMemo(() => {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i)
      hash = hash & hash // Convert to 32bit integer
    }
    
    // Use hash to generate consistent pseudo-random values
    const rng = (index: number) => {
      const x = Math.sin(hash + index) * 10000
      return x - Math.floor(x)
    }
    
    // Generate positions and sizes based on title
    const circles = seed.length % 4 + 4 // 4-7 circles based on title length
    const elements = Array.from({ length: circles }, (_, i) => ({
      x: rng(i * 2) * 100, // 0-100%
      y: rng(i * 2 + 1) * 100,
      size: rng(i * 3) * 50 + 40, // 40-90%
      duration: rng(i * 4) * 8 + 8, // 8-16s (faster)
      delay: rng(i * 5) * -8, // -8 to 0s
      opacity: rng(i * 6) * 0.3 + 0.5, // 0.5-0.8 (more visible)
      hue: Math.floor(rng(i * 7) * 360), // 0-360 for color variety
      colorType: i % 5, // Different color schemes
    }))
    
    return { elements, hash }
  }, [seed])
  
  // Get color based on color type for variety
  const getColor = (type: number, opacity: number) => {
    switch(type) {
      case 0:
        return `hsl(var(--primary) / ${opacity})`
      case 1:
        return 'hsl(158 64% 52% / ' + opacity + ')' // Emerald/green
      case 2:
        return 'hsl(43 96% 56% / ' + opacity + ')' // Gold/amber
      case 3:
        return 'hsl(168 76% 42% / ' + opacity + ')' // Teal
      case 4:
        return 'hsl(142 71% 45% / ' + opacity + ')' // Hemp green
      default:
        return `hsl(var(--primary) / ${opacity})`
    }
  }
  
  return (
    <div className={`relative overflow-hidden border-2 border-primary/30 ${className}`}>
      {/* Vibrant gradient base - stronger for light mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/40 via-amber-400/40 to-teal-400/40" />
      
      {/* Animated colorful circles */}
      {params.elements.map((el, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            width: `${el.size}%`,
            height: `${el.size}%`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${getColor(el.colorType, 0.9)} 0%, ${getColor(el.colorType, 0.4)} 40%, transparent 70%)`,
            filter: 'blur(25px)',
            opacity: el.opacity,
            animation: `float-pattern-${i % 4} ${el.duration}s ease-in-out infinite`,
            animationDelay: `${el.delay}s`,
            mixBlendMode: 'normal',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            perspective: 1000,
          }}
        />
      ))}
      
      {/* Additional accent circles for more movement */}
      {params.elements.slice(0, 3).map((el, i) => (
        <div
          key={`accent-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${(el.x + 30) % 100}%`,
            top: `${(el.y + 30) % 100}%`,
            width: `${el.size * 0.6}%`,
            height: `${el.size * 0.6}%`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${getColor((el.colorType + 2) % 5, 0.8)} 0%, transparent 60%)`,
            filter: 'blur(30px)',
            opacity: el.opacity * 0.8,
            animation: `float-pattern-${(i + 2) % 4} ${el.duration * 1.3}s ease-in-out infinite reverse`,
            animationDelay: `${el.delay * 0.5}s`,
            mixBlendMode: 'normal',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            perspective: 1000,
          }}
        />
      ))}
      
      {/* Subtle overlay to blend with theme */}
      <div className="absolute inset-0 bg-background/10" />
      
      {/* CSS animations - larger movements */}
      <style>{`
        @keyframes float-pattern-0 {
          0%, 100% { 
            transform: translate(-50%, -50%) translateY(0px) translateX(0px) scale(1); 
          }
          33% { 
            transform: translate(-50%, -50%) translateY(-40px) translateX(30px) scale(1.15); 
          }
          66% { 
            transform: translate(-50%, -50%) translateY(20px) translateX(-30px) scale(0.9); 
          }
        }
        
        @keyframes float-pattern-1 {
          0%, 100% { 
            transform: translate(-50%, -50%) translateX(0) translateY(0) scale(1); 
          }
          50% { 
            transform: translate(-50%, -50%) translateX(50px) translateY(-30px) scale(1.2); 
          }
        }
        
        @keyframes float-pattern-2 {
          0%, 100% { 
            transform: translate(-50%, -50%) translate(0, 0) scale(1) rotate(0deg); 
          }
          25% { 
            transform: translate(-50%, -50%) translate(35px, -35px) scale(1.1) rotate(5deg); 
          }
          50% { 
            transform: translate(-50%, -50%) translate(-20px, 30px) scale(0.95) rotate(-5deg); 
          }
          75% { 
            transform: translate(-50%, -50%) translate(-35px, -20px) scale(1.05) rotate(3deg); 
          }
        }
        
        @keyframes float-pattern-3 {
          0%, 100% { 
            transform: translate(-50%, -50%) translateY(0) scale(1); 
          }
          33% { 
            transform: translate(-50%, -50%) translateY(40px) scale(1.15); 
          }
          66% { 
            transform: translate(-50%, -50%) translateY(-40px) scale(0.85); 
          }
        }
      `}</style>
    </div>
  )
}