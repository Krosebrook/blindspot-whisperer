import { supabase } from '@/integrations/supabase/client'

// Temporary database utilities without strict typing until types are regenerated
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

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  // Scan operations
  async createScan(scanData: any) {
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
        blind_spots (*)
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
  async createBlindSpot(blindSpotData: any) {
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
  async createShareCard(shareCardData: any) {
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