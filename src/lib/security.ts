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

// Profanity and inappropriate content filter
const INAPPROPRIATE_WORDS = [
  // Add basic inappropriate words - in production, use a comprehensive library
  'spam', 'scam', 'fraud', 'hack', 'exploit'
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
    
    // Check for spam patterns
    const spamPatterns = [
      /(.)\1{10,}/g, // Repeated characters
      /^[A-Z\s!]{20,}$/g, // All caps
      /(?:buy|click|free|urgent|limited|offer){3,}/gi // Spam keywords
    ]
    
    spamPatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        errors.push('Content appears to be spam or inappropriate')
      }
    })
    
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
   * Rate limiting check for public endpoints
   */
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>()
  
  static checkRateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
    const now = Date.now()
    const entry = this.rateLimitStore.get(identifier)
    
    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      })
      return true
    }
    
    if (entry.count >= maxRequests) {
      return false // Rate limit exceeded
    }
    
    entry.count++
    return true
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
}

// Initialize cleanup interval for rate limiting
if (typeof window !== 'undefined') {
  setInterval(() => {
    SecurityService.cleanupRateLimit()
  }, 300000) // Clean up every 5 minutes
}