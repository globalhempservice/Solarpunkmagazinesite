import { motion } from 'motion/react'
import { Clock, ScrollText, Heart } from 'lucide-react'
import { BudModal } from './BudModal'

interface PointsRulesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PointsRulesModal({ isOpen, onClose }: PointsRulesModalProps) {
  return (
    <BudModal
      isOpen={isOpen}
      onClose={onClose}
      title="Hey! I'm BUD, your reading buddy!"
      subtitle="Let me show you how to earn points by reading articles"
      budExpression="happy"
      budMood="default"
      footerButton={{
        text: 'Got it, BUD!',
        onClick: onClose
      }}
    >
      <div className="space-y-3">
        {[
          {
            icon: Clock,
            title: 'Take Your Time',
            description: 'Stay on the article for at least 2 seconds',
            color: 'from-blue-400 to-cyan-400 dark:from-blue-500 dark:to-cyan-500',
            border: 'border-blue-300 dark:border-blue-600',
            iconColor: 'text-white'
          },
          {
            icon: ScrollText,
            title: 'Just Scroll a Bit',
            description: 'Read through at least 15% of the article',
            color: 'from-purple-400 to-violet-400 dark:from-purple-500 dark:to-violet-500',
            border: 'border-purple-300 dark:border-purple-600',
            iconColor: 'text-white'
          }
        ].map((rule, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="relative"
          >
            {/* Speech bubble tail */}
            <div className={`absolute top-5 ${index % 2 === 0 ? '-left-2.5' : '-right-2.5'} w-0 h-0 ${index % 2 === 0 ? 'border-r-[14px]' : 'border-l-[14px]'} ${index % 2 === 0 ? 'border-r-white' : 'border-l-white'} dark:${index % 2 === 0 ? 'border-r-pink-800/90' : 'border-l-pink-800/90'} border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent`} />
            
            {/* Bubble content */}
            <div className={`relative overflow-hidden rounded-2xl bg-white dark:bg-pink-800/90 p-4 border-3 ${rule.border} shadow-lg hover:shadow-xl transition-all group`}>
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${rule.color} shadow-md`}>
                  <rule.icon className={`w-5 h-5 ${rule.iconColor}`} strokeWidth={2.5} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-gray-800 dark:text-gray-100 mb-1">
                    {rule.title}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-snug">
                    {rule.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Final encouraging message bubble */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="relative mt-4"
        >
          {/* Speech bubble tail */}
          <div className="absolute -left-2.5 top-5 w-0 h-0 border-r-[14px] border-r-emerald-400 dark:border-r-emerald-500 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent" />
          
          <div className="p-4 bg-gradient-to-br from-emerald-400 via-green-400 to-emerald-500 dark:from-emerald-500 dark:via-green-500 dark:to-emerald-600 rounded-2xl shadow-xl border-3 border-emerald-300 dark:border-emerald-400">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-white/90 rounded-full shadow-md">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              </div>
              <div>
                <h4 className="font-black text-white mb-1.5">
                  That's it! Super simple!
                </h4>
                <p className="text-sm text-white/95 leading-snug font-semibold">
                  Just read naturally and you'll earn points! No pressure, no tricks - we keep it fair for everyone.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 bg-white/90 rounded-full shadow-sm">
                    <span className="text-xs font-black text-gray-800">Regular articles = +10 points</span>
                  </div>
                  <div className="px-3 py-1.5 bg-white/70 rounded-full shadow-sm">
                    <span className="text-xs font-black text-gray-700">RSS articles = +5 points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </BudModal>
  )
}