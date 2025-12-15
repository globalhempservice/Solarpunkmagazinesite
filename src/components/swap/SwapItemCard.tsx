import { MapPin, Package, Sparkles } from 'lucide-react';
import { Card } from '../ui/card';
import { CountryFlag } from '../profile/CountryFlag';

interface SwapItem {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  hemp_inside: boolean;
  hemp_percentage: number | null;
  images: string[];
  country: string | null;
  city: string | null;
  willing_to_ship: boolean;
  years_in_use: number | null;
  user_profile: {
    display_name: string;
    avatar_url: string | null;
    country: string | null;
  } | null;
}

interface SwapItemCardProps {
  item: SwapItem;
  onClick: () => void;
}

const CONDITION_LABELS: Record<string, string> = {
  like_new: 'Like New',
  good: 'Good',
  well_loved: 'Well-Loved',
  vintage: 'Vintage',
};

const CONDITION_COLORS: Record<string, string> = {
  like_new: 'text-green-400',
  good: 'text-cyan-400',
  well_loved: 'text-yellow-400',
  vintage: 'text-purple-400',
};

const CATEGORY_LABELS: Record<string, string> = {
  clothing: 'Clothing',
  accessories: 'Accessories',
  home_goods: 'Home Goods',
  wellness: 'Wellness',
  construction: 'Construction',
  other: 'Other',
};

export function SwapItemCard({ item, onClick }: SwapItemCardProps) {
  const firstImage = item.images && item.images.length > 0 ? item.images[0] : null;

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer bg-black/60 border-2 border-amber-500/30 hover:border-amber-500/70 transition-all duration-300 overflow-hidden hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] relative aspect-[3/4]"
    >
      {/* Full-Size Card Image */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 to-teal-950/30 overflow-hidden">
        {firstImage ? (
          <img
            src={firstImage}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <Package className="w-24 h-24 text-gray-700 opacity-50" />
          </div>
        )}
        
        {/* Vignette overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      </div>

      {/* Top Badges - Condition & Hemp */}
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10 gap-2">
        {/* Condition Badge - Enhanced frosted glass */}
        <div className="bg-black/70 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
          <span 
            className={`text-[10px] font-bold uppercase tracking-wide ${CONDITION_COLORS[item.condition] || 'text-gray-400'}`}
            style={{
              textShadow: '0 0 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9), 0 0 2px currentColor'
            }}
          >
            {CONDITION_LABELS[item.condition] || item.condition}
          </span>
        </div>

        {/* Hemp Badge - Enhanced frosted glass */}
        {item.hemp_inside && (
          <div className="bg-green-500/80 backdrop-blur-xl px-3 py-1.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1 shadow-[0_4px_12px_rgba(0,0,0,0.6)] border border-green-300/40">
            <Sparkles className="w-2.5 h-2.5 drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]" />
            <span
              style={{
                textShadow: '0 0 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9), 0 0 3px rgba(255,255,255,0.4)'
              }}
            >
              {item.hemp_percentage ? `${item.hemp_percentage}%` : 'Hemp'}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Overlay - Title & Owner Info (Pokemon card style) */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        {/* Title - Frosted glass container */}
        <div className="bg-black/70 backdrop-blur-xl px-3 py-2 rounded-lg border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.7)] mb-2">
          <h3 
            className="text-base font-black text-white line-clamp-2 leading-tight"
            style={{
              textShadow: '0 0 10px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,1), 0 0 4px rgba(255,255,255,0.2)'
            }}
          >
            {item.title}
          </h3>
        </div>

        {/* Bottom Row - Country & Years */}
        <div className="flex items-center justify-between gap-2">
          {/* Country Code - Enhanced frosted glass */}
          {item.country && (
            <div className="bg-black/70 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              <span 
                className="text-[11px] font-black text-white uppercase tracking-wider"
                style={{
                  textShadow: '0 0 8px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,1), 0 0 3px rgba(255,255,255,0.3)'
                }}
              >
                {item.country}
              </span>
            </div>
          )}

          {/* Years in use badge - Enhanced frosted glass */}
          {item.years_in_use && item.years_in_use > 0 && (
            <div className="bg-amber-500/30 backdrop-blur-xl border border-amber-400/50 px-2.5 py-1 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              <span 
                className="text-[9px] font-bold text-amber-300"
                style={{
                  textShadow: '0 0 8px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,1), 0 0 3px rgba(251,191,36,0.4)'
                }}
              >
                {item.years_in_use} year{item.years_in_use !== 1 ? 's' : ''} loved
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Holographic shine effect on hover (Pokemon card style) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-pulse" />
      </div>
    </Card>
  );
}