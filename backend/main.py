from fastapi import FastAPI, HTTPException, Depends, status, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse, StreamingResponse
import uvicorn
import uuid
from contextlib import asynccontextmanager
from typing import Optional
from datetime import datetime

from database import get_supabase
from models import Profile, ApiKey, Prompt, ChatQuestion
from schemas import (
    ProfileCreate, ProfileResponse, APIKeyCreate, APIKeyResponse,
    PromptOptimizeRequest, PromptOptimizeResponse, AuthResponse,
    ChatRequest, ChatResponse,
    LLMChatRequest, LLMChatResponse,
    OutputReduceRequest, OutputReduceResponse
)
from services.auth_service import AuthService
from services.prompt_service import PromptOptimizationService
from services.email_service import EmailService
from pipelines.input.compressor import InputCompressor
from services.docs_chat_service import DocsChatService
from services.llm_router import LLMRouter
from pipelines.output.summarizer import OutputSummarizer, build_quality_summary_response
from services.rules_engine import OpenAIRules, AnthropicRules, OutputFormat
from services.token_counter import OpenAITokenCounter
from database import get_supabase
from services.grammar_service import get_grammar_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown

app = FastAPI(
    title="PromptTrim API",
    description="AI-powered prompt optimization platform using TinyLlama compression",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Initialize services
auth_service = AuthService()
prompt_service = PromptOptimizationService()
email_service = EmailService()
tinyllama_service = InputCompressor()
docs_chat_service = DocsChatService()
llm_router = LLMRouter()
qa_summarizer = OutputSummarizer(similarity_threshold=0.75)

# API key middleware: attach api_key_info for /api/llm/* routes
@app.middleware("http")
async def api_key_middleware(request: Request, call_next):
    try:
        if request.url.path.startswith("/api/llm"):
            auth = request.headers.get("Authorization")
            if not auth or not auth.startswith("Bearer "):
                return JSONResponse(status_code=401, content={"detail": "Missing API key"})
            key = auth.split(" ")[1]
            supabase = get_supabase()
            res = supabase.table("api_keys").select("optimization_level, user_id").eq("key", key).execute()
            if not res.data:
                return JSONResponse(status_code=403, content={"detail": "Invalid API key"})
            request.state.api_key_info = res.data[0]
    except Exception:
        # Do not block non /api/llm routes
        pass
    return await call_next(request)

@app.get("/")
async def root():
    return {"message": "PromptTrim API - AI-powered prompt optimization"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "PromptTrim API"}

# Authentication endpoints (Supabase handles auth, this is for API key management)
@app.post("/auth/create-profile", response_model=ProfileResponse)
async def create_profile(user_id: str, profile_data: ProfileCreate):
    """Create a user profile after Supabase auth"""
    try:
        # Check if profile already exists
        existing_profile = auth_service.get_profile_by_id(user_id)
        if existing_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Profile already exists"
            )
        
        # Create profile
        profile = auth_service.create_profile(user_id, profile_data)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create profile"
            )
        
        # Send welcome email
        full_name = f"{profile.first_name} {profile.last_name}".strip() or "User"
        await email_service.send_welcome_email(profile.email, full_name)
        
        return ProfileResponse(
            id=profile.id,
            email=profile.email,
            first_name=profile.first_name,
            last_name=profile.last_name,
            subscription_tier=profile.subscription_tier,
            monthly_token_limit=profile.monthly_token_limit,
            tokens_used_this_month=profile.tokens_used_this_month,
            created_at=profile.created_at,
            updated_at=profile.updated_at
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile creation failed: {str(e)}"
        )

