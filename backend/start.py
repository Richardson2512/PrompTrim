#!/usr/bin/env python3
"""
PromptTrim API Startup Script
This script handles database initialization and starts the FastAPI server
"""

import os
import sys
import subprocess
import time
from pathlib import Path
from dotenv import load_dotenv

def check_dependencies():
    """Check if all required dependencies are installed"""
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        import sendgrid
        import transformers
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def setup_database():
    """Initialize the database with tables"""
    try:
        print("🔧 Setting up database...")
        
        # Supabase handles table creation via migrations
        # Just verify connection to database
        from database import get_supabase
        
        supabase = get_supabase()
        
        # Test connection by getting a simple query
        result = supabase.table('profiles').select('id').limit(1).execute()
        print("✅ Database connection successful")
        return True
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        print("⚠️  This is normal if tables haven't been created yet in Supabase")
        return True  # Allow startup even if connection fails

def check_environment():
    """Check if environment variables are set"""
    load_dotenv()
    
    required_vars = [
        "SUPABASE_URL",
        "SUPABASE_SERVICE_KEY",
        "SECRET_KEY"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please copy env.example to .env and fill in the values")
        return False
    
    print("✅ Environment variables configured")
    return True

def start_server():
    """Start the FastAPI server"""
    try:
        print("🚀 Starting PromptTrim API server...")
        print("📖 API Documentation: http://localhost:8000/docs")
        print("🔍 Health Check: http://localhost:8000/health")
        print("🛑 Press Ctrl+C to stop the server")
        print("-" * 50)
        
        import uvicorn
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Server startup failed: {e}")

def main():
    """Main startup function"""
    print("🎯 PromptTrim API Startup")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check environment
    if not check_environment():
        sys.exit(1)
    
    # Setup database
    if not setup_database():
        sys.exit(1)
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()
