# Behavioral Analytics Documentation

## Overview

BlindSpot Radar implements **advanced behavioral analytics** to detect bot activity before requiring CAPTCHA verification. The system monitors user interactions in real-time and calculates a "bot probability score" based on multiple behavioral signals.

## How It Works

### Real-Time Monitoring

The system tracks user behavior from the moment they land on the authentication form:

1. **Mouse Movements**
   - Number of movements
   - Movement velocity patterns
   - Trajectory consistency (humans are erratic, bots are linear)

2. **Typing Patterns**
   - Keystroke timing
   - Typing speed consistency
   - Inter-key delays
   - Natural variation (humans vary, bots are consistent)

3. **Interaction Timing**
   - Time between interactions
   - Form completion speed
   - Click patterns
   - Paste event detection

4. **Engagement Metrics**
   - Total time on form
   - Click count
   - Mouse activity level
   - Overall interaction richness

### Bot Score Calculation

The system calculates a bot probability score (0-100) with the following thresholds:

- **0-34**: Normal behavior → Allow without CAPTCHA
- **35-59**: Suspicious behavior → Challenge with CAPTCHA
- **60-100**: Bot-like behavior → Block submission

Each behavioral signal contributes to the score:

| Signal | Max Points | Trigger Condition |
|--------|-----------|-------------------|
| Minimal mouse movement | 30 | < 5 movements |
| Robotic mouse velocity | 25 | Very consistent speed |
| Paste events | 20 | Any paste detected |
| Fast typing | 20 | < 50ms per keystroke |
| Consistent typing | 15 | Very uniform timing |
| Consistent interaction gaps | 15 | Robot-like rhythm |
| Fast form completion | 20 | < 3 seconds |
| No clicks | 10 | Zero mouse clicks |

### Confidence Score

In addition to the bot score, the system calculates a **confidence level** (0-100) indicating how reliable the detection is:

- Higher confidence means more data points collected
- Low confidence scores are treated more leniently
- More interactions = higher confidence = more accurate detection

## Detection Strategies

### 1. Velocity Pattern Analysis

**Human Behavior:**
- Variable mouse speed
- Acceleration and deceleration
- Natural curves and pauses

**Bot Behavior:**
- Constant velocity
- Straight-line movements
- No natural variation

**Detection:**
```typescript
const velocityStdDev = calculateStdDev(mouseVelocity)
if (velocityStdDev < 50) {
  // Very consistent = likely bot
  score += 25
}
```

### 2. Typing Rhythm Detection

**Human Behavior:**
- Variable key press timing
- Natural pauses
- Mistakes and corrections

**Bot Behavior:**
- Uniform keystroke intervals
- No variation
- Instant form filling

**Detection:**
```typescript
const typingStdDev = calculateStdDev(typingSpeed)
if (typingStdDev < 10) {
  // Too consistent = likely bot
  score += 15
}
```

### 3. Paste Detection

**Human Behavior:**
- Typically type passwords
- May paste username/email

**Bot Behavior:**
- Almost always paste credentials
- Multiple paste events

**Detection:**
```typescript
if (pasteEvents > 0) {
  score += 20 // Suspicious
}
```

### 4. Time-Based Analysis

**Human Behavior:**
- Takes time to read, think, type
- Natural delays between fields
- 5-30 seconds typical

**Bot Behavior:**
- Instant form completion
- < 3 seconds total time
- No hesitation

**Detection:**
```typescript
if (timeOnForm < 3000) {
  score += 20 // Too fast
}
```

## Integration with Authentication

### Progressive Defense Layers

The system implements multiple defense layers:

1. **Behavioral Monitoring** (Always active)
   - Silent background tracking
   - Real-time score calculation
   - No user friction

2. **Progressive CAPTCHA** (Triggered at 35+ score OR 2 failed attempts)
   - Visual verification required
   - Smooth UI transition
   - Clear explanation

3. **Rate Limiting** (5 failed attempts in 15 min)
   - IP and email tracking
   - 30-minute block
   - Server-side enforcement

