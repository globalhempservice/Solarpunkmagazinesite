import { useState } from 'react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { 
  Wallet,
  DollarSign,
  ArrowUpRight,
  Activity,
  TrendingUp,
  AlertCircle,
  Shield,
  Trophy,
  CreditCard,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface WalletStats {
  totalWallets: number
  totalTransactions: number
  totalPointsExchanged: number
  totalNadaGenerated: number
  averageExchangeAmount: number
  exchangeRate: number
  last24hTransactions: number
  last24hVolume: number
  transactionsPerDay: Array<{ date: string; count: number; volume: number }>
  topExchangers: Array<{
    userId: string
    email: string
    nickname: string | null
    totalExchanges: number
    totalPointsExchanged: number
    totalNadaGenerated: number
    lastExchange: string
  }>
  recentTransactions: Array<{
    id: string
    userId: string
    email: string
    nickname: string | null
    pointsExchanged: number
    nadaReceived: number
    timestamp: string
    ipAddress: string
    riskScore: number
  }>
  dailyLimitHits: number
  fraudAlerts: number
}

interface WalletsTabProps {
  walletStats: WalletStats
  onRefresh: () => Promise<void>
  isRefreshing?: boolean
}

export function WalletsTab({ walletStats, onRefresh, isRefreshing = false }: WalletsTabProps) {
  const [exchangersPage, setExchangersPage] = useState(0)
  const [transactionsPage, setTransactionsPage] = useState(0)
  
  const ITEMS_PER_PAGE = 10
  
  // Pagination for top exchangers
  const totalExchangersPages = Math.ceil((walletStats.topExchangers?.length || 0) / ITEMS_PER_PAGE)
  const paginatedExchangers = (walletStats.topExchangers || []).slice(
    exchangersPage * ITEMS_PER_PAGE,
    (exchangersPage + 1) * ITEMS_PER_PAGE
  )
  
  // Pagination for recent transactions
  const totalTransactionsPages = Math.ceil((walletStats.recentTransactions?.length || 0) / ITEMS_PER_PAGE)
  const paginatedTransactions = (walletStats.recentTransactions || []).slice(
    transactionsPage * ITEMS_PER_PAGE,
    (transactionsPage + 1) * ITEMS_PER_PAGE
  )
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-500" />
            Wallet Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Points exchange system & NADA trading</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Exchange Rate</div>
            <div className="text-2xl font-bold text-emerald-500">{walletStats.exchangeRate}:1</div>
            <div className="text-xs text-muted-foreground">Points to NADA</div>
          </div>
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Wallets */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Wallets</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">{walletStats.totalWallets.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-lg">
              <Wallet className="w-5 h-5 text-blue-700 dark:text-blue-300" />
            </div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">Active wallet accounts</p>
        </Card>

        {/* Total Transactions */}
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Total Exchanges</p>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mt-2">{walletStats.totalTransactions.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-200 dark:bg-emerald-800 rounded-lg">
              <Activity className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            +{walletStats.last24hTransactions} in 24h
          </p>
        </Card>

        {/* Total Volume */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total NADA</p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 mt-2">{walletStats.totalNadaGenerated.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-200 dark:bg-purple-800 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-700 dark:text-purple-300" />
            </div>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-3">{walletStats.totalPointsExchanged.toLocaleString()} points exchanged</p>
        </Card>

        {/* Average Exchange */}
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Avg Exchange</p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300 mt-2">{Math.round(walletStats.averageExchangeAmount).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-200 dark:bg-orange-800 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-700 dark:text-orange-300" />
            </div>
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-3">Points per transaction</p>
        </Card>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-200 dark:bg-yellow-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-700 dark:text-yellow-300" />
            </div>
            <div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Daily Limit Hits</p>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{walletStats.dailyLimitHits}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-200 dark:bg-red-800 rounded-lg">
              <Shield className="w-5 h-5 text-red-700 dark:text-red-300" />
            </div>
            <div>
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">Fraud Alerts</p>
              <p className="text-2xl font-bold text-red-800 dark:text-red-200">{walletStats.fraudAlerts}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction Volume Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" />
          Transaction Volume & Activity
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={walletStats.transactionsPerDay || []}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              yAxisId="left"
              stroke="#10b981"
              fontSize={12}
              label={{ value: 'Transactions', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#8b5cf6"
              fontSize={12}
              label={{ value: 'Volume (Points)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="count" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorCount)"
              name="Transactions"
            />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="volume" 
              stroke="#8b5cf6" 
              fillOpacity={1} 
              fill="url(#colorVolume)"
              name="Volume"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Exchangers */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Exchangers
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Rank</th>
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium text-right">Exchanges</th>
                <th className="pb-3 font-medium text-right">Points Used</th>
                <th className="pb-3 font-medium text-right">NADA Earned</th>
                <th className="pb-3 font-medium text-right">Last Exchange</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExchangers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No exchange data available yet
                  </td>
                </tr>
              ) : (
                paginatedExchangers.map((exchanger, index) => {
                  const globalRank = exchangersPage * ITEMS_PER_PAGE + index
                  return (
                    <tr key={exchanger.userId} className="border-b last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {globalRank === 0 && <span className="text-2xl">🥇</span>}
                          {globalRank === 1 && <span className="text-2xl">🥈</span>}
                          {globalRank === 2 && <span className="text-2xl">🥉</span>}
                          {globalRank > 2 && <span className="text-muted-foreground">#{globalRank + 1}</span>}
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <div className="font-medium">{exchanger.nickname || 'Anonymous'}</div>
                          <div className="text-xs text-muted-foreground">{exchanger.email}</div>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {exchanger.totalExchanges || 0}
                        </Badge>
                      </td>
                      <td className="py-4 text-right font-medium">
                        {(exchanger.totalPointsExchanged || 0).toLocaleString()}
                      </td>
                      <td className="py-4 text-right">
                        <div className="font-bold text-purple-600 dark:text-purple-400">
                          {(exchanger.totalNadaGenerated || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 text-right text-sm text-muted-foreground">
                        {exchanger.lastExchange ? new Date(exchanger.lastExchange).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination for Top Exchangers */}
        {totalExchangersPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {exchangersPage + 1} of {totalExchangersPages} • Showing {paginatedExchangers.length} of {walletStats.topExchangers?.length || 0} exchangers
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExchangersPage(prev => Math.max(0, prev - 1))}
                disabled={exchangersPage === 0}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExchangersPage(prev => Math.min(totalExchangersPages - 1, prev + 1))}
                disabled={exchangersPage === totalExchangersPages - 1}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-500" />
          Recent Transactions
        </h3>
        <div className="space-y-3">
          {paginatedTransactions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No recent transactions
            </div>
          ) : (
            paginatedTransactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    (tx.riskScore || 0) > 50 ? 'bg-red-100 dark:bg-red-950' : 'bg-green-100 dark:bg-green-950'
                  }`}>
                    {(tx.riskScore || 0) > 50 ? (
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{tx.nickname || tx.email || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'N/A'}</span>
                      <span>•</span>
                      <span>IP: {tx.ipAddress || 'N/A'}</span>
                      {(tx.riskScore || 0) > 50 && (
                        <>
                          <span>•</span>
                          <Badge variant="destructive" className="text-xs">
                            Risk: {tx.riskScore}%
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    <span className="text-red-600 dark:text-red-400">-{(tx.pointsExchanged || 0).toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm"> pts</span>
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    +{(tx.nadaReceived || 0).toLocaleString()} NADA
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Pagination for Recent Transactions */}
        {totalTransactionsPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {transactionsPage + 1} of {totalTransactionsPages} • Showing {paginatedTransactions.length} of {walletStats.recentTransactions?.length || 0} transactions
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTransactionsPage(prev => Math.max(0, prev - 1))}
                disabled={transactionsPage === 0}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTransactionsPage(prev => Math.min(totalTransactionsPages - 1, prev + 1))}
                disabled={transactionsPage === totalTransactionsPages - 1}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
