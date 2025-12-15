import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Building2, MapPin, FileText, Compass, ArrowRight, ExternalLink, Bookmark, Archive, Trash2, MessageCircle } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';
import { createClient } from '../../utils/supabase/client';

interface DiscoveryMatchesProps {
  request: {
    id: string;
    request_text: string;
    status: string;
  };
  onClose: () => void;
  onMatchesViewed?: () => void; // Callback to refresh parent when matches are viewed
  onOpenMessages?: () => void; // Callback to open messenger panel
}

interface Recommendation {
  id: string;
  type: 'user' | 'company' | 'place' | 'article';
  entity_id: string;
  note: string | null;
  created_at: string;
  sent_at: string | null;
  entity?: any;
}

export function DiscoveryMatches({
  request,
  onClose,
  onMatchesViewed,
  onOpenMessages,
}: DiscoveryMatchesProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchRecommendations();
    markMatchesAsViewed(); // Mark as viewed when modal opens
  }, [request.id]);

  const markMatchesAsViewed = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/discovery/matches/${request.id}/mark-viewed`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        console.log('✅ Matches marked as viewed');
        // Trigger callback to refresh parent component (remove notifications)
        if (onMatchesViewed) {
          onMatchesViewed();
        }
      }
    } catch (error) {
      console.error('Error marking matches as viewed:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      // Get access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session found');
        return;
      }

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/discovery/request/${request.id}/recommendations`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      if (onMatchesViewed) {
        onMatchesViewed();
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return User;
      case 'company':
        return Building2;
      case 'place':
        return MapPin;
      case 'article':
        return FileText;
      default:
        return Compass;
    }
  };

  const handleRecommendationAction = async (recommendationId: string, action: 'save' | 'archive' | 'delete') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/discovery/recommendation/${recommendationId}/action`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        console.log(`✅ Recommendation ${action}d`);
        // Refresh recommendations list
        await fetchRecommendations();
      } else {
        throw new Error(`Failed to ${action} recommendation`);
      }
    } catch (error) {
      console.error(`Error ${action}ing recommendation:`, error);
      alert(`Failed to ${action} recommendation. Please try again.`);
    }
  };

  const renderRecommendation = (rec: Recommendation) => {
    const entity = rec.entity;
    if (!entity) return null;

    const Icon = getEntityIcon(rec.type);
    let name = '';
    let subtitle = '';
    let imageUrl = '';
    let actionUrl = '';

    switch (rec.type) {
      case 'user':
        name = entity.display_name || 'User';
        subtitle = entity.city && entity.country ? `${entity.city}, ${entity.country}` : entity.country || '';
        imageUrl = entity.avatar_url || '';
        // TODO: Add user profile view link
        break;
      case 'company':
        name = entity.name || 'Company';
        subtitle = entity.category_name || '';
        imageUrl = entity.logo_url || '';
        actionUrl = entity.website || '';
        break;
      case 'place':
        name = entity.name || 'Place';
        subtitle = `${entity.category} • ${entity.city}, ${entity.country}`;
        imageUrl = entity.images?.[0] || '';
        break;
      case 'article':
        name = entity.title || 'Article';
        subtitle = entity.category || '';
        imageUrl = entity.image || '';
        break;
    }

    return (
      <motion.div
        key={rec.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1D2E] rounded-lg border border-[#2A2F3E] p-4 hover:border-[#E8FF00]/30 transition-all"
      >
        <div className="flex gap-4">
          {/* Entity Image/Icon */}
          <div className="flex-shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#E8FF00]/20 to-[#E8FF00]/5 flex items-center justify-center">
                <Icon className="w-8 h-8 text-[#E8FF00]" />
              </div>
            )}
          </div>

          {/* Entity Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-white">{name}</h3>
              <span className="px-2 py-0.5 bg-[#E8FF00]/10 text-[#E8FF00] text-xs rounded-full border border-[#E8FF00]/20 capitalize">
                {rec.type}
              </span>
            </div>
            
            {subtitle && (
              <p className="text-sm text-gray-400 mb-2">{subtitle}</p>
            )}

            {rec.note && (
              <div className="bg-[#E8FF00]/5 border border-[#E8FF00]/20 rounded px-3 py-2 mb-3">
                <p className="text-sm text-[#E8FF00] italic">
                  💡 {rec.note}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Primary Action Button */}
              {rec.type === 'company' && actionUrl && (
                <a
                  href={actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E8FF00] text-black rounded-lg hover:bg-[#E8FF00]/90 transition-colors text-sm font-medium"
                >
                  Visit Website
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {rec.type === 'article' && (
                <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E8FF00] text-black rounded-lg hover:bg-[#E8FF00]/90 transition-colors text-sm font-medium">
                  Read Article
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {rec.type === 'user' && (
                <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E8FF00] text-black rounded-lg hover:bg-[#E8FF00]/90 transition-colors text-sm font-medium">
                  View Profile
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {rec.type === 'place' && (
                <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E8FF00] text-black rounded-lg hover:bg-[#E8FF00]/90 transition-colors text-sm font-medium">
                  View Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Message Button - For users and companies */}
              {(rec.type === 'user' || rec.type === 'company') && (
                <button 
                  onClick={async () => {
                    // Get the entity's user ID
                    const recipientUserId = rec.type === 'user' 
                      ? rec.entity_id 
                      : rec.entity?.owner_id; // For companies, use owner_id
                    
                    if (!recipientUserId) {
                      alert('Unable to start conversation - recipient not found');
                      return;
                    }
                    
                    try {
                      // Get session
                      const { data: { session } } = await supabase.auth.getSession();
                      if (!session) {
                        alert('Please log in to send messages');
                        return;
                      }
                      
                      // Send initial message to create conversation
                      const response = await fetch(
                        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/messages/send`,
                        {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${session.access_token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            recipientId: recipientUserId,
                            content: `Hi! I found you through Discovery Match. ${request.request_text}`
                          })
                        }
                      );
                      
                      if (!response.ok) {
                        throw new Error('Failed to send message');
                      }
                      
                      alert('✅ Message sent! Check your messages to continue the conversation.');
                      if (onOpenMessages) {
                        onOpenMessages();
                      }
                    } catch (error) {
                      console.error('Error sending message:', error);
                      alert('Failed to send message. Please try again.');
                    }
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#2A2F3E] text-[#E8FF00] rounded-lg hover:bg-[#3A3F4E] transition-colors text-sm font-medium border border-[#E8FF00]/20"
                  title="Send a message"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Message
                </button>
              )}

              {/* Save Button */}
              <button 
                onClick={() => handleRecommendationAction(rec.id, 'save')}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#2A2F3E] text-gray-300 rounded-lg hover:bg-[#3A3F4E] hover:text-[#E8FF00] transition-colors text-sm font-medium border border-[#2A2F3E]"
                title="Save for later"
              >
                <Bookmark className="w-3.5 h-3.5" />
                Save
              </button>

              {/* Archive Button */}
              <button 
                onClick={() => handleRecommendationAction(rec.id, 'archive')}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#2A2F3E] text-gray-300 rounded-lg hover:bg-[#3A3F4E] hover:text-orange-400 transition-colors text-sm font-medium border border-[#2A2F3E]"
                title="Archive this match"
              >
                <Archive className="w-3.5 h-3.5" />
                Archive
              </button>

              {/* Delete Button */}
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to delete this match? This cannot be undone.')) {
                    handleRecommendationAction(rec.id, 'delete');
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#2A2F3E] text-gray-300 rounded-lg hover:bg-red-900/30 hover:text-red-400 transition-colors text-sm font-medium border border-[#2A2F3E]"
                title="Delete this match"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl md:max-h-[90vh] bg-[#0F1117] rounded-2xl border border-[#E8FF00]/20 shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-[#2A2F3E]">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-6 h-6 text-[#E8FF00]" />
                <h2 className="text-2xl font-bold text-white">Your Discovery Matches</h2>
              </div>
              <p className="text-gray-400 text-sm">
                We found these perfect matches for: <span className="text-[#E8FF00] font-medium">"{request.request_text}"</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2A2F3E] transition-colors ml-4"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">Loading your matches...</div>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map(renderRecommendation)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Compass className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No matches yet</h3>
                <p className="text-gray-400 max-w-md">
                  Our team is reviewing your request. You'll be notified when we find perfect matches for you!
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#2A2F3E] bg-[#1A1D2E]/50">
            <p className="text-sm text-gray-400 text-center">
              💡 These matches were hand-picked by our team to help you succeed in the Hemp'in Universe
            </p>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}