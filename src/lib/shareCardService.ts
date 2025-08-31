// Secure share card service with data sanitization
import { db } from './database'
import { supabase } from '@/integrations/supabase/client'
import { SecurityService } from './security'

export interface ShareCardData {
  scan_id: string
  user_id: string
  title: string
  description?: string
  key_insights?: string[]
  blind_spot_count?: number
  critical_count?: number
  expires_at?: string
}

export class ShareCardService {
  /**
   * Create a secure share card with sanitized content
   */
  static async createShareCard(data: ShareCardData): Promise<{ data: any; error: any }> {
    try {
      // Validate required fields
      if (!data.scan_id || !data.user_id || !data.title) {
        return { 
          data: null, 
          error: { message: 'Missing required fields: scan_id, user_id, title' }
        }
      }

      // Sanitize all text content
      const sanitizedData = {
        ...data,
        title: SecurityService.sanitizeContent(data.title, { maxLength: 100 }),
        description: data.description 
          ? SecurityService.sanitizeContent(data.description, { maxLength: 300 })
          : null,
        key_insights: data.key_insights?.map(insight => 
          SecurityService.sanitizeContent(insight, { maxLength: 200 })
        ) || [],
        is_public: true, // All share cards are public by default
        view_count: 0,
        expires_at: data.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      }

      // Create the share card
      const result = await db.createShareCard(sanitizedData)
      
      if (result.error) {
        console.error('Share card creation error:', result.error)
        return { data: null, error: result.error }
      }

      return result
    } catch (error) {
      console.error('Unexpected error creating share card:', error)
      return { 
        data: null, 
        error: { message: 'Failed to create share card' }
      }
    }
  }

  /**
   * Get a public share card with rate limiting and sanitization
   */
  static async getPublicShareCard(slug: string, clientIdentifier?: string): Promise<{ data: any; error: any }> {
    try {
      // Rate limiting for public access
      const identifier = clientIdentifier || 'anonymous'
      if (!SecurityService.checkRateLimit(`share_card_${identifier}`, 20, 60000)) {
        return {
          data: null,
          error: { message: 'Rate limit exceeded. Please try again later.' }
        }
      }

      // Validate slug format (basic security)
      if (!slug || typeof slug !== 'string' || !/^[a-zA-Z0-9-_]{8,32}$/.test(slug)) {
        return {
          data: null,
          error: { message: 'Invalid share card identifier' }
        }
      }

      // Get the share card
      const result = await db.getShareCard(slug)
      
      if (result.error || !result.data) {
        return { data: null, error: result.error || { message: 'Share card not found' } }
      }

      // Additional sanitization for public consumption
      const sanitizedCard = SecurityService.sanitizeShareCard(result.data)

      // Increment view count (fire and forget)
      this.incrementViewCount(result.data.id).catch(console.error)

      return { data: sanitizedCard, error: null }
    } catch (error) {
      console.error('Error fetching share card:', error)
      return {
        data: null,
        error: { message: 'Failed to fetch share card' }
      }
    }
  }

  /**
   * Increment view count for analytics
   */
  private static async incrementViewCount(shareCardId: string): Promise<void> {
    try {
      // Simple increment without raw SQL
      const { data: currentCard } = await supabase
        .from('share_cards')
        .select('view_count')
        .eq('id', shareCardId)
        .single()

      if (currentCard) {
        const { error } = await supabase
          .from('share_cards')
          .update({ 
            view_count: (currentCard.view_count || 0) + 1
          })
          .eq('id', shareCardId)

        if (error) {
          console.warn('Failed to increment view count:', error)
        }
      }
    } catch (error) {
      console.warn('Error incrementing view count:', error)
    }
  }

  /**
   * Validate share card permissions
   */
  static async validateShareCardAccess(shareCardId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('share_cards')
        .select('user_id, is_public')
        .eq('id', shareCardId)
        .single()

      if (error || !data) return false

      // User owns the card or card is public
      return data.user_id === userId || data.is_public
    } catch {
      return false
    }
  }

  /**
   * Generate secure, unique slug for share cards
   */
  static generateSecureSlug(): string {
    // Generate a secure random slug
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return result
  }

  /**
   * Clean up expired share cards (for maintenance)
   */
  static async cleanupExpiredCards(): Promise<void> {
    try {
      const { error } = await supabase
        .from('share_cards')
        .delete()
        .lt('expires_at', new Date().toISOString())

      if (error) {
        console.warn('Failed to cleanup expired cards:', error)
      }
    } catch (error) {
      console.warn('Error during cleanup:', error)
    }
  }
}