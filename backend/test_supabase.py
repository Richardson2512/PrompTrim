#!/usr/bin/env python3
"""
Test Supabase connection and permissions
"""

from database import get_supabase
import os

def test_supabase_connection():
    print("Testing Supabase Connection...")
    print("=" * 40)
    
    # Check environment variables
    print(f"SUPABASE_URL: {os.getenv('SUPABASE_URL', 'NOT SET')}")
    print(f"SUPABASE_SERVICE_KEY: {'SET' if os.getenv('SUPABASE_SERVICE_KEY') else 'NOT SET'}")
    print()
    
    try:
        supabase = get_supabase()
        print("+ Supabase client created successfully")
        
        # Test basic connection
        print("\nTesting basic connection...")
        result = supabase.table('profiles').select('id').limit(1).execute()
        print(f"+ Connection successful - found {len(result.data)} profiles")
        
        # Test service role access
        print("\nTesting service role access...")
        try:
            # Try to insert a test profile
            test_profile = {
                'id': '550e8400-e29b-41d4-a716-446655440000',  # Valid UUID
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User',
                'subscription_tier': 'free',
                'monthly_token_limit': 10000,
                'tokens_used_this_month': 0
            }
            
            result = supabase.table('profiles').insert(test_profile).execute()
            print("+ Service role can insert profiles")
            
            # Clean up test data
            supabase.table('profiles').delete().eq('id', '550e8400-e29b-41d4-a716-446655440000').execute()
            print("+ Test data cleaned up")
            
        except Exception as e:
            print(f"- Service role access failed: {e}")
            print("This means the SQL policies haven't been run yet.")
            print("Please run the SQL script I provided earlier in your Supabase SQL editor.")
            
    except Exception as e:
        print(f"- Supabase connection failed: {e}")
        return False
    
    print("\n" + "=" * 40)
    print("Supabase connection test completed!")
    return True

if __name__ == "__main__":
    test_supabase_connection()
