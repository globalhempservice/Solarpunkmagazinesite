export function ReadEarnIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Book */}
      <path
        d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 4V20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Coin/NADA */}
      <circle
        cx="17"
        cy="7"
        r="3"
        fill="#10B981"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <text
        x="17"
        y="8.5"
        fontSize="4"
        fill="white"
        textAnchor="middle"
        fontWeight="bold"
      >
        N
      </text>
    </svg>
  )
}

export function StreakIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Lightning bolt */}
      <path
        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sparkles */}
      <path
        d="M19 3L19.5 4.5L21 5L19.5 5.5L19 7L18.5 5.5L17 5L18.5 4.5L19 3Z"
        fill="#FCD34D"
        stroke="#FCD34D"
        strokeWidth="0.5"
      />
      <path
        d="M5 5L5.5 6.5L7 7L5.5 7.5L5 9L4.5 7.5L3 7L4.5 6.5L5 5Z"
        fill="#FCD34D"
        stroke="#FCD34D"
        strokeWidth="0.5"
      />
    </svg>
  )
}

export function CommunityIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* People */}
      <circle
        cx="9"
        cy="7"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="15"
        cy="7"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M3 20C3 17.2386 5.23858 15 8 15H10C11.3062 15 12.4175 15.5909 13.1716 16.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 15H16C18.7614 15 21 17.2386 21 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Vote checkmark */}
      <path
        d="M19 3L20 4L22 2"
        stroke="#10B981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Circular progress ring for "Read & Earn" bento card
export function ProgressRing({ 
  progress = 65, 
  size = 48,
  strokeWidth = 4 
}: { 
  progress?: number
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(110, 231, 183, 0.2)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
    </svg>
  )
}