4. **Hard Block** (60+ bot score)
   - Immediate rejection
   - Manual review required
   - Contact support message

### Trigger Priority

The system uses the following priority:

```
IF bot_score >= 60 → BLOCK (highest priority)
ELSE IF bot_score >= 35 → FORCE CAPTCHA
ELSE IF failed_attempts >= 2 → SHOW CAPTCHA
ELSE → ALLOW (smooth experience)
```

## Implementation Details

### Client-Side Hook

```typescript
const {
  isTracking,      // Currently monitoring?
  botScore,        // Latest calculated score
  startTracking,   // Begin monitoring
  stopTracking,    // End monitoring & calculate
  getCurrentScore, // Get score without stopping
} = useBehavioralAnalytics()
```

### Usage in Auth Form

```typescript
// Start tracking on mount
useEffect(() => {
  startTracking()
  return () => stopTracking()
}, [])

// Check score before submission
const handleSubmit = async (e) => {
  const currentScore = getCurrentScore()
  
  if (currentScore?.recommendation === 'block') {
    setError('Suspicious activity detected')
    return
  }
  
  if (currentScore?.recommendation === 'challenge') {
    setShowCaptcha(true)
    return
  }
  
  // Proceed with authentication...
}
```

## Privacy Considerations

### Data Collection

**What We Track:**
- Mouse movement counts and velocity patterns
- Keystroke timing (NOT content)
- Interaction timestamps
- Click counts

**What We DON'T Track:**
- Actual keystrokes or passwords
- Mouse position coordinates
- Personal information
- Data beyond the auth form

**Storage:**
- Data stored only in memory (not persisted)
- Cleared after form submission
- No server-side behavioral data storage
- No cross-session tracking

### Compliance

- **GDPR**: No PII collected, minimal behavioral data
- **CCPA**: No sale of behavioral data
- **Disclosure**: Users informed via privacy policy

## Monitoring & Analytics

### Development Mode

In development, bot scores are visible in the UI:

```typescript
{process.env.NODE_ENV === 'development' && botScore && (
  <div>
    Bot Score: {botScore.score}/100
    Triggers: {botScore.triggers.join(', ')}
  </div>
)}
```

### Production Analytics

Track the following metrics:

1. **Bot Detection Rate**
   - % of submissions flagged as suspicious
   - False positive rate
   - True positive rate (confirmed bots)

2. **User Impact**
   - % of users seeing CAPTCHA
   - % blocked vs challenged
   - Conversion rate impact

3. **Score Distribution**
   - Average bot scores over time
   - Score histogram
   - Trigger frequency

### Logging

Bot scores are logged to console for debugging:

```typescript
console.log('[Behavioral Analytics] Bot Score:', currentScore)
```

In production, consider logging to analytics service:
```typescript
analytics.track('bot_score_calculated', {
  score: currentScore.score,
  confidence: currentScore.confidence,
  recommendation: currentScore.recommendation,
  triggers: currentScore.triggers
})
```

## Tuning & Optimization

### Adjusting Sensitivity

To make detection more lenient:

```typescript
// Increase thresholds in useBehavioralAnalytics.ts

// Current: Block at 60
if (score >= 60) recommendation = 'block'

// More lenient: Block at 75
if (score >= 75) recommendation = 'block'
```

To make detection stricter:

```typescript
// Current: Challenge at 35
if (score >= 35) recommendation = 'challenge'

// Stricter: Challenge at 25
if (score >= 25) recommendation = 'challenge'
```

### Adjusting Individual Signals

Each detection rule can be tuned:

```typescript
// Current: Paste adds 20 points
if (pasteEvents > 0) score += 20

// More lenient: Paste adds 10 points
if (pasteEvents > 0) score += 10

// Stricter: Paste adds 30 points
if (pasteEvents > 0) score += 30
```

### A/B Testing

Consider testing different threshold configurations:

```typescript
// Variant A: Lenient (fewer CAPTCHA challenges)
const THRESHOLDS_A = { challenge: 45, block: 70 }

// Variant B: Strict (more aggressive bot blocking)
const THRESHOLDS_B = { challenge: 30, block: 55 }
```

