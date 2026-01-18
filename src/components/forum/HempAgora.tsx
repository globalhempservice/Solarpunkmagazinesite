import { useState } from 'react'
import { ForumHome } from './ForumHome'
import { CreatePostModal } from './CreatePostModal'
import { Thread, Room } from './types'

interface HempAgoraProps {
  userId: string
  accessToken: string
  serverUrl: string
  nadaPoints?: number
  onClose: () => void
  onNadaUpdate?: (newBalance: number) => void
}

export function HempAgora({ userId, accessToken, serverUrl, nadaPoints, onClose, onNadaUpdate }: HempAgoraProps) {
  const [currentView, setCurrentView] = useState<'home' | 'room' | 'thread'>('home')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  const handleThreadClick = (thread: Thread) => {
    setSelectedThread(thread)
    setCurrentView('thread')
  }

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room)
    setCurrentView('room')
  }

  const handleCreatePost = (data: any) => {
    console.log('Creating post:', data)
    // TODO: Submit to backend
    // For now, just show success
  }

  return (
    <> 
      {/* Background Layer - Extends full screen behind navbars */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #1a0b2e 0%, #16213e 50%, #0f1729 100%)',
        }}
      >
        {/* Subtle aurora background */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
          }}
        />

        {/* Grain texture */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content Layer - Padded to stay between navbars */}
      <div 
        className="relative h-full flex flex-col overflow-hidden"
        style={{
          paddingTop: '80px', // Top navbar space
          paddingBottom: '96px', // Bottom navbar space
        }}
      >
        {currentView === 'home' && (
          <ForumHome
            onThreadClick={handleThreadClick}
            onRoomClick={handleRoomClick}
            onCreatePost={() => setShowCreateModal(true)}
            userId={userId}
          />
        )}

        {currentView === 'room' && selectedRoom && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white/60">
              <h2 className="text-2xl font-bold text-white mb-2">{selectedRoom.name}</h2>
              <p>Room view coming soon...</p>
              <button
                onClick={() => setCurrentView('home')}
                className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {currentView === 'thread' && selectedThread && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white/60 max-w-2xl px-6">
              <h2 className="text-2xl font-bold text-white mb-2">{selectedThread.title}</h2>
              <p className="mb-4">{selectedThread.excerpt}</p>
              <p>Thread detail view coming soon...</p>
              <button
                onClick={() => setCurrentView('home')}
                className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
      />
    </>
  )
}