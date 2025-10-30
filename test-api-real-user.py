#!/usr/bin/env python3
"""
Test API with real user ID
"""

import requests
import json

def test_api_real_user():
    base_url = "http://localhost:8000"
    
    print("Testing PromptTrim API with Real User")
    print("=" * 50)
    
    # Use the real user ID we found
    user_id = "27aa5c76-a2e1-49b7-8bee-32dd0506ae62"
    user_email = "richsamven12@gmail.com"
    
    print(f"Testing with user: {user_email} (ID: {user_id})")
    print()
    
    # Test 1: Health Check
    print("1. Testing Health Check...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("+ Health check passed")
        else:
            print(f"- Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"- Health check error: {e}")
        return False
    
    # Test 2: Get Profile (this should work now)
    print("\n2. Testing Profile Retrieval...")
    try:
        response = requests.get(f"{base_url}/auth/profile/{user_id}")
        if response.status_code == 200:
            print("+ Profile retrieval passed")
            profile = response.json()
            print(f"   Email: {profile.get('email', 'N/A')}")
            print(f"   Name: {profile.get('first_name', 'N/A')} {profile.get('last_name', 'N/A')}")
            print(f"   Tier: {profile.get('subscription_tier', 'N/A')}")
        else:
            print(f"- Profile retrieval failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"- Profile retrieval error: {e}")
    
    # Test 3: Create API Key
    print("\n3. Testing API Key Creation...")
    try:
        response = requests.post(f"{base_url}/api-keys/{user_id}",
                               json={"name": "Test API Key"})
        if response.status_code == 200:
            print("+ API key creation passed")
            api_key = response.json()
            print(f"   API Key: {api_key}")
        else:
            print(f"- API key creation failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"- API key creation error: {e}")
    
    # Test 4: Prompt Optimization
    print("\n4. Testing Prompt Optimization...")
    test_prompt = "Write a detailed analysis of the current market trends in artificial intelligence, including machine learning, deep learning, and natural language processing technologies, their applications, challenges, and future prospects."
    
    try:
        response = requests.post(f"{base_url}/optimize/{user_id}",
                               json={
                                   "prompt": test_prompt,
                                   "optimization_level": "moderate",
                                   "language": "en"
                               })
        if response.status_code == 200:
            print("+ Prompt optimization passed")
            result = response.json()
            print(f"   Original tokens: {result['original_token_count']}")
            print(f"   Optimized tokens: {result['optimized_token_count']}")
            print(f"   Tokens saved: {result['tokens_saved']}")
            print(f"   Cost saved: ${result['cost_saved_usd']:.4f}")
        else:
            print(f"- Prompt optimization failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"- Prompt optimization error: {e}")
    
    # Test 5: Analytics
    print("\n5. Testing Analytics...")
    try:
        response = requests.get(f"{base_url}/analytics/usage/{user_id}")
        if response.status_code == 200:
            print("+ Analytics passed")
            analytics = response.json()
            print(f"   Analytics: {analytics}")
        else:
            print(f"- Analytics failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"- Analytics error: {e}")
    
    print("\n" + "=" * 50)
    print("Real User API Test Completed!")
    
    return True

if __name__ == "__main__":
    test_api_real_user()
