import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Bell, BellOff, Check, Clock } from 'lucide-react'
import { alertService } from '@/lib/alertService';
import { AlertEvent, AlertRule, AlertType } from '@/types';
import { toast } from 'sonner'

const ALERT_DESCRIPTIONS: Record<AlertType, { title: string; description: string; unit: string }> = {
  HIGH_FALSE_POSITIVE_RATE: {
    title: 'High False Positive Rate',
    description: 'Alert when false positive rate exceeds threshold',
    unit: '%',
  },
  HIGH_BOT_ACTIVITY: {
    title: 'High Bot Activity',
    description: 'Alert when bot activity spike detected',
    unit: '% increase',
  },
  THRESHOLD_DRIFT: {
    title: 'Threshold Tuning Needed',
    description: 'Alert when auto-tuning recommends changes',
    unit: '% confidence',
  },
  ANOMALY_DETECTED: {
    title: 'Anomaly Detected',
    description: 'Alert when unusual patterns are detected',
    unit: '% of attempts',
  },
}

export function AlertConfiguration() {
  const [rules, setRules] = useState<Record<AlertType, AlertRule>>(alertService.getRules())
  const [history, setHistory] = useState<AlertEvent[]>([])
  const [notificationEnabled, setNotificationEnabled] = useState(false)

  useEffect(() => {
    loadData()
    checkNotificationPermission()
  }, [])

  const loadData = () => {
    setRules(alertService.getRules())
    setHistory(alertService.getHistory())
  }

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationEnabled(Notification.permission === 'granted')
    }
  }

  const requestNotificationPermission = async () => {
    const granted = await alertService.requestPermission()
    setNotificationEnabled(granted)
    if (granted) {
      toast.success('Notifications enabled')
    } else {
      toast.error('Notification permission denied')
    }
  }

  const toggleAlert = (type: AlertType, enabled: boolean) => {
    alertService.updateRule(type, { enabled })
    loadData()
    toast.success(`Alert ${enabled ? 'enabled' : 'disabled'}`)
  }

  const updateThreshold = (type: AlertType, threshold: number) => {
    alertService.updateRule(type, { threshold })
    setRules(prev => ({
      ...prev,
      [type]: { ...prev[type], threshold }
    }))
  }

  const acknowledgeAlert = (alertId: string) => {
    alertService.acknowledgeAlert(alertId)
    loadData()
  }

  const clearHistory = () => {
    if (window.confirm('Clear all alert history?')) {
      alertService.clearHistory()
      loadData()
      toast.success('Alert history cleared')
    }
  }

  const muteAlert = (type: AlertType, minutes: number) => {
    alertService.muteAlert(type, minutes)
    loadData()
    toast.success(`Alert muted for ${minutes} minutes`)
  }

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Enable browser notifications for real-time alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notificationEnabled ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500" />
              Notifications are enabled
            </div>
          ) : (
            <Button onClick={requestNotificationPermission}>
              Enable Notifications
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Alert Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Rules</CardTitle>
          <CardDescription>
            Configure when you want to be notified about potential issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(Object.keys(rules) as AlertType[]).map(type => {
            const rule = rules[type]
            const config = ALERT_DESCRIPTIONS[type]

            return (
              <div key={type} className="space-y-4 pb-6 border-b last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">{config.title}</Label>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(enabled) => toggleAlert(type, enabled)}
                  />
                </div>

                {rule.enabled && (
                  <div className="space-y-3 pl-4 border-l-2 border-muted">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Threshold: {rule.threshold}{config.unit}</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => muteAlert(type, 60)}
                        >
                          <BellOff className="h-3 w-3 mr-1" />
                          Mute 1h
                        </Button>
                      </div>
                      <Slider
                        value={[rule.threshold]}
                        onValueChange={([value]) => updateThreshold(type, value)}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Cooldown: {rule.cooldownMinutes} minutes
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Alert History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                History of triggered alerts
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={clearHistory}>
              Clear History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No alerts triggered yet
            </p>
          ) : (
            <div className="space-y-3">
              {history.slice().reverse().slice(0, 20).map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.acknowledged ? 'bg-muted/50' : 'bg-background'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          alert.severity === 'error' ? 'destructive' :
                          alert.severity === 'warning' ? 'default' : 'secondary'
                        }>
                          {alert.severity}
                        </Badge>
                        <span className="text-sm font-medium">
                          {ALERT_DESCRIPTIONS[alert.type].title}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!alert.acknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
