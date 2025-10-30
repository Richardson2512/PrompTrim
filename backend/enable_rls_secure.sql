-- Re-enable RLS with proper security policies
-- This will secure your database while keeping the API functional

-- =============================================
-- 1. ENABLE ROW LEVEL SECURITY
-- =============================================

-- Re-enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. DROP ALL EXISTING POLICIES
-- =============================================

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can insert own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can update own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can view own analytics" ON analytics_daily;
DROP POLICY IF EXISTS "Users can insert own analytics" ON analytics_daily;
DROP POLICY IF EXISTS "Users can update own analytics" ON analytics_daily;
DROP POLICY IF EXISTS "Users can view own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can insert own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete own api keys" ON api_keys;

-- Drop any service role policies
DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;
DROP POLICY IF EXISTS "Service role full access prompts" ON prompts;
DROP POLICY IF EXISTS "Service role full access analytics" ON analytics_daily;
DROP POLICY IF EXISTS "Service role full access api_keys" ON api_keys;
DROP POLICY IF EXISTS "Service role can access all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can access all prompts" ON prompts;
DROP POLICY IF EXISTS "Service role can access all analytics" ON analytics_daily;
DROP POLICY IF EXISTS "Service role can access all API keys" ON api_keys;

-- =============================================
-- 3. CREATE SERVICE ROLE POLICIES (for API backend)
-- =============================================

-- Service role needs full access to all tables for API operations
CREATE POLICY "Service role full access profiles" 
  ON profiles FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Service role full access prompts" 
  ON prompts FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Service role full access analytics" 
  ON analytics_daily FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Service role full access api_keys" 
  ON api_keys FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- =============================================
-- 4. CREATE USER POLICIES (for frontend)
-- =============================================

-- Profiles policies for authenticated users
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

-- Prompts policies for authenticated users
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

-- Analytics policies for authenticated users
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

-- API Keys policies for authenticated users
CREATE POLICY "Users can view own api keys" 
  ON api_keys FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api keys" 
  ON api_keys FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api keys" 
  ON api_keys FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own api keys" 
  ON api_keys FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- =============================================
-- 5. GRANT NECESSARY PERMISSIONS
-- =============================================

-- Ensure service role has all necessary permissions
GRANT ALL ON profiles TO service_role;
GRANT ALL ON prompts TO service_role;
GRANT ALL ON analytics_daily TO service_role;
GRANT ALL ON api_keys TO service_role;

-- Ensure authenticated users can access their own data
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON prompts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_daily TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO authenticated;

-- =============================================
-- 6. VERIFY POLICIES
-- =============================================

-- Check that policies are created correctly
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Count policies for each table
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'profiles';
  RAISE NOTICE 'Profiles policies: %', policy_count;
  
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'prompts';
  RAISE NOTICE 'Prompts policies: %', policy_count;
  
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'analytics_daily';
  RAISE NOTICE 'Analytics policies: %', policy_count;
  
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'api_keys';
  RAISE NOTICE 'API Keys policies: %', policy_count;
  
  RAISE NOTICE 'RLS has been re-enabled with proper security policies!';
  RAISE NOTICE 'Service role can access all data for API operations.';
  RAISE NOTICE 'Authenticated users can only access their own data.';
END $$;
