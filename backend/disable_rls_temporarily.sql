-- Temporarily disable RLS for service role testing
-- This is a more direct approach

-- First, let's check what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'prompts', 'analytics_daily', 'api_keys');

-- Disable RLS temporarily for testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE prompts DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows service role to do everything
DROP POLICY IF EXISTS "Service role full access" ON profiles;
DROP POLICY IF EXISTS "Service role full access" ON prompts;
DROP POLICY IF EXISTS "Service role full access" ON analytics_daily;
DROP POLICY IF EXISTS "Service role full access" ON api_keys;

CREATE POLICY "Service role full access" ON profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON prompts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON analytics_daily FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON api_keys FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Also allow service role to bypass RLS entirely
GRANT ALL ON profiles TO service_role;
GRANT ALL ON prompts TO service_role;
GRANT ALL ON analytics_daily TO service_role;
GRANT ALL ON api_keys TO service_role;
