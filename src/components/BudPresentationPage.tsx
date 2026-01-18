import { useState } from 'react'
import { BudShowcase } from './BudShowcase'
import { BudCharacter } from './BudCharacter'
import { motion } from 'motion/react'
import { Download, Image, Camera } from 'lucide-react'

export function BudPresentationPage() {
  const [currentView, setCurrentView] = useState<'all' | 'hero' | 'about' | 'features' | 'journey' | 'expressions'>('all')

  const views = [
    { id: 'all', label: 'All Sections', icon: Image },
    { id: 'hero', label: 'Hero Banner', icon: Camera },
    { id: 'about', label: 'About BUD', icon: Camera },
    { id: 'features', label: 'Features Grid', icon: Camera },
    { id: 'journey', label: 'Journey Timeline', icon: Camera },
    { id: 'expressions', label: 'BUD Expressions', icon: Camera },
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-green-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b-2 border-pink-200 dark:border-pink-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BudCharacter size="md" expression="winking" mood="default" animate={false} />
              <div>
                <h1 className="font-black text-transparent bg-gradient-to-r from-pink-600 via-rose-500 to-green-600 bg-clip-text">
                  BUD Presentation Assets
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Screenshot-ready images for investor deck
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              <span className="text-sm font-black text-pink-600 dark:text-pink-400">
                Ready for Screenshots
              </span>
            </div>
          </div>

          {/* View Selector */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {views.map((view) => {
              const Icon = view.icon
              return (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm whitespace-nowrap transition-all ${
                    currentView === view.id
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {view.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-20">
        {/* Hero Section */}
        {(currentView === 'all' || currentView === 'hero') && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-black text-gray-900 dark:text-white">Hero Banner</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                Recommended: 1920x600px
              </span>
            </div>
            <BudShowcase variant="hero" />
          </motion.section>
        )}

        {/* About Section */}
        {(currentView === 'all' || currentView === 'about') && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-black text-gray-900 dark:text-white">About BUD</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                Recommended: 1920x500px
              </span>
            </div>
            <BudShowcase variant="about" />
          </motion.section>
        )}

        {/* Features Section */}
        {(currentView === 'all' || currentView === 'features') && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-black text-gray-900 dark:text-white">BUD Features Grid</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                Recommended: 1920x400px (4 cards)
              </span>
            </div>
            <BudShowcase variant="features" />
          </motion.section>
        )}

        {/* Journey Section */}
        {(currentView === 'all' || currentView === 'journey') && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-black text-gray-900 dark:text-white">BUD's Journey Timeline</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                Recommended: 1920x1200px (scroll capture)
              </span>
            </div>
            <BudShowcase variant="journey" />
          </motion.section>
        )}

        {/* BUD Expressions Reference */}
        {(currentView === 'all' || currentView === 'expressions') && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-black text-gray-900 dark:text-white">BUD Expression Reference</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                All available moods & expressions
              </span>
            </div>
            
            {/* Expressions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {/* Happy Default */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border-2 border-pink-300 dark:border-pink-600">
                <div className="flex justify-center mb-4">
                  <BudCharacter size="lg" expression="happy" mood="default" />
                </div>
                <h3 className="text-center font-black text-pink-600 dark:text-pink-400 mb-1">Happy</h3>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">Default mood</p>
              </div>

              {/* Excited */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border-2 border-yellow-300 dark:border-yellow-600">
                <div className="flex justify-center mb-4">
                  <BudCharacter size="lg" expression="excited" mood="warning" />
                </div>
                <h3 className="text-center font-black text-yellow-600 dark:text-yellow-400 mb-1">Excited</h3>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">Warning mood</p>
              </div>

              {/* Thinking */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border-2 border-cyan-300 dark:border-cyan-600">
                <div className="flex justify-center mb-4">
                  <BudCharacter size="lg" expression="thinking" mood="info" />
                </div>
                <h3 className="text-center font-black text-cyan-600 dark:text-cyan-400 mb-1">Thinking</h3>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">Info mood</p>
              </div>

              {/* Celebrating */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border-2 border-green-300 dark:border-green-600">
                <div className="flex justify-center mb-4">
                  <BudCharacter size="lg" expression="celebrating" mood="success" />
                </div>
                <h3 className="text-center font-black text-green-600 dark:text-green-400 mb-1">Celebrating</h3>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">Success mood</p>
              </div>

              {/* Winking */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border-2 border-pink-300 dark:border-pink-600">
                <div className="flex justify-center mb-4">
                  <BudCharacter size="lg" expression="winking" mood="default" />
                </div>
                <h3 className="text-center font-black text-pink-600 dark:text-pink-400 mb-1">Winking</h3>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">Default mood</p>
              </div>
            </div>

            {/* Size Variations */}
            <div className="mt-8">
              <h3 className="font-black text-gray-900 dark:text-white mb-4">Size Variations</h3>
              <div className="flex items-end justify-center gap-8 bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl">
                <div className="text-center">
                  <BudCharacter size="sm" expression="happy" mood="default" />
                  <p className="mt-2 text-xs font-black text-gray-600 dark:text-gray-400">Small</p>
                </div>
                <div className="text-center">
                  <BudCharacter size="md" expression="happy" mood="success" />
                  <p className="mt-2 text-xs font-black text-gray-600 dark:text-gray-400">Medium</p>
                </div>
                <div className="text-center">
                  <BudCharacter size="lg" expression="happy" mood="info" />
                  <p className="mt-2 text-xs font-black text-gray-600 dark:text-gray-400">Large</p>
                </div>
                <div className="text-center">
                  <BudCharacter size="xl" expression="celebrating" mood="warning" />
                  <p className="mt-2 text-xs font-black text-gray-600 dark:text-gray-400">Extra Large</p>
                </div>
              </div>
            </div>

            {/* Mood Variations */}
            <div className="mt-8">
              <h3 className="font-black text-gray-900 dark:text-white mb-4">Mood Color Schemes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-2xl p-6 text-center">
                  <BudCharacter size="lg" expression="happy" mood="default" />
                  <p className="mt-3 font-black text-pink-600 dark:text-pink-400">Default</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Pink & Green</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl p-6 text-center">
                  <BudCharacter size="lg" expression="celebrating" mood="success" />
                  <p className="mt-3 font-black text-green-600 dark:text-green-400">Success</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Green Tones</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-2xl p-6 text-center">
                  <BudCharacter size="lg" expression="thinking" mood="info" />
                  <p className="mt-3 font-black text-cyan-600 dark:text-cyan-400">Info</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Cyan & Blue</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-2xl p-6 text-center">
                  <BudCharacter size="lg" expression="excited" mood="warning" />
                  <p className="mt-3 font-black text-yellow-600 dark:text-yellow-400">Warning</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Yellow & Orange</p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Screenshot Instructions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-pink-100 via-white to-green-100 dark:from-pink-900/20 dark:via-gray-900 dark:to-green-900/20 rounded-3xl p-8 border-2 border-pink-300 dark:border-pink-600"
        >
          <h3 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-3">
            <Camera className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            Screenshot Instructions
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-black text-pink-600 dark:text-pink-400 mb-2">For Investor Deck:</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>✅ <strong>Hero Banner:</strong> Full-width screenshot for intro slide</li>
                <li>✅ <strong>About BUD:</strong> Two-column layout explaining the character</li>
                <li>✅ <strong>Features Grid:</strong> 4-card showcase of BUD's roles</li>
                <li>✅ <strong>Journey Timeline:</strong> 5-step user journey with BUD</li>
                <li>✅ <strong>Expressions:</strong> Show BUD's personality variations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-green-600 dark:text-green-400 mb-2">Screenshot Tips:</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>🖥️ Use 1920x1080 browser window for consistency</li>
                <li>📱 Toggle dark mode for different presentations</li>
                <li>🎯 Use "View Selector" buttons to isolate sections</li>
                <li>📏 Check recommended dimensions above each section</li>
                <li>✨ BUD animations look great in video/GIF too!</li>
              </ul>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}