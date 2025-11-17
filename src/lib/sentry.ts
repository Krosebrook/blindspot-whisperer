import * as Sentry from '@sentry/react'

export function initSentry() {
  // Only initialize in production
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true
        })
      ],
      
      // Performance monitoring
      tracesSampleRate: 0.1, // 10% of transactions
      
      // Session replay for error debugging
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of errors
      
      // Environment
      environment: import.meta.env.MODE,
      
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      
      // Filter out sensitive data
      beforeSend(event) {
        // Remove sensitive data from error reports
        if (event.request) {
          delete event.request.cookies
          delete event.request.headers
        }
        
        // Don't send password validation errors
        if (event.message?.toLowerCase().includes('password')) {
          return null
        }
        
        return event
      },
      
      // Ignore specific errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'Network request failed'
      ]
    })
  }
}

// Set user context when authenticated
export function setSentryUser(user: { id: string; email?: string }) {
  if (import.meta.env.PROD) {
    Sentry.setUser({
      id: user.id,
      email: user.email
    })
  }
}

// Clear user context on logout
export function clearSentryUser() {
  if (import.meta.env.PROD) {
    Sentry.setUser(null)
  }
}

// Capture custom error with context
export function captureError(error: Error, context?: Record<string, any>) {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      contexts: {
        custom: context
      }
    })
  }
}

// Capture message with level
export function captureMessage(message: string, level: 'info' | 'warning' | 'error') {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(message, level)
  }
}
