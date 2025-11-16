/**
 * A/B Testing Service
 * Manages threshold A/B tests and result tracking
 */

import { ThresholdConfig } from './botAnalyticsService'

export interface TestResults {
  attempts: number
  allowed: number
  challenged: number
  blocked: number
  falsePositives: number
  avgBotScore: number
  avgConfidence: number
}

export interface ABTest {
  id: string
  name: string
  status: 'active' | 'paused' | 'completed'
  startDate: number
  endDate: number | null
  variants: {
    control: ThresholdConfig
    variant: ThresholdConfig
  }
  trafficSplit: number // % in variant (0-100)
  minSampleSize: number
  results: {
    control: TestResults
    variant: TestResults
  }
}

export interface TestAttemptTag {
  testId: string
  variant: 'control' | 'variant'
}

const STORAGE_KEY = 'ab_tests'
const SESSION_KEY = 'ab_test_assignment'

class ABTestService {
  /**
   * Create a new A/B test
   */
  createTest(
    name: string,
    control: ThresholdConfig,
    variant: ThresholdConfig,
    trafficSplit: number = 50,
    minSampleSize: number = 100
  ): ABTest {
    const test: ABTest = {
      id: crypto.randomUUID(),
      name,
      status: 'active',
      startDate: Date.now(),
      endDate: null,
      variants: { control, variant },
      trafficSplit,
      minSampleSize,
      results: {
        control: this.createEmptyResults(),
        variant: this.createEmptyResults(),
      },
    }

    const tests = this.getTests()
    tests.push(test)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests))

    return test
  }

  /**
   * Get all tests
   */
  getTests(): ABTest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []
      return JSON.parse(data)
    } catch (error) {
      console.error('Failed to load A/B tests:', error)
      return []
    }
  }

  /**
   * Get active test
   */
  getActiveTest(): ABTest | null {
    const tests = this.getTests()
    return tests.find(t => t.status === 'active') || null
  }

  /**
   * Assign user to test variant
   */
  assignVariant(testId: string): TestAttemptTag | null {
    const test = this.getTests().find(t => t.id === testId)
    if (!test || test.status !== 'active') {
      return null
    }

    // Check if already assigned
    const existingAssignment = this.getAssignment(testId)
    if (existingAssignment) {
      return existingAssignment
    }

    // Assign based on traffic split
    const variant = Math.random() * 100 < test.trafficSplit ? 'variant' : 'control'
    
    const assignment: TestAttemptTag = { testId, variant }
    
    // Store in sessionStorage for consistency
    const assignments = this.getAllAssignments()
    assignments[testId] = assignment
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(assignments))

    return assignment
  }

  /**
   * Get user's assignment for a test
   */
  getAssignment(testId: string): TestAttemptTag | null {
    const assignments = this.getAllAssignments()
    return assignments[testId] || null
  }

  /**
   * Get all assignments
   */
  private getAllAssignments(): Record<string, TestAttemptTag> {
    try {
      const data = sessionStorage.getItem(SESSION_KEY)
      if (!data) return {}
      return JSON.parse(data)
    } catch {
      return {}
    }
  }

  /**
   * Record test result
   */
  recordResult(
    testId: string,
    variant: 'control' | 'variant',
    score: number,
    confidence: number,
    recommendation: 'allow' | 'challenge' | 'block',
    isFalsePositive: boolean
  ): void {
    const tests = this.getTests()
    const test = tests.find(t => t.id === testId)
    
    if (!test) return

    const results = test.results[variant]
    results.attempts++
    results.avgBotScore = (results.avgBotScore * (results.attempts - 1) + score) / results.attempts
    results.avgConfidence = (results.avgConfidence * (results.attempts - 1) + confidence) / results.attempts
    
    if (recommendation === 'allow') results.allowed++
    if (recommendation === 'challenge') results.challenged++
    if (recommendation === 'block') results.blocked++
    if (isFalsePositive) results.falsePositives++

    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests))
  }

  /**
   * Update test status
   */
  updateTestStatus(testId: string, status: 'active' | 'paused' | 'completed'): void {
    const tests = this.getTests()
    const test = tests.find(t => t.id === testId)
    
    if (test) {
      test.status = status
      if (status === 'completed') {
        test.endDate = Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tests))
    }
  }

  /**
   * Calculate statistical significance
   */
  calculateSignificance(test: ABTest, metric: 'allowed' | 'challenged' | 'blocked' | 'falsePositives'): {
    pValue: number
    significant: boolean
    stars: string
  } {
    const control = test.results.control
    const variant = test.results.variant

    // Not enough data
    if (control.attempts < test.minSampleSize || variant.attempts < test.minSampleSize) {
      return { pValue: 1, significant: false, stars: '' }
    }

    // Get rates
    const controlRate = control[metric] / control.attempts
    const variantRate = variant[metric] / variant.attempts

    // Simple chi-squared approximation
    const pooledRate = (control[metric] + variant[metric]) / (control.attempts + variant.attempts)
    const expectedControl = control.attempts * pooledRate
    const expectedVariant = variant.attempts * pooledRate

    const chiSquared = 
      Math.pow(control[metric] - expectedControl, 2) / expectedControl +
      Math.pow(variant[metric] - expectedVariant, 2) / expectedVariant

    // Approximate p-value from chi-squared
    const pValue = 1 - this.chiSquaredCDF(chiSquared, 1)

    let stars = ''
    if (pValue < 0.01) stars = '⭐⭐⭐'
    else if (pValue < 0.05) stars = '⭐⭐'
    else if (pValue < 0.10) stars = '⭐'

    return {
      pValue,
      significant: pValue < 0.05,
      stars,
    }
  }

  /**
   * Simple chi-squared CDF approximation
   */
  private chiSquaredCDF(x: number, df: number): number {
    if (x <= 0) return 0
    if (x > 100) return 1
    
    // Simplified approximation for df=1
    const z = Math.sqrt(x)
    return this.normalCDF(z) - this.normalCDF(-z)
  }

  /**
   * Normal CDF approximation
   */
  private normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x))
    const d = 0.3989423 * Math.exp(-x * x / 2)
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
    return x > 0 ? 1 - prob : prob
  }

  /**
   * Get winner recommendation
   */
  getWinnerRecommendation(test: ABTest): {
    winner: 'control' | 'variant' | 'inconclusive'
    reason: string
    confidence: number
  } {
    const control = test.results.control
    const variant = test.results.variant

    // Check minimum sample size
    if (control.attempts < test.minSampleSize || variant.attempts < test.minSampleSize) {
      return {
        winner: 'inconclusive',
        reason: 'Not enough data collected',
        confidence: 0,
      }
    }

    // Calculate metrics
    const controlFPRate = control.falsePositives / control.attempts
    const variantFPRate = variant.falsePositives / variant.attempts
    const fpSignificance = this.calculateSignificance(test, 'falsePositives')

    const controlBlockedRate = control.blocked / control.attempts
    const variantBlockedRate = variant.blocked / variant.attempts

    // Variant wins if: lower FP rate AND similar or better security
    if (variantFPRate < controlFPRate && fpSignificance.significant) {
      if (variantBlockedRate >= controlBlockedRate * 0.8) {
        return {
          winner: 'variant',
          reason: `${((controlFPRate - variantFPRate) * 100).toFixed(1)}% reduction in false positives with maintained security`,
          confidence: Math.min(95, (1 - fpSignificance.pValue) * 100),
        }
      }
    }

    // Control wins if variant has worse security or higher FP
    if (variantFPRate > controlFPRate && fpSignificance.significant) {
      return {
        winner: 'control',
        reason: 'Variant increased false positives',
        confidence: Math.min(95, (1 - fpSignificance.pValue) * 100),
      }
    }

    return {
      winner: 'inconclusive',
      reason: 'No statistically significant difference detected',
      confidence: 0,
    }
  }

  /**
   * Delete a test
   */
  deleteTest(testId: string): void {
    const tests = this.getTests().filter(t => t.id !== testId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests))
  }

  private createEmptyResults(): TestResults {
    return {
      attempts: 0,
      allowed: 0,
      challenged: 0,
      blocked: 0,
      falsePositives: 0,
      avgBotScore: 0,
      avgConfidence: 0,
    }
  }
}

export const abTestService = new ABTestService()
