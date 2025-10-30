# PromptTrim API Documentation

## Overview

PromptTrim is an AI-powered prompt optimization platform that uses TinyLlama compression technology to reduce token usage by 30-70% while maintaining output quality. This API allows developers to integrate prompt optimization into their applications.

## Features

- 🚀 **Smart Compression**: Uses TinyLlama to intelligently compress prompts
- 💰 **Cost Savings**: Reduce token usage by 30-70% without losing quality
- 🔧 **Easy Integration**: Simple REST API with comprehensive documentation
- 📊 **Analytics**: Track usage and savings with detailed analytics
- 🔐 **Secure**: API key-based authentication
- 📧 **Email Integration**: SendGrid-powered welcome emails

## Quick Start

### 1. Register a User

```bash
curl -X POST "https://api.prompttrim.com/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "securepassword123"
  }'
```

### 2. Login and Get API Key

```bash
curl -X POST "https://api.prompttrim.com/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### 3. Optimize a Prompt

```bash
curl -X POST "https://api.prompttrim.com/optimize" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a detailed analysis of the current market trends in artificial intelligence, including machine learning, deep learning, and natural language processing technologies, their applications, challenges, and future prospects.",
    "compression_ratio": 0.5,
    "target_llm": "gpt-4"
  }'
```

## API Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "string",
  "name": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2024-01-01T00:00:00Z",
  "is_active": true
}
```

#### POST /auth/login
Login and get API key.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "pt_abc123...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true
  }
}
```

### API Key Management

#### GET /api-keys
Get all API keys for the authenticated user.

**Headers:**
- `Authorization: Bearer YOUR_API_KEY`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Default API Key",
    "key": "pt_abc123...xyz789",
    "created_at": "2024-01-01T00:00:00Z",
    "last_used": "2024-01-01T12:00:00Z",
    "is_active": true
  }
]
```

#### POST /api-keys
Create a new API key.

**Headers:**
- `Authorization: Bearer YOUR_API_KEY`

**Request Body:**
```json
{
  "name": "My New API Key"
}
```

### Prompt Optimization

#### POST /optimize
Optimize a prompt using TinyLlama compression.

**Headers:**
- `Authorization: Bearer YOUR_API_KEY`

**Request Body:**
```json
{
  "prompt": "string",
  "target_llm": "string (optional)",
  "compression_ratio": 0.5
}
```

**Response:**
```json
{
  "original_prompt": "Write a detailed analysis...",
  "optimized_prompt": "Analyze AI market trends...",
  "original_tokens": 45,
  "optimized_tokens": 23,
  "compression_ratio": 0.511,
  "savings_percentage": 48.9
}
```

### Analytics

#### GET /analytics/usage
Get usage analytics for the authenticated user.

**Headers:**
- `Authorization: Bearer YOUR_API_KEY`

**Response:**
```json
{
  "total_optimizations": 150,
  "total_tokens_saved": 2500,
  "average_compression_ratio": 0.45,
  "most_used_llm": "gpt-4",
  "optimizations_this_month": 25
}
```

## Parameters

### Compression Ratio
- **Range**: 0.1 to 0.9
- **Default**: 0.5
- **Description**: Target compression ratio (0.1 = 10% of original tokens, 0.9 = 90% of original tokens)

### Target LLM
- **Optional**: Yes
- **Description**: Specify the target LLM for optimization (e.g., "gpt-4", "claude-3", "llama-2")

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a JSON body with error details:

```json
{
  "detail": "Error message describing what went wrong"
}
```

## Rate Limits

- **Free Tier**: 100 requests per hour
- **Pro Tier**: 1000 requests per hour
- **Enterprise**: Custom limits

## SDKs and Examples

### Python Example

```python
import requests

class PromptTrimClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.prompttrim.com"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def optimize_prompt(self, prompt, compression_ratio=0.5, target_llm=None):
        response = requests.post(
            f"{self.base_url}/optimize",
            headers=self.headers,
            json={
                "prompt": prompt,
                "compression_ratio": compression_ratio,
                "target_llm": target_llm
            }
        )
        return response.json()

# Usage
client = PromptTrimClient("your_api_key_here")
result = client.optimize_prompt(
    "Write a detailed analysis of AI trends...",
    compression_ratio=0.5
)
print(f"Saved {result['savings_percentage']:.1f}% tokens!")
```

### JavaScript Example

```javascript
class PromptTrimClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.prompttrim.com';
    }
    
    async optimizePrompt(prompt, compressionRatio = 0.5, targetLlm = null) {
        const response = await fetch(`${this.baseUrl}/optimize`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt,
                compression_ratio: compressionRatio,
                target_llm: targetLlm
            })
        });
        
        return await response.json();
    }
}

// Usage
const client = new PromptTrimClient('your_api_key_here');
const result = await client.optimizePrompt(
    'Write a detailed analysis of AI trends...',
    0.5
);
console.log(`Saved ${result.savings_percentage.toFixed(1)}% tokens!`);
```

## Support

- **Documentation**: https://docs.prompttrim.com
- **Support Email**: support@prompttrim.com
- **GitHub**: https://github.com/prompttrim/api
- **Discord**: https://discord.gg/prompttrim

## Changelog

### v1.0.0 (2024-01-01)
- Initial release
- TinyLlama integration
- User authentication
- API key management
- Prompt optimization
- Analytics dashboard
- SendGrid email integration
