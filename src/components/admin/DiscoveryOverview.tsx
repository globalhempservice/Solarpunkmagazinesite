import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Search,
  Users,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  MapPin,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { projectId } from '../../utils/supabase/info';

interface DiscoveryStats {
  totalRequests: number;
  pendingRequests: number;
  searchingRequests: number;
  matchedRequests: number;
  noMatchesRequests: number;
  cancelledRequests: number;
  categoryBreakdown: Array<{ category: string; count: number }>;
  locationBreakdown: Array<{ location: string; count: number }>;
  matchPreferenceBreakdown: Array<{ preference: string; count: number }>;
  recentRequests: Array<{
    id: string;
    request_text: string;
    category: string;
    status: string;
    created_at: string;
    user: {
      display_name: string;
      avatar_url: string | null;
    };
  }>;
  requestsOverTime: Array<{ date: string; count: number }>;
}

interface DiscoveryOverviewProps {
  accessToken: string;
  onManageRequest: (requestId: string) => void;
}

export function DiscoveryOverview({ accessToken, onManageRequest }: DiscoveryOverviewProps) {
  const [stats, setStats] = useState<DiscoveryStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/admin/discovery/stats`;
      
      console.log('🔍 Fetching discovery stats from:', url);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log('📊 Stats response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Stats error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch stats');
      }

      const data = await response.json();
      console.log('✅ Stats data received:', data);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching discovery stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">No data available</div>
      </div>
    );
  }

  const statusColors = {
    pending_admin_review: '#F59E0B',
    searching: '#3B82F6',
    matched: '#10B981',
    no_matches: '#6B7280',
    cancelled: '#EF4444',
  };

  const statusData = [
    { name: 'Pending', value: stats.pendingRequests, color: statusColors.pending_admin_review },
    { name: 'Searching', value: stats.searchingRequests, color: statusColors.searching },
    { name: 'Matched', value: stats.matchedRequests, color: statusColors.matched },
    { name: 'No Matches', value: stats.noMatchesRequests, color: statusColors.no_matches },
    { name: 'Cancelled', value: stats.cancelledRequests, color: statusColors.cancelled },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <Search className="w-8 h-8 text-blue-500" />
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
              Total
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalRequests}</div>
          <div className="text-sm text-muted-foreground">Discovery Requests</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-500" />
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
              Pending
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.pendingRequests}</div>
          <div className="text-sm text-muted-foreground">Awaiting Review</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-600/5 border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-blue-500" />
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
              Active
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.searchingRequests}</div>
          <div className="text-sm text-muted-foreground">Currently Searching</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
              Success
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.matchedRequests}</div>
          <div className="text-sm text-muted-foreground">Matched</div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Status Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Categories
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.categoryBreakdown.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={100}
                style={{ fontSize: '12px' }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#E8FF00" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Location & Match Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Preferences */}
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location Preferences
          </h3>
          <div className="space-y-3">
            {stats.locationBreakdown.map((item) => (
              <div key={item.location} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="capitalize">{item.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.count}</Badge>
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(item.count / stats.totalRequests) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Match Preferences */}
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Match Preferences
          </h3>
          <div className="space-y-4">
            {stats.matchPreferenceBreakdown.map((item) => {
              const Icon =
                item.preference === 'individuals'
                  ? Users
                  : item.preference === 'companies'
                  ? Building2
                  : Search;
              return (
                <div key={item.preference} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="capitalize">{item.preference}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg px-3">
                      {item.count}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {((item.count / stats.totalRequests) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Requests Over Time */}
      {stats.requestsOverTime.length > 0 && (
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Requests Over Time
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.requestsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#E8FF00" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Recent Submissions */}
      <Card className="p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Submissions
        </h3>
        <div className="space-y-3">
          {stats.recentRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              {request.user.avatar_url ? (
                <img
                  src={request.user.avatar_url}
                  alt={request.user.display_name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {request.user.display_name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{request.user.display_name}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      request.status === 'pending_admin_review'
                        ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                        : request.status === 'searching'
                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                        : request.status === 'matched'
                        ? 'bg-green-500/10 text-green-500 border-green-500/30'
                        : 'bg-muted'
                    }`}
                  >
                    {request.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                  {request.request_text}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 bg-background rounded">{request.category}</span>
                  <span>{new Date(request.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onManageRequest(request.id)}
              >
                <ArrowRight className="w-4 h-4 mr-1" />
                Manage
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* All Categories Table */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">All Categories</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Category</th>
                <th className="text-center py-2 px-3">Requests</th>
                <th className="text-center py-2 px-3">Percentage</th>
                <th className="text-right py-2 px-3">Visual</th>
              </tr>
            </thead>
            <tbody>
              {stats.categoryBreakdown.map((item) => (
                <tr key={item.category} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-2 px-3">{item.category}</td>
                  <td className="text-center py-2 px-3">
                    <Badge variant="outline">{item.count}</Badge>
                  </td>
                  <td className="text-center py-2 px-3 text-sm text-muted-foreground">
                    {((item.count / stats.totalRequests) * 100).toFixed(1)}%
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex justify-end">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(item.count / stats.totalRequests) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}