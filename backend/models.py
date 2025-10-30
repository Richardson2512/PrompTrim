from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Supabase table models based on your existing schema

class Profile(BaseModel):
    id: str  # UUID from auth.users
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    subscription_tier: str = "free"  # free, pro, enterprise
    monthly_token_limit: int = 10000
    tokens_used_this_month: int = 0
    created_at: datetime
    updated_at: datetime

class Prompt(BaseModel):
    id: str
    user_id: str
    original_text: str
    original_token_count: int
    optimized_text: Optional[str] = None
    optimized_token_count: Optional[int] = None
    tokens_saved: int = 0
    optimization_level: str = "moderate"  # aggressive, moderate, minimal
    language: str = "en"
    status: str = "pending"  # pending, completed, failed
    cost_saved_usd: float = 0.0
    created_at: datetime

class AnalyticsDaily(BaseModel):
    id: str
    user_id: str
    date: str  # YYYY-MM-DD format
    total_prompts: int = 0
    total_tokens_saved: int = 0
    total_cost_saved_usd: float = 0.0
    avg_compression_rate: float = 0.0
    created_at: datetime

class ApiKey(BaseModel):
    id: str
    user_id: str
    key_hash: str
    key_prefix: str
    name: str
    key_type: str = "output"  # "input" or "output"
    optimization_level: str = "moderate"  # "aggressive", "moderate", or "minimal"
    is_active: bool = True
    last_used_at: Optional[datetime] = None
    created_at: datetime

class ChatQuestion(BaseModel):
    id: str
    user_id: Optional[str] = None  # Can be null for anonymous users
    question: str
    answer: str
    sources: list[str]
    confidence: float
    created_at: datetime
