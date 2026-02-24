import { useState } from 'react'
import { X, MessageCircle, HelpCircle, FileText, Tag, Sparkles } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { motion, AnimatePresence } from 'motion/react'
import { ThreadType } from './types'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [postType, setPostType] = useState<ThreadType>('standard')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  
  // Proposal-specific fields
  const [problem, setProblem] = useState('')
  const [proposal, setProposal] = useState('')
  const [impact, setImpact] = useState('')
  const [needed, setNeeded] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = {
      type: postType,
      title,
      content,
      room: selectedRoom,
      tags,
      ...(postType === 'proposal' && { problem, proposal, impact, needed })
    }
    
    onSubmit(data)
    onClose()
  }

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput])
      setTagInput('')
    }
  }

  if (!isOpen) return null

  const postTypes = [
    { type: 'standard' as ThreadType, label: 'Thread', icon: MessageCircle, desc: 'Start a discussion' },
    { type: 'question' as ThreadType, label: 'Question', icon: HelpCircle, desc: 'Ask the community' },
    { type: 'proposal' as ThreadType, label: 'Proposal', icon: FileText, desc: 'Propose a change' },
  ]

  return (
    <div className="fixed inset-x-0 top-0 z-[9999] flex items-center justify-center p-4" style={{ bottom: 'var(--nav-bottom)' }}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border shadow-2xl"
        style={{
          background: 'rgba(15, 10, 30, 0.95)',
          backdropFilter: 'blur(40px)',
          borderColor: 'rgba(147, 51, 234, 0.3)',
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'rgba(147, 51, 234, 0.2)' }}
        >
          <h2 className="text-2xl font-black text-white">Create Post</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Post Type Selection */}
            <div>
              <Label className="text-white mb-3 block">Type</Label>
              <div className="grid grid-cols-3 gap-3">
                {postTypes.map(({ type, label, icon: Icon, desc }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPostType(type)}
                    className={`p-4 rounded-xl border transition-all ${
                      postType === type
                        ? 'bg-purple-500/20 border-purple-500/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 mx-auto ${
                      postType === type ? 'text-purple-400' : 'text-white/40'
                    }`} />
                    <div className={`text-sm font-bold mb-1 ${
                      postType === type ? 'text-white' : 'text-white/60'
                    }`}>
                      {label}
                    </div>
                    <div className="text-xs text-white/40">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Room Selection */}
            <div>
              <Label className="text-white mb-3 block">Room</Label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                required
                className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white"
              >
                <option value="">Select a room...</option>
                <option value="cultivation">🌱 Hemp Cultivation</option>
                <option value="materials">🏭 Materials & Manufacturing</option>
                <option value="policy">⚖️ Policy & Regulation</option>
                <option value="business">💼 Business & Trade</option>
                <option value="health">🔬 Health & Science</option>
                <option value="culture">🎨 Culture & Lifestyle</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <Label className="text-white mb-3 block">
                {postType === 'question' ? 'Your Question' : 'Title'}
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  postType === 'question' 
                    ? 'What would you like to ask?' 
                    : postType === 'proposal'
                    ? 'Brief title for your proposal'
                    : 'Give your thread a clear title'
                }
                required
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
              />
            </div>

            {/* Conditional Fields for Proposal */}
            {postType === 'proposal' ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block">Problem</Label>
                  <textarea
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="What problem does this solve?"
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 resize-none"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">Proposal</Label>
                  <textarea
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    placeholder="What's your proposed solution?"
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 resize-none"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">Impact</Label>
                  <textarea
                    value={impact}
                    onChange={(e) => setImpact(e.target.value)}
                    placeholder="What impact will this have?"
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 resize-none"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">Needed</Label>
                  <textarea
                    value={needed}
                    onChange={(e) => setNeeded(e.target.value)}
                    placeholder="What resources or support are needed?"
                    required
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 resize-none"
                  />
                </div>
              </div>
            ) : (
              /* Content for Thread/Question */
              <div>
                <Label className="text-white mb-3 block">
                  {postType === 'question' ? 'Details (optional)' : 'Content'}
                </Label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    postType === 'question'
                      ? 'Add more context to help people answer...'
                      : 'Share your thoughts, ideas, or insights...'
                  }
                  rows={8}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 resize-none"
                />
              </div>
            )}

            {/* Tags */}
            <div>
              <Label className="text-white mb-3 block">Tags</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    placeholder="Add tags (press Enter)"
                    className="flex-1 h-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-lg"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    className="h-10 px-4 bg-white/10 hover:bg-white/20 rounded-lg"
                  >
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                      <div
                        key={i}
                        className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-sm text-purple-300 flex items-center gap-2"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* NADA Potential Info */}
            <div 
              className="p-4 rounded-xl border flex items-start gap-3"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
              }}
            >
              <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-200/80 leading-relaxed">
                {postType === 'proposal' 
                  ? 'Well-structured proposals can earn up to +50 NADA from community engagement'
                  : postType === 'question'
                  ? 'Helpful questions earn NADA when others engage and provide answers'
                  : 'Quality threads that spark discussion earn NADA based on engagement'
                }
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div 
          className="flex items-center justify-end gap-3 p-6 border-t"
          style={{ borderColor: 'rgba(147, 51, 234, 0.2)' }}
        >
          <Button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-6 py-3 rounded-xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
            }}
          >
            {postType === 'proposal' ? 'Submit Proposal' : postType === 'question' ? 'Ask Question' : 'Create Thread'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