@app.get("/auth/profile/{user_id}", response_model=ProfileResponse)
async def get_profile(user_id: str):
    """Get user profile"""
    profile = auth_service.get_profile_by_id(user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return ProfileResponse(
        id=profile.id,
        email=profile.email,
        first_name=profile.first_name,
        last_name=profile.last_name,
        subscription_tier=profile.subscription_tier,
        monthly_token_limit=profile.monthly_token_limit,
        tokens_used_this_month=profile.tokens_used_this_month,
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )

# API Key management
@app.get("/api-keys/{user_id}", response_model=list[APIKeyResponse])
async def get_api_keys(user_id: str):
    """Get all API keys for the user"""
    api_keys = auth_service.get_user_api_keys(user_id)
    return [APIKeyResponse(
        id=key.id,
        name=key.name,
        key_prefix=key.key_prefix,
        key_type=key.key_type,
        optimization_level=key.optimization_level,
        created_at=key.created_at,
        last_used_at=key.last_used_at,
        is_active=key.is_active
    ) for key in api_keys]

@app.post("/api-keys/{user_id}")
async def create_api_key(user_id: str, key_data: APIKeyCreate):
    """Create a new API key and return it with full key"""
    result = auth_service.create_api_key(user_id, key_data.name, key_data.key_type, key_data.optimization_level)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create API key"
        )
    
    api_key, full_key = result
    
    return {
        "id": api_key.id,
        "name": api_key.name,
        "key_prefix": api_key.key_prefix,
        "key_type": api_key.key_type,
        "optimization_level": api_key.optimization_level,
        "full_key": full_key,  # Include the full key on creation
        "created_at": api_key.created_at,
        "last_used_at": api_key.last_used_at,
        "is_active": api_key.is_active
    }

@app.delete("/api-keys/{user_id}/{key_id}")
async def delete_api_key(user_id: str, key_id: str):
    """Delete an API key"""
    success = auth_service.delete_api_key(user_id, key_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    return {"message": "API key deleted successfully"}

# Main prompt optimization endpoint
@app.post("/optimize/{user_id}", response_model=PromptOptimizeResponse)
async def optimize_prompt(
    user_id: str,
    request: PromptOptimizeRequest
):
    """Optimize a prompt using TinyLlama compression"""
    try:
        # Optimize the prompt
        optimized_result = await prompt_service.optimize_prompt(
            user_id=user_id,
            original_prompt=request.prompt,
            optimization_level=request.optimization_level,
            language=request.language
        )
        
        return PromptOptimizeResponse(
            id=optimized_result["id"],
            original_text=optimized_result["original_text"],
            optimized_text=optimized_result["optimized_text"],
            original_token_count=optimized_result["original_token_count"],
            optimized_token_count=optimized_result["optimized_token_count"],
            tokens_saved=optimized_result["tokens_saved"],
            optimization_level=optimized_result["optimization_level"],
            cost_saved_usd=optimized_result["cost_saved_usd"],
            created_at=optimized_result["created_at"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prompt optimization failed: {str(e)}"
        )

# Chrome Extension API Endpoint - Optimize with API Key
@app.post("/api/optimize")
async def optimize_with_api_key(request: PromptOptimizeRequest, req: Request, authorization: str = Header(None)):
    """Optimize a prompt using API key authentication (for Chrome extension)"""
    try:
        # Get API key from Authorization header
        api_key = None
        if authorization:
            api_key = authorization.replace('Bearer ', '').strip()
        elif req.headers.get('authorization'):
            api_key = req.headers.get('authorization').replace('Bearer ', '').strip()
        
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key required in Authorization header"
            )
        
        # Get user from API key
        profile = auth_service.get_user_from_api_key(api_key)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or inactive API key"
            )
        
        # Optimize the prompt
        optimized_result = await prompt_service.optimize_prompt(
            user_id=profile.id,
            original_prompt=request.prompt,
            optimization_level=request.optimization_level,
            language=request.language
        )
        
        return PromptOptimizeResponse(
            id=optimized_result["id"],
            original_text=optimized_result["original_text"],
            optimized_text=optimized_result["optimized_text"],
            original_token_count=optimized_result["original_token_count"],
            optimized_token_count=optimized_result["optimized_token_count"],
            tokens_saved=optimized_result["tokens_saved"],
            optimization_level=optimized_result["optimization_level"],
            cost_saved_usd=optimized_result["cost_saved_usd"],
            created_at=optimized_result["created_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prompt optimization failed: {str(e)}"
        )

# Analytics endpoints
@app.get("/prompts/history/{user_id}")
async def get_prompt_history(user_id: str, limit: int = 50):
    """Get prompt history for the user"""
    try:
        prompts_result = prompt_service.supabase.table("prompts").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
        return {"prompts": prompts_result.data or []}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch prompt history: {str(e)}"
        )

@app.get("/analytics/usage/{user_id}")
async def get_usage_analytics(user_id: str):
    """Get usage analytics for the user"""
    analytics = prompt_service.get_user_analytics(user_id)
    return analytics

