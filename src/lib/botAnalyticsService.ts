/**
 * Bot Analytics Service
 * Manages behavioral analytics data, thresholds, and false positive tracking
 */

export interface BotAttempt {
  id: string
  timestamp: number
  score: number
  confidence: number
  triggers: string[]
  recommendation: 'allow' | 'challenge' | 'block'
  isFalsePositive: boolean
}

export interface ThresholdConfig {
  challenge: number // Score at which to trigger CAPTCHA
  block: number // Score at which to block immediately
}

const STORAGE_KEYS = {
  ATTEMPTS: 'bot_analytics_attempts',
  THRESHOLDS: 'bot_analytics_thresholds',
} as const

const DEFAULT_THRESHOLDS: ThresholdConfig = {
  challenge: 35,
  block: 60,
}

class BotAnalyticsService {
  /**
   * Record a new authentication attempt
   */
  recordAttempt(
    score: number,
    confidence: number,
    triggers: string[],
    recommendation: 'allow' | 'challenge' | 'block'
  ): string {
    const attempt: BotAttempt = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      score,
      confidence,
      triggers,
      recommendation,
      isFalsePositive: false,
    }

    const attempts = this.getAttempts()
    attempts.push(attempt)

    // Keep only last 1000 attempts to prevent localStorage overflow
    const trimmedAttempts = attempts.slice(-1000)
    
    try {
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(trimmedAttempts))
    } catch (error) {
      console.error('Failed to store bot analytics:', error)
      // If storage fails, try clearing old data
      if (attempts.length > 500) {
        const recentAttempts = attempts.slice(-500)
        localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(recentAttempts))
      }
    }

    return attempt.id
  }

  /**
   * Get all recorded attempts
   */
  getAttempts(): BotAttempt[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTS)
      if (!data) return []
      return JSON.parse(data)
    } catch (error) {
      console.error('Failed to load bot analytics:', error)
      return []
    }
  }

  /**
   * Mark an attempt as a false positive (or unmark)
   */
  markFalsePositive(attemptId: string, isFalsePositive: boolean): void {
    const attempts = this.getAttempts()
    const attempt = attempts.find(a => a.id === attemptId)
    
    if (attempt) {
      attempt.isFalsePositive = isFalsePositive
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts))
    }
  }

  /**
   * Clear all recorded attempts
   */
  clearAttempts(): void {
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS)
  }

  /**
   * Get current detection thresholds
   */
  getThresholds(): ThresholdConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THRESHOLDS)
      if (!data) return DEFAULT_THRESHOLDS
      return JSON.parse(data)
    } catch (error) {
      console.error('Failed to load thresholds:', error)
      return DEFAULT_THRESHOLDS
    }
  }

  /**
   * Update detection thresholds
   */
  updateThresholds(thresholds: ThresholdConfig): void {
    // Validate thresholds
    if (thresholds.challenge >= thresholds.block) {
      throw new Error('Challenge threshold must be lower than block threshold')
    }
    if (thresholds.challenge < 0 || thresholds.block > 100) {
      throw new Error('Thresholds must be between 0 and 100')
    }

    localStorage.setItem(STORAGE_KEYS.THRESHOLDS, JSON.stringify(thresholds))
  }

  /**
   * Get statistics about attempts
   */
  getStats() {
    const attempts = this.getAttempts()
    const total = attempts.length
    
    if (total === 0) {
      return {
        total: 0,
        avgScore: 0,
        avgConfidence: 0,
        allowedCount: 0,
        challengedCount: 0,
        blockedCount: 0,
        falsePositiveCount: 0,
        falsePositiveRate: 0,
      }
    }

    const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / total
    const avgConfidence = attempts.reduce((sum, a) => sum + a.confidence, 0) / total
    const allowedCount = attempts.filter(a => a.recommendation === 'allow').length
    const challengedCount = attempts.filter(a => a.recommendation === 'challenge').length
    const blockedCount = attempts.filter(a => a.recommendation === 'block').length
    const falsePositiveCount = attempts.filter(a => a.isFalsePositive).length
    const falsePositiveRate = (falsePositiveCount / total) * 100

    return {
      total,
      avgScore: Math.round(avgScore * 10) / 10,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      allowedCount,
      challengedCount,
      blockedCount,
      falsePositiveCount,
      falsePositiveRate: Math.round(falsePositiveRate * 10) / 10,
    }
  }

  /**
   * Get recommendations for threshold tuning based on false positives
   */
  getThresholdRecommendations(): {
    shouldIncrease: boolean
    reason: string
  } | null {
    const attempts = this.getAttempts()
    const thresholds = this.getThresholds()
    
    if (attempts.length < 20) {
      return null // Not enough data
    }

    // Check false positive rate in challenged/blocked attempts
    const challengedOrBlocked = attempts.filter(
      a => a.recommendation === 'challenge' || a.recommendation === 'block'
    )
    
    if (challengedOrBlocked.length === 0) return null

    const fpCount = challengedOrBlocked.filter(a => a.isFalsePositive).length
    const fpRate = (fpCount / challengedOrBlocked.length) * 100

    // If false positive rate is high, suggest increasing thresholds
    if (fpRate > 20) {
      return {
        shouldIncrease: true,
        reason: `High false positive rate (${fpRate.toFixed(1)}%). Consider increasing thresholds to improve UX.`
      }
    }

    // If no false positives and many bots are in the allow zone
    const allowedBots = attempts.filter(
      a => a.recommendation === 'allow' && a.score > thresholds.challenge * 0.8
    )
    
    if (fpRate < 5 && allowedBots.length > attempts.length * 0.1) {
      return {
        shouldIncrease: false,
        reason: `Low false positive rate but many high-scoring attempts in allow zone. Consider lowering thresholds.`
      }
    }

    return null
  }

  /**
   * Export data for analysis
   */
  exportData(): string {
    const attempts = this.getAttempts()
    const thresholds = this.getThresholds()
    const stats = this.getStats()

    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        thresholds,
        stats,
        attempts,
      },
      null,
      2
    )
  }
}

// Export singleton instance
export const botAnalyticsService = new BotAnalyticsService()
