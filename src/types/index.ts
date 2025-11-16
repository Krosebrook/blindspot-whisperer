/**
 * Centralized Type Definitions
 * Shared types across the application
 */

// Auth types
export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  persona: string | null;
  business_type: string | null;
  business_description: string | null;
  industry: string | null;
  company_size: string | null;
  experience_level: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {
  metadata?: {
    full_name?: string;
    captchaToken?: string;
  };
}

// Scan types
export interface ScanInput {
  persona: string;
  business_description: string;
  user_id: string;
}

export interface BlindSpot {
  id: string;
  scan_id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: number;
  category_id: string | null;
  recommended_actions: string[];
  examples: string[];
  resources: string[];
  ai_reasoning: string | null;
  confidence_score: number | null;
  impact_description: string | null;
  potential_impact: string | null;
  priority_rank: number | null;
  estimated_cost: string | null;
  estimated_effort: string | null;
  created_at: string;
}

export interface Scan {
  id: string;
  user_id: string;
  persona: string;
  business_description: string;
  business_type: string | null;
  industry: string | null;
  target_market: string | null;
  goals: string[];
  current_challenges: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  blind_spot_score: number | null;
  total_blind_spots: number | null;
  critical_blind_spots: number | null;
  ai_analysis: any;
  scan_duration_seconds: number | null;
  created_at: string;
  completed_at: string | null;
}

// Analytics types
export interface BotAttempt {
  id: string;
  timestamp: number;
  score: number;
  confidence: number;
  triggers: string[];
  recommendation: 'allow' | 'challenge' | 'block';
  isFalsePositive: boolean;
}

export interface ThresholdConfig {
  challenge: number;
  block: number;
}

export interface BehavioralData {
  mouseMovements: number;
  keystrokes: number;
  clickCount: number;
  pasteEvents: number;
  timeOnForm: number;
  formFillSpeed: number;
  mouseSpeed: number;
  regularityScore: number;
}

// Alert types
export type AlertType = 
  | 'HIGH_FALSE_POSITIVE_RATE'
  | 'HIGH_BOT_ACTIVITY'
  | 'THRESHOLD_DRIFT'
  | 'ANOMALY_DETECTED';

export interface AlertRule {
  type: AlertType;
  enabled: boolean;
  threshold: number;
  cooldownMinutes: number;
  lastTriggered: number | null;
}

export interface AlertEvent {
  id: string;
  type: AlertType;
  timestamp: number;
  message: string;
  severity: 'info' | 'warning' | 'error';
  acknowledged: boolean;
  data?: Record<string, any>;
}

// Share card types
export interface ShareCard {
  id: string;
  scan_id: string;
  user_id: string;
  slug: string;
  title: string;
  description: string | null;
  blind_spot_count: number | null;
  critical_count: number | null;
  key_insights: string[];
  card_design: any;
  is_public: boolean;
  view_count: number;
  expires_at: string | null;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}
