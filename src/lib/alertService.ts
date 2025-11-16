/**
 * Alert Service
 * Manages alert rules, triggers, and notification history
 */

import { StorageService } from '@/services/storageService';
import { logger } from '@/utils/logger';
import { AlertType, AlertRule, AlertEvent } from '@/types';

const STORAGE_KEYS = {
  RULES: 'alert_rules',
  HISTORY: 'alert_history',
} as const;

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
    const data = StorageService.get<Record<AlertType, AlertRule>>(STORAGE_KEYS.RULES);
    return data ? { ...DEFAULT_RULES, ...data } : DEFAULT_RULES;
  }

  /**
   * Update a specific alert rule
   */
  updateRule(type: AlertType, updates: Partial<AlertRule>): void {
    const rules = this.getRules();
    rules[type] = { ...rules[type], ...updates };
    StorageService.set(STORAGE_KEYS.RULES, rules);
  }

  /**
   * Get alert history
   */
  getHistory(): AlertEvent[] {
    const data = StorageService.get<AlertEvent[]>(STORAGE_KEYS.HISTORY);
    return data || [];
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
    const history = this.getHistory();
    const alert = history.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      StorageService.set(STORAGE_KEYS.HISTORY, history);
    }
  }

  /**
   * Clear alert history
   */
  clearHistory(): void {
    StorageService.remove(STORAGE_KEYS.HISTORY);
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
