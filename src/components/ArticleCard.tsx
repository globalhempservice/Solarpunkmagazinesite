import { LucideIcon, Zap, BookOpen } from "lucide-react"
import { PlaceholderArt } from "./PlaceholderArt"
import { ImageWithFallback } from "./figma/ImageWithFallback"

interface ArticleCardProps {
  article: {
    id: string
    title: string
    excerpt: string
    category: string
    coverImage?: string
    readingTime: number
    views?: number
    createdAt: string
    source?: string
    sourceUrl?: string
    media?: Array<{
      type: 'youtube' | 'audio' | 'image' | 'pdf'
      url: string
      caption?: string
      title?: string
    }>
  }
  onClick: () => void
  categoryIcon?: LucideIcon
  categoryColor?: string
}

export function ArticleCard({ article, onClick, categoryIcon, categoryColor }: ArticleCardProps) {
  // Get cover image from article.coverImage or first media image
  const displayImage = article.coverImage || article.media?.find(m => m.type === 'image')?.url
  
  // Truncate excerpt to 2 lines with ellipsis
  const truncateExcerpt = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text + '...'
    return text.slice(0, maxLength).trim() + '...'
  }
  
  return (
    <div 
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Comic-style card with neon border and drop shadow */}
      <div className={`
        relative rounded-3xl p-[3px] 
        bg-gradient-to-br ${categoryColor || 'from-emerald-500 via-teal-500 to-green-600'} 
        shadow-[0_8px_0_rgba(0,0,0,0.2),0_0_30px_rgba(16,185,129,0.3)]
        hover:shadow-[0_12px_0_rgba(0,0,0,0.25),0_0_50px_rgba(16,185,129,0.5)]
        active:shadow-[0_4px_0_rgba(0,0,0,0.2)]
        active:translate-y-1
        transition-all duration-300
        border-2 border-white/20
      `}>
        {/* Inner card with solarpunk styling */}
        <div className="relative rounded-[22px] bg-card overflow-hidden h-full">
          {/* Halftone pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10" style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.4) 1px, transparent 1px)',
            backgroundSize: '12px 12px'
          }} />
          
          {/* Ambient neon glow effect - base layer */}
          <div className={`
            absolute inset-0 opacity-0 group-hover:opacity-100 
            bg-gradient-to-br ${categoryColor || 'from-emerald-500/10 via-teal-500/10 to-green-600/10'}
            transition-opacity duration-500 pointer-events-none z-10
          `} />
          
          {/* HOVER OVERLAY - Attractive CTA with points and category */}
          <div className={`
            absolute inset-0 z-30
            bg-gradient-to-br ${categoryColor || 'from-emerald-500/95 via-teal-500/95 to-green-600/95'}
            opacity-0 group-hover:opacity-100
            transition-all duration-500
            flex flex-col items-center justify-center gap-6 p-8
            backdrop-blur-sm
          `}>
            {/* Halftone on overlay too */}
            <div className="absolute inset-0 opacity-[0.08]" style={{
              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.6) 1.5px, transparent 1.5px)',
              backgroundSize: '16px 16px'
            }} />
            
            {/* Category Icon - Large and centered */}
            {categoryIcon && (
              <div className="relative">
                <div className="absolute inset-0 blur-2xl opacity-50 bg-white rounded-full" />
                <div className="relative p-6 bg-white/20 rounded-full border-4 border-white/40 shadow-[0_8px_0_rgba(0,0,0,0.2)]">
                  {(() => {
                    const Icon = categoryIcon
                    return <Icon className="w-12 h-12 text-white drop-shadow-2xl" strokeWidth={2.5} />
                  })()}
                </div>
              </div>
            )}
            
            {/* Category Name */}
            <div className="relative text-center">
              <h3 className="font-black text-white drop-shadow-2xl tracking-wide" style={{
                textShadow: '2px 2px 0 rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.5)',
                fontSize: '1.5rem'
              }}>
                {article.category}
              </h3>
            </div>
            
            {/* Points Badge - Attractive and prominent */}
            <div className="relative">
              <div className="absolute inset-0 blur-xl opacity-60 bg-amber-400 rounded-full animate-pulse" />
              <div className="relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full border-4 border-white/50 shadow-[0_6px_0_rgba(0,0,0,0.25)]">
                <Zap className="w-6 h-6 text-amber-900 drop-shadow-lg" strokeWidth={3} fill="currentColor" />
                <div className="flex flex-col items-center">
                  <span className="font-black text-amber-900 drop-shadow-lg" style={{
                    textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
                    fontSize: '1.25rem',
                    lineHeight: 1
                  }}>
                    +10 POINTS
                  </span>
                </div>
                <Zap className="w-6 h-6 text-amber-900 drop-shadow-lg" strokeWidth={3} fill="currentColor" />
              </div>
            </div>
            
            {/* READ Button - Big and inviting */}
            <div className="relative mt-2">
              <div className="absolute inset-0 blur-xl opacity-60 bg-white rounded-2xl" />
              <button className="relative px-12 py-4 bg-white rounded-2xl border-4 border-white/60 shadow-[0_8px_0_rgba(0,0,0,0.3)] hover:shadow-[0_10px_0_rgba(0,0,0,0.35)] active:shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-1 transition-all duration-200 group/btn">
                <div className="flex items-center gap-3">
                  <BookOpen className={`w-6 h-6 bg-gradient-to-r ${categoryColor || 'from-emerald-600 to-teal-600'} bg-clip-text text-transparent drop-shadow-lg group-hover/btn:scale-110 transition-transform`} strokeWidth={3} />
                  <span className={`font-black bg-gradient-to-r ${categoryColor || 'from-emerald-600 to-teal-600'} bg-clip-text text-transparent drop-shadow-lg tracking-wider`} style={{
                    fontSize: '1.5rem'
                  }}>
                    READ NOW
                  </span>
                  <BookOpen className={`w-6 h-6 bg-gradient-to-r ${categoryColor || 'from-emerald-600 to-teal-600'} bg-clip-text text-transparent drop-shadow-lg group-hover/btn:scale-110 transition-transform`} strokeWidth={3} />
                </div>
              </button>
            </div>
            
            {/* Reading time hint */}
            <div className="relative flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full border-2 border-white/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-black text-white text-sm drop-shadow-lg">{article.readingTime} MIN READ</span>
            </div>
          </div>
          
          {/* Image section with comic energy */}
          <div className="aspect-video overflow-hidden relative">
            {displayImage ? (
              <div className="relative w-full h-full">
                {/* Dramatic gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                
                {/* Hemp fiber texture overlay */}
                <div className="absolute inset-0 opacity-[0.08] z-10 mix-blend-overlay" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '30px 30px'
                }} />
                
                <ImageWithFallback
                  src={displayImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>
            ) : (
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                <PlaceholderArt 
                  articleId={article.id}
                  category={article.category}
                  title={article.title}
                  className="w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                  useCategoryArt={true}
                />
              </div>
            )}
            
            {/* Category badge with neon style - only visible when NOT hovering */}
            {categoryIcon && categoryColor && (
              <div className="absolute top-4 left-4 z-20 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                <div className={`
                  flex items-center gap-2 px-4 py-2 
                  bg-gradient-to-r ${categoryColor} 
                  rounded-full 
                  shadow-[0_4px_0_rgba(0,0,0,0.2),0_0_20px_rgba(255,255,255,0.3)]
                  border-2 border-white/30
                  backdrop-blur-sm
                `}>
                  {(() => {
                    const Icon = categoryIcon
                    return <Icon className="w-4 h-4 text-white drop-shadow-lg" strokeWidth={2.5} />
                  })()}
                  <span className="font-black text-white drop-shadow-lg" style={{
                    textShadow: '1px 1px 0 rgba(0,0,0,0.3)'
                  }}>{article.category}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Content section - Mysterious excerpt only - hidden on hover */}
          <div className="relative p-6 space-y-4 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
            {/* Mysterious excerpt - 2 lines max with ellipsis */}
            <p className="text-foreground/90 leading-relaxed line-clamp-2 font-medium">
              {truncateExcerpt(article.excerpt)}
            </p>
            
            {/* Bottom metadata bar with comic styling */}
            <div className="flex items-center justify-between pt-3 border-t-2 border-border/30">
              <div className="flex items-center gap-3">
                {/* Reading time badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 rounded-full">
                  <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-black text-muted-foreground">{article.readingTime} MIN</span>
                </div>
                
                {/* LinkedIn indicator if from LinkedIn */}
                {article.source === 'linkedin' && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-xs font-black text-blue-600">LINKEDIN</span>
                  </div>
                )}
              </div>
              
              {/* Hover arrow indicator */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className={`w-5 h-5 text-transparent bg-gradient-to-r ${categoryColor || 'from-emerald-500 to-teal-500'} bg-clip-text`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}