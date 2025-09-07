// Security audit logging service
import { supabase } from '@/integrations/supabase/client'

export interface SecurityEvent {
  event_type: string
  user_id?: string
  ip_address?: string
  user_agent?: string
  event_data: any
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export class AuditLogger {
  /**
   * Log security events using scan_analytics table for persistent monitoring
   */
  static async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Use scan_analytics table for security events with a dummy scan_id
      const { error } = await supabase
        .from('scan_analytics')
        .insert({
          scan_id: '00000000-0000-0000-0000-000000000000', // Dummy scan ID for security events
          event_type: `security:${event.event_type}`,
          event_data: {
            ...event.event_data,
            severity: event.severity,
            user_id: event.user_id,
            timestamp: new Date().toISOString()
          },
          ip_address: event.ip_address || null,
          user_agent: event.user_agent || navigator?.userAgent || null
        })
      
      if (error) {
        console.error('Failed to log security event:', error)
        // Fallback to local storage for critical events
        if (event.severity === 'critical') {
          this.logToLocalStorage(event)
        }
      }
    } catch (err) {
      console.error('Audit logging error:', err)
      this.logToLocalStorage(event)
    }
  }

  /**
   * Fallback logging to local storage
   */
  private static logToLocalStorage(event: SecurityEvent): void {
    try {
      const logs = JSON.parse(localStorage.getItem('security_logs') || '[]')
      logs.push({
        ...event,
        timestamp: new Date().toISOString()
      })
      
      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100)
      }
      
      localStorage.setItem('security_logs', JSON.stringify(logs))
    } catch (err) {
      console.error('Failed to log to localStorage:', err)
    }
  }

  /**
   * Get client identifier for rate limiting
   */
  static getClientIdentifier(): string {
    // Try to get user ID first
    const userId = supabase.auth.getUser().then(({ data }) => data.user?.id)
    
    if (userId) {
      return `user:${userId}`
    }
    
    // Fallback to fingerprinting
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
    ].join('|')
    
    return `anonymous:${btoa(fingerprint).slice(0, 16)}`
  }

  /**
   * Track user actions for security monitoring
   */
  static async trackUserAction(
    action: string,
    data: any = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ): Promise<void> {
    const { data: userData } = await supabase.auth.getUser()
    
    await this.logSecurityEvent({
      event_type: `user_action:${action}`,
      user_id: userData.user?.id,
      event_data: {
        action,
        ...data,
        url: window?.location?.href,
        referrer: document?.referrer
      },
      severity
    })
  }

  /**
   * Monitor authentication events
   */
  static async trackAuthEvent(
    event: 'login' | 'logout' | 'signup' | 'password_reset' | 'failed_login',
    data: any = {}
  ): Promise<void> {
    const severity = event === 'failed_login' ? 'medium' : 'low'
    
    await this.logSecurityEvent({
      event_type: `auth:${event}`,
      event_data: data,
      severity
    })
  }

  /**
   * Track data access patterns
   */
  static async trackDataAccess(
    resource: string,
    operation: 'read' | 'write' | 'delete',
    data: any = {}
  ): Promise<void> {
    const { data: userData } = await supabase.auth.getUser()
    
    await this.logSecurityEvent({
      event_type: `data_access:${resource}:${operation}`,
      user_id: userData.user?.id,
      event_data: {
        resource,
        operation,
        ...data
      },
      severity: operation === 'delete' ? 'medium' : 'low'
    })
  }
}
