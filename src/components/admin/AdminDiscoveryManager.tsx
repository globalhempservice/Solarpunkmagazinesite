import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { AdminDiscoveryDetail } from './AdminDiscoveryDetail';

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
  matchCount: number;
  user: {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
    city: string | null;
    country: string | null;
    user_interests: Array<{ interest: string }>;
  };
}

interface Match {
  id: string;
  match_type: 'user' | 'organization';
  match_score: number;
  match_rank: number;
  match_reason: string;
  matched_company: any;
  matched_user: any;
}

interface AdminDiscoveryManagerProps {
  accessToken: string;
  initialRequestId?: string;
  onBack?: () => void;
}

export function AdminDiscoveryManager({ accessToken, initialRequestId, onBack }: AdminDiscoveryManagerProps) {
  const [requests, setRequests] = useState<DiscoveryRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(initialRequestId || null);
  const [selectedRequest, setSelectedRequest] = useState<DiscoveryRequest | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'user' | 'organization'>('user');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [customReason, setCustomReason] = useState('');

  // If a request is selected for detail view, show the detail component
  if (selectedRequestId) {
    return (
      <AdminDiscoveryDetail
        requestId={selectedRequestId}
        accessToken={accessToken}
        onBack={() => {
          setSelectedRequestId(null);
          if (onBack) {
            onBack();
          } else {
            fetchRequests(); // Refresh the list
          }
        }}
      />
    );
  }

  // Fetch all discovery requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/admin/discovery/requests?status=${statusFilter}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching discovery requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single request with matches
  const fetchRequestDetails = async (requestId: string) => {
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/admin/discovery/request/${requestId}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch request details');
      }

      const data = await response.json();
      setSelectedRequest(data.request);
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };

  // Search for users or companies
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const endpoint = searchType === 'user' ? 'users' : 'companies';
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/admin/discovery/search/${endpoint}?q=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to search');
      }

      const data = await response.json();
      setSearchResults(searchType === 'user' ? data.users : data.companies);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  // Create a match
  const createMatch = async (entity: any) => {
    if (!selectedRequest) return;

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/admin/discovery/request/${selectedRequest.id}/match`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          matchType: searchType,
          matchedUserId: searchType === 'user' ? entity.user_id : null,
          matchedOrganizationId: searchType === 'organization' ? entity.id : null,
          matchReason: customReason || `Manually matched by admin - ${searchType === 'user' ? entity.display_name : entity.name}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create match');
      }

      // Refresh request details
      await fetchRequestDetails(selectedRequest.id);
      await fetchRequests();
      
      // Close modal and reset
      setMatchModalOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      setCustomReason('');
      
      alert('Match created successfully!');
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Failed to create match');
    }
  };

  // Delete a match
  const deleteMatch = async (matchId: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return;

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/admin/discovery/match/${matchId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete match');
      }

      // Refresh
      if (selectedRequest) {
        await fetchRequestDetails(selectedRequest.id);
        await fetchRequests();
      }
      
      alert('Match deleted successfully!');
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('Failed to delete match');
    }
  };

  // Update request status
  const updateRequestStatus = async (status: string) => {
    if (!selectedRequest) return;

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/admin/discovery/request/${selectedRequest.id}/status`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh
      await fetchRequestDetails(selectedRequest.id);
      await fetchRequests();
      
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounce = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchType]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending_admin_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'matched':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'no_matches':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#E8FF00] mb-2">Discovery Match Manager</h1>
          <p className="text-[#A0A0A0]">Manually review and match discovery requests</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#1A1F2E] text-white border border-[#2A2F3E] rounded-lg"
          >
            <option value="all">All Statuses</option>
            <option value="pending_admin_review">Pending Review</option>
            <option value="matched">Matched</option>
            <option value="no_matches">No Matches</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Requests List */}
          <div>
            <h2 className="text-white mb-4">Discovery Requests ({requests.length})</h2>
            {loading ? (
              <div className="text-[#A0A0A0]">Loading...</div>
            ) : requests.length === 0 ? (
              <div className="text-[#A0A0A0]">No requests found</div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => setSelectedRequestId(request.id)}
                    className={`p-4 bg-[#1A1F2E] border rounded-lg cursor-pointer transition-all ${
                      selectedRequest?.id === request.id
                        ? 'border-[#E8FF00]'
                        : 'border-[#2A2F3E] hover:border-[#E8FF00]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {request.user.avatar_url ? (
                          <img
                            src={request.user.avatar_url}
                            alt={request.user.display_name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#E8FF00] flex items-center justify-center">
                            <span className="text-[#0A0F1E]">
                              {request.user.display_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-white">{request.user.display_name}</div>
                          <div className="text-xs text-[#A0A0A0]">
                            {request.user.city}, {request.user.country}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full border ${getStatusBadgeColor(
                          request.status
                        )}`}
                      >
                        {request.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-[#A0A0A0] mb-2 line-clamp-2">
                      {request.request_text}
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#A0A0A0]">
                      <div className="flex gap-3">
                        <span className="px-2 py-1 bg-[#2A2F3E] rounded">{request.category}</span>
                        <span className="px-2 py-1 bg-[#2A2F3E] rounded">
                          {request.match_preference}
                        </span>
                      </div>
                      <div>{request.matchCount} matches</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Request Details */}
          <div>
            {selectedRequest ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white">Request Details</h2>
                  <button
                    onClick={() => setMatchModalOpen(true)}
                    className="px-4 py-2 bg-[#E8FF00] text-[#0A0F1E] rounded-lg hover:bg-[#d4eb00] transition-colors"
                  >
                    + Create Match
                  </button>
                </div>

                {/* Request Info */}
                <div className="bg-[#1A1F2E] border border-[#2A2F3E] rounded-lg p-6 mb-6">
                  <div className="mb-4">
                    <div className="text-xs text-[#A0A0A0] mb-1">REQUEST</div>
                    <div className="text-white">{selectedRequest.request_text}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-[#A0A0A0] mb-1">CATEGORY</div>
                      <div className="text-white">{selectedRequest.category}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#A0A0A0] mb-1">LOCATION PREF</div>
                      <div className="text-white">{selectedRequest.location_preference}</div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-xs text-[#A0A0A0] mb-1">USER INTERESTS</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.user.user_interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-[#2A2F3E] text-[#E8FF00] text-xs rounded"
                        >
                          {interest.interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateRequestStatus('searching')}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Mark Searching
                    </button>
                    <button
                      onClick={() => updateRequestStatus('matched')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Mark Matched
                    </button>
                    <button
                      onClick={() => updateRequestStatus('no_matches')}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                    >
                      No Matches
                    </button>
                    <button
                      onClick={() => updateRequestStatus('cancelled')}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Matches */}
                <div>
                  <h3 className="text-white mb-3">Matches ({matches.length})</h3>
                  {matches.length === 0 ? (
                    <div className="text-[#A0A0A0] text-center py-8">No matches yet</div>
                  ) : (
                    <div className="space-y-3">
                      {matches.map((match) => {
                        const entity =
                          match.match_type === 'user' ? match.matched_user : match.matched_company;
                        return (
                          <div
                            key={match.id}
                            className="bg-[#1A1F2E] border border-[#2A2F3E] rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                {match.match_type === 'user' ? (
                                  <>
                                    {entity.avatar_url ? (
                                      <img
                                        src={entity.avatar_url}
                                        alt={entity.display_name}
                                        className="w-10 h-10 rounded-full"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-[#E8FF00] flex items-center justify-center">
                                        <span className="text-[#0A0F1E]">
                                          {entity.display_name?.charAt(0) || 'U'}
                                        </span>
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-white">{entity.display_name}</div>
                                      <div className="text-xs text-[#A0A0A0]">
                                        {entity.city}, {entity.country}
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {entity.logo_url ? (
                                      <img
                                        src={entity.logo_url}
                                        alt={entity.name}
                                        className="w-10 h-10 rounded object-cover"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded bg-[#E8FF00] flex items-center justify-center">
                                        <span className="text-[#0A0F1E]">
                                          {entity.name?.charAt(0) || 'C'}
                                        </span>
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-white">{entity.name}</div>
                                      <div className="text-xs text-[#A0A0A0]">
                                        {entity.category_name}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                              <button
                                onClick={() => deleteMatch(match.id)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                            <div className="text-xs text-[#A0A0A0] mb-2">{match.match_reason}</div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="px-2 py-1 bg-[#2A2F3E] text-[#E8FF00] rounded">
                                Rank #{match.match_rank}
                              </span>
                              <span className="px-2 py-1 bg-[#2A2F3E] text-white rounded">
                                Score: {match.match_score}
                              </span>
                              <span className="px-2 py-1 bg-[#2A2F3E] text-white rounded">
                                {match.match_type}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-[#A0A0A0] text-center py-8">
                Select a request to view details
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match Creation Modal */}
      {matchModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1F2E] border border-[#2A2F3E] rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white">Create Match</h2>
              <button
                onClick={() => {
                  setMatchModalOpen(false);
                  setSearchQuery('');
                  setSearchResults([]);
                  setCustomReason('');
                }}
                className="text-[#A0A0A0] hover:text-white"
              >
                Close
              </button>
            </div>

            {/* Search Type Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setSearchType('user');
                  setSearchResults([]);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  searchType === 'user'
                    ? 'bg-[#E8FF00] text-[#0A0F1E]'
                    : 'bg-[#2A2F3E] text-white'
                }`}
              >
                Search Users
              </button>
              <button
                onClick={() => {
                  setSearchType('organization');
                  setSearchResults([]);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  searchType === 'organization'
                    ? 'bg-[#E8FF00] text-[#0A0F1E]'
                    : 'bg-[#2A2F3E] text-white'
                }`}
              >
                Search Companies
              </button>
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${searchType === 'user' ? 'users' : 'companies'}...`}
              className="w-full px-4 py-2 bg-[#0A0F1E] text-white border border-[#2A2F3E] rounded-lg mb-4"
            />

            {/* Custom Reason */}
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Custom match reason (optional)"
              className="w-full px-4 py-2 bg-[#0A0F1E] text-white border border-[#2A2F3E] rounded-lg mb-4 h-20"
            />

            {/* Search Results */}
            <div className="space-y-2">
              {searchResults.map((result) => (
                <div
                  key={searchType === 'user' ? result.user_id : result.id}
                  className="flex items-center justify-between p-3 bg-[#0A0F1E] border border-[#2A2F3E] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {searchType === 'user' ? (
                      <>
                        {result.avatar_url ? (
                          <img
                            src={result.avatar_url}
                            alt={result.display_name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#E8FF00] flex items-center justify-center">
                            <span className="text-[#0A0F1E]">
                              {result.display_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-white">{result.display_name}</div>
                          <div className="text-xs text-[#A0A0A0]">
                            {result.city}, {result.country}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {result.logo_url ? (
                          <img
                            src={result.logo_url}
                            alt={result.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-[#E8FF00] flex items-center justify-center">
                            <span className="text-[#0A0F1E]">{result.name?.charAt(0) || 'C'}</span>
                          </div>
                        )}
                        <div>
                          <div className="text-white">{result.name}</div>
                          <div className="text-xs text-[#A0A0A0]">{result.category_name}</div>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => createMatch(result)}
                    className="px-4 py-2 bg-[#E8FF00] text-[#0A0F1E] rounded-lg hover:bg-[#d4eb00] transition-colors"
                  >
                    Match
                  </button>
                </div>
              ))}
            </div>

            {searchQuery && searchResults.length === 0 && (
              <div className="text-[#A0A0A0] text-center py-4">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}