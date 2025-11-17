import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ErrorHandler } from './errorHandler'
import { AuthError } from '@supabase/supabase-js'

describe('ErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleAuthError', () => {
    it('returns generic message for invalid credentials', () => {
      const error = new Error('Invalid login credentials')
      const result = ErrorHandler.handleAuthError(error)
      
      expect(result.message).toBe('Invalid email or password')
      expect(result.code).toBe('AUTH_INVALID')
    })

    it('returns message for unverified email', () => {
      const error = new Error('Email not confirmed')
      const result = ErrorHandler.handleAuthError(error)
      
      expect(result.message).toBe('Please verify your email address')
      expect(result.code).toBe('AUTH_UNVERIFIED')
    })

    it('returns generic message for existing user', () => {
      const error = new Error('User already registered')
      const result = ErrorHandler.handleAuthError(error)
      
      expect(result.message).toBe('An account with this email may already exist')
      expect(result.code).toBe('AUTH_EXISTS')
    })

    it('returns rate limit message', () => {
      const error = new Error('rate limit exceeded')
      const result = ErrorHandler.handleAuthError(error)
      
      expect(result.message).toBe('Too many attempts. Please try again later')
      expect(result.code).toBe('RATE_LIMIT')
    })

    it('returns generic error for unknown auth errors', () => {
      const error = new Error('Some other error')
      const result = ErrorHandler.handleAuthError(error)
      
      expect(result.message).toBe('An error occurred. Please try again')
      expect(result.code).toBe('AUTH_UNKNOWN')
    })
  })

  describe('handleDatabaseError', () => {
    it('handles not found error', () => {
      const error = { code: 'PGRST116', message: 'Not found' }
      const result = ErrorHandler.handleDatabaseError(error)
      
      expect(result.message).toBe('Record not found')
      expect(result.code).toBe('DB_NOT_FOUND')
    })

    it('handles duplicate error', () => {
      const error = { code: '23505', message: 'Duplicate' }
      const result = ErrorHandler.handleDatabaseError(error)
      
      expect(result.message).toBe('This record already exists')
      expect(result.code).toBe('DB_DUPLICATE')
    })

    it('handles foreign key error', () => {
      const error = { code: '23503', message: 'Foreign key violation' }
      const result = ErrorHandler.handleDatabaseError(error)
      
      expect(result.message).toBe('Related record not found')
      expect(result.code).toBe('DB_FOREIGN_KEY')
    })

    it('returns generic database error', () => {
      const error = { code: '12345', message: 'Unknown' }
      const result = ErrorHandler.handleDatabaseError(error)
      
      expect(result.message).toBe('Database operation failed')
      expect(result.code).toBe('DB_ERROR')
    })
  })

  describe('handleValidationError', () => {
    it('returns first validation error', () => {
      const errors = ['Password is too short', 'Email is invalid']
      const result = ErrorHandler.handleValidationError(errors)
      
      expect(result.message).toBe('Password is too short')
      expect(result.code).toBe('VALIDATION_ERROR')
      expect(result.details).toEqual(errors)
    })

    it('handles empty error array', () => {
      const result = ErrorHandler.handleValidationError([])
      
      expect(result.message).toBe('Validation failed')
      expect(result.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('handleNetworkError', () => {
    it('returns network error message', () => {
      const error = new Error('Network failed')
      const result = ErrorHandler.handleNetworkError(error)
      
      expect(result.message).toBe('Network error. Please check your connection')
      expect(result.code).toBe('NETWORK_ERROR')
    })
  })

  describe('handle', () => {
    it('extracts message from error object', () => {
      const error = new Error('Custom error message')
      const result = ErrorHandler.handle(error, 'test context')
      
      expect(result.message).toBe('Custom error message')
    })

    it('returns generic error for non-error objects', () => {
      const result = ErrorHandler.handle({ random: 'object' }, 'test context')
      
      expect(result.message).toBe('An unexpected error occurred')
      expect(result.code).toBe('UNKNOWN_ERROR')
    })
  })
})
