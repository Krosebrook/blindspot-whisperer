import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateLimitConfig {
  maxAttempts: number
  windowMinutes: number
  blockDurationMinutes: number
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  signin: { maxAttempts: 5, windowMinutes: 15, blockDurationMinutes: 30 },
  signup: { maxAttempts: 3, windowMinutes: 60, blockDurationMinutes: 60 },
  reset_password: { maxAttempts: 3, windowMinutes: 60, blockDurationMinutes: 60 }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    const { action, email, password, metadata, captchaToken } = await req.json()

    // Extract client information
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    console.log(`[Rate Limit] Action: ${action}, Email: ${email}, IP: ${ipAddress}`)

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(
      supabaseClient,
      ipAddress,
      email,
      action
    )

    if (!rateLimitCheck.allowed) {
      console.log(`[Rate Limit] BLOCKED - ${rateLimitCheck.reason}`)
      
      // Log the blocked attempt
      await logAuthAttempt(supabaseClient, {
        ip_address: ipAddress,
        email: email,
        attempt_type: action,
        success: false,
        user_agent: userAgent
      })

      return new Response(
        JSON.stringify({
          error: rateLimitCheck.reason,
          retryAfter: rateLimitCheck.retryAfter
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Proceed with authentication action
    let result
    let success = false

    switch (action) {
      case 'signin':
        result = await supabaseClient.auth.signInWithPassword({
          email,
          password,
          options: captchaToken ? { captchaToken } : undefined
        })
        success = !result.error
        break

      case 'signup':
        const redirectUrl = req.headers.get('origin') || supabaseUrl
        result = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${redirectUrl}/`,
            data: metadata || {},
            ...(captchaToken && { captchaToken })
          }
        })
        success = !result.error
        break

      case 'reset_password':
        const resetUrl = req.headers.get('origin') || supabaseUrl
        result = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: `${resetUrl}/reset-password?mode=reset`
        })
        success = !result.error
        break

      default:
        throw new Error('Invalid action')
    }

    // Log the attempt
    await logAuthAttempt(supabaseClient, {
      ip_address: ipAddress,
      email: email,
      attempt_type: action,
      success: success,
      user_agent: userAgent
    })

    console.log(`[Rate Limit] ${action} attempt - Success: ${success}`)

    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('[Rate Limit] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function checkRateLimit(
  supabaseClient: any,
  ipAddress: string,
  email: string,
  action: string
): Promise<{ allowed: boolean; reason?: string; retryAfter?: number }> {
  const config = RATE_LIMITS[action]
  if (!config) {
    return { allowed: true }
  }

  const windowStart = new Date(Date.now() - config.windowMinutes * 60 * 1000)

  // Check IP-based rate limit
  const { data: ipAttempts, error: ipError } = await supabaseClient
    .from('auth_attempts')
    .select('*')
    .eq('ip_address', ipAddress)
    .eq('attempt_type', action)
    .gte('created_at', windowStart.toISOString())
    .order('created_at', { ascending: false })

  if (ipError) {
    console.error('[Rate Limit] Error checking IP attempts:', ipError)
    // Allow request if we can't check (fail open for availability)
    return { allowed: true }
  }

  const failedIpAttempts = ipAttempts?.filter(a => !a.success) || []
  
  if (failedIpAttempts.length >= config.maxAttempts) {
    const oldestFailedAttempt = failedIpAttempts[failedIpAttempts.length - 1]
    const blockUntil = new Date(
      new Date(oldestFailedAttempt.created_at).getTime() + 
      config.blockDurationMinutes * 60 * 1000
    )
    
    if (new Date() < blockUntil) {
      const retryAfter = Math.ceil((blockUntil.getTime() - Date.now()) / 1000)
      return {
        allowed: false,
        reason: `Too many failed ${action} attempts from this IP. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
        retryAfter
      }
    }
  }

  // Check email-based rate limit (if email provided)
  if (email) {
    const { data: emailAttempts, error: emailError } = await supabaseClient
      .from('auth_attempts')
      .select('*')
      .eq('email', email)
      .eq('attempt_type', action)
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false })

    if (!emailError) {
      const failedEmailAttempts = emailAttempts?.filter(a => !a.success) || []
      
      if (failedEmailAttempts.length >= config.maxAttempts) {
        const oldestFailedAttempt = failedEmailAttempts[failedEmailAttempts.length - 1]
        const blockUntil = new Date(
          new Date(oldestFailedAttempt.created_at).getTime() + 
          config.blockDurationMinutes * 60 * 1000
        )
        
        if (new Date() < blockUntil) {
          const retryAfter = Math.ceil((blockUntil.getTime() - Date.now()) / 1000)
          return {
            allowed: false,
            reason: `Too many failed ${action} attempts for this email. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
            retryAfter
          }
        }
      }
    }
  }

  return { allowed: true }
}

async function logAuthAttempt(
  supabaseClient: any,
  attempt: {
    ip_address: string
    email: string
    attempt_type: string
    success: boolean
    user_agent: string
  }
) {
  try {
    const { error } = await supabaseClient
      .from('auth_attempts')
      .insert([attempt])

    if (error) {
      console.error('[Rate Limit] Error logging attempt:', error)
    }
  } catch (error) {
    console.error('[Rate Limit] Exception logging attempt:', error)
  }
}