## Common Patterns

### Legitimate Users

Typical score: **5-25**

Characteristics:
- Natural mouse movements (50+ movements)
- Variable typing speed (100-300ms per key)
- Normal form completion time (5-20 seconds)
- Few to no paste events
- Active mouse engagement

### Basic Bots

Typical score: **40-60**

Characteristics:
- Linear mouse movements
- Consistent typing rhythm
- Fast completion (< 3 seconds)
- Paste events common
- Minimal mouse activity

### Sophisticated Bots

Typical score: **20-40**

Characteristics:
- Randomized delays added
- Some mouse movement simulation
- Slower completion times
- Still detectable via:
  - Velocity consistency
  - Unnatural timing patterns
  - Lack of correction/mistakes

## Evasion Prevention

### Anti-Detection Measures

Bots may attempt to evade detection by:

1. **Adding Random Delays** → We check for consistency patterns
2. **Simulating Mouse Movement** → We analyze velocity consistency
3. **Typing Character-by-Character** → We check timing variation
4. **Using Human-Like Speeds** → We use multiple signals together

### Counter-Measures

1. **Multiple Signal Analysis**: No single signal determines the score
2. **Statistical Analysis**: We look for unnatural consistency patterns
3. **Confidence Weighting**: More data = more confidence = harder to fake
4. **Layered Defense**: Behavioral analytics + CAPTCHA + rate limiting

## Future Enhancements

### Potential Improvements

1. **Machine Learning Model**
   - Train on real user vs bot data
   - Improve detection accuracy
   - Adapt to new bot patterns

2. **Cross-Session Learning**
   - Track patterns across multiple attempts
   - Build reputation scores
   - Identify persistent attackers

3. **Biometric Signals**
   - Touch pressure (mobile)
   - Gyroscope data (mobile)
   - Multi-touch patterns

4. **Invisible Challenges**
   - Background verification tasks
   - Prove humanity without friction
   - Canvas fingerprinting

5. **Network Analysis**
   - IP reputation scoring
   - VPN/proxy detection
   - ASN analysis

## Troubleshooting

### High False Positive Rate

If legitimate users are being challenged too often:

1. **Lower thresholds**: Increase challenge/block scores
2. **Reduce paste penalty**: Many users paste legitimate emails
3. **Increase time allowance**: Some users read carefully
4. **Check mouse tracking**: Ensure it works across devices

### Bots Getting Through

If bots are bypassing detection:

1. **Lower thresholds**: Decrease challenge/block scores
2. **Add new signals**: Detect specific bot patterns
3. **Enable logging**: Analyze bot behavior patterns
4. **Combine with CAPTCHA**: Don't rely solely on behavioral analytics

### Mobile Issues

Mobile users may score higher due to:
- Less mouse movement (touch only)
- Different interaction patterns
- Paste behavior more common

**Solution**: Adjust detection for touch devices:

```typescript
const isTouchDevice = 'ontouchstart' in window
if (isTouchDevice) {
  // Reduce mouse movement penalty
  if (mouseMovements < 5) score += 10 // instead of 30
}
```

## Best Practices

1. ✅ **Always combine with other security measures** (CAPTCHA, rate limiting)
2. ✅ **Monitor false positive rates** regularly
3. ✅ **Provide clear feedback** when users are challenged
4. ✅ **Respect privacy** - don't store PII
5. ✅ **Test across devices** (desktop, mobile, tablet)
6. ✅ **Log bot scores** for continuous improvement
7. ✅ **Update thresholds** based on real-world data
8. ✅ **Have a support channel** for false positives

## Conclusion

Behavioral analytics provides a **silent, friction-free first line of defense** against bots. When combined with progressive CAPTCHA and rate limiting, it creates a comprehensive security system that protects against automated attacks while maintaining excellent user experience for legitimate users.

The key is balancing security and UX - too strict and you frustrate users, too lenient and bots get through. Monitor, adjust, and iterate based on real-world data.
