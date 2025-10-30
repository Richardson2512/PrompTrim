from supabase import Client
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import secrets
import string
import hashlib
from typing import Optional
import uuid

from database import get_supabase
from models import Profile, ApiKey
from schemas import ProfileCreate

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "your-secret-key-here"  # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class AuthService:
    def __init__(self):
        self.pwd_context = pwd_context
        self.supabase = get_supabase()
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Hash a password"""
        return self.pwd_context.hash(password)
    
    def get_profile_by_email(self, email: str) -> Optional[Profile]:
        """Get profile by email"""
        try:
            result = self.supabase.table("profiles").select("*").eq("email", email).execute()
            if result.data:
                return Profile(**result.data[0])
            return None
        except Exception as e:
            print(f"Error getting profile by email: {e}")
            return None
    
    def get_profile_by_id(self, user_id: str) -> Optional[Profile]:
        """Get profile by ID"""
        try:
            result = self.supabase.table("profiles").select("*").eq("id", user_id).execute()
            if result.data:
                return Profile(**result.data[0])
            return None
        except Exception as e:
            print(f"Error getting profile by ID: {e}")
            return None
    
    def create_profile(self, user_id: str, profile_data: ProfileCreate) -> Optional[Profile]:
        """Create a new profile"""
        try:
            profile_dict = {
                "id": user_id,
                "email": profile_data.email,
                "first_name": profile_data.first_name,
                "last_name": profile_data.last_name,
                "subscription_tier": "free",
                "monthly_token_limit": 10000,
                "tokens_used_this_month": 0
            }
            
            result = self.supabase.table("profiles").insert(profile_dict).execute()
            if result.data:
                return Profile(**result.data[0])
            return None
        except Exception as e:
            print(f"Error creating profile: {e}")
            return None
    
    def generate_api_key(self) -> tuple[str, str]:
        """Generate a secure API key and return (full_key, key_prefix)"""
        # Generate a 32-character API key
        alphabet = string.ascii_letters + string.digits
        api_key = ''.join(secrets.choice(alphabet) for _ in range(32))
        full_key = f"pt_{api_key}"
        key_prefix = full_key[:8] + "..." + full_key[-8:]
        return full_key, key_prefix
    
    def hash_api_key(self, api_key: str) -> str:
        """Hash an API key for storage"""
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    def get_user_from_api_key(self, api_key: str) -> Optional[Profile]:
        """Get user from API key"""
        try:
            key_hash = self.hash_api_key(api_key)
            result = self.supabase.table("api_keys").select("*, profiles(*)").eq("key_hash", key_hash).eq("is_active", True).execute()
            
            if result.data and len(result.data) > 0:
                api_key_data = result.data[0]
                
                # Update last used timestamp
                self.supabase.table("api_keys").update({
                    "last_used_at": datetime.utcnow().isoformat()
                }).eq("id", api_key_data["id"]).execute()
                
                # Extract profile - check if it's nested
                profile_data = api_key_data.get("profiles")
                if profile_data:
                    # If profiles is a dict (single profile)
                    if isinstance(profile_data, dict):
                        return Profile(**profile_data)
                    # If profiles is a list
                    elif isinstance(profile_data, list) and len(profile_data) > 0:
                        return Profile(**profile_data[0])
                
                # If profile is not found in the join, get it directly
                user_id = api_key_data.get("user_id")
                if user_id:
                    return self.get_profile_by_id(user_id)
            
            return None
        except Exception as e:
            print(f"Error getting user from API key: {e}")
            return None
    
    def create_api_key(self, user_id: str, name: str, key_type: str = "output", optimization_level: str = "moderate") -> Optional[tuple[ApiKey, str]]:
        """Create a new API key for a user and return (ApiKey, full_key)"""
        try:
            full_key, key_prefix = self.generate_api_key()
            key_hash = self.hash_api_key(full_key)
            key_id = str(uuid.uuid4())
            
            api_key_dict = {
                "id": key_id,
                "user_id": user_id,
                "key_hash": key_hash,
                "key_prefix": key_prefix,
                "name": name,
                "key_type": key_type,
                "optimization_level": optimization_level,
                "is_active": True
            }
            
            result = self.supabase.table("api_keys").insert(api_key_dict).execute()
            if result.data:
                return ApiKey(**result.data[0]), full_key
            return None
        except Exception as e:
            print(f"Error creating API key: {e}")
            return None
    
    def get_user_api_keys(self, user_id: str) -> list[ApiKey]:
        """Get all API keys for a user"""
        try:
            result = self.supabase.table("api_keys").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return [ApiKey(**key) for key in result.data] if result.data else []
        except Exception as e:
            print(f"Error getting user API keys: {e}")
            return []
    
    def deactivate_api_key(self, user_id: str, key_id: str) -> bool:
        """Deactivate an API key"""
        try:
            result = self.supabase.table("api_keys").update({
                "is_active": False
            }).eq("id", key_id).eq("user_id", user_id).execute()
            
            return len(result.data) > 0 if result.data else False
        except Exception as e:
            print(f"Error deactivating API key: {e}")
            return False
    
    def delete_api_key(self, user_id: str, key_id: str) -> bool:
        """Permanently delete an API key"""
        try:
            result = self.supabase.table("api_keys").delete().eq("id", key_id).eq("user_id", user_id).execute()
            return len(result.data) > 0 if result.data else False
        except Exception as e:
            print(f"Error deleting API key: {e}")
            return False
