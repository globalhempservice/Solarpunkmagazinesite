import { MessageCircle, Sparkles, Plus } from 'lucide-react'
import { Button } from '../ui/button'

interface EmptyStateProps {
  type: 'no-threads' | 'no-rooms' | 'new-user'
  onAction?: () => void
}

export function EmptyState({ type, onAction }: EmptyStateProps) {
  const configs = {
    'no-threads': {
      icon: MessageCircle,
      title: 'No threads yet',
      description: 'Be the first to start a conversation in this room',
      action: 'Start a Thread',
    },
    'no-rooms': {
      icon: Sparkles,
      title: 'No rooms found',
      description: 'Try adjusting your filters or search query',
      action: null,
    },
    'new-user': {
      icon: Sparkles,
      title: 'Welcome to the Agora',
      description: 'Start by exploring rooms or creating your first post',
      action: 'Create Your First Post',
    },
  }

  const config = configs[type]
  const Icon = config.icon

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Icon */}
      <div 
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        <Icon className="w-10 h-10 text-purple-400" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-2">
        {config.title}
      </h3>

      {/* Description */}
      <p className="text-white/50 mb-6 max-w-sm">
        {config.description}
      </p>

      {/* Action */}
      {config.action && onAction && (
        <Button
          onClick={onAction}
          className="px-6 py-3 rounded-xl font-bold flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
          }}
        >
          <Plus className="w-5 h-5" />
          {config.action}
        </Button>
      )}
    </div>
  )
}
