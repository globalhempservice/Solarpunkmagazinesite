import { useState } from 'react';
import { X, Upload, Sparkles, Star, Globe, Zap, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';

interface AddSwapItemModalProps {
  userId: string;
  accessToken: string;
  onClose: () => void;
  onItemAdded: () => void;
}

const CATEGORIES = [
  { value: 'clothing', label: 'Clothing', power: 1 },
  { value: 'accessories', label: 'Accessories', power: 1 },
  { value: 'home_goods', label: 'Home Goods', power: 1 },
  { value: 'wellness', label: 'Wellness', power: 1 },
  { value: 'construction', label: 'Construction', power: 1 },
  { value: 'other', label: 'Other', power: 1 },
];

const CONDITIONS = [
  { value: 'like_new', label: 'Like New', description: 'Barely used, mint condition', power: 1 },
  { value: 'good', label: 'Good', description: 'Normal wear, fully functional', power: 1 },
  { value: 'well_loved', label: 'Well-Loved', description: 'Lots of character, still usable', power: 1 },
  { value: 'vintage', label: 'Vintage', description: 'Old but gold', power: 1 },
];

export function AddSwapItemModal({ userId, accessToken, onClose, onItemAdded }: AddSwapItemModalProps) {
  const [showPowerUpLab, setShowPowerUpLab] = useState(false);
  const [loading, setLoading] = useState(false);
  const [justPosted, setJustPosted] = useState(false);
  
  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [hempInside, setHempInside] = useState(false);
  const [hempPercentage, setHempPercentage] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [willingToShip, setWillingToShip] = useState(true);
  const [story, setStory] = useState('');
  const [yearsInUse, setYearsInUse] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Accordion states
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Calculate item power level — matches backend calculatePowerLevel() in swap_routes.tsx
  const calculatePowerLevel = () => {
    let power = 1; // Base level
    if (description && description.length > 20) power += 1; // +1 description
    if (images.length >= 1) power += 1;                     // +1 for first image
    if (images.length >= 3) power += 1;                     // +1 for 3+ images
    if (story && story.length > 20) power += 1;             // +1 story
    if (country) power += 1;                                 // +1 country
    if (city) power += 1;                                    // +1 city
    if (hempInside) power += 1;                             // +1 hemp
    if (yearsInUse) power += 1;                             // +1 years in use
    if (willingToShip) power += 1;                          // +1 willing to ship
    return Math.min(power, 10);
  };

  const powerLevel = calculatePowerLevel();
  const progressPercent = (powerLevel / 10) * 100;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    try {
      setUploadingImage(true);

      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const uploadResponse = await fetch(
        `https://${projectId}.supabase.co/storage/v1/object/swap-images/${filename}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': file.type,
          },
          body: file,
        }
      );

      if (!uploadResponse.ok) {
        const err = await uploadResponse.json().catch(() => ({}));
        throw new Error(err.message || 'Upload failed');
      }

      const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/swap-images/${filename}`;
      setImages(prev => [...prev, publicUrl]);
      toast.success('Image uploaded!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Make sure the swap-images storage bucket exists.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleQuickPost = async () => {
    if (!title || images.length === 0) {
      toast.error('Please add at least a photo and title');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/swap/items`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title,
            description,
            category: category || 'other',
            condition: condition || 'good',
            hemp_inside: hempInside,
            hemp_percentage: hempPercentage ? parseInt(hempPercentage) : null,
            images,
            country: country || null,
            city: city || null,
            willing_to_ship: willingToShip,
            story: story || null,
            years_in_use: yearsInUse ? parseInt(yearsInUse) : null,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create swap item');
      }

      setJustPosted(true);
      
      // Show celebration for 2 seconds then close
      setTimeout(() => {
        onItemAdded();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error creating swap item:', error);
      toast.error(error.message || 'Failed to list item');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const canPost = title && images.length > 0;

  // SUCCESS CELEBRATION VIEW
  if (justPosted) {
    return (
      <div className="fixed inset-x-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60]" style={{ top: 'var(--nav-top)', bottom: 'var(--nav-bottom)' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative max-w-2xl w-full mx-4"
        >
          {/* Celebration glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-3xl blur-3xl opacity-50 animate-pulse" />
          
          {/* Card */}
          <div className="relative bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 rounded-3xl p-8 text-center">
            {/* Confetti pattern background */}
            <div className="absolute inset-0 opacity-20 rounded-3xl overflow-hidden">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                backgroundSize: '30px 30px'
              }} />
            </div>

            <div className="relative z-10">
              {/* Item Image */}
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="relative mx-auto w-48 h-48 mb-6"
              >
                <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl" />
                <img 
                  src={images[0]} 
                  alt="Posted item"
                  className="relative w-full h-full object-cover rounded-full border-8 border-white/50 shadow-2xl"
                />
              </motion.div>

              {/* Success Message */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-4xl font-black text-white mb-2 drop-shadow-lg">
                  ITEM POSTED!
                </h2>
                <p className="text-xl text-white/90 mb-4">
                  Starting at Level {powerLevel}
                </p>
                
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + (i * 0.05) }}
                    >
                      <Star
                        className={`w-6 h-6 ${i < powerLevel ? 'text-white' : 'text-white/30'}`}
                        fill={i < powerLevel ? 'currentColor' : 'none'}
                      />
                    </motion.div>
                  ))}
                </div>

                <p className="text-lg text-white/90 font-medium">
                  Your item is now live in the SWAP feed!
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // MAIN MODAL VIEW
  return (
    <div className="fixed inset-x-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[60] p-4" style={{ top: 'var(--nav-top)', bottom: 'var(--nav-bottom)' }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative max-w-2xl w-full max-h-full overflow-y-auto"
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-amber-600/20 rounded-3xl blur-3xl" />
        
        {/* Main card */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-yellow-400/40 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(251,191,36,0.4)]">
          
          {/* Close button - floating */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* HERO SECTION - Giant Photo Upload */}
          <div className="relative bg-gradient-to-br from-yellow-400/10 via-orange-500/10 to-amber-600/10 p-8 pb-6">
            
            {/* Title */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300 mb-2">
                LIST YOUR ITEM
              </h2>
              <p className="text-gray-400">
                Upload photo + add title = instant post ⚡
              </p>
            </motion.div>

            {/* GIANT PHOTO AREA */}
            <AnimatePresence mode="wait">
              {images.length === 0 ? (
                // Empty state - giant upload circle
                <motion.label
                  key="empty"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative block w-64 h-64 mx-auto cursor-pointer group"
                >
                  {/* Pulsing glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse" />
                  
                  {/* Main circle */}
                  <div className="relative w-full h-full rounded-full border-4 border-dashed border-yellow-400/50 group-hover:border-yellow-400 bg-gradient-to-br from-yellow-400/5 to-orange-500/5 group-hover:from-yellow-400/10 group-hover:to-orange-500/10 flex flex-col items-center justify-center transition-all">
                    
                    {/* Shine effect */}
                    <div className="absolute top-8 right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    
                    <Upload className="w-20 h-20 text-yellow-400 mb-4 group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-bold text-white">Tap to Upload</span>
                    <span className="text-sm text-gray-400 mt-2">Your item's photo</span>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </motion.label>
              ) : (
                // Has image - show it BIG
                <motion.div
                  key="has-image"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative w-64 h-64 mx-auto"
                >
                  {/* Glow around image */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-full blur-2xl opacity-40" />
                  
                  {/* Main image */}
                  <div className="relative w-full h-full rounded-full overflow-hidden border-8 border-gradient-to-br from-yellow-400 via-orange-500 to-yellow-400 shadow-2xl">
                    <img 
                      src={images[0]} 
                      alt="Item preview"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Shine effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/30 via-transparent to-transparent" />
                  </div>

                  {/* Change photo button */}
                  <label className="absolute bottom-0 right-0 w-16 h-16 bg-yellow-400 hover:bg-yellow-300 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all border-4 border-black group">
                    <ImageIcon className="w-7 h-7 text-black group-hover:scale-110 transition-transform" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>

                  {/* Delete button */}
                  <button
                    onClick={() => setImages([])}
                    className="absolute top-0 left-0 w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all border-4 border-black"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Additional images preview */}
            {images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 justify-center mt-4"
              >
                {images.slice(1).map((url, index) => (
                  <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-yellow-400/50">
                    <img src={url} alt={`Extra ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImages(images.filter((_, i) => i !== index + 1))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                
                {images.length < 5 && (
                  <label className="w-16 h-16 border-2 border-dashed border-yellow-400/40 rounded-lg flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-all">
                    <Upload className="w-6 h-6 text-yellow-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                )}
              </motion.div>
            )}
          </div>

          {/* Form Section */}
          <div className="p-6 space-y-4">
            
            {/* Title Input - Clean & Focused */}
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your item called?"
                className="bg-black/40 border-2 border-yellow-400/30 focus:border-yellow-400 text-white placeholder:text-gray-500 text-xl h-14 rounded-xl text-center font-medium"
              />
            </div>

            {/* Power Level Display - Compact but Dramatic */}
            <motion.div
              layout
              className="relative border-2 border-yellow-400/40 rounded-2xl p-4 bg-gradient-to-br from-yellow-400/10 via-orange-500/10 to-amber-600/10 overflow-hidden"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(251,191,36,0.1) 10px, rgba(251,191,36,0.1) 20px)`
              }} />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-400" fill="currentColor" />
                    <span className="text-white font-bold text-lg">Power Level</span>
                  </div>
                  
                  {/* Big level number */}
                  <motion.div
                    key={powerLevel}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300"
                  >
                    {powerLevel}
                  </motion.div>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-3">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: i < powerLevel ? 1 : 0.7 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Star
                        className={`w-5 h-5 ${i < powerLevel ? 'text-yellow-400' : 'text-gray-600'}`}
                        fill={i < powerLevel ? 'currentColor' : 'none'}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-full"
                  />
                </div>

                {/* Status text */}
                <p className="text-sm text-gray-300 mt-3 text-center">
                  {powerLevel === 1 && "Add a photo + title to post instantly ⚡"}
                  {powerLevel >= 2 && powerLevel < 5 && "Good start! Add details to boost visibility 🌟"}
                  {powerLevel >= 5 && powerLevel < 8 && "Level 5+: Appears on the Globe! 🌍"}
                  {powerLevel >= 8 && "MAX POWER! Ultimate visibility! 🔥"}
                </p>
              </div>
            </motion.div>

            {/* Quick Description */}
            {!showPowerUpLab && (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Quick description (optional, +1 ⚡ if 20+ chars)"
                rows={2}
                className="bg-black/40 border-yellow-400/30 focus:border-yellow-400 text-white placeholder:text-gray-500 rounded-xl resize-none"
              />
            )}

            {/* Action Buttons */}
            {!showPowerUpLab ? (
              <div className="space-y-3 pt-2">
                {/* POST NOW - Big yellow button */}
                <Button
                  onClick={handleQuickPost}
                  disabled={!canPost || loading}
                  className="w-full h-16 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 hover:from-yellow-300 hover:via-orange-300 hover:to-yellow-300 text-black font-black text-xl rounded-2xl shadow-[0_8px_0_rgba(0,0,0,0.3)] active:shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'POSTING...' : `POST NOW • LVL ${powerLevel}`}
                </Button>

                {/* Power Up button - subtle */}
                <Button
                  onClick={() => setShowPowerUpLab(true)}
                  variant="outline"
                  className="w-full h-12 border-2 border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400 font-bold rounded-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Power Up First
                </Button>
              </div>
            ) : (
              // POWER-UP LAB
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between pt-2 border-t-2 border-yellow-400/20">
                  <h3 className="text-xl text-yellow-400 font-black flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    POWER-UP LAB
                  </h3>
                  <Button
                    onClick={() => setShowPowerUpLab(false)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    Hide
                  </Button>
                </div>

                {/* Basic Stats Accordion */}
                <div className="border-2 border-yellow-400/30 rounded-xl overflow-hidden bg-black/20">
                  <button
                    onClick={() => toggleSection('basic')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-yellow-400/10 hover:bg-yellow-400/20 transition-colors"
                  >
                    <span className="text-white font-bold flex items-center gap-2">
                      📦 Description
                      <span className="text-sm text-yellow-400">
                        +{(description && description.length > 20 ? 1 : 0)} ⭐
                      </span>
                    </span>
                    {openSection === 'basic' ? <ChevronUp className="w-5 h-5 text-yellow-400" /> : <ChevronDown className="w-5 h-5 text-yellow-400" />}
                  </button>
                  
                  <AnimatePresence>
                    {openSection === 'basic' && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-4">
                          <div>
                            <Label className="text-white mb-2 block flex items-center justify-between">
                              <span>Description</span>
                              <span className="text-yellow-400 text-sm">+1 ⭐ (20+ chars)</span>
                            </Label>
                            <Textarea
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Describe your item..."
                              rows={3}
                              className="bg-black/40 border-2 border-yellow-400/30 focus:border-yellow-400 text-white placeholder:text-gray-500 rounded-xl resize-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">{description.length} chars</p>
                          </div>

                          <div>
                            <Label className="text-white mb-2 block flex items-center justify-between">
                              <span>Category</span>
                            </Label>
                            <select
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              className="w-full px-3 py-2.5 bg-black/60 border-2 border-yellow-400/30 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                            >
                              <option value="">Select category</option>
                              {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <Label className="text-white mb-2 block flex items-center justify-between">
                              <span>Condition</span>
                            </Label>
                            <select
                              value={condition}
                              onChange={(e) => setCondition(e.target.value)}
                              className="w-full px-3 py-2.5 bg-black/60 border-2 border-yellow-400/30 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                            >
                              <option value="">Select condition</option>
                              {CONDITIONS.map((cond) => (
                                <option key={cond.value} value={cond.value}>
                                  {cond.label}
                                </option>
                              ))}
                            </select>
                            {condition && (
                              <p className="text-xs text-gray-400 mt-1">
                                {CONDITIONS.find((c) => c.value === condition)?.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Hemp Bonus Accordion */}
                <div className="border-2 border-green-400/30 rounded-xl overflow-hidden bg-black/20">
                  <button
                    onClick={() => toggleSection('hemp')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-green-400/10 hover:bg-green-400/20 transition-colors"
                  >
                    <span className="text-white font-bold flex items-center gap-2">
                      🌿 Hemp Bonus
                      <span className="text-sm text-green-400">
                        +{hempInside ? 1 : 0} ⭐
                      </span>
                    </span>
                    {openSection === 'hemp' ? <ChevronUp className="w-5 h-5 text-green-400" /> : <ChevronDown className="w-5 h-5 text-green-400" />}
                  </button>
                  
                  <AnimatePresence>
                    {openSection === 'hemp' && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-4">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id="hempInside"
                              checked={hempInside}
                              onChange={(e) => setHempInside(e.target.checked)}
                              className="mt-1 w-5 h-5"
                            />
                            <div className="flex-1">
                              <Label htmlFor="hempInside" className="text-white flex items-center justify-between">
                                <span>Contains Hemp</span>
                                <span className="text-green-400 text-sm">+1 ⭐</span>
                              </Label>
                              <p className="text-sm text-gray-400 mt-1">Hemp items get bonus visibility</p>
                            </div>
                          </div>

                          {hempInside && (
                            <div>
                              <Label className="text-white mb-2 block flex items-center justify-between">
                                <span>Hemp Percentage</span>
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={hempPercentage}
                                onChange={(e) => setHempPercentage(e.target.value)}
                                placeholder="e.g. 55"
                                className="bg-black/60 border-2 border-green-400/30 focus:border-green-400 text-white rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Story Power Accordion */}
                <div className="border-2 border-purple-400/30 rounded-xl overflow-hidden bg-black/20">
                  <button
                    onClick={() => toggleSection('story')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-purple-400/10 hover:bg-purple-400/20 transition-colors"
                  >
                    <span className="text-white font-bold flex items-center gap-2">
                      ✨ Story Power
                      <span className="text-sm text-purple-400">
                        +{(story && story.length > 20 ? 1 : 0) + (yearsInUse ? 1 : 0)} ⭐
                      </span>
                    </span>
                    {openSection === 'story' ? <ChevronUp className="w-5 h-5 text-purple-400" /> : <ChevronDown className="w-5 h-5 text-purple-400" />}
                  </button>
                  
                  <AnimatePresence>
                    {openSection === 'story' && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-4">
                          <div>
                            <Label className="text-white mb-2 block flex items-center justify-between">
                              <span>Item Story</span>
                              <span className="text-purple-400 text-sm">+1 ⭐ (20+ chars)</span>
                            </Label>
                            <Textarea
                              value={story}
                              onChange={(e) => setStory(e.target.value)}
                              placeholder="Where did you get it? How has it served you? Why swap it now?"
                              rows={4}
                              className="bg-black/60 border-2 border-purple-400/30 focus:border-purple-400 text-white placeholder:text-gray-500 rounded-lg resize-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                              {story.length} chars (min 20 for bonus)
                            </p>
                          </div>

                          <div>
                            <Label className="text-white mb-2 block flex items-center justify-between">
                              <span>Years in Use</span>
                              <span className="text-purple-400 text-sm">+1 ⭐</span>
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              value={yearsInUse}
                              onChange={(e) => setYearsInUse(e.target.value)}
                              placeholder="How long have you had this?"
                              className="bg-black/60 border-2 border-purple-400/30 focus:border-purple-400 text-white rounded-lg"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Location Boost Accordion */}
                <div className="border-2 border-blue-400/30 rounded-xl overflow-hidden bg-black/20">
                  <button
                    onClick={() => toggleSection('location')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-blue-400/10 hover:bg-blue-400/20 transition-colors"
                  >
                    <span className="text-white font-bold flex items-center gap-2">
                      📍 Location Boost
                      <span className="text-sm text-blue-400">
                        +{(country ? 1 : 0) + (city ? 1 : 0)} ⭐
                      </span>
                    </span>
                    {openSection === 'location' ? <ChevronUp className="w-5 h-5 text-blue-400" /> : <ChevronDown className="w-5 h-5 text-blue-400" />}
                  </button>
                  
                  <AnimatePresence>
                    {openSection === 'location' && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-4">
                          <div className="bg-blue-400/10 border border-blue-400/30 rounded-lg p-3">
                            <p className="text-sm text-blue-300 flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              <span>Level 5+ items with location appear on the 3D Globe!</span>
                            </p>
                          </div>

                          <div>
                            <Label className="text-white mb-2 block flex items-center justify-between">
                              <span>Country</span>
                              <span className="text-blue-400 text-sm">+1 ⭐</span>
                            </Label>
                            <Input
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              placeholder="e.g. United States"
                              className="bg-black/60 border-2 border-blue-400/30 focus:border-blue-400 text-white rounded-lg"
                            />
                          </div>

                          <div>
                            <Label className="text-white mb-2 block flex items-center justify-between">
                              <span>City</span>
                              <span className="text-blue-400 text-sm">+1 ⭐</span>
                            </Label>
                            <Input
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="e.g. Portland"
                              className="bg-black/60 border-2 border-blue-400/30 focus:border-blue-400 text-white rounded-lg"
                            />
                          </div>

                          <div className="flex items-start gap-3 pt-2">
                            <input
                              type="checkbox"
                              id="willingToShip"
                              checked={willingToShip}
                              onChange={(e) => setWillingToShip(e.target.checked)}
                              className="mt-1 w-5 h-5"
                            />
                            <div>
                              <Label htmlFor="willingToShip" className="text-white">Willing to ship</Label>
                              <p className="text-sm text-gray-400 mt-1">
                                Uncheck for local pickup only
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Post Button - Always visible in Power-Up Lab */}
                <Button
                  onClick={handleQuickPost}
                  disabled={!canPost || loading}
                  className="w-full h-16 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 hover:from-yellow-300 hover:via-orange-300 hover:to-yellow-300 text-black font-black text-xl rounded-2xl shadow-[0_8px_0_rgba(0,0,0,0.3)] active:shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'POSTING...' : `POST NOW • LVL ${powerLevel}`}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