# Documentation Chat Endpoint
@app.post("/docs/chat", response_model=ChatResponse)
async def chat_with_docs(request: ChatRequest, user_id: Optional[str] = None):
    """
    Chat with the AI assistant about PromptTrim documentation
    Saves all questions and answers to the database
    """
    question = request.question
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question is required"
        )
    
    try:
        # Get answer from chat service
        result = await docs_chat_service.answer_question(question)
        
        # Save to database
        supabase = get_supabase()
        chat_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,  # Can be None for anonymous users
            "question": question,
            "answer": result["answer"],
            "sources": result["sources"],
            "confidence": result["confidence"],
            "created_at": datetime.utcnow().isoformat()
        }
        
        try:
            supabase.table("chat_questions").insert(chat_data).execute()
        except Exception as db_error:
            print(f"Warning: Could not save chat question to database: {db_error}")
            # Continue even if database save fails
        
        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"],
            confidence=result["confidence"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat failed: {str(e)}"
        )

# Grammar Check Endpoint
@app.post("/api/grammar-check")
async def check_grammar(request: PromptOptimizeRequest):
    """
    Check grammar using spaCy + Grammarkit-style rules
    
    Args:
        request: Contains the text to check
        
    Returns:
        Grammar check results with errors and suggestions
    """
    text = request.prompt
    
    if not text or len(text) < 10:
        return {
            "hasErrors": False,
            "errors": [],
            "errorCount": 0,
            "text": text
        }
    
    try:
        grammar_service = get_grammar_service()
        result = grammar_service.check_grammar(text)
        
        return {
            "hasErrors": result["hasErrors"],
            "errors": result["errors"],
            "errorCount": result["errorCount"],
            "text": text
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Grammar check failed: {str(e)}"
        )

# Grammar Correction Endpoint
@app.post("/api/grammar-correct")
async def correct_grammar(request: PromptOptimizeRequest):
    """
    Apply grammar corrections to text
    
    Args:
        request: Contains the text and errors to correct
        
    Returns:
        Corrected text
    """
    text = request.prompt
    
    if not text:
        return {
            "correctedText": text,
            "errorCount": 0
        }
    
    try:
        grammar_service = get_grammar_service()
        
        # First check for errors
        check_result = grammar_service.check_grammar(text)
        
        if check_result["hasErrors"]:
            # Apply corrections
            corrected_text = grammar_service.correct_grammar(text, check_result["errors"])
            
            return {
                "correctedText": corrected_text,
                "errorCount": check_result["errorCount"],
                "originalText": text
            }
        
        return {
            "correctedText": text,
            "errorCount": 0,
            "originalText": text
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Grammar correction failed: {str(e)}"
        )

