import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { db } from '@/lib/database';
import { logger } from '@/utils/logger';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  persona?: string;
  business_type?: string;
  business_description?: string;
  company_size?: string;
  industry?: string;
  experience_level?: string;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: dbError } = await db.getProfile(userId);
      
      if (dbError && dbError.code !== 'PGRST116') {
        logger.error('Error loading profile', dbError, { userId });
        setError(new Error(dbError.message));
      } else {
        setProfile(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unexpected error loading profile';
      logger.error('Unexpected error loading profile', err, { userId });
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (user: User | null, updates: Partial<Profile>) => {
    if (!user) {
      const error = new Error('No user logged in');
      setError(error);
      return { error };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await db.updateProfile(user.id, updates);
      
      if (dbError) {
        logger.error('Profile update error', dbError);
        setError(new Error(dbError.message));
        return { error: dbError };
      }

      setProfile(data);
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unexpected profile update error';
      logger.error('Unexpected profile update error', err);
      const error = new Error(errorMessage);
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async (user: User | null) => {
    if (!user) return;
    await loadProfile(user.id);
  }, [loadProfile]);

  const clearProfile = useCallback(() => {
    setProfile(null);
    setError(null);
  }, []);

  return {
    profile,
    loading,
    error,
    loadProfile,
    updateProfile,
    refreshProfile,
    clearProfile
  };
}
