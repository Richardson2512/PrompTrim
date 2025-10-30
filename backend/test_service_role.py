#!/usr/bin/env python3
"""
Test service role authentication directly
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def test_service_role():
    print("Testing Service Role Authentication...")
    print("=" * 50)
    
    # Get environment variables
    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    print(f"URL: {url}")
    print(f"Service Key: {'SET' if service_key else 'NOT SET'}")
    print(f"Service Key Length: {len(service_key) if service_key else 0}")
    print()
    
    if not url or not service_key:
        print("ERROR: Missing environment variables!")
        return False
    
    try:
        # Create client with service role key
        supabase = create_client(url, service_key)
        print("+ Supabase client created")
        
        # Test 1: Try to get the current user (should be service role)
        print("\n1. Testing authentication...")
        try:
            # This should work with service role
            result = supabase.auth.get_user()
            print(f"   + Auth successful: {result}")
        except Exception as e:
            print(f"   - Auth failed: {e}")
        
        # Test 2: Try to insert a profile
        print("\n2. Testing profile insert...")
        test_profile = {
            'id': '550e8400-e29b-41d4-a716-446655440003',
            'email': 'service-test2@example.com',
            'first_name': 'Service',
            'last_name': 'Test',
            'subscription_tier': 'free',
            'monthly_token_limit': 10000,
            'tokens_used_this_month': 0
        }
        
        try:
            result = supabase.table('profiles').insert(test_profile).execute()
            print(f"   + Insert successful: {result.data}")
            
            # Clean up
            supabase.table('profiles').delete().eq('id', '550e8400-e29b-41d4-a716-446655440003').execute()
            print("   + Cleanup successful")
            
        except Exception as e:
            print(f"   - Insert failed: {e}")
            
            # Check if it's an RLS issue
            if "row-level security" in str(e).lower():
                print("\n   RLS is blocking service role access.")
                print("   The service role key might not have the right permissions.")
                print("   Please run this SQL in Supabase:")
                print("   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;")
                print("   (This is temporary for testing)")
            else:
                print(f"   Different error: {e}")
        
        # Test 3: Try to query
        print("\n3. Testing profile query...")
        try:
            result = supabase.table('profiles').select('*').limit(1).execute()
            print(f"   + Query successful: {len(result.data)} profiles")
        except Exception as e:
            print(f"   - Query failed: {e}")
        
        return True
        
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    test_service_role()
