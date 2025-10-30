#!/usr/bin/env python3
"""
Test script for PromptTrim API
"""

import requests
import json
import time
import sys
from typing import Dict, Any

class PromptTrimTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.api_key = None
        self.user_data = {
            "email": "test@example.com",
            "name": "Test User",
            "password": "testpassword123"
        }
    
    def test_health_check(self) -> bool:
        """Test the health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health")
            if response.status_code == 200:
                print("✅ Health check passed")
                return True
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return False
    
    def test_register_user(self) -> bool:
        """Test user registration"""
        try:
            response = requests.post(
                f"{self.base_url}/auth/register",
                json=self.user_data
            )
            if response.status_code == 200:
                print("✅ User registration passed")
                return True
            else:
                print(f"❌ User registration failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ User registration error: {e}")
            return False
    
    def test_login(self) -> bool:
        """Test user login"""
        try:
            response = requests.post(
                f"{self.base_url}/auth/login",
                json={
                    "email": self.user_data["email"],
                    "password": self.user_data["password"]
                }
            )
            if response.status_code == 200:
                data = response.json()
                self.api_key = data["access_token"]
                print("✅ User login passed")
                return True
            else:
                print(f"❌ User login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ User login error: {e}")
            return False
    
    def test_optimize_prompt(self) -> bool:
        """Test prompt optimization"""
        if not self.api_key:
            print("❌ No API key available for optimization test")
            return False
        
        try:
            test_prompt = "Write a detailed analysis of the current market trends in artificial intelligence, including machine learning, deep learning, and natural language processing technologies, their applications, challenges, and future prospects."
            
            response = requests.post(
                f"{self.base_url}/optimize",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "prompt": test_prompt,
                    "compression_ratio": 0.5,
                    "target_llm": "gpt-4"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Prompt optimization passed")
                print(f"   Original tokens: {data['original_tokens']}")
                print(f"   Optimized tokens: {data['optimized_tokens']}")
                print(f"   Savings: {data['savings_percentage']:.1f}%")
                return True
            else:
                print(f"❌ Prompt optimization failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Prompt optimization error: {e}")
            return False
    
    def test_analytics(self) -> bool:
        """Test analytics endpoint"""
        if not self.api_key:
            print("❌ No API key available for analytics test")
            return False
        
        try:
            response = requests.get(
                f"{self.base_url}/analytics/usage",
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Analytics test passed")
                print(f"   Total optimizations: {data['total_optimizations']}")
                print(f"   Total tokens saved: {data['total_tokens_saved']}")
                return True
            else:
                print(f"❌ Analytics test failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Analytics test error: {e}")
            return False
    
    def run_all_tests(self) -> bool:
        """Run all tests"""
        print("🧪 Running PromptTrim API Tests")
        print("=" * 50)
        
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_register_user),
            ("User Login", self.test_login),
            ("Prompt Optimization", self.test_optimize_prompt),
            ("Analytics", self.test_analytics)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n🔍 Testing {test_name}...")
            if test_func():
                passed += 1
            else:
                print(f"   Test failed: {test_name}")
        
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed!")
            return True
        else:
            print("❌ Some tests failed")
            return False

def main():
    """Main test function"""
    tester = PromptTrimTester()
    
    # Wait a moment for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(2)
    
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
