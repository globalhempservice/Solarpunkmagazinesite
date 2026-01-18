import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface CarouselCard {
  title: string
  description: string
  icon: any
  gradient: string
  stats: string
}

interface AutoCarouselProps {
  cards: CarouselCard[]
  autoScrollInterval?: number // milliseconds
}

export function AutoCarousel({ cards, autoScrollInterval = 5000 }: AutoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [isPaused, setIsPaused] = useState(false)
  
  // Calculate how many cards to show based on screen size
  const [cardsToShow, setCardsToShow] = useState(3)
  
  // Update cards to show based on screen size
  useEffect(() => {
    const updateCardsToShow = () => {
      if (window.innerWidth < 640) {
        setCardsToShow(2) // Mobile: 2 cards
      } else if (window.innerWidth < 1024) {
        setCardsToShow(2) // Tablet: 2 cards
      } else {
        setCardsToShow(3) // Desktop: 3 cards
      }
    }
    
    updateCardsToShow()
    window.addEventListener('resize', updateCardsToShow)
    return () => window.removeEventListener('resize', updateCardsToShow)
  }, [])
  
  // Auto-scroll functionality
  useEffect(() => {
    if (isPaused) return
    
    const interval = setInterval(() => {
      setDirection('right')
      setCurrentIndex((prev) => {
        // Loop back to start after showing all cards
        if (prev + cardsToShow >= cards.length) {
          return 0
        }
        return prev + 1
      })
    }, autoScrollInterval)
    
    return () => clearInterval(interval)
  }, [cards.length, cardsToShow, autoScrollInterval, isPaused])
  
  const goToPrevious = () => {
    setDirection('left')
    setCurrentIndex((prev) => {
      if (prev === 0) {
        return Math.max(0, cards.length - cardsToShow)
      }
      return prev - 1
    })
  }
  
  const goToNext = () => {
    setDirection('right')
    setCurrentIndex((prev) => {
      if (prev + cardsToShow >= cards.length) {
        return 0
      }
      return prev + 1
    })
  }
  
  // Get visible cards
  const visibleCards = cards.slice(currentIndex, currentIndex + cardsToShow)
  
  // Calculate dots
  const totalDots = Math.ceil(cards.length / cardsToShow)
  const currentDot = Math.floor(currentIndex / cardsToShow)
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Carousel Container */}
      <div className="relative overflow-hidden">
        <div className="flex gap-3 sm:gap-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleCards.map((card, idx) => {
              const Icon = card.icon
              const actualIndex = currentIndex + idx
              
              return (
                <motion.div
                  key={`${card.title}-${actualIndex}`}
                  initial={{ 
                    opacity: 0,
                    x: direction === 'right' ? 400 : -400,
                    scale: 0.9,
                  }}
                  animate={{ 
                    opacity: 1,
                    x: 0,
                    scale: 1,
                  }}
                  exit={{ 
                    opacity: 0,
                    x: direction === 'right' ? -400 : 400,
                    scale: 0.9,
                  }}
                  transition={{ 
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1], // Smooth cubic-bezier easing
                    opacity: { duration: 0.6 },
                    scale: { duration: 0.8 },
                  }}
                  className="group relative flex-shrink-0"
                  style={{ 
                    width: `calc((100% - ${(cardsToShow - 1) * (cardsToShow === 2 ? 12 : 16)}px) / ${cardsToShow})`
                  }}
                >
                  {/* Comic Drop Shadow with smooth transition */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: 'rgba(5, 47, 39, 0.8)',
                      transform: 'translate(4px, 4px)',
                      zIndex: -1
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />

                  {/* Card Content */}
                  <div className={`relative h-full bg-gradient-to-br ${card.gradient} rounded-2xl border-3 sm:border-4 border-[#0B2F27] shadow-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]`}>
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.6) 1px, transparent 0)`,
                      backgroundSize: '16px 16px'
                    }} />

                    {/* Content */}
                    <div className="relative p-4 sm:p-5 lg:p-6 flex flex-col h-full min-h-[200px] sm:min-h-[220px]">
                      {/* Icon with fade-in */}
                      <motion.div 
                        className="mb-3 sm:mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        <div className="inline-flex p-2 sm:p-2.5 lg:p-3 rounded-xl bg-white/20 border-2 border-white/20 transition-all duration-300 group-hover:bg-white/30">
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" strokeWidth={2.5} />
                        </div>
                      </motion.div>

                      {/* Title with fade-in */}
                      <motion.h3 
                        className="text-sm sm:text-base lg:text-lg font-black text-white mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        {card.title}
                      </motion.h3>

                      {/* Description with fade-in */}
                      <motion.p 
                        className="text-white/90 text-xs sm:text-sm mb-3 sm:mb-4 flex-grow leading-snug"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        {card.description}
                      </motion.p>

                      {/* Stats Badge with fade-in */}
                      <motion.div 
                        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 lg:px-3 py-1.5 sm:py-2 rounded-full bg-white/20 border border-white/25 w-fit transition-all duration-300 group-hover:bg-white/30"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white flex-shrink-0" strokeWidth={2.5} />
                        <span className="text-[10px] sm:text-xs font-bold text-white">
                          {card.stats}
                        </span>
                      </motion.div>

                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Navigation Arrows - Desktop Only */}
      <div className="hidden lg:block">
        <motion.button
          onClick={goToPrevious}
          whileHover={{ scale: 1.1, x: -4 }}
          whileTap={{ scale: 0.95 }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #10B981, #14B8A6)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
          }}
          aria-label="Previous cards"
        >
          <ChevronLeft className="w-5 h-5 text-white" strokeWidth={3} />
        </motion.button>
        
        <motion.button
          onClick={goToNext}
          whileHover={{ scale: 1.1, x: 4 }}
          whileTap={{ scale: 0.95 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #10B981, #14B8A6)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
          }}
          aria-label="Next cards"
        >
          <ChevronRight className="w-5 h-5 text-white" strokeWidth={3} />
        </motion.button>
      </div>
      
      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {Array.from({ length: totalDots }).map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => {
              setDirection(idx > currentDot ? 'right' : 'left')
              setCurrentIndex(idx * cardsToShow)
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="transition-all duration-500"
            aria-label={`Go to slide ${idx + 1}`}
          >
            <motion.div 
              className="rounded-full"
              animate={{
                width: currentDot === idx ? '24px' : '8px',
                height: '8px',
                background: currentDot === idx 
                  ? 'linear-gradient(135deg, #10B981, #14B8A6)'
                  : 'rgba(16, 185, 129, 0.3)',
              }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                boxShadow: currentDot === idx 
                  ? '0 2px 8px rgba(16, 185, 129, 0.4)'
                  : 'none',
              }}
            />
          </motion.button>
        ))}
      </div>
    </div>
  )
}