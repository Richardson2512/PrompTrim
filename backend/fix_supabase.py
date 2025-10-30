#!/usr/bin/env python3
"""
Fix Supabase connection by using service role directly
"""

from database import get_supabase
import os

def test_direct_access():
    print("Testing Direct Supabase Access...")
    print("=" * 40)
    
    try:
        supabase = get_supabase()
        
        # Test 1: Check if we can bypass RLS by using service role
        print("1. Testing service role access...")
        
        # Try to insert directly using service role
        test_profile = {
            'id': '550e8400-e29b-41d4-a716-446655440002',
            'email': 'service-test@example.com',
            'first_name': 'Service',
            'last_name': 'Test',
            'subscription_tier': 'free',
            'monthly_token_limit': 10000,
            'tokens_used_this_month': 0
        }
        
        # Use the service role client directly
        result = supabase.table('profiles').insert(test_profile).execute()
        print(f"   + Service role insert successful: {result.data}")
        
        # Test 2: Check if we can query
        print("\n2. Testing service role query...")
        result = supabase.table('profiles').select('*').eq('id', '550e8400-e29b-41d4-a716-446655440002').execute()
        print(f"   + Service role query successful: {len(result.data)} records")
        
        # Test 3: Clean up
        print("\n3. Cleaning up test data...")
        result = supabase.table('profiles').delete().eq('id', '550e8400-e29b-41d4-a716-446655440002').execute()
        print(f"   + Cleanup successful: {result.data}")
        
        print("\n✅ Service role is working! The issue might be in the API code.")
        return True
        
    except Exception as e:
        print(f"❌ Service role test failed: {e}")
        return False

if __name__ == "__main__":
    test_direct_access()
