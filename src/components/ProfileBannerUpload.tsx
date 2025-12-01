import { useState, useRef } from 'react'
import { Upload, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { Button } from './ui/button'
import { motion, AnimatePresence } from 'motion/react'

interface ProfileBannerUploadProps {
  userId: string
  accessToken: string
  serverUrl: string
  currentBannerUrl?: string | null
  onUploadComplete: () => void
}

export function ProfileBannerUpload({
  userId,
  accessToken,
  serverUrl,
  currentBannerUrl,
  onUploadComplete
}: ProfileBannerUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentBannerUrl || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    setError(null)
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    
    setSelectedFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    
    setUploading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('banner', selectedFile)
    
    try {
      const response = await fetch(
        `${serverUrl}/users/${userId}/upload-banner`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: formData
        }
      )
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }
      
      // Success!
      console.log('✅ Banner uploaded successfully:', data.bannerUrl)
      setUploadSuccess(true)
      setTimeout(() => {
        setUploadSuccess(false)
        console.log('🔄 Triggering onUploadComplete callback to refresh user progress')
        onUploadComplete()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleClearSelection = () => {
    setPreview(currentBannerUrl || null)
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative overflow-hidden rounded-2xl border-4 transition-all ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-dashed border-muted-foreground/30 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Preview or Placeholder */}
        {preview ? (
          <div className="relative aspect-[3/1] w-full">
            <img
              src={preview}
              alt="Banner preview"
              className="w-full h-full object-cover"
            />
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Change
              </Button>
              {selectedFile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSelection}
                  disabled={uploading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div
            className="aspect-[3/1] w-full flex flex-col items-center justify-center gap-4 p-8 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground mb-1">
                Drop banner image here or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Recommended: 1200x400px • Max 5MB • JPG, PNG, or WebP
              </p>
            </div>
          </div>
        )}
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-2 p-4 rounded-xl bg-destructive/10 border-2 border-destructive/50"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">Upload Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-destructive hover:text-destructive/80">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/50"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <div className="flex-1">
              <p className="font-black text-emerald-500">Banner Uploaded!</p>
              <p className="text-sm text-emerald-500/80">Your profile banner has been updated successfully</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      {selectedFile && !uploadSuccess && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full"
          size="lg"
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Upload Banner
            </>
          )}
        </Button>
      )}

      {/* Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Your banner will appear on your profile and dashboard header</p>
      </div>
    </div>
  )
}
