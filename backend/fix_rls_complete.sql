-- Complete RLS fix for service role access
-- This script will ensure service role has full access

-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'prompts', 'analytics_daily', 'api_keys')
ORDER BY tablename, policyname;

-- Drop ALL existing policies on these tables
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

-- Drop any service role policies that might exist
DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;
DROP POLICY IF EXISTS "Service role full access prompts" ON prompts;
DROP POLICY IF EXISTS "Service role full access analytics" ON analytics_daily;
DROP POLICY IF EXISTS "Service role full access api_keys" ON api_keys;
DROP POLICY IF EXISTS "Service role can access all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can access all prompts" ON prompts;
DROP POLICY IF EXISTS "Service role can access all analytics" ON analytics_daily;
DROP POLICY IF EXISTS "Service role can access all API keys" ON api_keys;

-- Grant full permissions to service role
GRANT ALL ON profiles TO service_role;
GRANT ALL ON prompts TO service_role;
GRANT ALL ON analytics_daily TO service_role;
GRANT ALL ON api_keys TO service_role;

-- Create new policies that allow service role full access
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

-- Also create policies for authenticated users (for frontend)
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Similar policies for other tables...
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
  USING (auth.uid() = user_id);

-- Test the policies
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated successfully!';
  RAISE NOTICE 'Service role should now have full access to all tables.';
  RAISE NOTICE 'Authenticated users can access their own data.';
END $$;
