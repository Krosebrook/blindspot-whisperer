# Rate Limiting Documentation

## Overview

BlindSpot Radar implements comprehensive rate limiting to prevent brute force attacks on authentication endpoints. The system tracks authentication attempts and blocks suspicious activity based on IP address and email.

## Rate Limit Configuration

Current limits per action:

### Sign In
- **Max Attempts**: 5 failed attempts
- **Time Window**: 15 minutes
- **Block Duration**: 30 minutes

### Sign Up
- **Max Attempts**: 3 failed attempts
- **Time Window**: 60 minutes
- **Block Duration**: 60 minutes

### Password Reset
- **Max Attempts**: 3 failed attempts
- **Time Window**: 60 minutes
- **Block Duration**: 60 minutes

## How It Works

1. **Attempt Tracking**: Every authentication attempt (success or failure) is logged in the `auth_attempts` table with:
   - IP address
   - Email (if provided)
   - Attempt type (signin/signup/reset_password)
   - Success status
   - User agent
   - Timestamp

2. **Rate Limit Checks**: Before processing any auth request, the system checks:
   - **IP-based limits**: Total failed attempts from the same IP
   - **Email-based limits**: Total failed attempts for the same email

3. **Blocking**: If limits are exceeded, the request is blocked with:
   - HTTP 429 (Too Many Requests) status
   - Clear error message indicating when to retry
   - Retry-After header with seconds until unblock

## Monitoring

### View Recent Auth Attempts

```sql
-- Recent failed attempts
SELECT 
  ip_address,
  email,
  attempt_type,
  COUNT(*) as attempts,
  MAX(created_at) as last_attempt
FROM auth_attempts
WHERE 
  success = false 
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address, email, attempt_type
ORDER BY attempts DESC;
```

### Check Blocked IPs

```sql
-- IPs currently blocked (assuming 5 failures in 15 min)
SELECT 
  ip_address,
  COUNT(*) as failed_attempts,
  MIN(created_at) as first_attempt,
  MAX(created_at) as last_attempt,
  MAX(created_at) + INTERVAL '30 minutes' as blocked_until
FROM auth_attempts
WHERE 
  success = false 
  AND attempt_type = 'signin'
  AND created_at > NOW() - INTERVAL '15 minutes'
GROUP BY ip_address
HAVING COUNT(*) >= 5;
```

### Audit Trail

```sql
-- Full audit trail for a specific email
SELECT 
  created_at,
  ip_address,
  attempt_type,
  success,
  user_agent
FROM auth_attempts
WHERE email = 'user@example.com'
ORDER BY created_at DESC
LIMIT 50;
```

## Maintenance

### Automatic Cleanup

The system automatically keeps auth attempts for 7 days. Older records are purged by the `cleanup_old_auth_attempts()` function.

### Manual Cleanup

To manually clean up old attempts:

```sql
SELECT cleanup_old_auth_attempts();
```

### Unblock a User/IP

If you need to manually unblock a legitimate user:

```sql
-- Delete failed attempts for specific email
DELETE FROM auth_attempts 
WHERE email = 'user@example.com' 
AND success = false;

-- Delete failed attempts for specific IP
DELETE FROM auth_attempts 
WHERE ip_address = '192.168.1.1' 
AND success = false;
```

## Adjusting Rate Limits

To modify rate limits, edit the `RATE_LIMITS` configuration in `supabase/functions/rate-limited-auth/index.ts`:

```typescript
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  signin: { 
    maxAttempts: 5,           // Max failed attempts
    windowMinutes: 15,         // Time window to count attempts
    blockDurationMinutes: 30   // How long to block after exceeding
  },
  // ... other actions
}
```

After making changes, the edge function will automatically redeploy.

## Security Considerations

1. **Layered Protection**: Rate limiting works alongside CAPTCHA for comprehensive protection
2. **Privacy**: IP addresses and user agents are logged for security but should be handled according to privacy regulations
3. **Legitimate Users**: Limits are set to not impact legitimate users while blocking attacks
4. **Fail Open**: If rate limit checks fail (e.g., database error), requests are allowed to maintain availability

## Testing

### Test Rate Limiting Locally

1. Make 5 failed sign-in attempts with wrong password
2. Verify 6th attempt is blocked with proper error message
3. Check `auth_attempts` table for logged attempts

### Verify Block Duration

1. Trigger rate limit
2. Wait for block duration to expire
3. Verify next attempt is allowed

## Alerts & Monitoring

Consider setting up alerts for:
- High number of failed attempts from single IP (potential attack)
- Unusual patterns in auth attempts
- Rate limit blocks (may indicate ongoing attack)

You can query Supabase Analytics or set up custom monitoring using the `auth_attempts` table.
