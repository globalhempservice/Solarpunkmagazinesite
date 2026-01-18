// Temporary placeholder for BudCharacter component
// TODO: Implement full BUD character component with expressions

interface BudCharacterProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  expression?: 'happy' | 'excited' | 'thinking' | 'celebrating' | 'winking'
  mood?: 'default' | 'success' | 'info' | 'warning'
  animate?: boolean
}

export function BudCharacter({ 
  size = 'md', 
  expression = 'happy', 
  mood = 'default',
  animate = true 
}: BudCharacterProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  }

  const moodColors = {
    default: 'from-pink-500 to-emerald-500',
    success: 'from-emerald-500 to-green-500',
    info: 'from-cyan-500 to-blue-500',
    warning: 'from-yellow-500 to-orange-500'
  }

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        bg-gradient-to-br ${moodColors[mood]}
        flex items-center justify-center
        shadow-lg
        ${animate ? 'animate-pulse' : ''}
      `}
    >
      <span className="text-white text-2xl" role="img" aria-label={expression}>
        {expression === 'winking' && '😉'}
        {expression === 'happy' && '😊'}
        {expression === 'excited' && '🎉'}
        {expression === 'thinking' && '🤔'}
        {expression === 'celebrating' && '🎊'}
      </span>
    </div>
  )
}
