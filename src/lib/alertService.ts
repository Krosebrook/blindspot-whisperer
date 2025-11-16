/**
 * Alert Service
 * Manages alert rules, triggers, and notification history
 */

export type AlertType = 
  | 'HIGH_FALSE_POSITIVE_RATE'
  | 'HIGH_BOT_ACTIVITY'
  | 'THRESHOLD_DRIFT'
  | 'ANOMALY_DETECTED'

export interface AlertRule {
  type: AlertType
  enabled: boolean
  threshold: number
  cooldownMinutes: number
  lastTriggered: number | null
}

export interface AlertEvent {
  id: string
  type: AlertType
  timestamp: number
  message: string
  severity: 'info' | 'warning' | 'error'
  acknowledged: boolean
  data?: Record<string, any>
}

const STORAGE_KEYS = {
  RULES: 'alert_rules',
  HISTORY: 'alert_history',
} as const

const DEFAULT_RULES: Record<AlertType, AlertRule> = {
  HIGH_FALSE_POSITIVE_RATE: {
    type: 'HIGH_FALSE_POSITIVE_RATE',
    enabled: true,
    threshold: 10,
    cooldownMinutes: 60,
    lastTriggered: null,
  },
  HIGH_BOT_ACTIVITY: {
    type: 'HIGH_BOT_ACTIVITY',
    enabled: true,
    threshold: 200,
    cooldownMinutes: 60,
    lastTriggered: null,
  },
  THRESHOLD_DRIFT: {
    type: 'THRESHOLD_DRIFT',
    enabled: true,
    threshold: 80,
    cooldownMinutes: 240,
    lastTriggered: null,
  },
  ANOMALY_DETECTED: {
    type: 'ANOMALY_DETECTED',
    enabled: true,
    threshold: 50,
    cooldownMinutes: 120,
    lastTriggered: null,
  },
}

class AlertService {
  private notificationPermission: NotificationPermission = 'default'

  constructor() {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission
    }
  }

  /**
   * Request browser notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false
    }

    if (this.notificationPermission === 'granted') {
      return true
    }

    const permission = await Notification.requestPermission()
    this.notificationPermission = permission
    return permission === 'granted'
  }

  /**
   * Get all alert rules
   */
  getRules(): Record<AlertType, AlertRule> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RULES)
      if (!data) return DEFAULT_RULES
      return { ...DEFAULT_RULES, ...JSON.parse(data) }
    } catch (error) {
      console.error('Failed to load alert rules:', error)
      return DEFAULT_RULES
    }
  }

  /**
   * Update a specific alert rule
   */
  updateRule(type: AlertType, updates: Partial<AlertRule>): void {
    const rules = this.getRules()
    rules[type] = { ...rules[type], ...updates }
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules))
  }

  /**
   * Get alert history
   */
  getHistory(): AlertEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY)
      if (!data) return []
      return JSON.parse(data)
    } catch (error) {
      console.error('Failed to load alert history:', error)
      return []
    }
  }

  /**
   * Trigger an alert if conditions are met
   */
  trigger(
    type: AlertType,
    message: string,
    severity: 'info' | 'warning' | 'error' = 'warning',
    data?: Record<string, any>
  ): boolean {
    const rules = this.getRules()
    const rule = rules[type]

    if (!rule.enabled) {
      return false
    }

    // Check cooldown
    if (rule.lastTriggered) {
      const cooldownMs = rule.cooldownMinutes * 60 * 1000
      const timeSinceLastTrigger = Date.now() - rule.lastTriggered
      if (timeSinceLastTrigger < cooldownMs) {
        return false
      }
    }

    // Create alert event
    const event: AlertEvent = {
      id: crypto.randomUUID(),
      type,
      timestamp: Date.now(),
      message,
      severity,
      acknowledged: false,
      data,
    }

    // Save to history
    const history = this.getHistory()
    history.push(event)
    const trimmedHistory = history.slice(-100) // Keep last 100 alerts
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmedHistory))

    // Update last triggered time
    this.updateRule(type, { lastTriggered: Date.now() })

    // Show notification
    this.showNotification(message, severity)

    return true
  }

  /**
   * Show browser notification
   */
  private showNotification(message: string, severity: 'info' | 'warning' | 'error'): void {
    if (!('Notification' in window) || this.notificationPermission !== 'granted') {
      return
    }

    const icon = severity === 'error' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️'
    
    const notification = new Notification('Bot Analytics Alert', {
      body: `${icon} ${message}`,
      icon: '/favicon.ico',
      tag: 'bot-analytics',
      requireInteraction: severity === 'error',
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }

  /**
   * Mark alert as acknowledged
   */
  acknowledgeAlert(alertId: string): void {
    const history = this.getHistory()
    const alert = history.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history))
    }
  }

  /**
   * Clear alert history
   */
  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.HISTORY)
  }

  /**
   * Mute specific alert type temporarily
   */
  muteAlert(type: AlertType, durationMinutes: number): void {
    const rules = this.getRules()
    rules[type].lastTriggered = Date.now()
    rules[type].cooldownMinutes = durationMinutes
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules))
  }

  /**
   * Get unacknowledged alert count
   */
  getUnacknowledgedCount(): number {
    return this.getHistory().filter(a => !a.acknowledged).length
  }
}

export const alertService = new AlertService()
