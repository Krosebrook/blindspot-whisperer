export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      auth_attempts: {
        Row: {
          attempt_type: string
          created_at: string
          email: string | null
          id: string
          ip_address: unknown
          success: boolean
          user_agent: string | null
        }
        Insert: {
          attempt_type: string
          created_at?: string
          email?: string | null
          id?: string
          ip_address: unknown
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          attempt_type?: string
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: unknown
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      blind_spots: {
        Row: {
          ai_reasoning: string | null
          category_id: string | null
          confidence_score: number | null
          created_at: string
          description: string
          estimated_cost: string | null
          estimated_effort: string | null
          examples: string[] | null
          id: string
          impact_description: string | null
          likelihood: number | null
          potential_impact: string | null
          priority_rank: number | null
          recommended_actions: string[] | null
          resources: string[] | null
          scan_id: string
          severity: string
          title: string
        }
        Insert: {
          ai_reasoning?: string | null
          category_id?: string | null
          confidence_score?: number | null
          created_at?: string
          description: string
          estimated_cost?: string | null
          estimated_effort?: string | null
          examples?: string[] | null
          id?: string
          impact_description?: string | null
          likelihood?: number | null
          potential_impact?: string | null
          priority_rank?: number | null
          recommended_actions?: string[] | null
          resources?: string[] | null
          scan_id: string
          severity: string
          title: string
        }
        Update: {
          ai_reasoning?: string | null
          category_id?: string | null
          confidence_score?: number | null
          created_at?: string
          description?: string
          estimated_cost?: string | null
          estimated_effort?: string | null
          examples?: string[] | null
          id?: string
          impact_description?: string | null
          likelihood?: number | null
          potential_impact?: string | null
          priority_rank?: number | null
          recommended_actions?: string[] | null
          resources?: string[] | null
          scan_id?: string
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "blind_spots_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blind_spots_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scan_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blind_spots_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          configuration: Json | null
          created_at: string
          id: string
          integration_type: string
          is_active: boolean | null
          last_sync: string | null
          provider_name: string
          user_id: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          id?: string
          integration_type: string
          is_active?: boolean | null
          last_sync?: string | null
          provider_name: string
          user_id: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          id?: string
          integration_type?: string
          is_active?: boolean | null
          last_sync?: string | null
          provider_name?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_intents: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          error_message: string | null
          id: string
          metadata: Json | null
          payment_intent_id: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          payment_intent_id: string
          status: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          payment_intent_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_description: string | null
          business_type: string | null
          company_size: string | null
          created_at: string
          email: string
          experience_level: string | null
          full_name: string | null
          id: string
          industry: string | null
          persona: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          business_description?: string | null
          business_type?: string | null
          company_size?: string | null
          created_at?: string
          email: string
          experience_level?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          persona?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          business_description?: string | null
          business_type?: string | null
          company_size?: string | null
          created_at?: string
          email?: string
          experience_level?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          persona?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scan_analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          scan_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          scan_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          scan_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scan_analytics_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scan_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_analytics_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      scans: {
        Row: {
          ai_analysis: Json | null
          blind_spot_score: number | null
          business_description: string
          business_type: string | null
          completed_at: string | null
          created_at: string
          critical_blind_spots: number | null
          current_challenges: string[] | null
          goals: string[] | null
          id: string
          industry: string | null
          persona: string
          scan_duration_seconds: number | null
          status: string
          target_market: string | null
          total_blind_spots: number | null
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          blind_spot_score?: number | null
          business_description: string
          business_type?: string | null
          completed_at?: string | null
          created_at?: string
          critical_blind_spots?: number | null
          current_challenges?: string[] | null
          goals?: string[] | null
          id?: string
          industry?: string | null
          persona: string
          scan_duration_seconds?: number | null
          status?: string
          target_market?: string | null
          total_blind_spots?: number | null
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          blind_spot_score?: number | null
          business_description?: string
          business_type?: string | null
          completed_at?: string | null
          created_at?: string
          critical_blind_spots?: number | null
          current_challenges?: string[] | null
          goals?: string[] | null
          id?: string
          industry?: string | null
          persona?: string
          scan_duration_seconds?: number | null
          status?: string
          target_market?: string | null
          total_blind_spots?: number | null
          user_id?: string
        }
        Relationships: []
      }
      share_cards: {
        Row: {
          blind_spot_count: number | null
          card_design: Json | null
          created_at: string
          critical_count: number | null
          description: string | null
          expires_at: string | null
          id: string
          is_public: boolean | null
          key_insights: string[] | null
          scan_id: string
          slug: string | null
          title: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          blind_spot_count?: number | null
          card_design?: Json | null
          created_at?: string
          critical_count?: number | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          key_insights?: string[] | null
          scan_id: string
          slug?: string | null
          title: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          blind_spot_count?: number | null
          card_design?: Json | null
          created_at?: string
          critical_count?: number | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          key_insights?: string[] | null
          scan_id?: string
          slug?: string | null
          title?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "share_cards_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scan_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_cards_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          payment_intent_id: string | null
          payment_method: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: string
          id?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          status: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_payment_intent_id_fkey"
            columns: ["payment_intent_id"]
            isOneToOne: false
            referencedRelation: "payment_intents"
            referencedColumns: ["payment_intent_id"]
          },
        ]
      }
    }
    Views: {
      public_share_cards: {
        Row: {
          blind_spot_count: number | null
          created_at: string | null
          critical_count: number | null
          id: string | null
          scan_id: string | null
          slug: string | null
          title: string | null
          view_count: number | null
        }
        Insert: {
          blind_spot_count?: number | null
          created_at?: string | null
          critical_count?: number | null
          id?: string | null
          scan_id?: string | null
          slug?: string | null
          title?: never
          view_count?: number | null
        }
        Update: {
          blind_spot_count?: number | null
          created_at?: string | null
          critical_count?: number | null
          id?: string | null
          scan_id?: string | null
          slug?: string | null
          title?: never
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "share_cards_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scan_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_cards_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_summaries: {
        Row: {
          business_type: string | null
          categories_affected: number | null
          completed_at: string | null
          created_at: string | null
          critical_blind_spots: number | null
          duration_seconds: number | null
          id: string | null
          persona: string | null
          status: string | null
          total_blind_spots: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_old_auth_attempts: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
