import { useState, useEffect } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { RefreshCw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface ServerStatusCheckerProps {
  serverUrl: string
  publicAnonKey: string
}

export function ServerStatusChecker({ serverUrl, publicAnonKey }: ServerStatusCheckerProps) {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'error' | 'unknown'>('unknown')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState<any>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkServerHealth = async () => {
    setStatus('checking')
    setMessage('Checking server status...')
    
    try {
      console.log('🔍 Checking server health at:', `${serverUrl}/health`)
      
      const response = await fetch(`${serverUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setStatus('healthy')
      setMessage('Server is healthy and responding')
      setDetails(data)
      setLastChecked(new Date())
      
      console.log('✅ Server health check passed:', data)
    } catch (error: any) {
      setStatus('error')
      setMessage(`Server error: ${error.message}`)
      setDetails(null)
      setLastChecked(new Date())
      
      console.error('❌ Server health check failed:', error)
      console.error('This usually means:')
      console.error('1. Function is not deployed')
      console.error('2. Function crashed on startup')
      console.error('3. Environment variables are missing')
      console.error('Check Supabase Dashboard → Edge Functions → Logs')
    }
  }

  useEffect(() => {
    // Check on mount
    checkServerHealth()
    
    // Check every 30 seconds
    const interval = setInterval(checkServerHealth, 30000)
    
    return () => clearInterval(interval)
  }, [serverUrl])

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="bg-background border border-border rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {status === 'checking' && (
              <RefreshCw className="size-4 animate-spin text-blue-500" />
            )}
            {status === 'healthy' && (
              <CheckCircle2 className="size-4 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="size-4 text-red-500" />
            )}
            {status === 'unknown' && (
              <AlertCircle className="size-4 text-gray-500" />
            )}
            
            <Badge 
              variant={
                status === 'healthy' ? 'default' : 
                status === 'error' ? 'destructive' : 
                'secondary'
              }
            >
              {status === 'healthy' && 'Server Online'}
              {status === 'error' && 'Server Offline'}
              {status === 'checking' && 'Checking...'}
              {status === 'unknown' && 'Unknown'}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={checkServerHealth}
            disabled={status === 'checking'}
          >
            <RefreshCw className={`size-4 ${status === 'checking' ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mb-2">{message}</p>
        
        {details && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded mb-2">
            <div>Service: {details.service}</div>
            <div>Version: {details.version}</div>
            <div>Time: {new Date(details.timestamp).toLocaleTimeString()}</div>
          </div>
        )}
        
        {lastChecked && (
          <p className="text-xs text-muted-foreground">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
        
        {status === 'error' && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">
              <strong>Troubleshooting:</strong>
            </p>
            <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
              <li>Check Supabase Dashboard</li>
              <li>Verify function is deployed</li>
              <li>Check function logs for errors</li>
              <li>Verify environment variables</li>
            </ol>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => window.open('/TEST_SERVER_CONNECTION.html', '_blank')}
            >
              Open Diagnostic Tool
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
