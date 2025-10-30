ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS optimization_level text DEFAULT 'moderate' CHECK (optimization_level IN ('aggressive', 'moderate', 'minimal'));

COMMENT ON COLUMN api_keys.optimization_level IS 'Default optimization level for this API key: aggressive (60-80% reduction), moderate (40-60% reduction), or minimal (20-30% reduction)';
