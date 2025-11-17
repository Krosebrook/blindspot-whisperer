/**
 * Centralized Error Handling
 * Consistent error handling and user-friendly messages
 */

import { AuthError } from '@supabase/supabase-js';
import { logger } from './logger';
import { captureError } from '@/lib/sentry';

export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

export class ErrorHandler {
  /**
   * Handle authentication errors with generic user messages
   */
  static handleAuthError(error: AuthError | Error | unknown): AppError {
    logger.error('Authentication error occurred', error);

    if (error && typeof error === 'object' && 'message' in error) {
      const authError = error as AuthError;
      
      // Return generic messages to prevent enumeration
      if (authError.message?.includes('Invalid login credentials')) {
        return { message: 'Invalid email or password', code: 'AUTH_INVALID' };
      }
      
      if (authError.message?.includes('Email not confirmed')) {
        return { message: 'Please verify your email address', code: 'AUTH_UNVERIFIED' };
      }
      
      if (authError.message?.includes('User already registered')) {
        return { message: 'An account with this email may already exist', code: 'AUTH_EXISTS' };
      }
      
      if (authError.message?.includes('rate limit')) {
        return { message: 'Too many attempts. Please try again later', code: 'RATE_LIMIT' };
      }
    }

    return { message: 'An error occurred. Please try again', code: 'AUTH_UNKNOWN' };
  }

  /**
   * Handle database errors
   */
  static handleDatabaseError(error: unknown): AppError {
    logger.error('Database error occurred', error);

    if (error && typeof error === 'object' && 'code' in error) {
      const pgError = error as { code: string; message: string };
      
      if (pgError.code === 'PGRST116') {
        return { message: 'Record not found', code: 'DB_NOT_FOUND' };
      }
      
      if (pgError.code === '23505') {
        return { message: 'This record already exists', code: 'DB_DUPLICATE' };
      }
      
      if (pgError.code === '23503') {
        return { message: 'Related record not found', code: 'DB_FOREIGN_KEY' };
      }
    }

    return { message: 'Database operation failed', code: 'DB_ERROR' };
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(errors: string[]): AppError {
    logger.warn('Validation failed', { errors });
    
    return {
      message: errors[0] || 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors
    };
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: unknown): AppError {
    logger.error('Network error occurred', error);

    return {
      message: 'Network error. Please check your connection',
      code: 'NETWORK_ERROR'
    };
  }

  /**
   * Generic error handler
   */
  static handle(error: unknown, context?: string): AppError {
    logger.error(`Error in ${context || 'unknown context'}`, error);

    if (import.meta.env.PROD && error instanceof Error) {
      captureError(error, { context });
    }

    if (error && typeof error === 'object') {
      if ('message' in error && typeof error.message === 'string') {
        return { message: error.message };
      }
    }

    return { message: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' };
  }
}
