// Security utilities for data sanitization and validation
import { supabase } from '@/integrations/supabase/client'

// Content security patterns to detect and sanitize sensitive information
const SENSITIVE_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  phone: /(\+?1?[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
  ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
  creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
  ipAddress: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
  apiKey: /\b[A-Za-z0-9]{32,}\b/g
}

// Enhanced inappropriate content filter
const INAPPROPRIATE_WORDS = [
  'spam', 'scam', 'fraud', 'hack', 'exploit', 'phishing', 'malware', 
  'clickbait', 'ponzi', 'pyramid', 'mlm', 'get-rich-quick', 'guaranteed-profit',
  'casino', 'gambling', 'bitcoin-scam', 'crypto-scam', 'investment-scam',
  'fake-reviews', 'bot-traffic', 'click-farm', 'seo-spam', 'link-farm'
]

// Advanced spam detection patterns
const SPAM_INDICATORS = [
  /(.)\1{8,}/g, // Repeated characters (8+ times)
  /^[A-Z\s!]{15,}$/g, // Excessive caps
  /(?:free|click|buy|now|urgent|limited|offer|guaranteed|instant){3,}/gi,
  /(?:\$|\€|\£|\¥|USD|EUR|GBP|profit|money|cash|earn|income){3,}/gi,
  /(?:www\.|http|\.com|\.net|\.org){3,}/gi, // Multiple URLs
  /(?:\d{1,3}[%]){2,}/g, // Multiple percentages
  /(?:!!|!!){3,}/g, // Excessive punctuation
]

interface SanitizationOptions {
  removeUrls?: boolean
  removeProfanity?: boolean
  maxLength?: number
  allowHtml?: boolean
}

export class SecurityService {
  /**
   * Sanitize text content for public sharing
   */
  static sanitizeContent(content: string, options: SanitizationOptions = {}): string {
    if (!content || typeof content !== 'string') return ''
    
    let sanitized = content.trim()
    
    // Remove sensitive information
    Object.entries(SENSITIVE_PATTERNS).forEach(([type, pattern]) => {
      if (type === 'url' && !options.removeUrls) return
      
      sanitized = sanitized.replace(pattern, (match) => {
        switch (type) {
          case 'email':
            return '[email protected]'
          case 'phone':
            return '[phone number]'
          case 'ssn':
            return '[SSN]'
          case 'creditCard':
            return '[card number]'
          case 'url':
            return '[website]'
          case 'ipAddress':
            return '[IP address]'
          case 'apiKey':
            return '[API key]'
          default:
            return '[redacted]'
        }
      })
    })
    
    // Remove inappropriate content
    if (options.removeProfanity !== false) {
      INAPPROPRIATE_WORDS.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi')
        sanitized = sanitized.replace(regex, '[removed]')
      })
    }
    
    // Enforce length limits
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength) + '...'
    }
    
    // HTML sanitization (basic)
    if (!options.allowHtml) {
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
    }
    
    return sanitized
  }

  /**
   * Validate and sanitize business description input
   */
  static validateBusinessDescription(description: string): { isValid: boolean; sanitized: string; errors: string[] } {
    const errors: string[] = []
    
    if (!description || typeof description !== 'string') {
      errors.push('Description is required')
      return { isValid: false, sanitized: '', errors }
    }
    
    const trimmed = description.trim()
    
    // Length validation
    if (trimmed.length < 50) {
      errors.push('Description must be at least 50 characters')
    }
    
    if (trimmed.length > 2000) {
      errors.push('Description must be less than 2000 characters')
    }
    
    // Content validation
    const sanitized = this.sanitizeContent(trimmed, {
      removeUrls: false, // Allow URLs in business descriptions
      removeProfanity: true,
      allowHtml: false
    })
    
    // Enhanced spam detection
    let spamScore = 0
    SPAM_INDICATORS.forEach(pattern => {
      if (pattern.test(sanitized)) {
        spamScore++
      }
    })
    
    // Additional content quality checks
    const wordCount = sanitized.split(/\s+/).length
    const uniqueWords = new Set(sanitized.toLowerCase().split(/\s+/)).size
    const repetitionRatio = uniqueWords / wordCount
    
    if (spamScore >= 2) {
      errors.push('Content appears to be spam or inappropriate')
    }
    
    if (repetitionRatio < 0.3 && wordCount > 20) {
      errors.push('Content contains too much repetition')
    }
    
    // Log suspicious content for review
    if (spamScore >= 1 || repetitionRatio < 0.4) {
      this.logSecurityEvent('suspicious_content', { 
        spamScore, 
        repetitionRatio, 
        contentLength: sanitized.length 
      })
    }
    
    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    }
  }

  /**
   * Sanitize share card data before making it public
   */
  static sanitizeShareCard(shareCard: any): any {
    if (!shareCard) return null
    
    return {
      ...shareCard,
      title: this.sanitizeContent(shareCard.title || '', { maxLength: 100 }),
      description: this.sanitizeContent(shareCard.description || '', { maxLength: 300 }),
      key_insights: shareCard.key_insights?.map((insight: string) => 
        this.sanitizeContent(insight, { maxLength: 200 })
      ) || [],
      // Remove sensitive scan data for public sharing
      scans: shareCard.scans ? {
        persona: shareCard.scans.persona,
        business_type: shareCard.scans.business_type,
        total_blind_spots: shareCard.scans.total_blind_spots,
        critical_blind_spots: shareCard.scans.critical_blind_spots
        // Remove business_description and other sensitive fields
      } : null
    }
  }

  /**
   * Enhanced rate limiting with progressive penalties
   */
  private static rateLimitStore = new Map<string, { 
    count: number; 
    resetTime: number; 
    violations: number; 
    lastViolation?: number 
  }>()
  
  static checkRateLimit(
    identifier: string, 
    maxRequests = 10, 
    windowMs = 60000,
    isAuthenticated = false
  ): { allowed: boolean; resetTime?: number; violationCount?: number } {
    const now = Date.now()
    const entry = this.rateLimitStore.get(identifier)
    
    // Adjust limits based on authentication status
    const adjustedMaxRequests = isAuthenticated ? maxRequests * 2 : maxRequests
    
    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
        violations: entry?.violations || 0
      })
      return { allowed: true }
    }
    
    // Apply progressive penalties for repeat violators
    const penaltyMultiplier = Math.min(entry.violations + 1, 5)
    const effectiveLimit = Math.max(1, Math.floor(adjustedMaxRequests / penaltyMultiplier))
    
    if (entry.count >= effectiveLimit) {
      entry.violations++
      entry.lastViolation = now
      this.logSecurityEvent('rate_limit_exceeded', { 
        identifier, 
        violations: entry.violations,
        limit: effectiveLimit 
      })
      return { 
        allowed: false, 
        resetTime: entry.resetTime,
        violationCount: entry.violations 
      }
    }
    
    entry.count++
    return { allowed: true }
  }

  /**
   * Clean expired rate limit entries
   */
  static cleanupRateLimit(): void {
    const now = Date.now()
    for (const [key, entry] of this.rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        this.rateLimitStore.delete(key)
      }
    }
  }

  /**
   * Validate scan input data
   */
  static validateScanInput(scanData: {
    persona?: string
    business_description?: string
    user_id?: string
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Validate persona
    const validPersonas = ['saas_founder', 'ecommerce', 'content_creator', 'service_business', 'student', 'no_coder', 'enterprise']
    if (!scanData.persona || !validPersonas.includes(scanData.persona)) {
      errors.push('Invalid persona selected')
    }
    
    // Validate business description
    const descriptionValidation = this.validateBusinessDescription(scanData.business_description || '')
    if (!descriptionValidation.isValid) {
      errors.push(...descriptionValidation.errors)
    }
    
    // Validate user ID
    if (!scanData.user_id) {
      errors.push('User authentication required')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Security audit logging
   */
  private static securityLogs: Array<{
    timestamp: number;
    event: string;
    data: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> = []

  static logSecurityEvent(
    event: string, 
    data: any, 
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    const logEntry = {
      timestamp: Date.now(),
      event,
      data,
      severity
    }
    
    this.securityLogs.push(logEntry)
    
    // Keep only last 1000 entries to prevent memory issues
    if (this.securityLogs.length > 1000) {
      this.securityLogs = this.securityLogs.slice(-1000)
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`🔒 Security Event [${severity.toUpperCase()}]:`, event, data)
    }
    
    // In production, you could send critical events to monitoring service
    if (severity === 'critical') {
      // TODO: Send to monitoring service (e.g., Sentry, DataDog)
    }
  }

  /**
   * Get recent security events for monitoring
   */
  static getSecurityLogs(
    since?: number, 
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ): Array<any> {
    let logs = this.securityLogs
    
    if (since) {
      logs = logs.filter(log => log.timestamp >= since)
    }
    
    if (severity) {
      logs = logs.filter(log => log.severity === severity)
    }
    
    return logs.slice(-100) // Return max 100 recent logs
  }

  /**
   * Advanced business description validation with ML-style scoring
   */
  static validateBusinessDescriptionAdvanced(description: string): {
    isValid: boolean;
    sanitized: string;
    errors: string[];
    qualityScore: number;
    riskScore: number;
  } {
    const basicValidation = this.validateBusinessDescription(description)
    
    if (!basicValidation.isValid) {
      return {
        ...basicValidation,
        qualityScore: 0,
        riskScore: 100
      }
    }
    
    const sanitized = basicValidation.sanitized
    const words = sanitized.toLowerCase().split(/\s+/)
    const wordCount = words.length
    const uniqueWords = new Set(words).size
    
    // Quality scoring
    let qualityScore = 50 // Base score
    
    // Length scoring
    if (wordCount >= 50 && wordCount <= 300) qualityScore += 20
    if (wordCount >= 100 && wordCount <= 200) qualityScore += 10
    
    // Vocabulary diversity
    const diversityRatio = uniqueWords / wordCount
    if (diversityRatio > 0.7) qualityScore += 15
    if (diversityRatio > 0.5) qualityScore += 10
    
    // Business-relevant keywords
    const businessKeywords = [
      'customer', 'product', 'service', 'market', 'revenue', 'growth', 
      'strategy', 'solution', 'value', 'business', 'company', 'industry'
    ]
    const keywordMatches = businessKeywords.filter(keyword => 
      words.includes(keyword)
    ).length
    qualityScore += Math.min(keywordMatches * 5, 25)
    
    // Risk scoring
    let riskScore = 0
    
    // Spam indicators
    SPAM_INDICATORS.forEach(pattern => {
      if (pattern.test(sanitized)) {
        riskScore += 20
      }
    })
    
    // Inappropriate content
    INAPPROPRIATE_WORDS.forEach(word => {
      if (words.includes(word.toLowerCase())) {
        riskScore += 25
      }
    })
    
    // Excessive repetition
    if (diversityRatio < 0.3) riskScore += 30
    
    // Normalize scores
    qualityScore = Math.min(Math.max(qualityScore, 0), 100)
    riskScore = Math.min(Math.max(riskScore, 0), 100)
    
    // Log quality assessment
    if (qualityScore < 40 || riskScore > 60) {
      this.logSecurityEvent('low_quality_content', {
        qualityScore,
        riskScore,
        wordCount,
        diversityRatio
      }, riskScore > 80 ? 'high' : 'medium')
    }
    
    return {
      isValid: basicValidation.isValid && riskScore < 70,
      sanitized,
      errors: riskScore >= 70 ? [...basicValidation.errors, 'Content quality too low'] : basicValidation.errors,
      qualityScore,
      riskScore
    }
  }

  /**
   * Detect potential security threats in user input
   */
  static detectSecurityThreats(input: string): {
    threats: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  } {
    const threats: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    
    // SQL injection patterns
    const sqlPatterns = [
      /'/gi,
      /;/gi,
      /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b/gi
    ]
    
    sqlPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        threats.push('Potential SQL injection attempt')
        riskLevel = 'high'
      }
    })
    
    // XSS patterns
    const xssPatterns = [
      /<script/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi
    ]
    
    xssPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        threats.push('Potential XSS attempt')
        riskLevel = 'high'
      }
    })
    
    // Command injection
    const cmdPatterns = [
      /(\||&|;|`|\$\()/g
    ]
    
    cmdPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        threats.push('Potential command injection')
        riskLevel = 'critical'
      }
    })
    
    if (threats.length > 0) {
      this.logSecurityEvent('security_threat_detected', {
        threats,
        riskLevel,
        inputLength: input.length
      }, riskLevel)
    }
    
    return { threats, riskLevel }
  }
}

// Initialize cleanup interval for rate limiting
if (typeof window !== 'undefined') {
  setInterval(() => {
    SecurityService.cleanupRateLimit()
  }, 300000) // Clean up every 5 minutes
}