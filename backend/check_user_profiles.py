#!/usr/bin/env python3
"""
Check if users have profiles created
"""

from database import get_supabase

def check_user_profiles():
    print("Checking User Profiles...")
    print("=" * 40)
    
    try:
        supabase = get_supabase()
        
        # Check profiles table
        print("1. Checking profiles table...")
        profiles_result = supabase.table('profiles').select('*').execute()
        print(f"   + Found {len(profiles_result.data)} profiles")
        
        if profiles_result.data:
            for profile in profiles_result.data:
                print(f"   - Profile: {profile['email']} (ID: {profile['id']})")
                print(f"     Name: {profile.get('first_name', 'N/A')} {profile.get('last_name', 'N/A')}")
                print(f"     Tier: {profile.get('subscription_tier', 'N/A')}")
        else:
            print("   - No profiles found")
        
        # Check if we can query auth.users (this might not work with service role)
        print("\n2. Checking auth users...")
        try:
            # This might not work with service role, but let's try
            auth_result = supabase.table('auth.users').select('id, email').execute()
            print(f"   + Found {len(auth_result.data)} auth users")
            for user in auth_result.data:
                print(f"   - Auth User: {user.get('email', 'N/A')} (ID: {user.get('id', 'N/A')})")
        except Exception as e:
            print(f"   - Cannot access auth.users: {e}")
            print("   - This is normal - service role might not have access to auth tables")
        
        # Test creating a profile manually
        print("\n3. Testing profile creation...")
        test_profile = {
            'id': '550e8400-e29b-41d4-a716-446655440004',
            'email': 'test-profile@example.com',
            'first_name': 'Test',
            'last_name': 'Profile',
            'subscription_tier': 'free',
            'monthly_token_limit': 10000,
            'tokens_used_this_month': 0
        }
        
        try:
            result = supabase.table('profiles').insert(test_profile).execute()
            print("   + Profile creation successful")
            
            # Clean up
            supabase.table('profiles').delete().eq('id', '550e8400-e29b-41d4-a716-446655440004').execute()
            print("   + Test profile cleaned up")
            
        except Exception as e:
            print(f"   - Profile creation failed: {e}")
        
        print("\n" + "=" * 40)
        print("Profile check completed!")
        
        if len(profiles_result.data) > 0:
            print("✅ Profiles are working! Your user should now have a profile.")
        else:
            print("❌ No profiles found. Please run the SQL script to create profiles for existing users.")
        
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    check_user_profiles()
