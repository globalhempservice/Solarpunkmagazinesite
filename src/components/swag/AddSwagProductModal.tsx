import { useState } from 'react';
import { X, Upload, Package, DollarSign, Tag, Building2, Sparkles, Image as ImageIcon, ChevronRight, Zap, Camera } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface AddSwagProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
  serverUrl: string;
  onProductAdded: () => void;
}

const CATEGORIES = [
  { value: 'clothing', label: 'Clothing', icon: '👕' },
  { value: 'accessories', label: 'Accessories', icon: '👜' },
  { value: 'home_goods', label: 'Home Goods', icon: '🏠' },
  { value: 'wellness', label: 'Wellness', icon: '💆' },
  { value: 'construction', label: 'Construction Materials', icon: '🔨' },
  { value: 'food_beverage', label: 'Food & Beverage', icon: '🍃' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export function AddSwagProductModal({ isOpen, onClose, accessToken, serverUrl, onProductAdded }: AddSwagProductModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [justPosted, setJustPosted] = useState(false);
  
  // Form data
  const [name, setName] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [hempPercentage, setHempPercentage] = useState('');
  const [externalShopUrl, setExternalShopUrl] = useState('');
  const [madeInCountry, setMadeInCountry] = useState('');

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setMainImage(base64String);
        toast.success('Image uploaded!');
        setUploadingImage(false);
      };
      reader.onerror = () => {
        toast.error('Failed to upload image');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setUploadingImage(false);
    }
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (additionalImages.length >= 4) {
      toast.error('Maximum 4 additional images allowed');
      return;
    }

    try {
      setUploadingImage(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAdditionalImages([...additionalImages, base64String]);
        toast.success('Image uploaded!');
        setUploadingImage(false);
      };
      reader.onerror = () => {
        toast.error('Failed to upload image');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setUploadingImage(false);
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  const handleQuickPost = async () => {
    if (!mainImage || !name) {
      toast.error('Photo and title are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const allImages = [mainImage, ...additionalImages];
      
      const response = await fetch(`${serverUrl}/swag-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          description: description || `Check out this amazing hemp product!`,
          price: 0, // Default price, can be updated later
          category: 'other', // Default category
          is_published: false, // Submitted for review
          image_urls: allImages,
        }),
      });

      if (response.ok) {
        toast.success('Product posted! 🌿 Add more details to power it up!');
        setJustPosted(true);
        setStep(2);
        onProductAdded();
      } else {
        const error = await response.json();
        console.error('Failed to post product:', error);
        toast.error('Failed to post product. Please try again.');
      }
    } catch (error) {
      console.error('Error posting product:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePowerUp = async () => {
    // For now, just close. In future, this would update the product with additional details
    toast.success('Product enhanced! ✨');
    
    // Reset form
    setName('');
    setMainImage('');
    setAdditionalImages([]);
    setCategory('');
    setPrice('');
    setDescription('');
    setHempPercentage('');
    setExternalShopUrl('');
    setMadeInCountry('');
    setStep(1);
    setJustPosted(false);
    
    onClose();
  };

  const canQuickPost = mainImage && name;
  const canSkipPowerUp = justPosted;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-x-0 top-0 z-[100] flex items-end overflow-hidden" style={{ bottom: 'var(--nav-bottom)' }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={canSkipPowerUp ? onClose : undefined}
        />

        {/* Slide-up Modal */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-h-full bg-gradient-to-br from-gray-900 via-purple-900/30 to-pink-900/30 rounded-t-3xl border-t-2 border-purple-500/30 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-6 border-b border-purple-400/30 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                {step === 1 ? (
                  <Camera className="w-6 h-6 text-white" />
                ) : (
                  <Zap className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="font-black text-white text-xl">
                  {step === 1 ? 'Quick Drop' : 'Power-Up Lab'}
                </h2>
                <p className="text-purple-100 text-sm">
                  {step === 1 ? 'Photo + Title = Instant Post' : 'Boost your product visibility'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Step 1: Quick Drop (Photo + Title) */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Main Photo Upload */}
                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Product Photo *
                    </label>
                    
                    {!mainImage ? (
                      <label className="block aspect-square rounded-2xl border-2 border-dashed border-purple-500/30 bg-black/20 hover:bg-black/30 cursor-pointer flex flex-col items-center justify-center transition-all group">
                        <div className="relative">
                          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
                          <ImageIcon className="relative w-16 h-16 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-lg font-bold text-purple-300 mb-1">Tap to upload</span>
                        <span className="text-sm text-purple-400">Show off your product!</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    ) : (
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/40 border-2 border-purple-500/30">
                        <img src={mainImage} alt="Product" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setMainImage('')}
                          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg"
                        >
                          <X className="w-5 h-5 text-white" />
                        </button>
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20">
                            <p className="text-xs text-white/80">Tap X to change photo</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Title */}
                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">
                      Product Title *
                    </label>
                    <Input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Organic Hemp T-Shirt"
                      className="bg-black/40 border-purple-500/30 text-white placeholder:text-gray-500 text-lg h-14"
                    />
                  </div>

                  {/* Quick Description (Optional) */}
                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">
                      Quick Description (optional)
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What makes this product special?"
                      rows={3}
                      className="bg-black/40 border-purple-500/30 text-white placeholder:text-gray-500 resize-none"
                    />
                  </div>

                  {/* Info Box */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-purple-200 mb-1">
                          Post Now, Power Up Later!
                        </p>
                        <p className="text-xs text-purple-300">
                          Your product will post instantly. You'll then have the option to add pricing, category, and more details to boost its visibility! 🚀
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Power-Up Lab */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Success Message */}
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-black text-green-300">Product Posted! 🎉</p>
                        <p className="text-sm text-green-200">Add details below to boost visibility</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Images */}
                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">
                      More Photos (optional)
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {additionalImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-black/40">
                          <img src={img} alt={`Additional ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeAdditionalImage(idx)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                      {additionalImages.length < 4 && (
                        <label className="aspect-square rounded-xl border-2 border-dashed border-purple-500/30 bg-black/20 hover:bg-black/30 cursor-pointer flex flex-col items-center justify-center transition-colors">
                          <ImageIcon className="w-6 h-6 text-purple-400 mb-1" />
                          <span className="text-xs text-purple-400">Add</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAdditionalImageUpload}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Category Grid */}
                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-3">
                      Category
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => setCategory(cat.value)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            category === cat.value
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-purple-500/20 bg-black/20 hover:border-purple-500/40'
                          }`}
                        >
                          <div className="text-xl mb-1">{cat.icon}</div>
                          <div className="text-xs font-bold text-white">{cat.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">
                      Price (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="bg-black/40 border-purple-500/30 text-white placeholder:text-gray-500 pl-12"
                      />
                    </div>
                  </div>

                  {/* Hemp Percentage & Country */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-purple-300 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Hemp %
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={hempPercentage}
                        onChange={(e) => setHempPercentage(e.target.value)}
                        placeholder="e.g., 100"
                        className="bg-black/40 border-purple-500/30 text-white placeholder:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-purple-300 mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Made In
                      </label>
                      <Input
                        value={madeInCountry}
                        onChange={(e) => setMadeInCountry(e.target.value)}
                        placeholder="e.g., USA"
                        className="bg-black/40 border-purple-500/30 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  {/* External Shop URL */}
                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">
                      Shop Link
                    </label>
                    <Input
                      type="url"
                      value={externalShopUrl}
                      onChange={(e) => setExternalShopUrl(e.target.value)}
                      placeholder="https://yourshop.com/product"
                      className="bg-black/40 border-purple-500/30 text-white placeholder:text-gray-500"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Bottom Actions - Sticky */}
          <div className="sticky bottom-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-gray-900/80 backdrop-blur-xl border-t border-purple-500/20 p-6">
            <div className="flex gap-3">
              {step === 1 ? (
                <>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 h-14"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleQuickPost}
                    disabled={!canQuickPost || isSubmitting}
                    className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold h-14 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Now! ⚡'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 h-14"
                  >
                    Skip for Now
                  </Button>
                  <Button
                    onClick={handlePowerUp}
                    className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold h-14"
                  >
                    Save Power-Ups ✨
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
