// ============================================================================
// DISCOVERY REQUEST FORM - Phase 1 Sprint 1.1
// ============================================================================
// Form for creating discovery match requests
// ============================================================================

import { useState } from 'react';
import { Loader2, Search, MapPin, DollarSign, Tag } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface DiscoveryRequestFormProps {
  userNadaBalance: number;
  onRequestCreated: (requestId: string, matchCount: number) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { value: 'textile', label: 'Textile & Fashion', icon: '🧵' },
  { value: 'food', label: 'Food & Nutrition', icon: '🌾' },
  { value: 'construction', label: 'Construction & Materials', icon: '🏗️' },
  { value: 'wellness', label: 'Wellness & CBD', icon: '🌿' },
  { value: 'education', label: 'Education & Research', icon: '📚' },
  { value: 'energy', label: 'Energy & Biofuels', icon: '⚡' },
  { value: 'paper', label: 'Paper & Packaging', icon: '📦' },
  { value: 'other', label: 'Other', icon: '🔧' },
];

const BUDGET_RANGES = [
  { value: 'low', label: 'Small Budget (< $1K)' },
  { value: 'medium', label: 'Medium Budget ($1K - $10K)' },
  { value: 'high', label: 'Large Budget ($10K - $100K)' },
  { value: 'enterprise', label: 'Enterprise ($100K+)' },
];

const LOCATION_PREFERENCES = [
  { value: 'local', label: 'Local (Same City)' },
  { value: 'regional', label: 'Regional (Same Country)' },
  { value: 'national', label: 'National' },
  { value: 'international', label: 'International' },
];

const NADA_COST = 10;

export default function DiscoveryRequestForm({
  userNadaBalance,
  onRequestCreated,
  onCancel,
}: DiscoveryRequestFormProps) {
  const [requestText, setRequestText] = useState('');
  const [category, setCategory] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [locationPreference, setLocationPreference] = useState('international');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canAfford = userNadaBalance >= NADA_COST;
  const isValid = requestText.trim().length >= 20 && category !== '';

  const handleSubmit = async () => {
    if (!isValid || !canAfford) return;

    setIsSubmitting(true);

    try {
      const supabase = (await import('../../utils/supabase/client')).default;
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Please sign in to use Discovery Match');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/discovery/request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            requestText,
            category,
            budgetRange,
            locationPreference,
            nadaCost: NADA_COST,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Insufficient NADA') {
          toast.error(`Insufficient NADA. You need ${data.required} but have ${data.current}.`);
        } else {
          toast.error(data.error || 'Failed to create discovery request');
        }
        return;
      }

      toast.success(`${data.matchCount} organizations matched!`);
      onRequestCreated(data.requestId, data.matchCount);
    } catch (error) {
      console.error('Error creating discovery request:', error);
      toast.error('Failed to create discovery request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* What are you looking for? */}
      <div>
        <Label htmlFor="request-text" className="text-white mb-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-emerald-400" />
          What are you looking for?
        </Label>
        <Textarea
          id="request-text"
          value={requestText}
          onChange={(e) => setRequestText(e.target.value)}
          placeholder="Example: I'm looking for sustainable hemp fabric suppliers for my fashion startup. Need organic certified materials with global shipping..."
          rows={4}
          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 resize-none"
          disabled={isSubmitting}
        />
        <p className="text-sm text-slate-400 mt-1">
          {requestText.length} characters (minimum 20)
        </p>
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category" className="text-white mb-2 flex items-center gap-2">
          <Tag className="w-4 h-4 text-cyan-400" />
          Category
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              disabled={isSubmitting}
              className={`p-3 rounded-lg border-2 transition-all ${
                category === cat.value
                  ? 'border-emerald-500 bg-emerald-500/20 text-white'
                  : 'border-slate-700 bg-slate-800/30 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="text-2xl mb-1">{cat.icon}</div>
              <div className="text-sm">{cat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Budget Range (Optional) */}
      <div>
        <Label htmlFor="budget" className="text-white mb-2 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-purple-400" />
          Budget Range (Optional)
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {BUDGET_RANGES.map((budget) => (
            <button
              key={budget.value}
              onClick={() => setBudgetRange(budget.value)}
              disabled={isSubmitting}
              className={`p-3 rounded-lg border transition-all ${
                budgetRange === budget.value
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-slate-700 bg-slate-800/30 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="text-sm" dangerouslySetInnerHTML={{ __html: budget.label }} />
            </button>
          ))}
        </div>
      </div>

      {/* Location Preference */}
      <div>
        <Label htmlFor="location" className="text-white mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          Location Preference
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {LOCATION_PREFERENCES.map((loc) => (
            <button
              key={loc.value}
              onClick={() => setLocationPreference(loc.value)}
              disabled={isSubmitting}
              className={`p-3 rounded-lg border transition-all ${
                locationPreference === loc.value
                  ? 'border-cyan-500 bg-cyan-500/20 text-white'
                  : 'border-slate-700 bg-slate-800/30 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="text-sm">{loc.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Cost & Action */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
        <div>
          <div className="text-white font-bold">Cost: {NADA_COST} NADA</div>
          {!canAfford && (
            <div className="text-red-400 text-sm mt-1">
              Insufficient NADA (need {NADA_COST}, have {userNadaBalance})
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-slate-300 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || !canAfford || isSubmitting}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finding Matches...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Find Matches
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
