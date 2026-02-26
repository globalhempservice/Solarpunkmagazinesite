import { Package, Sparkles } from 'lucide-react';
import { Card } from '../ui/card';

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
  power_level?: number;
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

// ── Rarity tiers by power level (1–10) ──────────────────────────────────────
interface RarityTier {
  label: string;
  labelColor: string;
  border: string;
  glow: string;
  shimmerOpacity: string;
  legendary: boolean;
}

function getRarityTier(level: number = 1): RarityTier {
  if (level >= 10) return {
    label: 'LEGENDARY',
    labelColor: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300',
    border: 'border-2 border-transparent',
    glow: 'shadow-[0_0_24px_rgba(168,85,247,0.7),0_0_48px_rgba(236,72,153,0.4)]',
    shimmerOpacity: 'group-hover:opacity-100 opacity-30',
    legendary: true,
  }
  if (level >= 9) return {
    label: 'EPIC',
    labelColor: 'text-fuchsia-300',
    border: 'border-2 border-fuchsia-500/70',
    glow: 'shadow-[0_0_18px_rgba(217,70,239,0.6)]',
    shimmerOpacity: 'group-hover:opacity-80 opacity-10',
    legendary: false,
  }
  if (level >= 7) return {
    label: 'RARE',
    labelColor: 'text-cyan-300',
    border: 'border-2 border-cyan-400/60',
    glow: 'shadow-[0_0_14px_rgba(34,211,238,0.5)]',
    shimmerOpacity: 'group-hover:opacity-60 opacity-0',
    legendary: false,
  }
  if (level >= 4) return {
    label: 'UNCOMMON',
    labelColor: 'text-emerald-300',
    border: 'border-2 border-emerald-500/50',
    glow: 'shadow-[0_0_10px_rgba(16,185,129,0.35)]',
    shimmerOpacity: 'group-hover:opacity-40 opacity-0',
    legendary: false,
  }
  return {
    label: 'COMMON',
    labelColor: 'text-slate-400',
    border: 'border-2 border-white/10',
    glow: '',
    shimmerOpacity: 'group-hover:opacity-20 opacity-0',
    legendary: false,
  }
}

export function SwapItemCard({ item, onClick }: SwapItemCardProps) {
  const firstImage = item.images && item.images.length > 0 ? item.images[0] : null;
  const powerLevel = item.power_level ?? 1;
  const rarity = getRarityTier(powerLevel);

  return (
    // Legendary: prismatic animated gradient border via a wrapper div
    <div
      className={`relative rounded-xl aspect-[3/4] cursor-pointer group ${rarity.legendary ? 'p-[2px]' : ''}`}
      style={rarity.legendary ? {
        background: 'linear-gradient(135deg, #fde68a, #f9a8d4, #c084fc, #67e8f9, #6ee7b7, #fde68a)',
        backgroundSize: '300% 300%',
        animation: 'legendaryBorder 3s ease infinite',
      } : undefined}
      onClick={onClick}
    >
      <Card
        className={`
          w-full h-full bg-black/60 overflow-hidden transition-all duration-300
          hover:scale-[1.02] relative
          ${rarity.legendary ? 'border-0 rounded-xl' : `${rarity.border} hover:border-opacity-100`}
          ${rarity.glow}
        `}
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

          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        </div>

        {/* Top row: Condition (left) + Rarity (right) */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10 gap-2">
          {/* Condition Badge */}
          <div className="bg-black/70 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            <span
              className={`text-[10px] font-bold uppercase tracking-wide ${CONDITION_COLORS[item.condition] || 'text-gray-400'}`}
              style={{ textShadow: '0 0 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)' }}
            >
              {CONDITION_LABELS[item.condition] || item.condition}
            </span>
          </div>

          {/* Rarity Badge (top-right) */}
          <div className="bg-black/70 backdrop-blur-xl px-2.5 py-1.5 rounded-full border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            <span className={`text-[9px] font-black uppercase tracking-widest ${rarity.labelColor}`}>
              {rarity.label}
            </span>
          </div>
        </div>

        {/* Hemp badge (left side, below condition row) */}
        {item.hemp_inside && (
          <div className="absolute top-10 left-2 z-10">
            <div className="bg-green-500/80 backdrop-blur-xl px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1 shadow-[0_4px_12px_rgba(0,0,0,0.6)] border border-green-300/40">
              <Sparkles className="w-2.5 h-2.5 drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]" />
              <span style={{ textShadow: '0 0 8px rgba(0,0,0,0.8)' }}>
                {item.hemp_percentage ? `Hemp ${item.hemp_percentage}%` : 'Hemp'}
              </span>
            </div>
          </div>
        )}

        {/* Bottom Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <div className="bg-black/70 backdrop-blur-xl px-3 py-2 rounded-lg border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.7)] mb-2">
            <h3
              className="text-base font-black text-white line-clamp-2 leading-tight"
              style={{ textShadow: '0 0 10px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,1)' }}
            >
              {item.title}
            </h3>
          </div>

          <div className="flex items-center justify-between gap-2">
            {item.country && (
              <div className="bg-black/70 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                <span
                  className="text-[11px] font-black text-white uppercase tracking-wider"
                  style={{ textShadow: '0 0 8px rgba(0,0,0,0.9)' }}
                >
                  {item.country}
                </span>
              </div>
            )}
            {item.years_in_use != null && item.years_in_use > 0 && (
              <div className="bg-amber-500/30 backdrop-blur-xl border border-amber-400/50 px-2.5 py-1 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                <span
                  className="text-[9px] font-bold text-amber-300"
                  style={{ textShadow: '0 0 8px rgba(0,0,0,0.9)' }}
                >
                  {item.years_in_use} yr{item.years_in_use !== 1 ? 's' : ''} loved
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Holographic shine — intensity scales with rarity */}
        <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${rarity.shimmerOpacity}`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/12 to-transparent" />
          {(powerLevel >= 7) && (
            <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-cyan-400/8 to-transparent" />
          )}
        </div>
      </Card>

      {/* Legendary keyframe style injected inline via a style tag sibling */}
      {rarity.legendary && (
        <style>{`
          @keyframes legendaryBorder {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
      )}
    </div>
  );
}
