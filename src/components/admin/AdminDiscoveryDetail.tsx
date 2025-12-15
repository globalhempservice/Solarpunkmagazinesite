import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  ArrowLeft,
  User,
  Building2,
  MapPin,
  Send,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  MessageSquare,
  Calendar,
  Target,
  Globe,
  Users,
  FileText,
} from 'lucide-react';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'react-toastify';

interface AdminDiscoveryDetailProps {
  requestId: string;
  accessToken: string;
  onBack: () => void;
}

interface DiscoveryRequest {
  id: string;
  user_id: string;
  request_text: string;
  category: string;
  location_preference: string;
  match_preference: string;
  status: string;
  created_at: string;
  matched_at: string | null;
  user: {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    city: string | null;
    country: string | null;
    user_interests: Array<{ interest: string }>;
  };
}

interface Recommendation {
  id: string;
  type: 'user' | 'company' | 'place' | 'article';
  entity_id: string;
  note: string | null;
  created_at: string;
  entity?: any;
}

type SearchType = 'user' | 'company' | 'place' | 'article';

export function AdminDiscoveryDetail({
  requestId,
  accessToken,
  onBack,
}: AdminDiscoveryDetailProps) {
  const [request, setRequest] = useState<DiscoveryRequest | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState<SearchType>('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [recommendationNote, setRecommendationNote] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/admin/discovery/request/${requestId}/details`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch request details');
      }

      const data = await response.json();
      setRequest(data.request);
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching request details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [requestId]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      
      // Convert searchType to plural form for API endpoint
      const pluralMap: Record<string, string> = {
        user: 'users',
        company: 'companies',
        place: 'places',
        article: 'articles',
      };
      const endpoint = pluralMap[searchType] || `${searchType}s`;
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/admin/discovery/search/${endpoint}?q=${encodeURIComponent(
        searchQuery
      )}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Search failed - Full error details:', {
          status: response.status,
          statusText: response.statusText,
          searchType,
          query: searchQuery,
          errorData,
        });
        throw new Error(`Search failed: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Search successful:', {
        searchType,
        resultsKey: endpoint,
        resultsCount: data[endpoint]?.length || 0,
        data,
      });
      setSearchResults(data[endpoint] || []);
    } catch (error: any) {
      console.error('❌ Error searching - Exception caught:', {
        message: error.message,
        stack: error.stack,
        searchType,
        query: searchQuery,
      });
      toast.error(`Failed to search ${searchType}s: ${error.message}`);
    } finally {
      setSearching(false);
    }
  };

  const handleAddRecommendation = async (entityId: string) => {
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/admin/discovery/request/${requestId}/recommendation`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: searchType,
          entityId,
          note: recommendationNote || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add recommendation');
      }

      setRecommendationNote('');
      setSearchQuery('');
      setSearchResults([]);
      setShowSearch(false);
      await fetchRequestDetails();
    } catch (error) {
      console.error('Error adding recommendation:', error);
    }
  };

  const handleDeleteRecommendation = async (recommendationId: string) => {
    if (!confirm('Remove this recommendation?')) return;

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/admin/discovery/recommendation/${recommendationId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete recommendation');
      }

      await fetchRequestDetails();
    } catch (error) {
      console.error('Error deleting recommendation:', error);
    }
  };

  const handleSendRecommendations = async () => {
    if (recommendations.length === 0) {
      alert('Please add at least one recommendation first');
      return;
    }

    if (!confirm(`Send ${recommendations.length} recommendation(s) to the user?`)) return;

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/admin/discovery/request/${requestId}/send`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send recommendations');
      }

      alert('Recommendations sent successfully!');
      await fetchRequestDetails();
    } catch (error) {
      console.error('Error sending recommendations:', error);
      alert('Failed to send recommendations');
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/admin/discovery/request/${requestId}/status`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await fetchRequestDetails();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading request details...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Request not found</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_admin_review':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'searching':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'matched':
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'no_matches':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/30';
      default:
        return 'bg-muted';
    }
  };

  const renderSearchResult = (result: any) => {
    switch (searchType) {
      case 'user':
        return (
          <div
            key={result.user_id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              {result.avatar_url ? (
                <img
                  src={result.avatar_url}
                  alt={result.display_name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="font-medium">{result.display_name}</div>
                <div className="text-sm text-muted-foreground">
                  {result.city && result.country
                    ? `${result.city}, ${result.country}`
                    : result.country || 'Location not set'}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => handleAddRecommendation(result.user_id)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        );

      case 'company':
        return (
          <div
            key={result.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              {result.logo_url ? (
                <img
                  src={result.logo_url}
                  alt={result.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="font-medium">{result.name}</div>
                <div className="text-sm text-muted-foreground">
                  {result.category_name} • {result.location || result.country}
                </div>
              </div>
            </div>
            <Button size="sm" onClick={() => handleAddRecommendation(result.id)}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        );

      case 'place':
        return (
          <div
            key={result.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              {result.images?.[0] ? (
                <img
                  src={result.images[0]}
                  alt={result.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="font-medium">{result.name}</div>
                <div className="text-sm text-muted-foreground">
                  {result.category} • {result.city}, {result.country}
                </div>
              </div>
            </div>
            <Button size="sm" onClick={() => handleAddRecommendation(result.id)}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        );

      case 'article':
        return (
          <div
            key={result.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              {result.image ? (
                <img
                  src={result.image}
                  alt={result.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium line-clamp-1">{result.title}</div>
                <div className="text-sm text-muted-foreground">{result.category}</div>
              </div>
            </div>
            <Button size="sm" onClick={() => handleAddRecommendation(result.id)}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const renderRecommendation = (rec: Recommendation) => {
    const entity = rec.entity;
    if (!entity) return null;

    let icon = <User className="w-5 h-5" />;
    let name = '';
    let subtitle = '';

    switch (rec.type) {
      case 'user':
        icon = <User className="w-5 h-5" />;
        name = entity.display_name || 'User';
        subtitle = entity.city && entity.country ? `${entity.city}, ${entity.country}` : '';
        break;
      case 'company':
        icon = <Building2 className="w-5 h-5" />;
        name = entity.name || 'Company';
        subtitle = entity.category_name || '';
        break;
      case 'place':
        icon = <MapPin className="w-5 h-5" />;
        name = entity.name || 'Place';
        subtitle = `${entity.city}, ${entity.country}`;
        break;
      case 'article':
        icon = <FileText className="w-5 h-5" />;
        name = entity.title || 'Article';
        subtitle = entity.category || '';
        break;
    }

    return (
      <div
        key={rec.id}
        className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20"
      >
        <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium">{name}</div>
          {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
          {rec.note && (
            <div className="text-sm text-muted-foreground mt-1 italic">
              Note: {rec.note}
            </div>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleDeleteRecommendation(rec.id)}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Discovery Request Details</h2>
        </div>
        <Badge variant="outline" className={getStatusColor(request.status)}>
          {request.status.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      </div>

      {/* User Info & Request */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Info */}
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Requester Information
          </h3>
          <div className="flex items-start gap-4">
            {request.user.avatar_url ? (
              <img
                src={request.user.avatar_url}
                alt={request.user.display_name}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
            )}
            <div className="flex-1">
              <div className="font-bold text-lg">{request.user.display_name}</div>
              {request.user.bio && (
                <p className="text-sm text-muted-foreground mt-1">{request.user.bio}</p>
              )}
              {(request.user.city || request.user.country) && (
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {request.user.city && request.user.country
                    ? `${request.user.city}, ${request.user.country}`
                    : request.user.country}
                </div>
              )}
              {request.user.user_interests?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {request.user.user_interests.slice(0, 5).map((interest, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {interest.interest}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Request Details */}
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Request Details
          </h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Request</div>
              <p className="text-sm">{request.request_text}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Category</div>
                <Badge variant="outline">{request.category}</Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Location</div>
                <Badge variant="outline">{request.location_preference}</Badge>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Looking for</div>
              <Badge variant="outline" className="capitalize">
                {request.match_preference}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Submitted</div>
              <div className="text-sm flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(request.created_at).toLocaleDateString()} at{' '}
                {new Date(request.created_at).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Actions */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Update Status</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={request.status === 'searching' ? 'default' : 'outline'}
            onClick={() => handleUpdateStatus('searching')}
          >
            <Search className="w-4 h-4 mr-2" />
            Set to Searching
          </Button>
          <Button
            size="sm"
            variant={request.status === 'matched' ? 'default' : 'outline'}
            onClick={() => handleUpdateStatus('matched')}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark as Matched
          </Button>
          <Button
            size="sm"
            variant={request.status === 'no_matches' ? 'default' : 'outline'}
            onClick={() => handleUpdateStatus('no_matches')}
          >
            No Matches Found
          </Button>
          <Button
            size="sm"
            variant={request.status === 'cancelled' ? 'default' : 'outline'}
            onClick={() => handleUpdateStatus('cancelled')}
          >
            Cancel Request
          </Button>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recommendations ({recommendations.length})
          </h3>
          <Button onClick={() => setShowSearch(!showSearch)}>
            {showSearch ? 'Hide Search' : 'Add Recommendation'}
          </Button>
        </div>

        {/* Search Section */}
        {showSearch && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
            <div className="flex gap-2 mb-3">
              <Button
                size="sm"
                variant={searchType === 'user' ? 'default' : 'outline'}
                onClick={() => {
                  setSearchType('user');
                  setSearchResults([]);
                }}
              >
                <User className="w-4 h-4 mr-1" />
                Users
              </Button>
              <Button
                size="sm"
                variant={searchType === 'company' ? 'default' : 'outline'}
                onClick={() => {
                  setSearchType('company');
                  setSearchResults([]);
                }}
              >
                <Building2 className="w-4 h-4 mr-1" />
                Companies
              </Button>
              <Button
                size="sm"
                variant={searchType === 'place' ? 'default' : 'outline'}
                onClick={() => {
                  setSearchType('place');
                  setSearchResults([]);
                }}
              >
                <MapPin className="w-4 h-4 mr-1" />
                Places
              </Button>
              <Button
                size="sm"
                variant={searchType === 'article' ? 'default' : 'outline'}
                onClick={() => {
                  setSearchType('article');
                  setSearchResults([]);
                }}
              >
                <FileText className="w-4 h-4 mr-1" />
                Articles
              </Button>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={`Search ${searchType}s...`}
                className="flex-1 px-3 py-2 bg-background border rounded-lg"
              />
              <Button onClick={handleSearch} disabled={searching}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="mb-3">
              <input
                type="text"
                value={recommendationNote}
                onChange={(e) => setRecommendationNote(e.target.value)}
                placeholder="Optional note for the user..."
                className="w-full px-3 py-2 bg-background border rounded-lg text-sm"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map(renderSearchResult)}
              </div>
            )}
          </div>
        )}

        {/* Current Recommendations */}
        {recommendations.length > 0 ? (
          <div className="space-y-3 mb-4">
            {recommendations.map(renderRecommendation)}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No recommendations yet. Add some to help this user!
          </div>
        )}

        {/* Send Button */}
        {recommendations.length > 0 && (
          <Button
            className="w-full"
            size="lg"
            onClick={handleSendRecommendations}
          >
            <Send className="w-4 h-4 mr-2" />
            Send {recommendations.length} Recommendation(s) to User
          </Button>
        )}
      </Card>
    </div>
  );
}