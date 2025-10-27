"""
PrompTrim API Endpoint
Compression service for the Chrome extension backend
Integrates with TinyLlama for advanced prompt compression
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="PrompTrim API",
    description="Prompt compression service for PrompTrim Chrome extension",
    version="1.0.0"
)


class CompressRequest(BaseModel):
    """Request model for prompt compression"""
    prompt: str
    model: Optional[str] = "tinyllama"
    mode: Optional[str] = "standard"


class CompressResponse(BaseModel):
    """Response model for compressed prompt"""
    compressed: str
    savings: int
    confidence: float
    original_length: int
    compressed_length: int


def calculate_savings_percentage(original: str, compressed: str) -> int:
    """Calculate token savings percentage"""
    original_length = len(original)
    compressed_length = len(compressed)
    
    if original_length == 0:
        return 0
    
    savings = ((original_length - compressed_length) / original_length) * 100
    return int(round(savings))


def estimate_tokens(text: str) -> int:
    """Estimate token count (OpenAI uses ~4 chars per token)"""
    return len(text) // 4


@app.post("/api/compress", response_model=CompressResponse)
async def compress_prompt(request: CompressRequest):
    """
    Compress a prompt using TinyLlama or rule-based fallback
    
    Args:
        request: CompressRequest containing the original prompt
        
    Returns:
        CompressResponse with compressed prompt and metadata
    """
    try:
        logger.info(f"Received compression request for {len(request.prompt)} chars")
        
        # TODO: Integrate with your TinyLlama service
        # For now, use rule-based compression
        compressed = compress_rule_based(request.prompt)
        
        # Calculate savings
        savings = calculate_savings_percentage(request.prompt, compressed)
        
        # Estimate confidence (rule-based is less confident than ML-based)
        confidence = 0.7  # Would be higher if using TinyLlama
        
        response = CompressResponse(
            compressed=compressed,
            savings=savings,
            confidence=confidence,
            original_length=len(request.prompt),
            compressed_length=len(compressed)
        )
        
        logger.info(f"Compression complete: {savings}% savings")
        
        return response
        
    except Exception as e:
        logger.error(f"Compression failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to compress prompt: {str(e)}"
        )


def compress_rule_based(prompt: str) -> str:
    """
    Fallback rule-based compression
    This is a simple implementation - replace with TinyLlama integration
    """
    import re
    
    compressed = prompt
    
    # Redundant phrases to remove
    replacements = [
        (r'\bplease\b', ''),
        (r'\bkindly\b', ''),
        (r'\bcan you\b', ''),
        (r'\bcould you\b', ''),
        (r'\bwould you\b', ''),
        (r'\bI want you to\b', ''),
        (r'\bI need you to\b', ''),
        (r'\bI would like you to\b', ''),
        (r'\bin order to\b', 'to'),
        (r'\bfor the purpose of\b', 'for'),
        (r'\bwith regards to\b', 'about'),
        (r'\breferring to\b', 'on'),
    ]
    
    for pattern, replacement in replacements:
        compressed = re.sub(pattern, replacement, compressed, flags=re.IGNORECASE)
    
    # Remove extra whitespace
    compressed = re.sub(r'\s+', ' ', compressed)
    compressed = re.sub(r'\s+([,.!?;:])', r'\1', compressed)
    compressed = compressed.strip()
    
    return compressed


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "promptrim-api",
        "version": "1.0.0"
    }


@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "name": "PrompTrim API",
        "version": "1.0.0",
        "endpoints": {
            "compress": "/api/compress",
            "health": "/health"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

