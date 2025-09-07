import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SecurityService } from '@/lib/security'
import { Shield, AlertTriangle, Clock, RefreshCw } from 'lucide-react'

interface SecurityEvent {
  timestamp: number
  event: string
  data: any
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export function SecurityMonitor() {
  const [securityLogs, setSecurityLogs] = useState<SecurityEvent[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshLogs = () => {
    setIsRefreshing(true)
    const logs = SecurityService.getSecurityLogs()
    setSecurityLogs(logs)
    setTimeout(() => setIsRefreshing(false), 500)
  }

  useEffect(() => {
    refreshLogs()
    const interval = setInterval(refreshLogs, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const criticalEvents = securityLogs.filter(log => log.severity === 'critical')
  const recentEvents = securityLogs.slice(0, 50) // Show last 50 events

  const eventCounts = {
    critical: securityLogs.filter(log => log.severity === 'critical').length,
    high: securityLogs.filter(log => log.severity === 'high').length,
    medium: securityLogs.filter(log => log.severity === 'medium').length,
    low: securityLogs.filter(log => log.severity === 'low').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Security Monitor
        </h2>
        <Button 
          onClick={refreshLogs}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{eventCounts.critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{eventCounts.high}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Medium Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{eventCounts.medium}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityLogs.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Events</TabsTrigger>
          <TabsTrigger value="critical">Critical Events</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              {recentEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No security events recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentEvents.map((log, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getSeverityIcon(log.severity)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{log.event}</span>
                            <Badge variant={getSeverityColor(log.severity) as any} className="text-xs">
                              {log.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {formatTimestamp(log.timestamp)}
                          </p>
                          {log.data && Object.keys(log.data).length > 0 && (
                            <details className="mt-2">
                              <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                                View Details
                              </summary>
                              <pre className="text-xs mt-1 p-2 bg-muted rounded text-muted-foreground overflow-x-auto">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical">
          <Card>
            <CardHeader>
              <CardTitle>Critical Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              {criticalEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No critical security events - All good!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {criticalEvents.map((log, index) => (
                    <div key={index} className="p-4 border-l-4 border-l-destructive bg-destructive/5 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="font-medium">{log.event}</span>
                        <Badge variant="destructive">CRITICAL</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {formatTimestamp(log.timestamp)}
                      </p>
                      {log.data && (
                        <pre className="text-xs p-2 bg-muted rounded overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}