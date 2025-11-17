import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { logger } from '@/utils/logger';
import { ErrorHandler } from '@/utils/errorHandler';
import { FullPageLoader } from '@/components/ui/loading-spinner';

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: AuthError }>
  signIn: (email: string, password: string, captchaToken?: string) => Promise<{ error?: AuthError }>
  signOut: () => Promise<{ error?: AuthError }>
  updateProfile: (updates: any) => Promise<{ error?: any }>
  refreshProfile: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: AuthError }>
  updatePassword: (newPassword: string) => Promise<{ error?: AuthError }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const {
    profile,
    loadProfile,
    updateProfile: updateProfileData,
    refreshProfile: refreshProfileData,
    clearProfile
  } = useProfile()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          setTimeout(() => {
            loadProfile(session.user.id)
          }, 0)
        } else {
          clearProfile()
        }

        if (event === 'SIGNED_OUT') {
          clearProfile()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [loadProfile, clearProfile])

  const signUp = async (email: string, password: string, metadata = {}) => {
    setLoading(true);
    try {
      logger.info('User signup initiated', { email });
      
      const { data, error } = await supabase.functions.invoke('rate-limited-auth', {
        body: {
          action: 'signup',
          email,
          password,
          metadata,
          captchaToken: (metadata as any).captchaToken
        }
      });

      if (error || data?.error) {
        const appError = ErrorHandler.handleAuthError(error || data.error);
        return { error: { message: appError.message } as AuthError };
      }

      logger.info('User signup successful', { email });
      return { error: null };
    } catch (error) {
      logger.error('Unexpected sign up error', error);
      const appError = ErrorHandler.handleAuthError(error);
      return { error: appError as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string, captchaToken?: string) => {
    setLoading(true)
    try {
      // Use rate-limited edge function for signin
      const { data, error } = await supabase.functions.invoke('rate-limited-auth', {
        body: {
          action: 'signin',
          email,
          password,
          captchaToken
        }
      })

      if (error) {
        console.error('Sign in error:', error)
        return { error: { message: error.message } as AuthError }
      }

      if (data?.error) {
        console.error('Sign in error:', data.error)
        return { error: { message: data.error.message || data.error } as AuthError }
      }

      // The edge function returns the session, we need to set it
      if (data?.data?.session) {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      }

      return { error: null }
    } catch (error) {
      console.error('Unexpected sign in error:', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        return { error }
      }
      return { error: null }
    } catch (error) {
      console.error('Unexpected sign out error:', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: any) => {
    return await updateProfileData(user, updates)
  }

  const refreshProfile = async () => {
    await refreshProfileData(user)
  }

  const resetPassword = async (email: string) => {
    try {
      // Use rate-limited edge function for password reset
      const { data, error } = await supabase.functions.invoke('rate-limited-auth', {
        body: {
          action: 'reset_password',
          email
        }
      })
      
      if (error) {
        console.error('Password reset error:', error)
        return { error: { message: error.message } as AuthError }
      }

      if (data?.error) {
        console.error('Password reset error:', data.error)
        return { error: { message: data.error.message || data.error } as AuthError }
      }
      
      return { error: null }
    } catch (error) {
      console.error('Unexpected password reset error:', error)
      return { error: error as AuthError }
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) {
        console.error('Password update error:', error)
        return { error }
      }
      
      return { error: null }
    } catch (error) {
      console.error('Unexpected password update error:', error)
      return { error: error as AuthError }
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    resetPassword,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Auth guard component
interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, fallback, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <FullPageLoader />
  }

  if (requireAuth && !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Simple auth status component
export function AuthStatus() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return <div className="w-6 h-6 animate-pulse bg-gray-200 rounded"></div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-medium text-sm">
            {user.email?.[0]?.toUpperCase()}
          </span>
        </div>
        <span className="text-sm text-gray-700">{user.email}</span>
      </div>
      <button
        onClick={() => signOut()}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Sign Out
      </button>
    </div>
  )
}