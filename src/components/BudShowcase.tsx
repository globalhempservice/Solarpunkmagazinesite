import { motion } from 'motion/react'
import { BudCharacter } from './BudCharacter'
import { Sparkles, Heart, Zap, BookOpen, Compass, Users, Gift } from 'lucide-react'

interface BudShowcaseProps {
  variant?: 'hero' | 'about' | 'features' | 'journey'
}

export function BudShowcase({ variant = 'hero' }: BudShowcaseProps) {
  if (variant === 'hero') {
    return (
      <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl">
        {/* Background Image - Hemp Field Sunrise */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1643385418886-454c6c801e69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
            alt="Hemp field at sunrise"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* BUD Character - Flying in the scene */}
        <div className="absolute top-1/4 right-1/4 z-20">
          <motion.div
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <BudCharacter size="xl" expression="happy" mood="default" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              <h1 className="text-white font-black">Meet BUD</h1>
            </div>
            <p className="text-white/90 text-xl mb-6">
              Your friendly companion throughout the Hemp'in Universe. I'm here to guide you, 
              celebrate your achievements, and help you discover everything this ecosystem has to offer!
            </p>
            <div className="flex gap-3 flex-wrap">
              <span className="px-4 py-2 bg-pink-500/90 text-white rounded-full font-black text-sm">
                🌱 Always Learning
              </span>
              <span className="px-4 py-2 bg-green-500/90 text-white rounded-full font-black text-sm">
                💚 Here to Help
              </span>
              <span className="px-4 py-2 bg-yellow-500/90 text-white rounded-full font-black text-sm">
                ✨ Celebrates You
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (variant === 'about') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left - Image with BUD */}
        <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1710596220294-3f88dfe02fd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt="Green plant growth"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-transparent to-green-500/30" />
          
          {/* BUD in the center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <BudCharacter size="xl" expression="celebrating" mood="success" />
            </motion.div>
          </div>

          {/* Floating text bubbles */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0 }}
            className="absolute top-20 left-8 bg-white/95 dark:bg-gray-900/95 px-4 py-2 rounded-full shadow-lg border-2 border-pink-300"
          >
            <p className="text-sm font-black text-pink-600 dark:text-pink-400">Hey there! 👋</p>
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            className="absolute bottom-20 right-8 bg-white/95 dark:bg-gray-900/95 px-4 py-2 rounded-full shadow-lg border-2 border-green-300"
          >
            <p className="text-sm font-black text-green-600 dark:text-green-400">Let's explore! 🌿</p>
          </motion.div>
        </div>

        {/* Right - About BUD */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <h2 className="font-black text-transparent bg-gradient-to-r from-pink-600 via-rose-500 to-green-600 bg-clip-text mb-4">
              Who is BUD?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              BUD is your personal companion throughout the DEWII ecosystem - a friendly plant bud 
              who grows alongside you as you explore, learn, and connect within the hemp industry.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Just like a real plant, BUD represents growth, sustainability, and natural wisdom. 
              I'm here to make your journey delightful, educational, and rewarding!
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h3 className="font-black text-pink-600 dark:text-pink-400 mb-1">Friendly & Supportive</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  I'm always here with encouragement and helpful tips
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-black text-green-600 dark:text-green-400 mb-1">Celebrates Your Wins</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Every achievement, big or small, deserves celebration!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-black text-yellow-600 dark:text-yellow-400 mb-1">Makes Things Fun</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Learning and exploring should be enjoyable!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'features') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 - Guide */}
        <motion.div
          whileHover={{ y: -5 }}
          className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl group cursor-pointer"
        >
          <img
            src="https://images.unsplash.com/photo-1760074016419-f9c13beb7eff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
            alt="Digital nature ecosystem"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          
          <div className="absolute top-6 left-1/2 -translate-x-1/2">
            <BudCharacter size="md" expression="thinking" mood="info" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <h3 className="font-black text-white">Your Guide</h3>
            </div>
            <p className="text-white/80 text-sm">
              I'll help you navigate through every feature and discover hidden gems
            </p>
          </div>
        </motion.div>

        {/* Card 2 - Teacher */}
        <motion.div
          whileHover={{ y: -5 }}
          className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl group cursor-pointer"
        >
          <img
            src="https://images.unsplash.com/photo-1648734728505-f432d774f11d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
            alt="Plant sprout macro"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          
          <div className="absolute top-6 left-1/2 -translate-x-1/2">
            <BudCharacter size="md" expression="happy" mood="success" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-green-400" />
              <h3 className="font-black text-white">Your Teacher</h3>
            </div>
            <p className="text-white/80 text-sm">
              Learn about hemp, earn rewards, and grow your knowledge with me
            </p>
          </div>
        </motion.div>

        {/* Card 3 - Cheerleader */}
        <motion.div
          whileHover={{ y: -5 }}
          className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl group cursor-pointer"
        >
          <img
            src="https://images.unsplash.com/photo-1760884092418-c63c82cabae2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
            alt="Futuristic garden"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          
          <div className="absolute top-6 left-1/2 -translate-x-1/2">
            <BudCharacter size="md" expression="celebrating" mood="warning" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h3 className="font-black text-white">Your Cheerleader</h3>
            </div>
            <p className="text-white/80 text-sm">
              Celebrating every achievement, unlock, and milestone with you!
            </p>
          </div>
        </motion.div>

        {/* Card 4 - Connector */}
        <motion.div
          whileHover={{ y: -5 }}
          className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl group cursor-pointer"
        >
          <img
            src="https://images.unsplash.com/photo-1668097613572-40b7c11c8727?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
            alt="Sustainable technology"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          
          <div className="absolute top-6 left-1/2 -translate-x-1/2">
            <BudCharacter size="md" expression="winking" mood="default" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-pink-400" />
              <h3 className="font-black text-white">Your Connector</h3>
            </div>
            <p className="text-white/80 text-sm">
              Helping you find the right people, products, and opportunities
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (variant === 'journey') {
    return (
      <div className="relative w-full py-20">
        {/* Timeline background */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-300 via-green-300 to-yellow-300 dark:from-pink-600 dark:via-green-600 dark:to-yellow-600 -translate-x-1/2" />

        <div className="max-w-6xl mx-auto space-y-20">
          <h2 className="text-center font-black text-transparent bg-gradient-to-r from-pink-600 via-green-600 to-yellow-600 bg-clip-text mb-12">
            BUD's Journey With You
          </h2>

          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          >
            <div className="order-2 md:order-1">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border-2 border-pink-300 dark:border-pink-600">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-black">
                    1
                  </div>
                  <h3 className="font-black text-pink-600 dark:text-pink-400">Welcome!</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  When you first arrive, I'll introduce myself and show you around the Hemp'in Universe. 
                  Don't worry - I'll make sure you feel right at home!
                </p>
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <BudCharacter size="xl" expression="happy" mood="default" />
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          >
            <div className="flex justify-center">
              <BudCharacter size="xl" expression="thinking" mood="info" />
            </div>
            <div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border-2 border-cyan-300 dark:border-cyan-600">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-black">
                    2
                  </div>
                  <h3 className="font-black text-cyan-600 dark:text-cyan-400">Explore Together</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  As you explore different apps and features, I'll pop up with helpful tips and tricks. 
                  Think of me as your personal tour guide through the ecosystem!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          >
            <div className="order-2 md:order-1">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border-2 border-green-300 dark:border-green-600">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-black">
                    3
                  </div>
                  <h3 className="font-black text-green-600 dark:text-green-400">Learn & Earn</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  I'll teach you how to earn Power Points, NADA tokens, and unlock achievements. 
                  The more you engage, the more rewards you'll discover!
                </p>
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <BudCharacter size="xl" expression="excited" mood="success" />
            </div>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          >
            <div className="flex justify-center">
              <BudCharacter size="xl" expression="celebrating" mood="warning" />
            </div>
            <div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border-2 border-yellow-300 dark:border-yellow-600">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-black">
                    4
                  </div>
                  <h3 className="font-black text-yellow-600 dark:text-yellow-400">Celebrate Success!</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Every milestone deserves a celebration! I'll be there to cheer you on when you 
                  level up, unlock features, or achieve something amazing.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Step 5 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-pink-100 via-green-100 to-yellow-100 dark:from-pink-900/30 dark:via-green-900/30 dark:to-yellow-900/30 p-8 rounded-3xl shadow-2xl border-4 border-gradient">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <BudCharacter size="xl" expression="winking" mood="default" />
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-black text-transparent bg-gradient-to-r from-pink-600 via-green-600 to-yellow-600 bg-clip-text mb-3">
                    Grow Together Forever
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Just like a real plant, we'll both keep growing! As the platform evolves and you 
                    discover new features, I'll be right there beside you, adapting and learning too. 
                    We're in this together! 🌱💚
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return null
}
