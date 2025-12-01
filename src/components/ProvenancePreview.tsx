import { Sprout, Award, Leaf, Globe, CheckCircle, TrendingDown, Droplet, Ban, MapPin, FileCheck } from 'lucide-react'
import { Badge } from './ui/badge'
import { motion } from 'motion/react'

interface SwagProduct {
  hemp_source?: string | null
  hemp_source_country?: string | null
  certifications?: string[] | null
  carbon_footprint?: number | null
  processing_method?: string | null
  fair_trade_verified?: boolean
  provenance_verified?: boolean
  conscious_score?: number | null
  conscious_score_breakdown?: any
  water_usage?: number | null
  pesticide_free?: boolean
}

interface ProvenancePreviewProps {
  product: SwagProduct
  compact?: boolean // For preview vs full view
}

// Certification badge colors
const CERT_COLORS: Record<string, string> = {
  'USDA Organic': 'bg-green-500/20 text-green-300 border-green-500/30',
  'Regenerative': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Fair Trade': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Non-GMO': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Carbon Negative': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
}

export function ProvenancePreview({ product, compact = true }: ProvenancePreviewProps) {
  // Don't render if no provenance data
  if (!product.hemp_source && !product.certifications?.length && !product.provenance_verified) {
    return null
  }

  const consciousScore = product.conscious_score || 0
  const breakdown = product.conscious_score_breakdown || {}

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400'
    if (score >= 75) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30'
    if (score >= 75) return 'from-green-500/20 to-emerald-500/20 border-green-500/30'
    if (score >= 60) return 'from-yellow-500/20 to-green-500/20 border-yellow-500/30'
    return 'from-orange-500/20 to-yellow-500/20 border-orange-500/30'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-2 border-emerald-500/30 rounded-2xl p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-emerald-400" />
          <h3 className="font-black text-white">Hemp Provenance</h3>
          {product.provenance_verified && (
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified
            </Badge>
          )}
        </div>

        {/* Conscious Score */}
        {consciousScore > 0 && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r ${getScoreBg(consciousScore)} border-2`}>
            <span className="text-white/70 text-xs font-bold">Score:</span>
            <span className={`text-lg font-black ${getScoreColor(consciousScore)}`}>
              {consciousScore}
            </span>
            <span className="text-white/50 text-xs">/100</span>
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
        {/* Hemp Source */}
        {product.hemp_source && (
          <div className="bg-emerald-950/50 border border-emerald-500/20 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-2 text-emerald-300/70 text-xs font-bold uppercase tracking-wide">
              <MapPin className="w-3.5 h-3.5" />
              Hemp Source
            </div>
            <p className="text-white font-bold">
              {product.hemp_source}
            </p>
            {product.hemp_source_country && (
              <p className="text-emerald-200/60 text-sm flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                {product.hemp_source_country}
              </p>
            )}
          </div>
        )}

        {/* Certifications */}
        {product.certifications && product.certifications.length > 0 && (
          <div className="bg-emerald-950/50 border border-emerald-500/20 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300/70 text-xs font-bold uppercase tracking-wide">
              <Award className="w-3.5 h-3.5" />
              Certifications
            </div>
            <div className="flex flex-wrap gap-1.5">
              {product.certifications.map(cert => (
                <Badge 
                  key={cert}
                  className={`${CERT_COLORS[cert] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'} text-xs font-bold`}
                >
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Environmental Impact */}
        {(product.carbon_footprint !== null && product.carbon_footprint !== undefined) && (
          <div className="bg-emerald-950/50 border border-emerald-500/20 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300/70 text-xs font-bold uppercase tracking-wide">
              <Leaf className="w-3.5 h-3.5" />
              Environmental Impact
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <TrendingDown className={`w-4 h-4 ${product.carbon_footprint < 0 ? 'text-emerald-400' : 'text-yellow-400'}`} />
                <span className="text-white font-bold text-sm">
                  {product.carbon_footprint < 0 ? '' : '+'}{product.carbon_footprint.toFixed(1)} kg CO₂
                </span>
              </div>
              {product.carbon_footprint < 0 && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-bold">
                  🌱 Carbon Negative!
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Processing Method */}
        {product.processing_method && (
          <div className="bg-emerald-950/50 border border-emerald-500/20 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-2 text-emerald-300/70 text-xs font-bold uppercase tracking-wide">
              <FileCheck className="w-3.5 h-3.5" />
              Processing
            </div>
            <p className="text-white font-bold capitalize">
              {product.processing_method}
            </p>
            {(product.processing_method === 'mechanical' || product.processing_method === 'chemical-free') && (
              <p className="text-emerald-300/70 text-xs flex items-center gap-1">
                <Ban className="w-3 h-3" />
                No harsh chemicals
              </p>
            )}
          </div>
        )}

        {/* Fair Trade */}
        {product.fair_trade_verified && (
          <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-bold text-sm">Fair Trade Verified</p>
                <p className="text-blue-300/70 text-xs">Ethical labor practices</p>
              </div>
            </div>
          </div>
        )}

        {/* Water Usage */}
        {product.water_usage && (
          <div className="bg-emerald-950/50 border border-emerald-500/20 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-2 text-emerald-300/70 text-xs font-bold uppercase tracking-wide">
              <Droplet className="w-3.5 h-3.5" />
              Water Usage
            </div>
            <p className="text-white font-bold">
              {product.water_usage}L
            </p>
            <p className="text-emerald-300/70 text-xs">
              vs conventional materials
            </p>
          </div>
        )}

        {/* Pesticide Free */}
        {product.pesticide_free && (
          <div className="bg-emerald-950/50 border border-emerald-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-white font-bold text-sm">Pesticide Free</p>
                <p className="text-emerald-300/70 text-xs">Hemp naturally resists pests</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conscious Score Breakdown (if not compact) */}
      {!compact && consciousScore > 0 && breakdown && (
        <div className="pt-3 border-t border-emerald-500/20">
          <p className="text-emerald-300/70 text-xs font-bold uppercase tracking-wide mb-3">
            Score Breakdown
          </p>
          <div className="grid grid-cols-2 gap-2">
            {breakdown.material !== undefined && (
              <ScoreBar label="Material" score={breakdown.material} />
            )}
            {breakdown.labor !== undefined && (
              <ScoreBar label="Labor" score={breakdown.labor} />
            )}
            {breakdown.environmental !== undefined && (
              <ScoreBar label="Environmental" score={breakdown.environmental} />
            )}
            {breakdown.transparency !== undefined && (
              <ScoreBar label="Transparency" score={breakdown.transparency} />
            )}
          </div>
        </div>
      )}

      {/* Footer message */}
      {compact && product.provenance_verified && (
        <div className="pt-3 border-t border-emerald-500/20">
          <p className="text-emerald-300/60 text-xs text-center">
            This product's sustainability claims have been verified by DEWII
          </p>
        </div>
      )}
    </motion.div>
  )
}

// Score bar component for breakdown
function ScoreBar({ label, score }: { label: string; score: number }) {
  const getBarColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500'
    if (score >= 75) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-emerald-200/70 font-bold">{label}</span>
        <span className="text-white font-bold">{score}/100</span>
      </div>
      <div className="h-2 bg-emerald-950/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${getBarColor(score)} rounded-full`}
        />
      </div>
    </div>
  )
}
