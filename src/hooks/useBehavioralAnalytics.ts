import { useState, useEffect, useRef, useCallback } from 'react'
import { abTestService } from '@/lib/abTestService'

interface BehavioralData {
  mouseMovements: number
  mouseVelocity: number[]
  keystrokes: number
  typingSpeed: number[]
  pasteEvents: number
  clickCount: number
  timeOnForm: number
  interactionGaps: number[]
  suspiciousPatterns: string[]
}

interface BotScore {
  score: number // 0-100, higher = more likely bot
  confidence: number // 0-100, confidence in the score
  triggers: string[]
  recommendation: 'allow' | 'challenge' | 'block'
}

export function useBehavioralAnalytics() {
  const [isTracking, setIsTracking] = useState(false)
  const [botScore, setBotScore] = useState<BotScore | null>(null)
  
  const dataRef = useRef<BehavioralData>({
    mouseMovements: 0,
    mouseVelocity: [],
    keystrokes: 0,
    typingSpeed: [],
    pasteEvents: 0,
    clickCount: 0,
    timeOnForm: 0,
    interactionGaps: [],
    suspiciousPatterns: []
  })
  
  const lastMouseTime = useRef<number>(0)
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const lastKeyTime = useRef<number>(0)
  const lastInteractionTime = useRef<number>(0)
  const startTime = useRef<number>(0)

  // Calculate bot probability score
  const calculateBotScore = useCallback((): BotScore => {
    const data = dataRef.current
    const triggers: string[] = []
    let score = 0
    let confidence = 0

    // Check 1: Mouse movement analysis
    if (data.mouseMovements < 5) {
      score += 30
      triggers.push('Minimal mouse movement')
      confidence += 15
    } else if (data.mouseMovements < 20) {
      score += 15
      triggers.push('Low mouse activity')
      confidence += 10
    }

    // Check 2: Mouse velocity consistency (bots move in straight lines)
    if (data.mouseVelocity.length > 3) {
      const velocityStdDev = calculateStdDev(data.mouseVelocity)
      if (velocityStdDev < 50) {
        score += 25
        triggers.push('Robotic mouse movements')
        confidence += 20
      }
    }

    // Check 3: Paste events (bots often paste credentials)
    if (data.pasteEvents > 0) {
      score += 20
      triggers.push(`${data.pasteEvents} paste event(s) detected`)
      confidence += 15
    }

    // Check 4: Typing speed analysis
    if (data.typingSpeed.length > 3) {
      const avgTypingSpeed = data.typingSpeed.reduce((a, b) => a + b, 0) / data.typingSpeed.length
      const typingStdDev = calculateStdDev(data.typingSpeed)
      
      // Unnaturally fast typing
      if (avgTypingSpeed < 50) {
        score += 20
        triggers.push('Extremely fast typing')
        confidence += 15
      }
      
      // Unnaturally consistent typing (humans vary)
      if (typingStdDev < 10) {
        score += 15
        triggers.push('Robotic typing pattern')
        confidence += 10
      }
    }

    // Check 5: Interaction timing
    if (data.interactionGaps.length > 2) {
      const avgGap = data.interactionGaps.reduce((a, b) => a + b, 0) / data.interactionGaps.length
      const gapStdDev = calculateStdDev(data.interactionGaps)
      
      // Too consistent = bot
      if (gapStdDev < 100) {
        score += 15
        triggers.push('Suspiciously consistent timing')
        confidence += 10
      }
      
      // Too fast = bot
      if (avgGap < 500) {
        score += 10
        triggers.push('Unnaturally fast interactions')
        confidence += 5
      }
    }

    // Check 6: Time on form (too fast = bot)
    if (data.timeOnForm < 3000) {
      score += 20
      triggers.push('Form filled too quickly')
      confidence += 15
    }

    // Check 7: Zero clicks but form submission attempt
    if (data.clickCount === 0 && data.keystrokes > 0) {
      score += 10
      triggers.push('No mouse clicks detected')
      confidence += 5
    }

    // Normalize confidence (max 100)
    confidence = Math.min(confidence, 100)

    // Determine recommendation
    let recommendation: 'allow' | 'challenge' | 'block'
    if (score >= 60) {
      recommendation = 'block'
    } else if (score >= 35) {
      recommendation = 'challenge'
    } else {
      recommendation = 'allow'
    }

    return { score, confidence, triggers, recommendation }
  }, [])

  // Track mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isTracking) return

    const now = Date.now()
    const timeDiff = now - lastMouseTime.current
    
    if (timeDiff > 0) {
      const dx = e.clientX - lastMousePos.current.x
      const dy = e.clientY - lastMousePos.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const velocity = distance / timeDiff

      dataRef.current.mouseMovements++
      dataRef.current.mouseVelocity.push(velocity)
      
      // Keep only last 50 measurements
      if (dataRef.current.mouseVelocity.length > 50) {
        dataRef.current.mouseVelocity.shift()
      }
    }

    lastMouseTime.current = now
    lastMousePos.current = { x: e.clientX, y: e.clientY }
    lastInteractionTime.current = now
  }, [isTracking])

  // Track keystrokes
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isTracking) return

    const now = Date.now()
    const timeSinceLastKey = now - lastKeyTime.current

    if (lastKeyTime.current > 0) {
      dataRef.current.typingSpeed.push(timeSinceLastKey)
      
      // Keep only last 30 measurements
      if (dataRef.current.typingSpeed.length > 30) {
        dataRef.current.typingSpeed.shift()
      }
    }

    dataRef.current.keystrokes++
    lastKeyTime.current = now
    
    // Track interaction gaps
    if (lastInteractionTime.current > 0) {
      const gap = now - lastInteractionTime.current
      dataRef.current.interactionGaps.push(gap)
      
      if (dataRef.current.interactionGaps.length > 20) {
        dataRef.current.interactionGaps.shift()
      }
    }
    
    lastInteractionTime.current = now
  }, [isTracking])

  // Track paste events
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!isTracking) return
    dataRef.current.pasteEvents++
    dataRef.current.suspiciousPatterns.push('paste')
  }, [isTracking])

  // Track clicks
  const handleClick = useCallback((e: MouseEvent) => {
    if (!isTracking) return
    dataRef.current.clickCount++
    
    const now = Date.now()
    if (lastInteractionTime.current > 0) {
      const gap = now - lastInteractionTime.current
      dataRef.current.interactionGaps.push(gap)
      
      if (dataRef.current.interactionGaps.length > 20) {
        dataRef.current.interactionGaps.shift()
      }
    }
    
    lastInteractionTime.current = now
  }, [isTracking])

  // Start tracking
  const startTracking = useCallback(() => {
    if (isTracking) return

    // Reset data
    dataRef.current = {
      mouseMovements: 0,
      mouseVelocity: [],
      keystrokes: 0,
      typingSpeed: [],
      pasteEvents: 0,
      clickCount: 0,
      timeOnForm: 0,
      interactionGaps: [],
      suspiciousPatterns: []
    }
    
    startTime.current = Date.now()
    lastInteractionTime.current = Date.now()
    setIsTracking(true)
    setBotScore(null)

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('paste', handlePaste)
    document.addEventListener('click', handleClick)
  }, [isTracking, handleMouseMove, handleKeyDown, handlePaste, handleClick])

  // Stop tracking and calculate score
  const stopTracking = useCallback(() => {
    if (!isTracking) return

    // Calculate time on form
    dataRef.current.timeOnForm = Date.now() - startTime.current

    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('paste', handlePaste)
    document.removeEventListener('click', handleClick)

    setIsTracking(false)

    // Calculate and return bot score
    const score = calculateBotScore()
    setBotScore(score)
    
    // Record to analytics and A/B test
    if (typeof window !== 'undefined' && score) {
      import('@/lib/botAnalyticsService').then(({ botAnalyticsService }) => {
        botAnalyticsService.recordAttempt(
          score.score,
          score.confidence,
          score.triggers,
          score.recommendation
        )
      })

      // Record to A/B test if active
      const activeTest = abTestService.getActiveTest()
      if (activeTest) {
        const assignment = abTestService.assignVariant(activeTest.id)
        if (assignment) {
          abTestService.recordResult(
            activeTest.id,
            assignment.variant,
            score.score,
            score.confidence,
            score.recommendation,
            false
          )
        }
      }
    }
    
    return score
  }, [isTracking, handleMouseMove, handleKeyDown, handlePaste, handleClick, calculateBotScore])

  // Get current score without stopping
  const getCurrentScore = useCallback(() => {
    if (!isTracking) return null
    dataRef.current.timeOnForm = Date.now() - startTime.current
    return calculateBotScore()
  }, [isTracking, calculateBotScore])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isTracking) {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('paste', handlePaste)
        document.removeEventListener('click', handleClick)
      }
    }
  }, [isTracking, handleMouseMove, handleKeyDown, handlePaste, handleClick])

  return {
    isTracking,
    botScore,
    startTracking,
    stopTracking,
    getCurrentScore,
    behavioralData: dataRef.current
  }
}

// Utility: Calculate standard deviation
function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const squareDiffs = values.map(value => Math.pow(value - avg, 2))
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length
  return Math.sqrt(avgSquareDiff)
}
