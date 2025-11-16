/**
 * Authentication Service
 * Centralized authentication operations
 */

import { supabase } from '@/integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';
import { ErrorHandler } from '@/utils/errorHandler';
import { SignUpData, AuthCredentials, ApiResponse } from '@/types';

export class AuthService {
  /**
   * Sign up with rate-limited edge function
   */
  static async signUp(signUpData: SignUpData): Promise<ApiResponse<void>> {
    try {
      logger.info('Initiating user signup', { email: signUpData.email });
      
      const { data, error } = await supabase.functions.invoke('rate-limited-auth', {
        body: {
          action: 'signup',
          email: signUpData.email,
          password: signUpData.password,
          metadata: signUpData.metadata,
          captchaToken: signUpData.metadata?.captchaToken
        }
      });

      if (error) {
        return { error: ErrorHandler.handleAuthError(error) };
      }

      if (data?.error) {
        return { error: ErrorHandler.handleAuthError(data.error) };
      }

      logger.info('User signup successful', { email: signUpData.email });
      return { data: undefined };
    } catch (error) {
      logger.error('Unexpected signup error', error);
      return { error: ErrorHandler.handleAuthError(error) };
    }
  }

  /**
   * Sign in with rate-limited edge function
   */
  static async signIn(credentials: AuthCredentials, captchaToken?: string): Promise<ApiResponse<void>> {
    try {
      logger.info('Initiating user signin', { email: credentials.email });
      
      const { data, error } = await supabase.functions.invoke('rate-limited-auth', {
        body: {
          action: 'signin',
          email: credentials.email,
          password: credentials.password,
          captchaToken
        }
      });

      if (error) {
        return { error: ErrorHandler.handleAuthError(error) };
      }

      if (data?.error) {
        return { error: ErrorHandler.handleAuthError(data.error) };
      }

      logger.info('User signin successful', { email: credentials.email });
      return { data: undefined };
    } catch (error) {
      logger.error('Unexpected signin error', error);
      return { error: ErrorHandler.handleAuthError(error) };
    }
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<ApiResponse<void>> {
    try {
      logger.info('Initiating user signout');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: ErrorHandler.handleAuthError(error) };
      }

      logger.info('User signout successful');
      return { data: undefined };
    } catch (error) {
      logger.error('Unexpected signout error', error);
      return { error: ErrorHandler.handleAuthError(error) };
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<ApiResponse<void>> {
    try {
      logger.info('Initiating password reset', { email });
      
      const { data, error } = await supabase.functions.invoke('rate-limited-auth', {
        body: {
          action: 'reset_password',
          email
        }
      });

      if (error) {
        return { error: ErrorHandler.handleAuthError(error) };
      }

      if (data?.error) {
        return { error: ErrorHandler.handleAuthError(data.error) };
      }

      logger.info('Password reset email sent', { email });
      return { data: undefined };
    } catch (error) {
      logger.error('Unexpected password reset error', error);
      return { error: ErrorHandler.handleAuthError(error) };
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string): Promise<ApiResponse<void>> {
    try {
      logger.info('Initiating password update');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { error: ErrorHandler.handleAuthError(error) };
      }

      logger.info('Password updated successfully');
      return { data: undefined };
    } catch (error) {
      logger.error('Unexpected password update error', error);
      return { error: ErrorHandler.handleAuthError(error) };
    }
  }
}
