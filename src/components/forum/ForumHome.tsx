import { useState } from 'react'
import { Search, Plus, MessageSquare, Bookmark, FileText, Users, TrendingUp, Flame } from 'lucide-react'
import { Thread, Room } from './types'
import { ThreadCard } from './ThreadCard'
import { RoomCard } from './RoomCard'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { motion } from 'motion/react'

interface ForumHomeProps {
  onThreadClick: (thread: Thread) => void
  onRoomClick: (room: Room) => void
  onCreatePost: () => void
  userId: string
}

// Mock data (replace with real data)
const MOCK_ROOMS: Room[] = [
  { id: '1', name: 'Hemp Cultivation', description: 'Growing techniques, soil health, and sustainable farming', icon: '🌱', threadCount: 342, activeNow: 12, color: '#10B981', isFollowing: true },
  { id: '2', name: 'Materials & Manufacturing', description: 'Hemp fiber, textiles, biocomposites, and industrial applications', icon: '🏭', threadCount: 189, activeNow: 8, color: '#8B5CF6' },
  { id: '3', name: 'Policy & Regulation', description: 'Legislation, advocacy, and regulatory frameworks worldwide', icon: '⚖️', threadCount: 156, activeNow: 5, color: '#3B82F6' },
  { id: '4', name: 'Business & Trade', description: 'Market insights, supply chains, and entrepreneurship', icon: '💼', threadCount: 224, activeNow: 15, color: '#14B8A6' },
  { id: '5', name: 'Health & Science', description: 'CBD research, nutritional benefits, and clinical studies', icon: '🔬', threadCount: 278, activeNow: 9, color: '#06B6D4' },
  { id: '6', name: 'Culture & Lifestyle', description: 'Hemp history, art, music, and community stories', icon: '🎨', threadCount: 167, activeNow: 6, color: '#EC4899' },
]

const MOCK_THREADS: Thread[] = [
  {
    id: '1',
    title: 'Water-efficient irrigation systems for small-scale hemp farms?',
    excerpt: 'Looking for recommendations on drip irrigation setups that work well in dry climates. What are you using?',
    content: '',
    type: 'question',
    status: 'new',
    roomId: '1',
    roomName: 'Hemp Cultivation',
    tags: ['irrigation', 'farming', 'sustainability'],
    author: { id: '1', name: 'Sarah Chen', reputation: 342 },
    signals: { replies: 12, views: 89, saves: 5, nadaPotential: 15 },
    createdAt: '2025-12-29T08:30:00Z',
    updatedAt: '2025-12-29T08:30:00Z',
  },
  {
    id: '2',
    title: 'Proposal: Create a Hemp Carbon Credit Standard',
    excerpt: 'Establishing a standardized carbon credit framework for hemp cultivation to incentivize regenerative farming practices.',
    content: '',
    type: 'proposal',
    status: 'proposal',
    roomId: '3',
    roomName: 'Policy & Regulation',
    tags: ['carbon', 'policy', 'climate'],
    author: { id: '2', name: 'Marcus Williams', reputation: 1205 },
    signals: { replies: 34, views: 456, saves: 28, nadaPotential: 50 },
    createdAt: '2025-12-28T14:15:00Z',
    updatedAt: '2025-12-29T10:22:00Z',
    isPinned: true,
  },
  {
    id: '3',
    title: 'Best hemp fiber degumming methods for small textile mills',
    excerpt: 'Comparing enzymatic vs alkaline degumming processes. What has worked for you in terms of cost, quality, and environmental impact?',
    content: '',
    type: 'standard',
    status: 'hot',
    roomId: '2',
    roomName: 'Materials & Manufacturing',
    tags: ['textiles', 'manufacturing', 'processing'],
    author: { id: '3', name: 'Elena Rodriguez', reputation: 678 },
    signals: { replies: 24, views: 312, saves: 18, nadaPotential: 25 },
    createdAt: '2025-12-27T11:45:00Z',
    updatedAt: '2025-12-29T09:10:00Z',
  },
]

