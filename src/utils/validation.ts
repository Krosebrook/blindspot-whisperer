/**
 * Unified Validation Schemas
 * Centralized validation using Zod for type safety and consistency
 */

import { z } from 'zod';

// Email validation with proper RFC compliance
export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Invalid email format" })
  .max(255, { message: "Email must be less than 255 characters" });

// Strong password validation
export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .max(128, { message: "Password must be less than 128 characters" });

// Business description validation
export const businessDescriptionSchema = z
  .string()
  .trim()
  .min(50, { message: "Business description must be at least 50 characters" })
  .max(2000, { message: "Business description must be less than 2000 characters" });

// Persona validation
export const personaSchema = z.enum([
  'saas_founder',
  'ecommerce',
  'content_creator',
  'service_business',
  'student',
  'no_coder',
  'enterprise'
], { message: "Invalid persona selected" });

// Scan input validation
export const scanInputSchema = z.object({
  persona: personaSchema,
  business_description: businessDescriptionSchema,
  user_id: z.string().uuid({ message: "Invalid user ID" })
});

// Auth validation schemas
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" })
});

export const resetPasswordSchema = z.object({
  email: emailSchema
});

// Helper function to validate and return errors
export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: result.error.errors.map(err => err.message)
  };
}
