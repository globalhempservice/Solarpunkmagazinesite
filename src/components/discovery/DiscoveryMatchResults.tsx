// ============================================================================
// DISCOVERY MATCH RESULTS - Phase 1 Sprint 1.1
// ============================================================================
// Display matched organizations
// ============================================================================

import { useState, useEffect } from 'react';
import { Loader2, Building2, MapPin, Award, ExternalLink, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../../utils/supabase/info';

interface Organization {
  id: string;
  name: string;
  description?: string;
  category_name?: string;
  logo_url?: string;
  location?: string;
  country?: string;
  website?: string;
}

interface Match {
  id: string;
  match_score: number;
  match_rank: number;
  score_breakdown: {
    categoryMatch: number;
    locationMatch: number;
    interestMatch: number;
    trustScore: number;
    activityLevel: number;
  };
  match_reason: string;
  organization: Organization;
}

interface DiscoveryMatchResultsProps {
  requestId: string;
  matchCount: number;
  onClose: () => void;
}

export default function DiscoveryMatchResults({
  requestId,
  matchCount,
  onClose,
}: DiscoveryMatchResultsProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    loadMatches();
  }, [requestId]);

  const loadMatches = async () => {
    try {
      const supabase = (await import('../../utils/supabase/client')).default;
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Please sign in');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/discovery/matches/${requestId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error('Failed to load matches');
        return;
      }

      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error loading matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMatch = async (matchId: string, orgName: string) => {
    setIsSelecting(true);

    try {
      const supabase = (await import('../../utils/supabase/client')).default;
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Please sign in');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/discovery/select-match`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ matchId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error('Failed to select match');
        return;
      }

      toast.success(`Selected ${orgName}! ${data.message}`);
    } catch (error) {
      console.error('Error selecting match:', error);
      toast.error('Failed to select match');
    } finally {
      setIsSelecting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-slate-300">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-slate-800/50 mx-auto mb-4 flex items-center justify-center">
          <Building2 className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-white mb-2">No matches found</h3>
        <p className="text-slate-400 mb-6">
          We couldn&apos;t find any organizations matching your criteria.
          Try broadening your search or adjusting categories.
        </p>
        <Button onClick={onClose} className="bg-slate-700 hover:bg-slate-600">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-white mb-2">
          Found {matchCount} {matchCount === 1 ? 'Match' : 'Matches'}
        </h3>
        <p className="text-slate-400 text-sm">
          Organizations are ranked by relevance to your request
        </p>
      </div>

      <div className="space-y-4">
        {matches.map((match) => (
          <div
            key={match.id}
            className="group relative rounded-lg overflow-hidden border border-slate-700 bg-slate-800/30 hover:border-emerald-500/50 transition-all"
          >
            {/* Rank badge */}
            <div className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold">
              #{match.match_rank}
            </div>

            {/* Banner */}
            {match.organization.banner_url && (
              <div
                className="h-24 bg-cover bg-center"
                style={{ backgroundImage: `url(${match.organization.banner_url})` }}
              />
            )}

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="w-16 h-16 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                  {match.organization.logo_url ? (
                    <img
                      src={match.organization.logo_url}
                      alt={match.organization.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Building2 className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name & trust score */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4 className="text-white font-bold">{match.organization.name}</h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Match score */}
                      <div
                        className={`px-3 py-1 rounded-full bg-slate-700/50 font-bold ${getScoreColor(
                          match.match_score
                        )}`}
                      >
                        {match.match_score.toFixed(0)}%
                      </div>
                      {/* Trust score */}
                      {match.organization.trust_score !== undefined && (
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
                          <Award className="w-3 h-3" />
                          <span>{match.organization.trust_score}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category & location */}
                  <div className="flex items-center gap-3 text-sm text-slate-400 mb-3">
                    {match.organization.category_name && (
                      <span className="px-2 py-1 rounded bg-slate-700/50">
                        {match.organization.category_name}
                      </span>
                    )}
                    {(match.organization.location || match.organization.country) && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {[match.organization.location, match.organization.country]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {match.organization.description && (
                    <p className="text-slate-300 text-sm line-clamp-2 mb-3">
                      {match.organization.description}
                    </p>
                  )}

                  {/* Match reason */}
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-4">
                    <p className="text-emerald-400 text-sm">{match.match_reason}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() =>
                        handleSelectMatch(match.id, match.organization.name)
                      }
                      disabled={isSelecting}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
                    >
                      {isSelecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Request Introduction
                        </>
                      )}
                    </Button>
                    {match.organization.website && (
                      <Button
                        onClick={() => window.open(match.organization.website, '_blank')}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Website
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Close button */}
      <div className="mt-6 text-center">
        <Button
          onClick={onClose}
          variant="ghost"
          className="text-slate-300 hover:text-white"
        >
          Close
        </Button>
      </div>
    </div>
  );
}