import { AlertCircle, ExternalLink, Terminal, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

interface ServerErrorBannerProps {
  error: string
  onDismiss?: () => void
  showDeploymentHelp?: boolean
}

export function ServerErrorBanner({ error, onDismiss, showDeploymentHelp = true }: ServerErrorBannerProps) {
  const isNetworkError = error === 'Failed to fetch' || error.includes('fetch')
  
  if (!isNetworkError) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="size-4" />
      <AlertTitle className="flex items-center gap-2">
        Server Not Responding
        <Badge variant="outline" className="bg-destructive/10">
          Deployment Required
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>
          The DEWII server is not responding. This means the Supabase Edge Function needs to be deployed.
        </p>
        
        {showDeploymentHelp && (
          <>
            <div className="bg-muted/50 p-3 rounded-md font-mono text-sm">
              <p className="text-muted-foreground mb-1">Run this command:</p>
              <code className="text-primary">supabase functions deploy make-server-053bcd80</code>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Quick Fix Steps:</p>
              <ol className="list-decimal list-inside text-sm space-y-1 ml-2">
                <li>Open terminal in your project directory</li>
                <li>Run: <code className="bg-muted px-1 rounded">supabase functions deploy make-server-053bcd80</code></li>
                <li>Wait for "✓ Deployed successfully"</li>
                <li>Refresh this page (Ctrl+Shift+R)</li>
              </ol>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/DEPLOYMENT_CHECKLIST.md', '_blank')}
              >
                <Terminal className="size-4 mr-2" />
                Deployment Guide
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/TEST_SERVER_CONNECTION.html', '_blank')}
              >
                <CheckCircle2 className="size-4 mr-2" />
                Test Connection
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://supabase.com/dashboard/project/dhsqlszauibxintwziib/functions', '_blank')}
              >
                <ExternalLink className="size-4 mr-2" />
                Supabase Dashboard
              </Button>
            </div>

            <div className="border-t pt-3 mt-3">
              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                  Advanced: Check Environment Variables
                </summary>
                <div className="mt-2 space-y-1 text-muted-foreground">
                  <p>Make sure these are set in Supabase Dashboard:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li><code>SUPABASE_URL</code></li>
                    <li><code>SUPABASE_ANON_KEY</code></li>
                    <li><code>SUPABASE_SERVICE_ROLE_KEY</code></li>
                    <li><code>ADMIN_USER_ID</code></li>
                  </ul>
                  <p className="mt-2">
                    <a 
                      href="https://supabase.com/dashboard/project/dhsqlszauibxintwziib/settings/functions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Configure Environment Variables
                      <ExternalLink className="size-3" />
                    </a>
                  </p>
                </div>
              </details>
            </div>
          </>
        )}
        
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="mt-2"
          >
            Dismiss
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
