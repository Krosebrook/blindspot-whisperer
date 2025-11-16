import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { AlertCircle, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from './AuthProvider'
import HCaptcha from '@hcaptcha/react-hcaptcha'

interface AuthFormProps {
  mode?: 'signin' | 'signup'
  onSuccess?: () => void
  className?: string
}

export default function AuthForm({ mode = 'signin', onSuccess, className = '' }: AuthFormProps) {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(mode === 'signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const captchaRef = useRef<HCaptcha>(null)

  const { signIn, signUp } = useAuth()
  
  const captchaSiteKey = import.meta.env.VITE_CAPTCHA_SITE_KEY

  // Check failed attempts from localStorage on email change
  const checkFailedAttempts = (checkEmail: string) => {
    if (!checkEmail) return
    
    const storageKey = `auth_failed_${checkEmail}`
    const stored = localStorage.getItem(storageKey)
    
    if (stored) {
      const { count, timestamp } = JSON.parse(stored)
      // Reset if older than 15 minutes
      if (Date.now() - timestamp > 15 * 60 * 1000) {
        localStorage.removeItem(storageKey)
        setFailedAttempts(0)
        setShowCaptcha(false)
      } else {
        setFailedAttempts(count)
        // Show CAPTCHA after 2 failed attempts
        setShowCaptcha(count >= 2)
      }
    } else {
      setFailedAttempts(0)
      setShowCaptcha(false)
    }
  }

  // Track failed attempt
  const trackFailedAttempt = (attemptEmail: string) => {
    const storageKey = `auth_failed_${attemptEmail}`
    const newCount = failedAttempts + 1
    
    localStorage.setItem(storageKey, JSON.stringify({
      count: newCount,
      timestamp: Date.now()
    }))
    
    setFailedAttempts(newCount)
    
    // Show CAPTCHA after 2 failed attempts
    if (newCount >= 2) {
      setShowCaptcha(true)
    }
  }

  // Clear failed attempts on success
  const clearFailedAttempts = (attemptEmail: string) => {
    const storageKey = `auth_failed_${attemptEmail}`
    localStorage.removeItem(storageKey)
    setFailedAttempts(0)
    setShowCaptcha(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!email || !password) {
      setError('Please fill in all required fields')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    // CAPTCHA validation (only if CAPTCHA is shown and configured)
    if (captchaSiteKey && showCaptcha && !captchaToken) {
      setError('Please complete the CAPTCHA verification')
      return
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
      
      if (!fullName.trim()) {
        setError('Please enter your full name')
        return
      }
    }

    setIsLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, {
          full_name: fullName.trim(),
          ...(captchaToken && { captchaToken })
        })

        if (error) {
          if (error.message.includes('already registered')) {
            setError('An account with this email already exists')
          } else if (error.message.includes('email')) {
            setSuccess('Please check your email and click the confirmation link to complete signup')
          } else {
            setError(error.message)
          }
          // Reset captcha on error
          captchaRef.current?.resetCaptcha()
          setCaptchaToken(null)
          trackFailedAttempt(email)
        } else {
          setSuccess('Account created successfully! Please check your email for confirmation.')
          clearFailedAttempts(email)
          if (onSuccess) onSuccess()
        }
      } else {
        const { error } = await signIn(email, password, captchaToken || undefined)

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password')
            trackFailedAttempt(email)
          } else if (error.message.includes('Too many failed')) {
            setError(error.message) // Show rate limit message
          } else {
            setError(error.message)
            trackFailedAttempt(email)
          }
          // Reset captcha on error
          captchaRef.current?.resetCaptcha()
          setCaptchaToken(null)
        } else {
          setSuccess('Signed in successfully!')
          clearFailedAttempts(email)
          if (onSuccess) onSuccess()
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('Something went wrong. Please try again.')
      trackFailedAttempt(email)
      // Reset captcha on error
      captchaRef.current?.resetCaptcha()
      setCaptchaToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setSuccess('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFullName('')
    setCaptchaToken(null)
    setShowCaptcha(false)
    setFailedAttempts(0)
    captchaRef.current?.resetCaptcha()
  }

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Sign up to start analyzing your business blind spots'
                : 'Sign in to access your dashboard'
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <p className="text-sm text-green-800">{success}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      disabled={isLoading}
                      className="pl-3"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      // Check failed attempts when email changes
                      if (e.target.value.includes('@')) {
                        checkFailedAttempts(e.target.value)
                      }
                    }}
                    onBlur={() => {
                      // Check again on blur to ensure we catch paste events
                      if (email.includes('@')) {
                        checkFailedAttempts(email)
                      }
                    }}
                    placeholder="you@example.com"
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {/* Progressive CAPTCHA - Only shown after 2 failed attempts */}
              {captchaSiteKey && showCaptcha && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <div className="flex justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="space-y-2">
                      <p className="text-sm text-yellow-800 text-center">
                        Security verification required after {failedAttempts} failed {failedAttempts === 1 ? 'attempt' : 'attempts'}
                      </p>
                      <HCaptcha
                        ref={captchaRef}
                        sitekey={captchaSiteKey}
                        onVerify={(token) => setCaptchaToken(token)}
                        onExpire={() => setCaptchaToken(null)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>

              {!isSignUp && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/reset-password')}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              {' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
