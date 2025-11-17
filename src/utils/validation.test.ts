import { describe, it, expect } from 'vitest'
import {
  emailSchema,
  passwordSchema,
  businessDescriptionSchema,
  personaSchema,
  validateWithSchema
} from './validation'

describe('Email Validation', () => {
  it('accepts valid email addresses', () => {
    const result = validateWithSchema(emailSchema, 'user@example.com')
    expect(result.success).toBe(true)
    expect(result.data).toBe('user@example.com')
  })

  it('trims whitespace', () => {
    const result = validateWithSchema(emailSchema, '  user@example.com  ')
    expect(result.success).toBe(true)
    expect(result.data).toBe('user@example.com')
  })

  it('rejects invalid email formats', () => {
    const testCases = ['invalid', 'no@domain', '@example.com', 'user@']
    testCases.forEach(email => {
      const result = validateWithSchema(emailSchema, email)
      expect(result.success).toBe(false)
    })
  })

  it('rejects emails over 255 characters', () => {
    const longEmail = 'a'.repeat(250) + '@example.com'
    const result = validateWithSchema(emailSchema, longEmail)
    expect(result.success).toBe(false)
  })
})

describe('Password Validation', () => {
  it('accepts strong passwords', () => {
    const result = validateWithSchema(passwordSchema, 'StrongPass123')
    expect(result.success).toBe(true)
  })

  it('rejects passwords under 8 characters', () => {
    const result = validateWithSchema(passwordSchema, 'Short1')
    expect(result.success).toBe(false)
    expect(result.errors?.[0]).toContain('at least 8 characters')
  })

  it('requires uppercase letter', () => {
    const result = validateWithSchema(passwordSchema, 'lowercase123')
    expect(result.success).toBe(false)
    expect(result.errors?.[0]).toContain('uppercase')
  })

  it('requires lowercase letter', () => {
    const result = validateWithSchema(passwordSchema, 'UPPERCASE123')
    expect(result.success).toBe(false)
    expect(result.errors?.[0]).toContain('lowercase')
  })

  it('requires number', () => {
    const result = validateWithSchema(passwordSchema, 'NoNumbers')
    expect(result.success).toBe(false)
    expect(result.errors?.[0]).toContain('number')
  })

  it('rejects passwords over 128 characters', () => {
    const longPassword = 'A1' + 'a'.repeat(130)
    const result = validateWithSchema(passwordSchema, longPassword)
    expect(result.success).toBe(false)
  })
})

describe('Business Description Validation', () => {
  it('accepts valid business descriptions', () => {
    const desc = 'We are a SaaS company building innovative solutions for small businesses to manage their operations.'
    const result = validateWithSchema(businessDescriptionSchema, desc)
    expect(result.success).toBe(true)
  })

  it('trims whitespace', () => {
    const desc = '  We are a company building great products for customers.  '
    const result = validateWithSchema(businessDescriptionSchema, desc)
    expect(result.success).toBe(true)
  })

  it('rejects descriptions under 50 characters', () => {
    const result = validateWithSchema(businessDescriptionSchema, 'Too short')
    expect(result.success).toBe(false)
    expect(result.errors?.[0]).toContain('at least 50 characters')
  })

  it('rejects descriptions over 2000 characters', () => {
    const longDesc = 'A'.repeat(2001)
    const result = validateWithSchema(businessDescriptionSchema, longDesc)
    expect(result.success).toBe(false)
  })
})

describe('Persona Validation', () => {
  it('accepts valid personas', () => {
    const validPersonas = [
      'saas_founder',
      'ecommerce',
      'content_creator',
      'service_business',
      'student',
      'no_coder',
      'enterprise'
    ]
    
    validPersonas.forEach(persona => {
      const result = validateWithSchema(personaSchema, persona)
      expect(result.success).toBe(true)
    })
  })

  it('rejects invalid personas', () => {
    const result = validateWithSchema(personaSchema, 'invalid_persona')
    expect(result.success).toBe(false)
    expect(result.errors?.[0]).toContain('Invalid persona')
  })
})
