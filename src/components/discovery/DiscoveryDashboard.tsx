import React, { useState, useEffect } from 'react';
import { X, Compass, MapPin, Users, Building2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { DiscoveryMatches } from './DiscoveryMatches';

interface DiscoveryRequest {
  id: string;
  request_text: string;
  category: string;
  location_preference: string;
  match_preference: string;
  status: string;
  created_at: string;
  matched_at: string | null;
}

interface DiscoveryDashboardProps {
  userId: string;
  accessToken: string;
  onClose: () => void;
  onOpenMessages?: () => void; // Simplified - just opens messenger panel
}

export function DiscoveryDashboard({ userId, accessToken, onClose, onOpenMessages }: DiscoveryDashboardProps) {
  const [requests, setRequests] = useState<DiscoveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequestForMatches, setSelectedRequestForMatches] = useState<DiscoveryRequest | null>(null);

  // Form state
  const [requestText, setRequestText] = useState('');
  const [category, setCategory] = useState('');
  const [locationPreference, setLocationPreference] = useState('');
  const [matchPreference, setMatchPreference] = useState('both');

  const categories = [
    'Hemp Products',
    'Sustainable Fashion',
    'Eco Innovation',
    'Green Building',
    'Regenerative Agriculture',
    'Clean Energy',
    'Zero Waste',
    'Education & Advocacy',
    'Health & Wellness',
    'Other',
  ];

  const locationPreferences = [
    { value: 'local', label: 'Local (Same City)' },
    { value: 'regional', label: 'Regional (Same Country)' },
    { value: 'national', label: 'National' },
    { value: 'global', label: 'Global (Anywhere)' },
  ];

  const matchPreferences = [
    { value: 'both', label: 'Both Individuals & Companies' },
    { value: 'individuals', label: 'Individuals Only' },
    { value: 'companies', label: 'Companies Only' },
  ];

  // Fetch user's discovery requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/discovery/my-requests`;
      
      console.log('🔍 Fetching discovery requests...');
      console.log('URL:', url);
      console.log('Has access token:', !!accessToken);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch requests');
      }

      const data = await response.json();
      console.log('✅ Fetched requests:', data);
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching discovery requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Submit new discovery request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestText.trim() || !category || !locationPreference) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/discovery/request`;
      
      console.log('🎯 Submitting discovery request...');
      console.log('URL:', url);
      console.log('Data:', { requestText, category, locationPreference, matchPreference });
      console.log('Has access token:', !!accessToken);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          requestText,
          category,
          locationPreference,
          matchPreference,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.error || 'Failed to create request');
      }

      const data = await response.json();
      console.log('✅ Request created:', data);

      // Reset form
      setRequestText('');
      setCategory('');
      setLocationPreference('');
      setMatchPreference('both');
      setShowCreateForm(false);

      // Refresh requests list
      await fetchRequests();

      alert('Discovery request submitted successfully! Our team will review and find matches for you.');
    } catch (error: any) {
      console.error('Error creating discovery request:', error);
      alert(`Failed to create request: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending_admin_review: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Pending Review' },
      searching: { bg: 'bg-blue-500/20', text: 'text-blue-500', label: 'Searching' },
      matched: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Matched' },
      no_matches: { bg: 'bg-gray-500/20', text: 'text-gray-500', label: 'No Matches' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.pending_admin_review;

    return (
      <span className={`px-3 py-1 rounded-full text-xs ${config.bg} ${config.text} border border-current`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0F1E] border border-[#E8FF00] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#2A2F3E] flex items-center justify-between">
          <div>
            <h2 className="text-[#E8FF00] text-2xl mb-1">Discovery Dashboard</h2>
            <p className="text-[#A0A0A0] text-sm">
              Submit discovery requests to find perfect matches in the Hemp&apos;in Universe
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#A0A0A0] hover:text-[#E8FF00] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showCreateForm ? (
            /* Create Request Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white mb-2">
                  What are you looking for? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  placeholder="Describe what you're looking for... (e.g., Hemp fabric supplier for sustainable fashion line)"
                  className="w-full px-4 py-3 bg-[#1A1F2E] text-white border border-[#2A2F3E] rounded-lg focus:border-[#E8FF00] focus:outline-none h-32"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1A1F2E] text-white border border-[#2A2F3E] rounded-lg focus:border-[#E8FF00] focus:outline-none"
                  required
                >
                  <option value="">Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">
                  Location Preference <span className="text-red-500">*</span>
                </label>
                <select
                  value={locationPreference}
                  onChange={(e) => setLocationPreference(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1A1F2E] text-white border border-[#2A2F3E] rounded-lg focus:border-[#E8FF00] focus:outline-none"
                  required
                >
                  <option value="">Select location preference...</option>
                  {locationPreferences.map((pref) => (
                    <option key={pref.value} value={pref.value}>
                      {pref.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">Match Preference</label>
                <select
                  value={matchPreference}
                  onChange={(e) => setMatchPreference(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1A1F2E] text-white border border-[#2A2F3E] rounded-lg focus:border-[#E8FF00] focus:outline-none"
                >
                  {matchPreferences.map((pref) => (
                    <option key={pref.value} value={pref.value}>
                      {pref.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-[#E8FF00] text-[#0A0F1E] rounded-lg hover:bg-[#d4eb00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 bg-[#1A1F2E] text-white border border-[#2A2F3E] rounded-lg hover:border-[#E8FF00] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* Requests List */
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white">Your Discovery Requests</h3>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-[#E8FF00] text-[#0A0F1E] rounded-lg hover:bg-[#d4eb00] transition-colors flex items-center gap-2"
                >
                  <Compass size={18} />
                  New Request
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12 text-[#A0A0A0]">Loading...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12">
                  <Compass size={48} className="mx-auto mb-4 text-[#2A2F3E]" />
                  <p className="text-[#A0A0A0] mb-4">
                    No discovery requests yet. Create your first request to find matches!
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-6 py-3 bg-[#E8FF00] text-[#0A0F1E] rounded-lg hover:bg-[#d4eb00] transition-colors"
                  >
                    Create First Request
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-[#1A1F2E] border border-[#2A2F3E] rounded-lg p-5 hover:border-[#E8FF00]/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(request.status)}
                            <span className="text-xs text-[#A0A0A0]">
                              {new Date(request.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-white mb-3">{request.request_text}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-[#A0A0A0]">
                          <Compass size={16} />
                          <span>{request.category}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#A0A0A0]">
                          <MapPin size={16} />
                          <span>{request.location_preference}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#A0A0A0]">
                          {request.match_preference === 'individuals' ? (
                            <Users size={16} />
                          ) : request.match_preference === 'companies' ? (
                            <Building2 size={16} />
                          ) : (
                            <Users size={16} />
                          )}
                          <span>
                            {request.match_preference === 'both'
                              ? 'Individuals & Companies'
                              : request.match_preference === 'individuals'
                              ? 'Individuals Only'
                              : 'Companies Only'}
                          </span>
                        </div>
                      </div>

                      {request.status === 'matched' && (
                        <div className="mt-3 pt-3 border-t border-[#2A2F3E]">
                          <button
                            className="text-[#E8FF00] text-sm hover:underline"
                            onClick={() => setSelectedRequestForMatches(request)}
                          >
                            View Matches →
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Discovery Matches Modal */}
      {selectedRequestForMatches && (
        <DiscoveryMatches
          request={selectedRequestForMatches}
          onClose={() => setSelectedRequestForMatches(null)}
          onMatchesViewed={() => {
            // Refresh the requests list to update notification state
            fetchRequests();
          }}
          onOpenMessages={onOpenMessages ? () => onOpenMessages() : undefined}
        />
      )}
    </div>
  );
}