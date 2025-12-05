import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Clock, MousePointerClick, Search as SearchIcon, AlertCircle, Users, Globe } from 'lucide-react'
import { Badge } from './ui/badge'
import { motion } from 'motion/react'

interface SearchAnalyticsViewProps {
  serverUrl: string
  accessToken: string | null
}

interface AnalyticsStat {
  totalSearches: number
  uniqueUsers: number
  uniqueSessions: number
  searchesWithClicks: number
  clickThroughRate: number
  avgTimeToClickMs: number
  searchesByLayer?: Record<string, number>
  searchesByResultType?: Record<string, number>
  topCountries?: Array<{ country: string; count: number }>
}

interface TopSearch {
  query: string
  count: number
  click_rate: number
}

interface FailedSearch {
  query: string
  count: number
  last_searched: string
}

interface TrendingSearch {
  query: string
  count: number
  growth_rate: number
}

export function SearchAnalyticsView({ serverUrl, accessToken }: SearchAnalyticsViewProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AnalyticsStat | null>(null)
  const [topSearches, setTopSearches] = useState<TopSearch[]>([])
  const [failedSearches, setFailedSearches] = useState<FailedSearch[]>([])
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([])
  const [allSearches, setAllSearches] = useState<any[]>([])
  
  // Helper function to filter out meaningless searches (< 3 chars)
  const filterMeaningfulSearches = (searches: any[]) => {
    return searches.filter(search => {
      const query = search.search_query || search.query
      return query && query.trim().length >= 3
    })
  }
  
  // Helper function to deduplicate and group similar searches
  const deduplicateSearches = (searches: any[]) => {
    const uniqueMap = new Map()
    
    searches.forEach(search => {
      const query = (search.search_query || search.query)?.trim().toLowerCase()
      if (!query || query.length < 3) return
      
      if (!uniqueMap.has(query)) {
        uniqueMap.set(query, search)
      }
    })
    
    return Array.from(uniqueMap.values())
  }
  
  useEffect(() => {
    if (accessToken) {
      fetchAnalytics()
    }
  }, [accessToken])
  
  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      console.log('📊 Fetching search analytics from:', serverUrl)
      console.log('📊 Building URLs:')
      console.log('   - Stats:', `${serverUrl}/search/admin/stats`)
      console.log('   - Top:', `${serverUrl}/search/admin/top-searches`)
      console.log('   - Failed:', `${serverUrl}/search/admin/failed-searches`)
      console.log('   - Trending:', `${serverUrl}/search/admin/trending`)
      console.log('   - All:', `${serverUrl}/search/admin/all-searches?days=30&limit=100`)
      
      // Fetch all analytics data in parallel
      const [statsRes, topRes, failedRes, trendingRes, allRes] = await Promise.all([
        fetch(`${serverUrl}/search/admin/stats`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${serverUrl}/search/admin/top-searches`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${serverUrl}/search/admin/failed-searches`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${serverUrl}/search/admin/trending`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${serverUrl}/search/admin/all-searches?days=30&limit=100`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
      ])
      
      // Log responses for debugging
      console.log('📊 Stats response:', statsRes.ok, statsRes.status)
      console.log('📊 Top searches response:', topRes.ok, topRes.status)
      console.log('📊 Failed searches response:', failedRes.ok, failedRes.status)
      console.log('📊 Trending response:', trendingRes.ok, trendingRes.status)
      console.log('📊 Summary response:', allRes.ok, allRes.status)
      
      if (statsRes.ok) {
        const data = await statsRes.json()
        console.log('📊 Stats data:', data)
        setStats(data.stats) // Extract stats from response
      } else {
        const error = await statsRes.text()
        console.error('❌ Stats error:', error)
      }
      
      if (topRes.ok) {
        const data = await topRes.json()
        // Filter out short searches
        const filtered = (data.topSearches || []).filter((s: TopSearch) => s.query && s.query.trim().length >= 3)
        setTopSearches(filtered)
      } else {
        const error = await topRes.text()
        console.error('❌ Top searches error:', error)
      }
      
      if (failedRes.ok) {
        const data = await failedRes.json()
        // Filter out short searches
        const filtered = (data.failedSearches || []).filter((s: FailedSearch) => s.query && s.query.trim().length >= 3)
        setFailedSearches(filtered)
      } else {
        const error = await failedRes.text()
        console.error('❌ Failed searches error:', error)
      }
      
      if (trendingRes.ok) {
        const data = await trendingRes.json()
        setTrendingSearches(data.trending || [])
      } else {
        const error = await trendingRes.text()
        console.error('❌ Trending error:', error)
      }
      
      if (allRes.ok) {
        const data = await allRes.json()
        // Filter and deduplicate searches
        const filtered = filterMeaningfulSearches(data.searches || [])
        const deduplicated = deduplicateSearches(filtered)
        setAllSearches(deduplicated)
      } else {
        const error = await allRes.text()
        console.error('❌ Summary error:', error)
      }
      
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-700 border-t-violet-500" />
        <p className="text-slate-400 mt-4">Loading analytics...</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <SearchIcon className="w-5 h-5 text-violet-400" />
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-400/30">
              Total
            </Badge>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {stats?.totalSearches?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-slate-400">Total Searches</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <MousePointerClick className="w-5 h-5 text-emerald-400" />
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
              Clicks
            </Badge>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {stats?.searchesWithClicks?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-slate-400">Total Clicks</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30">
              CTR
            </Badge>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {stats?.clickThroughRate?.toFixed(1) || 0}%
          </div>
          <div className="text-sm text-slate-400">Click-Through Rate</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
              Avg
            </Badge>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {stats?.avgTimeToClickMs ? `${(stats.avgTimeToClickMs / 1000).toFixed(1)}s` : '0s'}
          </div>
          <div className="text-sm text-slate-400">Avg Time to Click</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-pink-400" />
            <Badge className="bg-pink-500/20 text-pink-300 border-pink-400/30">
              Users
            </Badge>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {stats?.uniqueUsers?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-slate-400">Unique Users</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30">
              Sessions
            </Badge>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {stats?.uniqueSessions?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-slate-400">Unique Sessions</div>
        </motion.div>
      </div>
      
      {/* Top Searches and Failed Searches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Searches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-white text-lg">Top Searches</h3>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
              {topSearches.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {topSearches.length === 0 ? (
              <p className="text-slate-400 text-sm">No searches yet</p>
            ) : (
              topSearches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">"{search.query}"</div>
                      <div className="text-xs text-slate-400">{(search.click_rate || 0).toFixed(0)}% click rate</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                    {search.count} searches
                  </Badge>
                </div>
              ))
            )}
          </div>
        </motion.div>
        
        {/* Failed Searches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h3 className="font-black text-white text-lg">Failed Searches</h3>
            <Badge className="bg-red-500/20 text-red-300 border-red-400/30">
              {failedSearches.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {failedSearches.length === 0 ? (
              <p className="text-slate-400 text-sm">No failed searches</p>
            ) : (
              failedSearches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">"{search.query}"</div>
                      <div className="text-xs text-slate-400">Last: {new Date(search.last_searched).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-red-500/50 text-red-400">
                    {search.count}x
                  </Badge>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Recent Searches Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <SearchIcon className="w-5 h-5 text-violet-400" />
          <h3 className="font-black text-white text-lg">Recent Searches (Last 30 Days)</h3>
          <Badge className="bg-violet-500/20 text-violet-300 border-violet-400/30">
            {allSearches.length}
          </Badge>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Query</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Results</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Clicked</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Result Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Time to Click</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {allSearches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No searches found
                  </td>
                </tr>
              ) : (
                allSearches.slice(0, 50).map((search, index) => (
                  <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-white">"{search.search_query}"</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {search.results_count}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {search.clicked ? (
                        <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                          ✓ Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-600 text-slate-400">
                          No
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {search.result_type ? (
                        <Badge 
                          variant="outline" 
                          className={
                            search.result_type === 'country' ? 'border-cyan-500/50 text-cyan-400' :
                            search.result_type === 'city' ? 'border-yellow-500/50 text-yellow-400' :
                            search.result_type === 'place' ? 'border-pink-500/50 text-pink-400' :
                            search.result_type === 'organization' ? 'border-emerald-500/50 text-emerald-400' :
                            search.result_type === 'product' ? 'border-amber-500/50 text-amber-400' :
                            'border-slate-600 text-slate-400'
                          }
                        >
                          {search.result_type}
                        </Badge>
                      ) : (
                        <span className="text-slate-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {search.time_to_click_ms ? (
                        <span className="text-sm text-slate-300 font-mono">
                          {(search.time_to_click_ms / 1000).toFixed(2)}s
                        </span>
                      ) : (
                        <span className="text-slate-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-400">
                      {new Date(search.searched_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}