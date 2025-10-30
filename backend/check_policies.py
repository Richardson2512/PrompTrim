#!/usr/bin/env python3
"""
Check if Supabase policies are working
"""

from database import get_supabase

def check_policies():
    print("Checking Supabase Policies...")
    print("=" * 40)
    
    try:
        supabase = get_supabase()
        
        # Check if we can query the profiles table
        print("1. Testing basic query...")
        result = supabase.table('profiles').select('*').limit(1).execute()
        print(f"   + Query successful: {len(result.data)} profiles found")
        
        # Check if we can insert (this should work with service role)
        print("\n2. Testing insert with service role...")
        test_profile = {
            'id': '550e8400-e29b-41d4-a716-446655440001',
            'email': 'test2@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'subscription_tier': 'free',
            'monthly_token_limit': 10000,
            'tokens_used_this_month': 0
        }
        
        try:
            result = supabase.table('profiles').insert(test_profile).execute()
            print("   + Insert successful with service role!")
            
            # Clean up
            supabase.table('profiles').delete().eq('id', '550e8400-e29b-41d4-a716-446655440001').execute()
            print("   + Test data cleaned up")
            
        except Exception as e:
            print(f"   - Insert failed: {e}")
            
            # Check if the issue is with RLS
            if "row-level security" in str(e).lower():
                print("\n   RLS is still blocking service role access.")
                print("   This means the policies weren't created properly.")
                print("   Please check:")
                print("   1. Did you run the SQL in the correct Supabase project?")
                print("   2. Are you logged in as the project owner?")
                print("   3. Did any errors occur when running the SQL?")
            else:
                print(f"   Different error: {e}")
        
        # Check existing policies
        print("\n3. Checking existing policies...")
        try:
            # This is a more direct way to check if policies exist
            result = supabase.rpc('get_user_by_api_key', {'api_key_hash': 'test'}).execute()
            print("   + Helper functions are working!")
        except Exception as e:
            if "function get_user_by_api_key" in str(e):
                print("   - Helper functions not found - SQL may not have run completely")
            else:
                print(f"   - Function test failed: {e}")
                
    except Exception as e:
        print(f"Connection failed: {e}")
    
    print("\n" + "=" * 40)
    print("Policy check completed!")

if __name__ == "__main__":
    check_policies()
