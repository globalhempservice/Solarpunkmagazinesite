// Forum Type Definitions

export type ThreadType = 'standard' | 'question' | 'proposal'
export type ThreadStatus = 'new' | 'hot' | 'answered' | 'proposal' | 'locked'

export interface Thread {
  id: string
  title: string
  excerpt: string
  content: string
  type: ThreadType
  status?: ThreadStatus
  roomId: string
  roomName: string
  tags: string[]
  author: {
    id: string
    name: string
    reputation: number
    avatar?: string
  }
  signals: {
    replies: number
    views: number
    saves: number
    nadaPotential: number
  }
  createdAt: string
  updatedAt: string
  isPinned?: boolean
  isSolved?: boolean
}

export interface Room {
  id: string
  name: string
  description: string
  icon: string
  threadCount: number
  activeNow: number
  color: string
  isFollowing?: boolean
}

export interface Reply {
  id: string
  threadId: string
  content: string
  author: {
    id: string
    name: string
    reputation: number
    avatar?: string
  }
  createdAt: string
  likes: number
  isAccepted?: boolean
}

export interface Proposal {
  problem: string
  proposal: string
  impact: string
  needed: string
  supporters: number
}
