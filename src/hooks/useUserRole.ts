import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/utils/logger'

type UserRole = 'admin' | 'moderator' | 'user'

export function useUserRole() {
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserRoles()
  }, [])

  async function fetchUserRoles() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setRoles([])
        return
      }

      const { data, error: queryError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)

      if (queryError) {
        throw queryError
      }

      const userRoles = data?.map(r => r.role as UserRole) || []
      setRoles(userRoles)
      logger.info('User roles loaded', { roles: userRoles })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user roles'
      logger.error('Error fetching user roles', err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role)
  }

  const isAdmin = hasRole('admin')
  const isModerator = hasRole('moderator')

  return {
    roles,
    hasRole,
    isAdmin,
    isModerator,
    loading,
    error,
    refetch: fetchUserRoles
  }
}
