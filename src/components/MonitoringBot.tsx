import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Bot, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Activity,
  Database,
  Shield,
  Zap,
  Globe,
  Clock,
  TrendingUp,
  Server,
  Heart,
  Cpu
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface MonitoringBotProps {
  accessToken: string
  serverUrl: string
}

interface HealthCheck {
  id: string
  name: string
  description: string
  status: 'healthy' | 'warning' | 'error' | 'checking'
  message: string
  lastChecked: string
  iconName: string
  details?: any
}

interface SystemMetrics {
  databaseSize: string
  totalRecords: number
  activeUsers: number
  avgResponseTime: number
  uptime: string
  errorRate: number
}

export function MonitoringBot({ accessToken, serverUrl }: MonitoringBotProps) {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([])
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Icon mapping function
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'Database': Database,
      'Server': Server,
      'Shield': Shield,
      'CheckCircle': CheckCircle,
      'Zap': Zap,
      'TrendingUp': TrendingUp,
      'Activity': Activity
    }
    return iconMap[iconName] || Database
  }

  // Initial health checks structure
  const initialChecks: HealthCheck[] = [
    {
      id: 'database',
      name: 'Database Connection',
      description: 'Verifies database is accessible and responding',
      status: 'checking',
      message: 'Checking...',
      lastChecked: new Date().toISOString(),
      iconName: 'Database'
    },
    {
      id: 'api',
      name: 'API Endpoints',
      description: 'Tests critical API endpoints are responding',
      status: 'checking',
      message: 'Checking...',
      lastChecked: new Date().toISOString(),
      iconName: 'Server'
    },
    {
      id: 'auth',
      name: 'Authentication System',
      description: 'Verifies auth service is functioning',
      status: 'checking',
      message: 'Checking...',
      lastChecked: new Date().toISOString(),
      iconName: 'Shield'
    },
    {
      id: 'data_integrity',
      name: 'Data Integrity',
      description: 'Checks for orphaned records and consistency',
      status: 'checking',
      message: 'Checking...',
      lastChecked: new Date().toISOString(),
      iconName: 'CheckCircle'
    },
    {
      id: 'security',
      name: 'Security Systems',
      description: 'Validates security measures are active',
      status: 'checking',
      message: 'Checking...',
      lastChecked: new Date().toISOString(),
      iconName: 'Shield'
    },
    {
      id: 'performance',
      name: 'Performance Metrics',
      description: 'Monitors response times and resource usage',
      status: 'checking',
      message: 'Checking...',
      lastChecked: new Date().toISOString(),
      iconName: 'Zap'
    },
    {
      id: 'gamification',
      name: 'Gamification Engine',
      description: 'Verifies points, achievements, and streaks',
      status: 'checking',
      message: 'Checking...',
      lastChecked: new Date().toISOString(),
      iconName: 'TrendingUp'
    },
    {
      id: 'wallet',
      name: 'Wallet System',
      description: 'Checks NADA points and transactions',
      status: 'checking',
      message: 'Checking...',
      lastChecked: new Date().toISOString(),
      iconName: 'Activity'
    }
  ]

  const runHealthChecks = async () => {
    setLoading(true)
    setHealthChecks(initialChecks)

    try {
      // Call the health check endpoint
      const response = await fetch(`${serverUrl}/health-check`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch health checks')
      }

      const data = await response.json()
      
      setHealthChecks(data.checks || initialChecks)
      setMetrics(data.metrics || null)
      setLastRefresh(new Date())
    } catch (error: any) {
      console.error('Error running health checks:', error)
      
      // Mark all as error if the endpoint fails
      setHealthChecks(prev => prev.map(check => ({
        ...check,
        status: 'error' as const,
        message: 'Failed to connect to monitoring service',
        lastChecked: new Date().toISOString()
      })))
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    runHealthChecks()

    if (autoRefresh) {
      const interval = setInterval(() => {
        runHealthChecks()
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      case 'error':
        return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'checking':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return null
    }
  }

  const overallHealth = healthChecks.every(c => c.status === 'healthy') 
    ? 'healthy' 
    : healthChecks.some(c => c.status === 'error') 
    ? 'error' 
    : 'warning'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            <Bot className="w-8 h-8 text-purple-500" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              System Monitoring Bot
            </h2>
            <p className="text-sm text-muted-foreground">
              Continuously monitors system health and performance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Heart className={`w-4 h-4 mr-2 ${autoRefresh ? 'text-red-500 animate-pulse' : ''}`} />
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            onClick={runHealthChecks}
            disabled={loading}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className={`p-6 border-2 ${getStatusColor(overallHealth)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getStatusIcon(overallHealth)}
            <div>
              <h3 className="text-lg font-semibold">
                {overallHealth === 'healthy' && '✅ All Systems Operational'}
                {overallHealth === 'warning' && '⚠️ Some Issues Detected'}
                {overallHealth === 'error' && '🚨 Critical Issues Found'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Last checked: {lastRefresh.toLocaleString()}
              </p>
            </div>
          </div>

          {metrics && (
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.activeUsers}</div>
                <div className="text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
                <div className="text-muted-foreground">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.errorRate}%</div>
                <div className="text-muted-foreground">Error Rate</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* System Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">Database Size</div>
                <div className="text-xl font-bold">{metrics.databaseSize}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Cpu className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-sm text-muted-foreground">Total Records</div>
                <div className="text-xl font-bold">{metrics.totalRecords.toLocaleString()}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-sm text-muted-foreground">Uptime</div>
                <div className="text-xl font-bold">{metrics.uptime}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-orange-500" />
              <div>
                <div className="text-sm text-muted-foreground">Active Users</div>
                <div className="text-xl font-bold">{metrics.activeUsers}</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Health Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {healthChecks.map((check, index) => {
            const Icon = getIconComponent(check.iconName)
            return (
              <motion.div
                key={check.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-4 border ${getStatusColor(check.status)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="w-6 h-6 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{check.name}</h3>
                          {getStatusIcon(check.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {check.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant={check.status === 'healthy' ? 'default' : 'destructive'}>
                            {check.message}
                          </Badge>
                        </div>
                        {check.details && (
                          <div className="mt-3 space-y-2">
                            {/* Security Systems Details */}
                            {check.id === 'security' && check.details.readSessionTokens && (
                              <div className="text-xs space-y-1">
                                <div className="font-semibold text-foreground">Security Table Status:</div>
                                <div className="bg-muted/50 rounded p-2 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Read Session Tokens:</span>
                                    <Badge 
                                      variant={check.details.readSessionTokens.status === 'healthy' ? 'default' : 'destructive'}
                                      className="text-xs"
                                    >
                                      {check.details.readSessionTokens.status}
                                    </Badge>
                                  </div>
                                  {check.details.readSessionTokens.error && (
                                    <div className="text-red-500 ml-2">
                                      ⚠️ {check.details.readSessionTokens.error}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Wallet Audit Logs:</span>
                                    <Badge 
                                      variant={check.details.walletAuditLogs.status === 'healthy' ? 'default' : 'destructive'}
                                      className="text-xs"
                                    >
                                      {check.details.walletAuditLogs.status}
                                    </Badge>
                                  </div>
                                  {check.details.walletAuditLogs.error && (
                                    <div className="text-red-500 ml-2">
                                      ⚠️ {check.details.walletAuditLogs.error}
                                    </div>
                                  )}
                                  
                                  <div className="pt-1 border-t border-border/50">
                                    <span className="font-medium">Recent Threats (1h):</span> {check.details.recentThreats || 0}
                                  </div>
                                </div>
                                
                                {/* Show setup instructions if tables are missing */}
                                {(check.details.readSessionTokens.status === 'error' || check.details.walletAuditLogs.status === 'error') && (
                                  <div className="mt-2 bg-yellow-500/10 border border-yellow-500/20 rounded p-3 space-y-2">
                                    <div className="font-semibold text-yellow-500 flex items-center gap-2">
                                      <AlertTriangle className="w-4 h-4" />
                                      Quick Fix Required
                                    </div>
                                    <div className="text-xs text-foreground space-y-1">
                                      <p className="font-medium">📋 To create the missing tables:</p>
                                      <ol className="ml-4 space-y-1 list-decimal">
                                        <li>Open Supabase Dashboard → SQL Editor</li>
                                        <li>Copy SQL from <code className="bg-muted px-1 rounded">/SECURITY_TABLES_SETUP.sql</code></li>
                                        <li>Run the SQL script</li>
                                        <li>Refresh this bot to verify</li>
                                      </ol>
                                      <p className="mt-2 text-muted-foreground">
                                        📖 Full guide: <code className="bg-muted px-1 rounded">/SECURITY_TABLES_SETUP_GUIDE.md</code>
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Other Details */}
                            {check.id !== 'security' && (
                              <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
                                <pre className="whitespace-pre-wrap break-words">
                                  {JSON.stringify(check.details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Last checked: {new Date(check.lastChecked).toLocaleTimeString()}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Bot Status Footer */}
      <Card className="p-4 bg-purple-500/5 border-purple-500/20">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-purple-500" />
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-semibold">Monitoring Bot Status:</span>{' '}
              {autoRefresh ? (
                <span className="text-green-500">🟢 Active - Auto-checking every 30 seconds</span>
              ) : (
                <span className="text-yellow-500">🟡 Paused - Auto-refresh is disabled</span>
              )}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}