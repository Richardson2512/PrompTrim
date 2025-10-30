-- Add key_type column to api_keys table
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS key_type text DEFAULT 'output' CHECK (key_type IN ('input', 'output'));

-- Add comment to explain the column
COMMENT ON COLUMN api_keys.key_type IS 'Type of API key: input for input token reduction, output for future features';

