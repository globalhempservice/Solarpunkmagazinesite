import { Share2, Copy, ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { GamifiedImporter } from './GamifiedImporter'
import { useState } from 'react'
import { ChevronDown, ChevronUp, MoreHorizontal, X } from 'lucide-react'
import { Button } from './ui/button'
import linkedinCopyExample from 'figma:asset/2b7dcb1729958df102f9216b2a7adada20c9b1b4.png'

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
  const [showTutorial, setShowTutorial] = useState(false)

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

          {/* Mini Tutorial: 3 Steps */}
          {showTutorial && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Step 1: Click 3 Dots */}
                <div className="flex flex-col p-4 md:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-2 border-emerald-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                      <div className="relative bg-emerald-500 rounded-xl p-3">
                        <MoreHorizontal className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                          1
                        </div>
                        <h3 className="font-bold">Find the Menu</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">Click the ⋯ button</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-background/50 border border-border">
                      <p className="text-sm font-semibold mb-2 text-emerald-600">📱 Mobile:</p>
                      <p className="text-xs text-muted-foreground">
                        Tap the <span className="font-semibold">three dots (⋯)</span> on the post
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border">
                      <p className="text-sm font-semibold mb-2 text-emerald-600">💻 Desktop:</p>
                      <p className="text-xs text-muted-foreground">
                        Click the <span className="font-semibold">three dots (⋯)</span> in the top right
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2: Copy Link with Screenshot */}
                <div className="flex flex-col p-4 md:p-5 rounded-2xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 border-2 border-teal-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full" />
                      <div className="relative bg-teal-500 rounded-xl p-3">
                        <Copy className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-xs">
                          2
                        </div>
                        <h3 className="font-bold">Copy the Link</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">Select copy option</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-background/50 border border-border">
                      <p className="text-sm font-semibold mb-2 text-teal-600">📱 Mobile:</p>
                      <p className="text-xs text-muted-foreground">
                        Tap <span className="font-semibold">"Share via"</span> → then <span className="font-semibold">"Copy"</span>
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border">
                      <p className="text-sm font-semibold mb-2 text-teal-600">💻 Desktop:</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Click <span className="font-semibold">"Copy link to post"</span>
                      </p>
                      {/* Screenshot Example */}
                      <div className="mt-2 rounded-lg overflow-hidden border-2 border-teal-500/30 shadow-lg">
                        <img 
                          src={linkedinCopyExample} 
                          alt="LinkedIn copy link example" 
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Paste Here */}
                <div className="flex flex-col p-4 md:p-5 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border-2 border-cyan-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
                      <div className="relative bg-cyan-500 rounded-xl p-3">
                        <ArrowRight className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold text-xs">
                          3
                        </div>
                        <h3 className="font-bold">Paste Here</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">Create your post!</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-background/50 border border-border">
                      <p className="text-sm font-semibold mb-2 text-cyan-600">✨ All Platforms:</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Paste the link below and click <span className="font-semibold">"Create"</span>
                      </p>
                      <div className="mt-3 p-2 rounded bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
                        <p className="text-xs text-center font-medium">
                          🚀 Works with LinkedIn, Instagram, Medium, X, TikTok, Reddit
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hide Tutorial Button */}
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm hover:bg-background/80"
                  onClick={() => setShowTutorial(false)}
                >
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Hide Tutorial
                </Button>
              </div>
            </div>
          )}
          
          {/* Show Tutorial Button */}
          {!showTutorial && (
            <div className="flex justify-center mb-6">
              <Button
                variant="outline"
                size="sm"
                className="text-sm hover:bg-background/80"
                onClick={() => setShowTutorial(true)}
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                Show Tutorial
              </Button>
            </div>
          )}

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