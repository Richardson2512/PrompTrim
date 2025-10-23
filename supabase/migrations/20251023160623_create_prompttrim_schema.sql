/*
  # PromptTrim Database Schema

  ## Overview
  This migration creates the complete database schema for PromptTrim - an AI-powered prompt optimization platform.

  ## 1. New Tables
  
  ### `profiles`
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `subscription_tier` (text) - free, pro, enterprise
  - `monthly_token_limit` (integer) - Token optimization limit per month
  - `tokens_used_this_month` (integer) - Current month usage
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `prompts`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to profiles)
  - `original_text` (text) - The original prompt submitted
  - `original_token_count` (integer) - Token count of original
  - `optimized_text` (text) - The optimized version
  - `optimized_token_count` (integer) - Token count after optimization
  - `tokens_saved` (integer) - Difference between original and optimized
  - `optimization_level` (text) - aggressive, moderate, minimal
  - `language` (text) - Detected or specified language
  - `status` (text) - pending, completed, failed
  - `cost_saved_usd` (numeric) - Estimated cost savings
  - `created_at` (timestamptz)

  ### `analytics_daily`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to profiles)
  - `date` (date) - The specific date
  - `total_prompts` (integer) - Number of prompts optimized
  - `total_tokens_saved` (integer) - Total tokens saved that day
  - `total_cost_saved_usd` (numeric) - Total cost saved
  - `avg_compression_rate` (numeric) - Average percentage of tokens saved
  - `created_at` (timestamptz)

  ### `api_keys`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to profiles)
  - `key_hash` (text) - Hashed API key for security
  - `key_prefix` (text) - First 8 chars for identification
  - `name` (text) - User-defined name for the key
  - `is_active` (boolean) - Whether key is active
  - `last_used_at` (timestamptz) - Last usage timestamp
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
  - Restrict access based on user_id ownership

  ## 3. Important Notes
  - All tables use gen_random_uuid() for primary keys
  - Timestamps default to now()
  - Token limits are enforced at application level
  - Analytics are aggregated daily for performance
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  monthly_token_limit integer DEFAULT 10000,
  tokens_used_this_month integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_text text NOT NULL,
  original_token_count integer NOT NULL,
  optimized_text text,
  optimized_token_count integer,
  tokens_saved integer DEFAULT 0,
  optimization_level text DEFAULT 'moderate' CHECK (optimization_level IN ('aggressive', 'moderate', 'minimal')),
  language text DEFAULT 'en',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  cost_saved_usd numeric(10, 6) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prompts"
  ON prompts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompts"
  ON prompts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts"
  ON prompts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts"
  ON prompts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create analytics_daily table
CREATE TABLE IF NOT EXISTS analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_prompts integer DEFAULT 0,
  total_tokens_saved integer DEFAULT 0,
  total_cost_saved_usd numeric(10, 6) DEFAULT 0,
  avg_compression_rate numeric(5, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON analytics_daily FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON analytics_daily FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
  ON analytics_daily FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON api_keys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON api_keys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON api_keys FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON analytics_daily(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();