import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, db } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: AuthError }>
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>
  signOut: () => Promise<{ error?: AuthError }>
  updateProfile: (updates: any) => Promise<{ error?: any }>
  refreshProfile: () => Promise<void>
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
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }

        // Handle different auth events
        if (event === 'SIGNED_OUT') {
          setProfile(null)
        }

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', session.user.email)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await db.getProfile(userId)
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error loading profile:', error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Unexpected error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata = {}) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        console.error('Sign up error:', error)
        return { error }
      }

      if (data.user && !data.session) {
        // Email confirmation required
        return { error: null }
      }

      return { error: null }
    } catch (error) {
      console.error('Unexpected sign up error:', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Sign in error:', error)
        return { error }
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
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    try {
      const { data, error } = await db.updateProfile(user.id, updates)
      
      if (error) {
        console.error('Profile update error:', error)
        return { error }
      }

      setProfile(data)
      return { error: null }
    } catch (error) {
      console.error('Unexpected profile update error:', error)
      return { error }
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    await loadProfile(user.id)
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
    refreshProfile
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
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