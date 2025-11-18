import { Sparkles } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { GamifiedImporter } from './GamifiedImporter'

interface SimplifiedURLImporterProps {
  onImport: (data: {
    title: string
    content: string
    excerpt: string
    author?: string
    authorImage?: string
    authorTitle?: string
    publishDate?: string
    sourceUrl: string
    media: Array<{
      type: 'youtube' | 'audio' | 'image' | 'spotify'
      url: string
      caption?: string
    }>
  }) => void
}

export function SimplifiedURLImporter({ onImport }: SimplifiedURLImporterProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 animate-gradient-xy" />
      
      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-emerald-400/40 to-teal-400/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <Card className="relative backdrop-blur-xl bg-card/90 border-2 border-emerald-500/30 shadow-2xl">
        <CardContent className="p-6 md:p-10">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full" />
                <Sparkles className="relative w-8 h-8 text-emerald-500 animate-pulse" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                The Fast Way to Publish
              </h2>
            </div>
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-sm text-foreground/80">
                  Create a time print of content you want to preserve or share
                </p>
              </div>
            </div>
          </div>

          {/* Gamified Importer Component */}
          <GamifiedImporter onImport={onImport} />
        </CardContent>
      </Card>

      {/* CSS for animations */}
      <style>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100px); opacity: 0; }
        }
        
        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 15s ease infinite;
        }
        
        .animate-float {
          animation: float 5s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}