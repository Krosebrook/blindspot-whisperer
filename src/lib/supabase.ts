// Supabase Client Configuration for Blindspot Whisperer
import { createClient } from '@supabase/supabase-js'

// Environment variables - these work with Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables')
  console.log('Required variables:', {
    VITE_SUPABASE_URL: !!supabaseUrl,
    VITE_SUPABASE_ANON_KEY: !!supabaseAnonKey,
  })
}

// Client for frontend use (with RLS)
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl!, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          persona: 'saas_founder' | 'ecommerce' | 'content_creator' | 'service_business' | 'student' | 'no_coder' | 'enterprise' | null
          business_type: string | null
          business_description: string | null
          company_size: string | null
          industry: string | null
          experience_level: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          persona?: 'saas_founder' | 'ecommerce' | 'content_creator' | 'service_business' | 'student' | 'no_coder' | 'enterprise' | null
          business_type?: string | null
          business_description?: string | null
          company_size?: string | null
          industry?: string | null
          experience_level?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          persona?: 'saas_founder' | 'ecommerce' | 'content_creator' | 'service_business' | 'student' | 'no_coder' | 'enterprise' | null
          business_type?: string | null
          business_description?: string | null
          company_size?: string | null
          industry?: string | null
          experience_level?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      scans: {
        Row: {
          id: string
          user_id: string
          persona: 'saas_founder' | 'ecommerce' | 'content_creator' | 'service_business' | 'student' | 'no_coder' | 'enterprise'
          business_description: string
          business_type: string | null
          industry: string | null
          target_market: string | null
          current_challenges: string[] | null
          goals: string[] | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          ai_analysis: any | null
          total_blind_spots: number
          critical_blind_spots: number
          scan_duration_seconds: number | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          persona: 'saas_founder' | 'ecommerce' | 'content_creator' | 'service_business' | 'student' | 'no_coder' | 'enterprise'
          business_description: string
          business_type?: string | null
          industry?: string | null
          target_market?: string | null
          current_challenges?: string[] | null
          goals?: string[] | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          ai_analysis?: any | null
          total_blind_spots?: number
          critical_blind_spots?: number
          scan_duration_seconds?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          persona?: 'saas_founder' | 'ecommerce' | 'content_creator' | 'service_business' | 'student' | 'no_coder' | 'enterprise'
          business_description?: string
          business_type?: string | null
          industry?: string | null
          target_market?: string | null
          current_challenges?: string[] | null
          goals?: string[] | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          ai_analysis?: any | null
          total_blind_spots?: number
          critical_blind_spots?: number
          scan_duration_seconds?: number | null
          created_at?: string
          completed_at?: string | null
        }
      }
      blind_spots: {
        Row: {
          id: string
          scan_id: string
          category_id: string | null
          title: string
          description: string
          impact_description: string | null
          severity: 'low' | 'medium' | 'high' | 'critical'
          confidence_score: number | null
          potential_impact: string | null
          recommended_actions: string[] | null
          resources: string[] | null
          estimated_effort: string | null
          estimated_cost: string | null
          priority_rank: number | null
          ai_reasoning: string | null
          examples: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          scan_id: string
          category_id?: string | null
          title: string
          description: string
          impact_description?: string | null
          severity: 'low' | 'medium' | 'high' | 'critical'
          confidence_score?: number | null
          potential_impact?: string | null
          recommended_actions?: string[] | null
          resources?: string[] | null
          estimated_effort?: string | null
          estimated_cost?: string | null
          priority_rank?: number | null
          ai_reasoning?: string | null
          examples?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          scan_id?: string
          category_id?: string | null
          title?: string
          description?: string
          impact_description?: string | null
          severity?: 'low' | 'medium' | 'high' | 'critical'
          confidence_score?: number | null
          potential_impact?: string | null
          recommended_actions?: string[] | null
          resources?: string[] | null
          estimated_effort?: string | null
          estimated_cost?: string | null
          priority_rank?: number | null
          ai_reasoning?: string | null
          examples?: string[] | null
          created_at?: string
        }
      }
      share_cards: {
        Row: {
          id: string
          scan_id: string
          user_id: string
          title: string
          description: string | null
          key_insights: string[] | null
          blind_spot_count: number | null
          critical_count: number | null
          card_design: any | null
          is_public: boolean
          slug: string | null
          view_count: number
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          scan_id: string
          user_id: string
          title: string
          description?: string | null
          key_insights?: string[] | null
          blind_spot_count?: number | null
          critical_count?: number | null
          card_design?: any | null
          is_public?: boolean
          slug?: string | null
          view_count?: number
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          scan_id?: string
          user_id?: string
          title?: string
          description?: string | null
          key_insights?: string[] | null
          blind_spot_count?: number | null
          critical_count?: number | null
          card_design?: any | null
          is_public?: boolean
          slug?: string | null
          view_count?: number
          created_at?: string
          expires_at?: string | null
        }
      }
    }
    Views: {
      scan_summaries: {
        Row: {
          id: string
          user_id: string
          persona: 'saas_founder' | 'ecommerce' | 'content_creator' | 'service_business' | 'student' | 'no_coder' | 'enterprise' | null
          business_type: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          total_blind_spots: number
          critical_blind_spots: number
          created_at: string
          completed_at: string | null
          duration_seconds: number | null
          categories_affected: number | null
        }
      }
    }
  }
}

// Utility functions for common operations
export const db = {
  // User profile operations
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    return { data, error }
  },

  async updateProfile(userId: string, updates: Database['public']['Tables']['profiles']['Update']) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  // Scan operations
  async createScan(scanData: Database['public']['Tables']['scans']['Insert']) {
    const { data, error } = await supabase
      .from('scans')
      .insert(scanData)
      .select()
      .single()
    
    return { data, error }
  },

  async getScan(scanId: string) {
    const { data, error } = await supabase
      .from('scans')
      .select(`
        *,
        blind_spots (*),
        scan_findings (*)
      `)
      .eq('id', scanId)
      .single()
    
    return { data, error }
  },

  async getUserScans(userId: string) {
    const { data, error } = await supabase
      .from('scan_summaries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // Blind spot operations
  async createBlindSpot(blindSpotData: Database['public']['Tables']['blind_spots']['Insert']) {
    const { data, error } = await supabase
      .from('blind_spots')
      .insert(blindSpotData)
      .select()
      .single()
    
    return { data, error }
  },

  async getBlindSpotsByScan(scanId: string) {
    const { data, error } = await supabase
      .from('blind_spots')
      .select('*')
      .eq('scan_id', scanId)
      .order('severity', { ascending: false })
    
    return { data, error }
  },

  // Share card operations
  async createShareCard(shareCardData: Database['public']['Tables']['share_cards']['Insert']) {
    const { data, error } = await supabase
      .from('share_cards')
      .insert(shareCardData)
      .select()
      .single()
    
    return { data, error }
  },

  async getShareCard(slug: string) {
    const { data, error } = await supabase
      .from('share_cards')
      .select(`
        *,
        scans (
          persona,
          business_type,
          total_blind_spots,
          critical_blind_spots
        )
      `)
      .eq('slug', slug)
      .eq('is_public', true)
      .single()
    
    return { data, error }
  }
}

export default supabase