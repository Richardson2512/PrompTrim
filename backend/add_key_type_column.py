"""Add key_type column to api_keys table"""
from database import get_supabase

def add_key_type_column():
    try:
        supabase = get_supabase()
        
        # Check if column exists first
        print("Checking if key_type column exists...")
        
        # Try to run the ALTER TABLE statement
        # Since Supabase Python client doesn't have direct SQL execution,
        # we need to use the Supabase dashboard or SQL editor
        
        print("\n" + "="*60)
        print("MIGRATION REQUIRED: Add key_type column to api_keys table")
        print("="*60)
        print("\nRun this SQL in your Supabase SQL Editor:")
        print("\nALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key_type text DEFAULT 'output' CHECK (key_type IN ('input', 'output'));")
        print("\nOr use Supabase Dashboard -> SQL Editor")
        print("="*60)
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_key_type_column()

