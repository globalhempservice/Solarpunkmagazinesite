import { useMemo } from 'react'

interface PlaceholderArtProps {
  articleId: string
  category?: string
  title?: string
  className?: string
  useCategoryArt?: boolean
}

/**
 * Component that displays beautiful computerized art as placeholder images
 * Each article gets a consistent but unique art style based on its properties
 */
export function PlaceholderArt({ 
  articleId, 
  category = 'general', 
  title = '',
  className = '',
  useCategoryArt = false 
}: PlaceholderArtProps) {
  
  // Generate a consistent seed number from articleId
  const seed = useMemo(() => {
    let hash = 0
    const seedString = articleId + category + title
    for (let i = 0; i < seedString.length; i++) {
      hash = ((hash << 5) - hash) + seedString.charCodeAt(i)
      hash = hash & hash
    }
    return Math.abs(hash)
  }, [articleId, category, title])
  
  // Generate consistent values from seed
  const params = useMemo(() => {
    const rng = (index: number) => {
      const x = Math.sin(seed + index) * 10000
      return x - Math.floor(x)
    }
    
    // Generate positions and sizes based on seed
    const circles = (seed % 4) + 5 // 5-8 circles
    const elements = Array.from({ length: circles }, (_, i) => ({
      x: rng(i * 2) * 100,
      y: rng(i * 2 + 1) * 100,
      size: rng(i * 3) * 50 + 40,
      duration: rng(i * 4) * 8 + 8,
      delay: rng(i * 5) * -8,
      opacity: rng(i * 6) * 0.4 + 0.4,
      colorType: i % 8,
    }))
    
    // Generate geometric shapes
    const shapeCount = (seed % 5) + 6 // 6-10 shapes
    const shapes = Array.from({ length: shapeCount }, (_, i) => ({
      type: ['triangle', 'square', 'hexagon', 'circle', 'line', 'diamond'][Math.floor(rng(i * 10) * 6)],
      x: rng(i * 11) * 100,
      y: rng(i * 12) * 100,
      size: rng(i * 13) * 60 + 30, // 30-90
      rotation: rng(i * 14) * 360,
      duration: rng(i * 15) * 15 + 10, // 10-25s
      delay: rng(i * 16) * -10,
      opacity: rng(i * 17) * 0.3 + 0.2, // 0.2-0.5
      colorType: Math.floor(rng(i * 18) * 8),
      scale: rng(i * 19) * 0.5 + 0.5, // 0.5-1
    }))
    
    return { elements, shapes }
  }, [seed])
  
  // Category-specific color schemes
  const getCategoryColors = (cat: string) => {
    const normalizedCat = cat.toLowerCase()
    
    // Theme-aware color schemes
    switch(normalizedCat) {
      case 'sustainability':
      case 'hemp':
        return {
          primary: 'from-emerald-400 via-green-500 to-teal-600 dark:from-emerald-500 dark:via-teal-600 dark:to-green-600 hempin:from-teal-400 hempin:via-emerald-500 hempin:to-amber-500',
          secondary: 'from-lime-400 to-green-600 dark:from-green-500 dark:to-emerald-600 hempin:from-emerald-400 hempin:to-teal-500',
          accent: 'from-teal-400 to-cyan-500 dark:from-teal-500 dark:to-emerald-500 hempin:from-amber-400 hempin:to-orange-500'
        }
      case 'technology':
        return {
          primary: 'from-blue-400 via-cyan-500 to-indigo-600 dark:from-cyan-500 dark:via-teal-500 dark:to-blue-600 hempin:from-cyan-400 hempin:via-teal-500 hempin:to-amber-500',
          secondary: 'from-cyan-400 to-blue-600 dark:from-teal-500 dark:to-cyan-600 hempin:from-teal-400 hempin:to-cyan-500',
          accent: 'from-indigo-400 to-purple-500 dark:from-emerald-400 dark:to-teal-500 hempin:from-amber-400 hempin:to-yellow-500'
        }
      case 'culture':
        return {
          primary: 'from-purple-400 via-pink-500 to-rose-600 dark:from-emerald-400 dark:via-teal-500 dark:to-green-600 hempin:from-teal-400 hempin:via-cyan-500 hempin:to-amber-500',
          secondary: 'from-fuchsia-400 to-pink-600 dark:from-teal-500 dark:to-emerald-600 hempin:from-emerald-400 hempin:to-teal-500',
          accent: 'from-rose-400 to-red-500 dark:from-green-400 dark:to-teal-500 hempin:from-amber-400 hempin:to-orange-500'
        }
      case 'health':
        return {
          primary: 'from-green-400 via-emerald-500 to-teal-600 dark:from-emerald-500 dark:via-green-600 dark:to-teal-600 hempin:from-emerald-400 hempin:via-teal-500 hempin:to-green-500',
          secondary: 'from-teal-400 to-cyan-600 dark:from-teal-500 dark:to-emerald-600 hempin:from-teal-400 hempin:to-cyan-500',
          accent: 'from-emerald-400 to-green-500 dark:from-green-400 dark:to-emerald-500 hempin:from-amber-400 hempin:to-emerald-500'
        }
      case 'innovation':
        return {
          primary: 'from-violet-400 via-purple-500 to-fuchsia-600 dark:from-teal-400 dark:via-emerald-500 dark:to-cyan-600 hempin:from-cyan-400 hempin:via-teal-500 hempin:to-amber-500',
          secondary: 'from-purple-400 to-fuchsia-600 dark:from-emerald-500 dark:to-teal-600 hempin:from-teal-400 hempin:to-amber-500',
          accent: 'from-fuchsia-400 to-pink-500 dark:from-teal-400 dark:to-emerald-500 hempin:from-amber-400 hempin:to-yellow-500'
        }
      case 'community':
        return {
          primary: 'from-orange-400 via-amber-500 to-yellow-600 dark:from-emerald-400 dark:via-teal-500 dark:to-green-600 hempin:from-amber-400 hempin:via-orange-500 hempin:to-teal-500',
          secondary: 'from-yellow-400 to-orange-600 dark:from-teal-500 dark:to-emerald-600 hempin:from-yellow-400 hempin:to-amber-500',
          accent: 'from-amber-400 to-yellow-500 dark:from-green-400 dark:to-teal-500 hempin:from-amber-400 hempin:to-orange-500'
        }
      default:
        return {
          primary: 'from-cyan-400 via-blue-500 to-purple-600 dark:from-teal-400 dark:via-emerald-500 dark:to-cyan-600 hempin:from-teal-400 hempin:via-cyan-500 hempin:to-amber-500',
          secondary: 'from-blue-400 to-purple-600 dark:from-emerald-500 dark:to-teal-600 hempin:from-cyan-400 hempin:to-teal-500',
          accent: 'from-purple-400 to-pink-500 dark:from-teal-400 dark:to-emerald-500 hempin:from-amber-400 hempin:to-yellow-500'
        }
    }
  }
  
  const colors = getCategoryColors(category)
  
  // Get color based on color type for variety
  const getColor = (type: number, opacity: number) => {
    // Theme-specific hue palettes
    const lightHues = [
      158, // Emerald
      192, // Cyan
      270, // Purple
      43,  // Amber
      168, // Teal
      320, // Pink
      220, // Blue
      142, // Green
    ]
    
    const darkHues = [
      158, // Emerald (eco/solarpunk)
      168, // Teal
      142, // Green
      180, // Cyan
      150, // Light Green
      172, // Aqua
      155, // Sea Green
      165, // Turquoise
    ]
    
    const hempinHues = [
      168, // Teal (Carbon Mint)
      43,  // Amber (Gold)
      180, // Cyan
      158, // Emerald
      35,  // Orange-Gold
      175, // Aqua
      50,  // Yellow-Amber
      160, // Mint
    ]
    
    // Use appropriate hue palette based on theme (detected via CSS)
    // This will automatically work with theme switching
    const hues = lightHues // Default to light
    const hue = hues[type % hues.length]
    const saturation = 70 + (seed % 20)
    const lightness = 50 + (seed % 15)
    
    return `hsl(${hue} ${saturation}% ${lightness}% / ${opacity})`
  }
  
  // Render geometric shapes
  const renderShape = (shape: typeof params.shapes[0], index: number) => {
    const color = getColor(shape.colorType, shape.opacity)
    const borderColor = getColor((shape.colorType + 2) % 8, shape.opacity * 0.8)
    const size = `${shape.size}px`
    
    const baseStyle = {
      left: `${shape.x}%`,
      top: `${shape.y}%`,
      width: size,
      height: size,
      transform: `translate(-50%, -50%) rotate(${shape.rotation}deg) scale(${shape.scale})`,
      opacity: shape.opacity,
      animation: `geometric-float-${index % 5} ${shape.duration}s ease-in-out infinite`,
      animationDelay: `${shape.delay}s`,
    }
    
    switch(shape.type) {
      case 'triangle':
        return (
          <div
            key={`shape-${index}`}
            className="absolute"
            style={{
              ...baseStyle,
              borderLeft: `${shape.size / 2}px solid transparent`,
              borderRight: `${shape.size / 2}px solid transparent`,
              borderBottom: `${shape.size}px solid ${color}`,
              width: 0,
              height: 0,
              filter: 'drop-shadow(0 0 10px currentColor)',
            }}
          />
        )
      
      case 'square':
        return (
          <div
            key={`shape-${index}`}
            className="absolute border-2"
            style={{
              ...baseStyle,
              backgroundColor: color,
              borderColor: borderColor,
            }}
          />
        )
      
      case 'hexagon':
        return (
          <div
            key={`shape-${index}`}
            className="absolute"
            style={{
              ...baseStyle,
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              backgroundColor: color,
              border: `2px solid ${borderColor}`,
            }}
          />
        )
      
      case 'circle':
        return (
          <div
            key={`shape-${index}`}
            className="absolute rounded-full border-2"
            style={{
              ...baseStyle,
              borderColor: color,
              backgroundColor: 'transparent',
            }}
          />
        )
      
      case 'diamond':
        return (
          <div
            key={`shape-${index}`}
            className="absolute border-2"
            style={{
              ...baseStyle,
              backgroundColor: color,
              borderColor: borderColor,
              transform: `${baseStyle.transform} rotate(45deg)`,
            }}
          />
        )
      
      case 'line':
        return (
          <div
            key={`shape-${index}`}
            className="absolute"
            style={{
              ...baseStyle,
              width: `${shape.size * 1.5}px`,
              height: '3px',
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}`,
            }}
          />
        )
      
      default:
        return null
    }
  }
  
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${colors.primary} dark:opacity-60 ${className}`}>
      {/* Base gradient layer */}
      <div className={`absolute inset-0 bg-gradient-to-tl ${colors.secondary} opacity-40`} />
      
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
            background: `radial-gradient(circle, ${getColor(el.colorType, 0.8)} 0%, ${getColor(el.colorType, 0.3)} 40%, transparent 70%)`,
            filter: 'blur(30px)',
            opacity: el.opacity,
            animation: `float-pattern-${i % 4} ${el.duration}s ease-in-out infinite`,
            animationDelay: `${el.delay}s`,
          }}
        />
      ))}
      
      {/* Additional accent circles */}
      {params.elements.slice(0, 3).map((el, i) => (
        <div
          key={`accent-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${(el.x + 30) % 100}%`,
            top: `${(el.y + 30) % 100}%`,
            width: `${el.size * 0.5}%`,
            height: `${el.size * 0.5}%`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${getColor((el.colorType + 3) % 8, 0.9)} 0%, transparent 60%)`,
            filter: 'blur(40px)',
            opacity: el.opacity * 0.7,
            animation: `float-pattern-${(i + 2) % 4} ${el.duration * 1.4}s ease-in-out infinite reverse`,
            animationDelay: `${el.delay * 0.5}s`,
          }}
        />
      ))}
      
      {/* Geometric shapes layer */}
      <div className="absolute inset-0 z-10">
        {params.shapes.map((shape, index) => renderShape(shape, index))}
      </div>
      
      {/* Overlay gradient for depth */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.accent} opacity-20 mix-blend-overlay z-10`} />
      
      {/* Dark overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
      
      {/* CSS animations */}
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
        
        @keyframes geometric-float-0 {
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
        
        @keyframes geometric-float-1 {
          0%, 100% { 
            transform: translate(-50%, -50%) translateX(0) translateY(0) scale(1); 
          }
          50% { 
            transform: translate(-50%, -50%) translateX(50px) translateY(-30px) scale(1.2); 
          }
        }
        
        @keyframes geometric-float-2 {
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
        
        @keyframes geometric-float-3 {
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
        
        @keyframes geometric-float-4 {
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