import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && 
         supabaseUrl !== 'your_supabase_url_here' && 
         supabaseAnonKey !== 'your_supabase_anon_key_here';
};

// Create Supabase client - no mock client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  monthly_token_limit: number;
  tokens_used_this_month: number;
  created_at: string;
  updated_at: string;
}

export interface Prompt {
  id: string;
  user_id: string;
  original_text: string;
  original_token_count: number;
  optimized_text: string | null;
  optimized_token_count: number | null;
  tokens_saved: number;
  optimization_level: 'aggressive' | 'moderate' | 'minimal';
  language: string;
  status: 'pending' | 'completed' | 'failed';
  cost_saved_usd: number;
  created_at: string;
}

export interface AnalyticsDaily {
  id: string;
  user_id: string;
  date: string;
  total_prompts: number;
  total_tokens_saved: number;
  total_cost_saved_usd: number;
  avg_compression_rate: number;
  created_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  key_hash: string;
  key_prefix: string;
  name: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}
