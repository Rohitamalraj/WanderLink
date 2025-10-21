import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface User {
  id: string
  email: string
  name: string
  agent_address?: string
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  age?: number
  gender?: string
  location?: string
  preferred_destinations: string[]
  budget_min: number
  budget_max: number
  travel_pace: 'relaxed' | 'moderate' | 'packed'
  group_size_preference?: string
  interests: string[]
  accommodation_types: string[]
  dietary_restrictions: string[]
  languages_spoken: string[]
  travel_experience: 'beginner' | 'intermediate' | 'expert'
  smoking_preference?: string
  drinking_preference?: string
  created_at: string
  updated_at: string
}

export interface MatchRequest {
  id: string
  user_id: string
  trip_id: string
  compatibility_score: number
  match_factors: any
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  user_message?: string
  host_response?: string
  created_at: string
  updated_at: string
}

export interface SavedMatch {
  id: string
  user_id: string
  trip_id: string
  compatibility_score: number
  notes?: string
  created_at: string
}

export interface UserAgentState {
  id: string
  user_id: string
  agent_address: string
  agent_seed: string
  is_active: boolean
  last_active_at: string
  agent_config?: any
  created_at: string
  updated_at: string
}
