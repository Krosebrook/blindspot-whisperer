# Progressive CAPTCHA Documentation

## Overview

BlindSpot Radar implements **Progressive CAPTCHA** to balance security with user experience. Instead of showing CAPTCHA on every authentication attempt, it only appears after detecting suspicious activity.

## How It Works

### Trigger Threshold
- **First Attempt**: No CAPTCHA shown - smooth login experience
- **Second Attempt**: No CAPTCHA shown - still giving benefit of doubt
- **Third Attempt**: CAPTCHA appears - security verification required
- **All Subsequent Attempts**: CAPTCHA required until success

### Visual Experience

When CAPTCHA triggers, users see:
1. A smooth animated transition (not jarring)
2. Clear message: "Security verification required after X failed attempts"
3. Yellow highlight box to draw attention
4. The CAPTCHA widget centered in the form

### Data Persistence

Failed attempts are tracked in **localStorage** with:
- **Key Format**: `auth_failed_{email}`
- **Data Stored**: 
  ```json
  {
    "count": 2,
    "timestamp": 1234567890
  }
  ```
- **Expiration**: 15 minutes (auto-reset)
- **Scope**: Per email address

### Reset Conditions

CAPTCHA tracking resets when:
1. **Successful Login**: Immediately clears failed attempts
2. **Time Expiration**: After 15 minutes of inactivity
3. **Mode Switch**: When toggling between sign-in/sign-up
4. **Browser Data Clear**: If user clears localStorage

## Benefits

### User Experience
✅ **No Friction for Legitimate Users**: Most users never see CAPTCHA  
✅ **Fast Login**: No delay on first attempts  
✅ **Clear Feedback**: Users understand why CAPTCHA appeared  
✅ **Forgiving**: Typos don't immediately trigger verification

### Security
✅ **Brute Force Protection**: Activates before damage is done  
✅ **Bot Detection**: Automated attacks hit CAPTCHA wall quickly  
✅ **Layered Defense**: Works alongside rate limiting  
✅ **No Bypass**: Can't skip CAPTCHA once triggered

## Technical Implementation

### Client-Side Tracking
```typescript
// Check failed attempts for email
const checkFailedAttempts = (email: string) => {
  const storageKey = `auth_failed_${email}`
  const stored = localStorage.getItem(storageKey)
  
  if (stored) {
    const { count, timestamp } = JSON.parse(stored)
    // Reset if older than 15 minutes
    if (Date.now() - timestamp > 15 * 60 * 1000) {
      localStorage.removeItem(storageKey)
      setShowCaptcha(false)
    } else {
      setShowCaptcha(count >= 2)
    }
  }
}
```

### Automatic Tracking
- Email input field monitors for changes
- Failed login automatically increments counter
- Successful login immediately clears counter
- All tracking happens transparently

## Monitoring

### Check User's Failed Attempts

Users can see their own status by checking localStorage in browser DevTools:
```javascript
// In browser console
Object.keys(localStorage)
  .filter(key => key.startsWith('auth_failed_'))
  .forEach(key => {
    console.log(key, localStorage.getItem(key))
  })
```

### Analytics Considerations

Track CAPTCHA effectiveness:
- % of logins that trigger CAPTCHA
- Average failed attempts before success
- CAPTCHA solve rate
- Time to complete CAPTCHA

## Configuration

### Adjusting Threshold

To change when CAPTCHA appears, modify the condition in `AuthForm.tsx`:

```typescript
// Current: Show after 2 failed attempts
setShowCaptcha(count >= 2)

// More lenient: Show after 3 failed attempts
setShowCaptcha(count >= 3)

// More strict: Show after 1 failed attempt
setShowCaptcha(count >= 1)
```

### Adjusting Expiration

To change the 15-minute expiration window:

```typescript
// Current: 15 minutes
if (Date.now() - timestamp > 15 * 60 * 1000) {

// Shorter: 5 minutes
if (Date.now() - timestamp > 5 * 60 * 1000) {

// Longer: 30 minutes
if (Date.now() - timestamp > 30 * 60 * 1000) {
```

## Edge Cases

### Multiple Browser Tabs
- Each tab tracks independently
- One tab's success doesn't affect others
- User may see CAPTCHA in one tab but not another

### Incognito/Private Mode
- No localStorage between sessions
- Each session starts fresh
- More lenient for privacy-focused users

### Shared Computers
- Each email tracked separately
- One user's failures don't affect another
- Good for public computers

### Browser Data Clearing
- Resets all tracking
- User starts fresh after clearing data
- Expected behavior, not a bug

## Comparison: Progressive vs Always-On

| Aspect | Progressive CAPTCHA | Always-On CAPTCHA |
|--------|-------------------|-------------------|
| First Login | ✅ Smooth & Fast | ❌ Delayed by CAPTCHA |
| Legitimate User | ✅ Rarely sees CAPTCHA | ❌ Always sees CAPTCHA |
| Bot Protection | ✅ Activates quickly | ✅ Immediate |
| User Friction | ✅ Minimal | ❌ High |
| False Positives | ✅ Forgiving | ❌ Punishes typos |
| Mobile UX | ✅ Better | ❌ Frustrating |

## Recommendations

### When to Use Progressive CAPTCHA
✅ Consumer-facing applications  
✅ High-traffic public sites  
✅ Apps with legitimate retry scenarios  
✅ Mobile-first applications

### When to Consider Always-On CAPTCHA
⚠️ High-value target applications  
⚠️ Known to be under active attack  
⚠️ Compliance requirements  
⚠️ Enterprise security policies

## Testing

### Test Progressive Trigger

1. Navigate to sign-in form
2. Enter valid email
3. Enter wrong password - submit (no CAPTCHA)
4. Enter wrong password again - submit (no CAPTCHA)
5. Enter wrong password third time - **CAPTCHA appears!**
6. Complete CAPTCHA and enter correct password - success
7. Sign out and try again - no CAPTCHA (counter reset)

### Test Time Expiration

1. Trigger CAPTCHA (3 failed attempts)
2. Wait 15 minutes
3. Return to form with same email
4. CAPTCHA should not appear (expired)

### Test Email Isolation

1. Fail 3 times with email A (CAPTCHA appears)
2. Switch to email B
3. No CAPTCHA for email B (separate tracking)

## Troubleshooting

### CAPTCHA Always Shows
- Check if threshold is set too low (< 2)
- Verify localStorage isn't being cleared automatically
- Check browser console for errors

### CAPTCHA Never Shows
- Verify CAPTCHA site key is configured
- Check if `showCaptcha` state updates correctly
- Confirm failed attempts are being tracked

### CAPTCHA Doesn't Clear After Success
- Verify `clearFailedAttempts()` is called on success
- Check localStorage in DevTools
- Ensure email matches exactly (case-sensitive)

## Future Enhancements

Potential improvements:
- **IP-based tracking**: Complement email-based tracking
- **Behavioral analysis**: ML-based bot detection
- **Adaptive threshold**: Adjust based on threat level
- **Silent verification**: Invisible CAPTCHA for legitimate users
- **Biometric fallback**: FaceID/TouchID as CAPTCHA alternative
