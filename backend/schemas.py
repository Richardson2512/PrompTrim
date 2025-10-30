from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# Profile schemas (Supabase auth integration)
class ProfileBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: str
    subscription_tier: str
    monthly_token_limit: int
    tokens_used_this_month: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# API Key schemas
class APIKeyBase(BaseModel):
    name: str

class APIKeyCreate(APIKeyBase):
    key_type: str = "output"  # "input" or "output"
    optimization_level: str = "moderate"  # "aggressive", "moderate", or "minimal"

class APIKeyResponse(APIKeyBase):
    id: str
    key_prefix: str  # Only show first 8 chars for security
    key_type: str  # "input" or "output"
    optimization_level: str  # "aggressive", "moderate", or "minimal"
    created_at: datetime
    last_used_at: Optional[datetime]
    is_active: bool
    
    class Config:
        from_attributes = True

# Prompt optimization schemas
class PromptOptimizeRequest(BaseModel):
    prompt: str
    optimization_level: str = "moderate"  # aggressive, moderate, minimal
    language: str = "en"

class PromptOptimizeResponse(BaseModel):
    id: str
    original_text: str
    optimized_text: str
    original_token_count: int
    optimized_token_count: int
    tokens_saved: int
    optimization_level: str
    cost_saved_usd: float
    created_at: datetime

# Analytics schemas
class UsageAnalytics(BaseModel):
    total_prompts: int
    total_tokens_saved: int
    total_cost_saved_usd: float
    avg_compression_rate: float
    prompts_this_month: int

# Auth schemas (for Supabase integration)
class AuthResponse(BaseModel):
    user_id: str
    email: str
    access_token: str
    refresh_token: str
    expires_in: int

# Chat schemas
class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    confidence: float

# LLM Router + Output reduction schemas
class LLMChatRequest(BaseModel):
    provider: str  # openai | anthropic | grok | custom
    model: Optional[str] = None
    prompt: str
    optimization_level: str = "moderate"  # reuse level for input compression behavior
    max_output_tokens: int = 256

class LLMChatResponse(BaseModel):
    provider: str
    model: str
    prompt_tokens_est: int
    output_tokens_est: int
    raw_output: str
    final_output: str
    quality_similarity: float
    iterations_used: int
    reduction_percent: float

class OutputReduceRequest(BaseModel):
    text: str
    max_length: int = 200
    target_similarity: float = 0.75

class OutputReduceResponse(BaseModel):
    output: str
    similarity_to_original: float
    iterations_used: int
    original_tokens: int
    compressed_tokens: int
    reduction_percent: float