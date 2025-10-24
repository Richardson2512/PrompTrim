/*
  # PromptTrim Complete Database Schema with First Name & Last Name Support
  
  ## Overview
  This migration creates the complete database schema for PromptTrim - an AI-powered prompt optimization platform.
  Includes all tables, security policies, indexes, and first name/last name functionality.
  
  ## Tables Created:
  - `profiles` - User profiles with first_name and last_name support
  - `prompts` - Prompt optimization records
  - `analytics_daily` - Daily analytics aggregation
  - `api_keys` - API key management
  
  ## Features:
  - Row Level Security (RLS) enabled on all tables
  - Separate first_name and last_name fields for better data management
  - Performance indexes
  - Audit timestamps
*/

-- =============================================
-- 1. CREATE PROFILES TABLE WITH FIRST NAME & LAST NAME
-- =============================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  monthly_token_limit integer DEFAULT 10000,
  tokens_used_this_month integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

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

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can insert own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can update own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can delete own prompts" ON prompts;

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

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view own analytics" ON analytics_daily;
DROP POLICY IF EXISTS "Users can insert own analytics" ON analytics_daily;
DROP POLICY IF EXISTS "Users can update own analytics" ON analytics_daily;

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

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can insert own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete own API keys" ON api_keys;

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

-- =============================================
-- 6. CREATE UTILITY FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create full name from first_name and last_name
CREATE OR REPLACE FUNCTION create_full_name(first_name text, last_name text)
RETURNS text AS $$
BEGIN
  IF first_name IS NULL AND last_name IS NULL THEN
    RETURN NULL;
  END IF;
  
  IF first_name IS NULL THEN
    RETURN last_name;
  END IF;
  
  IF last_name IS NULL THEN
    RETURN first_name;
  END IF;
  
  RETURN trim(first_name) || ' ' || trim(last_name);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 7. CREATE TRIGGERS
-- =============================================

-- Drop existing trigger if it exists, then recreate it
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'PromptTrim database schema created successfully!';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '- User profiles with separate first name and last name fields';
  RAISE NOTICE '- Prompt optimization tracking';
  RAISE NOTICE '- Daily analytics aggregation';
  RAISE NOTICE '- API key management';
  RAISE NOTICE '- Row Level Security (RLS)';
  RAISE NOTICE '- Performance indexes';
  RAISE NOTICE '- Audit timestamps';
END $$;