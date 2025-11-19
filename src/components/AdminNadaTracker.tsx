import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Coins, TrendingUp, TrendingDown, Filter, Search, Download, RefreshCw, Undo2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

// NADA Ripple Icon from Wallet
function NadaRippleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Center droplet */}
      <circle cx="50" cy="50" r="8" fill="currentColor" opacity="1" />
      
      {/* First ripple */}
      <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="3" opacity="0.7" fill="none" />
      
      {/* Second ripple */}
      <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="2.5" opacity="0.5" fill="none" />
      
      {/* Third ripple */}
      <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="2" opacity="0.3" fill="none" />
    </svg>
  )
}

interface Transaction {
  id: string
  user_id: string
  transaction_type: string
  amount: number
  balance_after: number
  description: string
  ip_address: string
  created_at: string
  user_email?: string
}

interface AdminNadaTrackerProps {
  serverUrl: string
  accessToken: string
}

export function AdminNadaTracker({ serverUrl, accessToken }: AdminNadaTrackerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'exchange' | 'market_unlock'>('all')
  const [stats, setStats] = useState({
    totalExchanged: 0,
    totalSpent: 0,
    marketUnlocks: 0,
    uniqueUsers: 0
  })

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${serverUrl}/admin/nada-transactions`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch NADA transactions')
      }

      const data = await response.json()
      setTransactions(data.transactions)
      setFilteredTransactions(data.transactions)
      
      // Calculate stats
      const totalExchanged = data.transactions
        .filter((t: Transaction) => t.transaction_type === 'exchange' && t.amount > 0)
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
      
      const totalSpent = Math.abs(data.transactions
        .filter((t: Transaction) => t.amount < 0)
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0))
      
      const marketUnlocks = data.transactions
        .filter((t: Transaction) => t.transaction_type === 'market_unlock')
        .length
      
      const uniqueUsers = new Set(data.transactions.map((t: Transaction) => t.user_id)).size

      setStats({
        totalExchanged,
        totalSpent,
        marketUnlocks,
        uniqueUsers
      })
    } catch (error) {
      console.error('Failed to fetch NADA transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    let filtered = transactions

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.transaction_type === filterType)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredTransactions(filtered)
  }, [searchQuery, filterType, transactions])

  const exportToCSV = () => {
    const headers = ['Date', 'User', 'Type', 'Amount', 'Balance After', 'Description', 'IP Address']
    const rows = filteredTransactions.map(t => [
      new Date(t.created_at).toLocaleString(),
      t.user_email || t.user_id,
      t.transaction_type,
      t.amount,
      t.balance_after,
      t.description,
      t.ip_address
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nada-transactions-${new Date().toISOString()}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Exchanged</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {stats.totalExchanged}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-black text-red-600 dark:text-red-400">
                  {stats.totalSpent}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Unlocks</p>
                <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                  {stats.marketUnlocks}
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center">
                <NadaRippleIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Users</p>
                <p className="text-2xl font-black text-violet-600 dark:text-violet-400">
                  {stats.uniqueUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-violet-500/10 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <NadaRippleIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                NADA Transaction History
              </CardTitle>
              <CardDescription>
                Track all NADA exchanges, spending, and wallet activity
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTransactions}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, email, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'exchange' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('exchange')}
              >
                Exchanges
              </Button>
              <Button
                variant={filterType === 'market_unlock' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('market_unlock')}
              >
                Market Unlocks
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Balance After</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Loading transactions...
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm">
                          {new Date(transaction.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="max-w-[200px] truncate" title={transaction.user_email || transaction.user_id}>
                            {transaction.user_email || transaction.user_id.slice(0, 8) + '...'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant={
                              transaction.transaction_type === 'exchange' ? 'default' : 
                              transaction.transaction_type === 'market_unlock' ? 'secondary' :
                              'outline'
                            }
                            className={
                              transaction.transaction_type === 'exchange' 
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                                : transaction.transaction_type === 'market_unlock'
                                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30'
                                : transaction.transaction_type === 'admin_refund'
                                ? 'bg-violet-500/20 text-violet-700 dark:text-violet-400 border-violet-500/30 hover:bg-violet-500/30'
                                : ''
                            }
                          >
                            {transaction.transaction_type === 'market_unlock' ? 'Market Unlock' : 
                             transaction.transaction_type === 'admin_refund' ? 'Admin Refund' :
                             transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-bold ${transaction.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {transaction.balance_after}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          <div className="max-w-[300px] truncate" title={transaction.description}>
                            {transaction.description}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {transaction.ip_address}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </CardContent>
      </Card>
    </div>
  )
}