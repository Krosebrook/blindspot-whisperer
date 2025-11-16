# Bot Analytics Dashboard

## Overview

The Bot Analytics Dashboard is an admin interface for monitoring, analyzing, and tuning the behavioral bot detection system. It provides real-time insights into authentication attempts, bot score distributions, false positive tracking, and threshold configuration.

## Features

### 1. **Real-Time Monitoring**
- Track all authentication attempts with detailed bot scores
- View confidence levels for each detection
- See specific triggers that contributed to bot scores
- Monitor recommendation outcomes (Allow, Challenge, Block)

### 2. **Data Visualization**

#### Score Distribution Chart
- Bar chart showing bot score distribution across 0-100 range
- Overlays false positives to identify threshold issues
- Helps visualize where legitimate users are being flagged

#### Recommendation Breakdown
- Pie chart showing distribution of Allow/Challenge/Block decisions
- Percentage and count for each category
- Color-coded for quick interpretation

#### Time Series Analysis
- Line chart tracking last 20 attempts
- Dual-axis showing both bot score and confidence
- Identifies patterns and trends over time

### 3. **Threshold Tuning**

#### Interactive Sliders
- **Challenge Threshold**: Score at which CAPTCHA is triggered (default: 35)
- **Block Threshold**: Score at which attempts are blocked (default: 60)
- Real-time preview of how changes would affect historical data

#### Impact Analysis
- Shows how many attempts would be affected by threshold changes
- Displays "Would Allow", "Would Challenge", and "Would Block" counts
- Helps make data-driven threshold adjustments

#### Recommendation Zones
- Clear visualization of score ranges and their outcomes:
  - 0 - 34: Allow (Green)
  - 35 - 59: Challenge (Yellow)
  - 60 - 100: Block (Red)

### 4. **False Positive Tracking**

#### Manual Flagging
- Admin can mark attempts as false positives
- Toggle flag on/off for each attempt
- Helps improve threshold calibration

#### False Positive Rate
- Track overall false positive rate
- Filter charts to show only false positives
- Identify patterns in misclassifications

### 5. **Detailed Attempt Log**

Each logged attempt includes:
- **Timestamp**: When the attempt occurred
- **Bot Score**: 0-100 numerical score
- **Confidence**: Detection confidence percentage
- **Recommendation**: Allow/Challenge/Block
- **Triggers**: List of specific behavioral red flags
- **False Positive Flag**: Manual override indicator

## Usage

### Accessing the Dashboard

1. Navigate to `/bot-analytics` in your application
2. Only accessible to authenticated users (protected route)
3. Best viewed on desktop for full data visualization

### Tuning Thresholds

1. Go to the **"Threshold Tuning"** tab
2. Adjust sliders based on:
   - Current false positive rate
   - User experience feedback
   - Security requirements
3. Review the "Impact Analysis" section
4. Click **"Save Thresholds"** to apply changes
5. Monitor the effect on subsequent attempts

### Analyzing False Positives

1. Go to the **"Attempt Log"** tab
2. Review attempts marked as "CHALLENGE" or "BLOCK"
3. Click **"Mark False Positive"** if a legitimate user was flagged
4. Check the **"Visualizations"** tab to see false positive distribution
5. Adjust thresholds if false positive rate exceeds 10%

### Best Practices

#### Threshold Configuration
- **Too Low (High Security)**: More false positives, frustrated users
- **Too High (High UX)**: More bots pass through, security risk
- **Balanced Approach**: Start with defaults (35/60), tune based on data

#### Monitoring Frequency
- Check dashboard weekly during initial deployment
- Monthly reviews once thresholds are stable
- Immediate review after security incidents

#### False Positive Management
- Flag false positives within 24 hours of occurrence
- Aim for false positive rate < 5%
- Consider user feedback when flagging

## Data Storage

All analytics data is stored in **localStorage**:
- Maximum 1000 attempts retained
- Automatic cleanup of old data
- Export functionality for external analysis
- Can be cleared manually via "Clear Data" button

### Storage Keys
- `bot_analytics_attempts`: Array of all recorded attempts
- `bot_analytics_thresholds`: Current threshold configuration

## API Reference

### BotAnalyticsService

```typescript
import { botAnalyticsService } from '@/lib/botAnalyticsService'

// Record a new attempt
botAnalyticsService.recordAttempt(score, confidence, triggers, recommendation)

// Get all attempts
const attempts = botAnalyticsService.getAttempts()

// Mark false positive
botAnalyticsService.markFalsePositive(attemptId, true)

// Update thresholds
botAnalyticsService.updateThresholds({ challenge: 40, block: 65 })

// Get statistics
const stats = botAnalyticsService.getStats()

// Export data
const json = botAnalyticsService.exportData()

// Clear all data
botAnalyticsService.clearAttempts()
```

## Metrics Explained

### Bot Score (0-100)
Higher score = more bot-like behavior
- 0-34: Human-like (Allow)
- 35-59: Suspicious (Challenge with CAPTCHA)
- 60-100: Bot-like (Block)

### Confidence (0-100%)
How certain the system is about the score
- < 50%: Low confidence, less data
- 50-75%: Moderate confidence
- > 75%: High confidence, reliable detection

### Triggers
Specific behavioral patterns detected:
- "Minimal mouse movement"
- "Robotic mouse movements"
- "Paste event(s) detected"
- "Extremely fast typing"
- "Robotic typing pattern"
- "Suspiciously consistent timing"
- "Form filled too quickly"
- "No mouse clicks detected"

## Troubleshooting

### High False Positive Rate (>10%)

**Symptoms**: Legitimate users frequently challenged or blocked

**Solutions**:
1. Increase both thresholds by 5-10 points
2. Review trigger sensitivity in `useBehavioralAnalytics.ts`
3. Check for accessibility users (screen readers, keyboard-only)

### Too Many Bots Getting Through

**Symptoms**: Low block rate, suspected bot activity

**Solutions**:
1. Decrease challenge threshold to catch more suspicious behavior
2. Review bot score distribution for clustering near threshold
3. Add additional behavioral checks

### Inconsistent Confidence Scores

**Symptoms**: Many attempts with confidence < 50%

**Solutions**:
1. Users may be interacting too briefly
2. Increase minimum interaction time before scoring
3. Add more behavioral signals (scroll, focus events)

## Privacy & Security

- **No PII Stored**: Only behavioral metrics, no email/IP/user data
- **Client-Side Only**: All data stored in browser localStorage
- **No Server Transmission**: Analytics data never leaves client
- **User Consent**: Consider adding notice in privacy policy

## Future Enhancements

Planned features:
- [ ] Machine learning for threshold auto-tuning
- [ ] A/B testing framework
- [ ] Export to CSV/JSON for external analysis
- [ ] Integration with Supabase for server-side storage
- [ ] Multi-tenant support with role-based access
- [ ] Automated alerts for anomalies
- [ ] Mobile-specific behavioral signals
- [ ] Integration with security monitoring tools

## Related Documentation

- [Behavioral Analytics](./BEHAVIORAL_ANALYTICS.md) - Core detection logic
- [Progressive CAPTCHA](./PROGRESSIVE_CAPTCHA.md) - CAPTCHA integration
- [Rate Limiting](./RATE_LIMITING.md) - Backend rate limits

## Support

For issues or questions:
1. Check console for JavaScript errors
2. Verify localStorage is enabled
3. Ensure user is authenticated
4. Review browser compatibility (Chrome, Firefox, Safari, Edge)
