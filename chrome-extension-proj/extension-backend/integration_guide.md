# PrompTrim Backend Integration Guide

## Overview

This backend provides API endpoints for the PrompTrim Chrome extension to compress prompts using advanced algorithms (e.g., TinyLlama).

## Architecture

```
Chrome Extension (Frontend)
        ↓ HTTP POST
PrompTrim API (Backend)
        ↓
TinyLlama Service (Optional)
```

## Integration with Your Existing Backend

### Option 1: Standalone API

Run as separate service:
```bash
cd chrome-extension-proj/extension-backend
pip install fastapi uvicorn
python api_endpoint.py
```

The API will be available at: `http://localhost:8001`

### Option 2: Integrate with Main Backend

Add to your existing `backend/main.py`:

```python
from backend.services.compression_service import compress_prompt
from chrome_extension_proj.extension_backend.api_endpoint import compress_rule_based

# Add this route to your existing app
@app.post("/api/promptrim/compress")
async def promptrim_compress(request: CompressRequest):
    """PrompTrim extension compression endpoint"""
    compressed = await compress_prompt(request.prompt)
    savings = calculate_savings(request.prompt, compressed)
    
    return {
        "compressed": compressed,
        "savings": savings,
        "confidence": 0.8
    }
```

### Option 3: Use TinyLlama Service

Connect to your existing TinyLlama service in `backend/services/tinyllama_service.py`:

```python
# In api_endpoint.py, replace compress_rule_based() with:

from backend.services.tinyllama_service import TinyLlamaService

tinyllama = TinyLlamaService()

@app.post("/api/compress", response_model=CompressResponse)
async def compress_prompt(request: CompressRequest):
    # Use TinyLlama for compression
    compressed = await tinyllama.compress_prompt(request.prompt)
    
    return CompressResponse(
        compressed=compressed,
        savings=calculate_savings(request.prompt, compressed),
        confidence=0.95  # High confidence with ML model
    )
```

## API Endpoints

### POST /api/compress

Compress a prompt.

**Request:**
```json
{
  "prompt": "I would like to kindly ask you to help me with this task please",
  "model": "tinyllama"
}
```

**Response:**
```json
{
  "compressed": "Help me with this task",
  "savings": 65,
  "confidence": 0.8,
  "original_length": 67,
  "compressed_length": 23
}
```

### GET /health

Health check endpoint.

### GET /

API information.

## Configuration

### Environment Variables

Create `chrome-extension-proj/extension-backend/.env`:

```env
# TinyLlama Configuration
TINYLLAMA_ENDPOINT=http://localhost:5000
TINYLLAMA_API_KEY=your_api_key

# API Configuration
API_HOST=0.0.0.0
API_PORT=8001

# CORS (for Chrome extension)
ALLOWED_ORIGINS=chrome-extension://*
```

### CORS Setup

To allow Chrome extension to access the API:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Chrome Extension Configuration

Update the Chrome extension to point to your backend:

1. Open `chrome-extension-proj/extension-frontend/popup.html`
2. Set compression mode to "API"
3. Enter endpoint: `http://localhost:8001/api/compress`
4. Or use your production URL: `https://your-api.com/api/compress`

## Testing

Test the API locally:

```bash
curl -X POST http://localhost:8001/api/compress \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Can you please help me with this task?"}'
```

## Production Deployment

### Option 1: Add to existing Railway deployment

Add to your `backend/` that's already deployed on Railway.

### Option 2: Separate deployment

Deploy as standalone service:

```bash
# Install dependencies
pip install -r requirements.txt

# Run with gunicorn for production
gunicorn api_endpoint:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8001
```

## Security Considerations

1. **Rate Limiting**: Add rate limiting to prevent abuse
2. **Authentication**: Consider adding API key authentication
3. **Input Validation**: Already handled by Pydantic models
4. **CORS**: Configure properly for production

Example rate limiting:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/compress")
@limiter.limit("10/minute")
async def compress_prompt(request: CompressRequest):
    # ...
```

## Monitoring

Add logging and monitoring:

```python
import structlog

logger = structlog.get_logger()

@app.post("/api/compress")
async def compress_prompt(request: CompressRequest):
    logger.info("compression_request", 
                prompt_length=len(request.prompt),
                model=request.model)
    
    # compression logic
    
    logger.info("compression_complete", 
                savings=savings,
                confidence=confidence)
```

## Next Steps

1. Integrate TinyLlama compression algorithm
2. Add caching for common prompts
3. Implement rate limiting
4. Add API authentication
5. Deploy to production
6. Update Chrome extension to use production URL