export function ForumHome({ onThreadClick, onRoomClick, onCreatePost, userId }: ForumHomeProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'following' | 'saved'>('all')

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Sticky Header */}
      <div 
        className="sticky top-0 z-20 border-b backdrop-blur-xl"
        style={{
          background: 'rgba(15, 10, 30, 0.8)',
          borderColor: 'rgba(147, 51, 234, 0.2)',
        }}
      >
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
                }}
              >
                💬
              </div>
              <h1 className="text-xl font-black text-white hidden lg:block">FORUM</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                type="text"
                placeholder="Search rooms, topics, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={onCreatePost}
                className="h-11 px-6 rounded-xl font-bold flex items-center gap-2 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                }}
              >
                <Plus className="w-5 h-5" />
                <span className="hidden lg:inline">New Post</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Three-Column Layout */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-[1600px] mx-auto px-4 lg:px-6 py-4 lg:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr,320px] gap-4 lg:gap-6 h-full">
            
            {/* LEFT SIDEBAR - Agora Map - Desktop Only */}
            <div className="hidden lg:block overflow-y-auto space-y-6">
              {/* Rooms */}
              <div>
                <h3 className="text-sm font-bold text-white/60 mb-3 px-2">ROOMS</h3>
                <div className="space-y-2">
                  {MOCK_ROOMS.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => onRoomClick(room)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-white/5 border border-transparent hover:border-white/10"
                    >
                      <span className="text-2xl">{room.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{room.name}</div>
                        <div className="text-xs text-white/40">{room.threadCount} threads</div>
                      </div>
                      {room.activeNow > 0 && (
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-sm font-bold text-white/60 mb-3 px-2">QUICK FILTERS</h3>
                <div className="flex flex-wrap gap-2">
                  {['farming', 'textiles', 'policy', 'CBD', 'business', 'research'].map((tag) => (
                    <button
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* My Trail */}
              <div>
                <h3 className="text-sm font-bold text-white/60 mb-3 px-2">MY TRAIL</h3>
                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/5 transition-all">
                    <Bookmark className="w-4 h-4" />
                    <span>Saved (12)</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/5 transition-all">
                    <Users className="w-4 h-4" />
                    <span>Following (8)</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/5 transition-all">
                    <FileText className="w-4 h-4" />
                    <span>Drafts (2)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CENTER - Public Square Feed */}
            <div className="overflow-y-auto space-y-6">
              {/* Hero */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <h2 className="text-4xl font-black text-white" style={{
                  textShadow: '0 0 40px rgba(139, 92, 246, 0.3)',
                }}>
                  The Hemp Agora
                </h2>
                <p className="text-lg text-white/60">
                  A living forum for hemp knowledge, debate, and building the future.
                </p>
              </motion.div>

              {/* Featured Rooms Strip */}
              <div>
                <h3 className="text-sm font-bold text-white/60 mb-3">FEATURED ROOMS</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MOCK_ROOMS.slice(0, 3).map((room) => (
                    <RoomCard key={room.id} room={room} onClick={() => onRoomClick(room)} variant="compact" />
                  ))}
                </div>
              </div>

              {/* Today in the Agora */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white/60">TODAY IN THE AGORA</h3>
                  <div className="flex items-center gap-2">
                    {(['all', 'following', 'saved'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setSelectedFilter(filter)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          selectedFilter === filter
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thread List */}
                <div className="space-y-3">
                  {MOCK_THREADS.map((thread) => (
                    <ThreadCard key={thread.id} thread={thread} onClick={() => onThreadClick(thread)} />
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR - Signals + Presence */}
            <div className="hidden lg:block overflow-y-auto space-y-6">
              {/* Active Now */}
              <div 
                className="rounded-xl p-4 border"
                style={{
                  background: 'rgba(30, 20, 60, 0.3)',
                  backdropFilter: 'blur(20px)',
                  borderColor: 'rgba(147, 51, 234, 0.2)',
                }}
              >
                <h3 className="text-sm font-bold text-white/60 mb-3">ACTIVE NOW</h3>
                <div className="space-y-2">
                  {[
                    { name: 'Sarah C.', status: 'Replying in Hemp Cultivation' },
                    { name: 'Marcus W.', status: 'Viewing Policy & Regulation' },
                    { name: 'Elena R.', status: 'Writing a proposal...' },
                  ].map((user, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white/80">{user.name}</div>
                        <div className="text-xs text-white/40 truncate">{user.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Your Signals */}
              <div 
                className="rounded-xl p-4 border"
                style={{
                  background: 'rgba(30, 20, 60, 0.3)',
                  backdropFilter: 'blur(20px)',
                  borderColor: 'rgba(147, 51, 234, 0.2)',
                }}
              >
                <h3 className="text-sm font-bold text-white/60 mb-4">YOUR SIGNALS</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/60">Daily Streak</span>
                      <span className="text-xs font-bold text-emerald-400">3 days 🔥</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-black text-white">12</div>
                      <div className="text-xs text-white/40">Replies</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-emerald-400">+45</div>
                      <div className="text-xs text-white/40">NADA today</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agora Rules */}
              <div 
                className="rounded-xl p-4 border"
                style={{
                  background: 'rgba(30, 20, 60, 0.3)',
                  backdropFilter: 'blur(20px)',
                  borderColor: 'rgba(147, 51, 234, 0.2)',
                }}
              >
                <h3 className="text-sm font-bold text-white/60 mb-3">AGORA RULES</h3>
                <div className="space-y-2 text-xs text-white/50 leading-relaxed">
                  <p>• Be kind and respectful</p>
                  <p>• Cite your sources</p>
                  <p>• No spam or self-promotion</p>
                  <p>• Stay on topic</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}