# Overall LLM chat endpoint: input compression -> provider call -> output reduction
@app.post("/api/llm/chat", response_model=LLMChatResponse)
async def llm_chat(request: LLMChatRequest, req: Request):
    try:
        # Resolve optimization level from API key (if present)
        api_level = None
        if hasattr(req.state, "api_key_info"):
            api_level = req.state.api_key_info.get("optimization_level")

        # Map optimization level to compression ratio
        compression_ratios = {
            "minimal": 0.8,
            "moderate": 0.5,
            "aggressive": 0.3
        }
        # numeric levels 1=light, 2=moderate, 3=aggressive
        numeric_map = {1: "minimal", 2: "moderate", 3: "aggressive"}
        effective_level = request.optimization_level
        if isinstance(api_level, int) and api_level in numeric_map:
            effective_level = numeric_map[api_level]
        compression_ratio = compression_ratios.get(effective_level, 0.5)

        # Input compression using TinyLlama
        compressed = tinyllama_service.compress_prompt(
            prompt=request.prompt,
            compression_ratio=compression_ratio
        )
        optimized_prompt = compressed.get("optimized_prompt", request.prompt)

        # Route to provider and get raw output
        routed = await llm_router.call(
            provider=request.provider,
            prompt=optimized_prompt,
            max_output_tokens=request.max_output_tokens,
            model=request.model
        )
        if routed.get("error"):
            raise HTTPException(status_code=400, detail=routed["error"])
        raw_output = routed.get("text", "")

        # Output reduction with quality checks
        final_summary, similarity_score, iterations = qa_summarizer.summarize_with_quality_check(
            raw_output,
            max_length=max(60, request.max_output_tokens // 2),
            target_similarity=0.75
        )

        # Token estimates
        prompt_tokens_est = llm_router.estimate_tokens(request.provider, optimized_prompt)
        output_tokens_est = llm_router.estimate_tokens(request.provider, raw_output)

        # Build response + token breakdown
        original_output_tokens = max(1, len(raw_output.split()))
        compressed_output_tokens = len(final_summary.split())
        reduction_percent = round(((original_output_tokens - compressed_output_tokens) / original_output_tokens) * 100, 2)

        # Optional: detailed tokens object for OpenAI using exact counts
        tokens_detail = None
        if request.provider.lower() == "openai":
            model_name = request.model or "gpt-4o-mini"
            input_counts = OpenAITokenCounter.count_batch([request.prompt, optimized_prompt], model=model_name)
            output_counts = OpenAITokenCounter.count_batch([raw_output, final_summary], model=model_name)
            input_original, input_compressed = input_counts
            output_original, output_final = output_counts
            total_saved = max(0, (input_original + output_original) - (input_compressed + output_final))
            efficiency = 0.0
            denom = (input_original + output_original)
            if denom > 0:
                efficiency = round(1 - ((input_compressed + output_final) / denom), 3)
            tokens_detail = {
                "input": {"original": input_original, "compressed": input_compressed, "saved": input_original - input_compressed},
                "output": {"original": output_original, "final": output_final, "saved": output_original - output_final},
                "total_saved": total_saved,
                "efficiency": efficiency,
            }

        response_payload = LLMChatResponse(
            provider=request.provider,
            model=(request.model or ""),
            prompt_tokens_est=prompt_tokens_est,
            output_tokens_est=output_tokens_est,
            raw_output=raw_output,
            final_output=final_summary,
            quality_similarity=similarity_score,
            iterations_used=iterations,
            reduction_percent=reduction_percent
        )

        # Attach non-modeled extra section when OpenAI (exact breakdown)
        if tokens_detail is not None:
            # FastAPI will include extra fields if we return a dict
            base = response_payload.model_dump()
            base["tokens"] = tokens_detail
            base["optimization_level"] = api_level if api_level is not None else effective_level
            return base

        return response_payload
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM chat failed: {str(e)}")


# Output-only reduction endpoint
@app.post("/api/output/reduce", response_model=OutputReduceResponse)
async def reduce_output(request: OutputReduceRequest):
    try:
        summary, similarity, iterations = qa_summarizer.summarize_with_quality_check(
            request.text,
            max_length=request.max_length,
            target_similarity=request.target_similarity
        )
        original_tokens = len(request.text.split())
        compressed_tokens = len(summary.split())
        reduction_percent = 0.0
        if original_tokens > 0:
            reduction_percent = round(((original_tokens - compressed_tokens) / original_tokens) * 100, 2)
        return OutputReduceResponse(
            output=summary,
            similarity_to_original=similarity,
            iterations_used=iterations,
            original_tokens=original_tokens,
            compressed_tokens=compressed_tokens,
            reduction_percent=reduction_percent
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Output reduction failed: {str(e)}")


# Optional: OpenAI streaming (text/plain). Only for provider=openai
@app.post("/api/llm/stream")
async def stream_chat(request: LLMChatRequest):
    if request.provider.lower() != "openai":
        raise HTTPException(status_code=400, detail="Streaming supported only for OpenAI provider")

    async def _generator():
        try:
            # Compress input first
            compression_ratios = {"minimal": 0.8, "moderate": 0.5, "aggressive": 0.3}
            compression_ratio = compression_ratios.get(request.optimization_level, 0.5)
            compressed = tinyllama_service.compress_prompt(prompt=request.prompt, compression_ratio=compression_ratio)
            optimized_prompt = compressed.get("optimized_prompt", request.prompt)

            # Use OpenAI streaming via httpx
            import os
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                yield "[Streaming error: OPENAI_API_KEY not configured]"
                return
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
            payload = {
                "model": request.model or "gpt-4o-mini",
                "messages": [{"role": "user", "content": optimized_prompt}],
                "stream": True,
                "max_tokens": request.max_output_tokens,
            }
            async with httpx.AsyncClient(timeout=None) as client:
                async with client.stream("POST", url, headers=headers, json=payload) as resp:
                    async for line in resp.aiter_lines():
                        if not line or not line.startswith("data:"):
                            continue
                        data = line[5:].strip()
                        if data == "[DONE]":
                            break
                        try:
                            obj = json.loads(data)
                            delta = obj.get("choices", [{}])[0].get("delta", {}).get("content", "")
                            if delta:
                                yield delta
                        except Exception:
                            continue
        except Exception as e:
            yield f"[Streaming error: {str(e)}]"

    return StreamingResponse(_generator(), media_type="text/plain")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
