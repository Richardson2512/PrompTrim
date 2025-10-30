from typing import Dict, Any, List, Tuple
import re

# Extract all documentation content
DOCS_CONTENT = {
    "overview": """
    PromptTrim is an AI-powered token optimization platform that intelligently compresses your prompts 
    to reduce LLM token costs while maintaining quality and effectiveness. Our API provides fast, scalable 
    compression services for input prompts, output responses, and complete workflows.
    
    Key Advantages:
    - Save 30-70% on token costs
    - Maintain prompt quality while reducing length
    - Real-time optimization with sub-second response times
    - Full analytics tracking your savings and usage
    - Support for all major LLMs (GPT-4, Claude, Llama, Gemini, etc.)
    
    Supported LLM Models:
    - OpenAI: GPT-3.5, GPT-4, GPT-4 Turbo
    - Anthropic: Claude 3 Opus, Sonnet, Haiku
    - Google: Gemini Pro, Gemini Ultra
    - Meta: Llama 2, Llama 3
    - Mistral: Mistral 7B, Mistral Large
    """,
    
    "getting-started": """
    Getting Started with PromptTrim:
    
    1. Sign up: Create an account at app.promptrim.com
    2. Get your API key: Navigate to API Keys section and create a new key
    3. Choose optimization level: Minimal (20-30% reduction), Moderate (40-60% reduction), or Aggressive (60-80% reduction)
    4. Make your first request: Use the /optimize endpoint with your API key
    
    Quick Start Code Examples:
    
    Python:
    ```python
    import requests
    
    response = requests.post(
        'https://api.promptrim.com/optimize',
        headers={'Authorization': 'Bearer YOUR_API_KEY'},
        json={'prompt': 'Your prompt text', 'optimization_level': 'moderate'}
    )
    print(response.json()['optimized_text'])
    ```
    
    cURL:
    ```bash
    curl -X POST https://api.promptrim.com/optimize \\
      -H "Authorization: Bearer YOUR_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{"prompt":"Your prompt text","optimization_level":"moderate"}'
    ```
    """,
    
    "api-keys": """
    Managing API Keys:
    
    - Create keys: Go to API Keys page, click "Create Key", choose name and optimization level
    - Key types: Currently supporting Input optimization only (Output coming soon)
    - Security: Your full key is shown once upon creation - save it immediately!
    - Revoke keys: Click "Revoke" to permanently delete a key if compromised
    - Key limits: Free tier allows 10,000 tokens/month, paid plans available
    """,
    
    "optimization-levels": """
    Optimization Levels:
    
    1. Minimal (20-30% reduction):
       - Gentle compression, preserves most context
       - Best for: Complex prompts requiring full context
       
    2. Moderate (40-60% reduction):
       - Balanced compression, recommended for most cases
       - Best for: General use, cost-effective optimization
       
    3. Aggressive (60-80% reduction):
       - Maximum compression for maximum cost savings
       - Best for: Simple prompts, high-volume usage
    """,
    
    "api-endpoints": """
    API Endpoints:
    
    POST /optimize - Optimize a prompt
    - Required: prompt (string), optimization_level (minimal/moderate/aggressive)
    - Returns: original_text, optimized_text, token savings
    
    GET /api-keys/{user_id} - List your API keys
    - Returns: List of active API keys with metadata
    
    POST /api-keys/{user_id} - Create new API key
    - Required: name (string), optimization_level (string)
    - Returns: Full key (shown once!), key metadata
    
    DELETE /api-keys/{user_id}/{key_id} - Revoke API key
    - Permanently deletes the key
    """,
    
    "authentication": """
    Authentication:
    
    - Include your API key in the Authorization header: Bearer YOUR_API_KEY
    - Your API key should be kept secret
    - Rotate keys regularly for security
    - Never commit keys to version control
    """,
    
    "pricing": """
    Pricing & Limits:
    
    Free Tier:
    - 10,000 tokens/month
    - Unlimited API calls
    - Basic support
    
    Pro Tier ($9/month):
    - 100,000 tokens/month
    - Priority processing
    - Advanced analytics
    
    Enterprise:
    - Custom limits
    - Dedicated support
    - SLA guarantees
    """
}

class DocsChatService:
    def __init__(self):
        # No longer need TinyLlama for fast responses
        self.docs = DOCS_CONTENT
    
    def search_docs(self, question: str) -> List[Tuple[str, str]]:
        """
        Search documentation for relevant content based on question
        Returns list of (section_name, content) tuples
        """
        question_lower = question.lower()
        keywords = question_lower.split()
        
        results = []
        for section_name, content in self.docs.items():
            # Simple keyword matching
            content_lower = content.lower()
            match_count = sum(1 for keyword in keywords if keyword in content_lower)
            
            if match_count > 0:
                results.append((section_name, content, match_count))
        
        # Sort by relevance
        results.sort(key=lambda x: x[2], reverse=True)
        
        # Return top 2 most relevant sections
        return [(name, content) for name, content, _ in results[:2]]
    
    async def answer_question(self, question: str) -> Dict[str, Any]:
        """
        Answer a question using RAG (Retrieval-Augmented Generation)
        """
        # Search for relevant documentation
        relevant_docs = self.search_docs(question)
        
        if not relevant_docs:
            return {
                "answer": "I'm not sure about that specific topic. Try asking me about getting started, creating API keys, or the different optimization levels!",
                "sources": [],
                "confidence": 0.0
            }
        
        # Build context from retrieved docs
        context = "\n\n".join([content for _, content in relevant_docs])
        
        try:
            # Simple pattern-based extraction (much faster than TinyLlama)
            answer = self.extract_answer_fast(question, context)
            
            return {
                "answer": answer,
                "sources": [name for name, _ in relevant_docs],
                "confidence": 0.85
            }
            
        except Exception as e:
            print(f"Error generating answer: {e}")
            # Fallback: return relevant section directly
            section_name, content = relevant_docs[0]
            answer = self.format_friendly_answer(content[:500])
            
            return {
                "answer": answer,
                "sources": [section_name],
                "confidence": 0.7
            }
    
    def extract_answer_fast(self, question: str, context: str) -> str:
        """Fast pattern-based answer extraction"""
        question_lower = question.lower()
        
        # Prioritize HOW we reduce costs (mechanism) over pricing
        if any(word in question_lower for word in ['reduce cost', 'save money', 'cut cost', 'lower expense', 'reduce token', 'token reduction', 'optimize cost']):
            return "Great question! We reduce your API token costs by intelligently compressing your prompts - shrinking them by 30-70% while keeping the meaning intact. Think of it like ZIP compression but for AI prompts! 🔥 We use smart algorithms that remove redundancy, simplify phrasing, and keep only essential information. So instead of sending 1000 tokens, you might only send 400 - and you only pay for those 400 tokens when using our optimized prompts. It's like having a shortcut that saves you money!"
        
        # Ask specifically about HOW it works
        if any(word in question_lower for word in ['how does', 'how can', 'how is', 'how do', 'mechanism', 'work', 'process']):
            if 'cost' in question_lower or 'token' in question_lower or 'price' in question_lower or 'save' in question_lower:
                return "Here's exactly how we save you money: We take your long, verbose prompts and compress them down by 30-70% using intelligent optimization. For example, if your original prompt is 1000 tokens, we'll shrink it to maybe 400-500 tokens while keeping the same meaning. Since most LLMs charge per token, you're paying for 400-500 tokens instead of 1000! That's 50% savings right there. And the best part? Our compression keeps your prompts effective - the AI gets the same information from fewer words. Pretty cool savings, right? 💰"
            elif 'start' in question_lower:
                if 'api key' in question_lower or 'key' in question_lower:
                    return "First, sign up for an account! Then head to the API Keys page and click 'Create Key'. Choose your optimization level - I recommend 'moderate' for most use cases. You'll get your key right away - make sure to copy it immediately since we only show it once!"
                else:
                    return "Getting started is super easy! Just sign up, grab an API key, and start optimizing. You can choose between three optimization levels - minimal (gentle), moderate (balanced), or aggressive (maximum savings). Want to know more about any specific part?"
            else:
                return self.format_friendly_answer(context[:400])
        
        # Conversational responses based on keywords
        if any(word in question_lower for word in ['start', 'begin', 'getting started']):
            if 'api key' in question_lower or 'key' in question_lower:
                return "First, sign up for an account! Then head to the API Keys page and click 'Create Key'. Choose your optimization level - I recommend 'moderate' for most use cases. You'll get your key right away - make sure to copy it immediately since we only show it once!"
            else:
                return "Getting started is super easy! Just sign up, grab an API key, and start optimizing. You can choose between three optimization levels - minimal (gentle), moderate (balanced), or aggressive (maximum savings). Want to know more about any specific part?"
        
        if any(word in question_lower for word in ['optimization level', 'compression', 'aggressive', 'moderate', 'minimal']):
            if 'aggressive' in question_lower:
                return "Aggressive optimization gives you 60-80% token reduction - that's huge savings! Perfect for high-volume usage or simpler prompts. It really maximizes your cost efficiency."
            elif 'moderate' in question_lower:
                return "Moderate is my sweet spot recommendation! You get 40-60% reduction while keeping your prompt quality intact. It's the best balance for most people."
            elif 'minimal' in question_lower:
                return "Minimal gives you gentle compression - 20-30% reduction. Perfect when you need to preserve almost all context. Great for complex prompts!"
            else:
                return "We have three levels to choose from: Minimal (20-30% reduction, preserves most context), Moderate (40-60% reduction, great balance), and Aggressive (60-80% reduction, maximum savings). Most users love moderate! 🎯"
        
        if any(word in question_lower for word in ['api key', 'key', 'bearer', 'auth']):
            if 'create' in question_lower or 'get' in question_lower:
                return "Creating an API key is easy! Just go to your dashboard's API Keys section, click 'Create Key', give it a name, pick your optimization level, and boom - you're all set! Pro tip: copy it immediately because we only show it once for security."
            else:
                return "Your API key is like your secret passcode. Use it in the Authorization header like 'Bearer YOUR_API_KEY'. Keep it safe! 🔑"
        
        # Only show pricing if specifically asked about pricing plans
        if any(word in question_lower for word in ['pricing plan', 'paid plan', 'plan cost', 'subscription', 'monthly fee', 'tier']):
            return "Good news! We have a free tier with 10,000 tokens per month. If you need more, Pro is just $9/month for 100,000 tokens. We've got you covered! 💰"
        
        if any(word in question_lower for word in ['model', 'llm', 'gpt', 'claude', 'gemini']):
            return "PrompTrim works with all major LLMs! We support GPT-4, Claude, Gemini, Llama, Mistral - basically any AI that accepts text input. Pretty cool, right? 🤖"
        
        # Default: summarize the relevant content conversationally
        return self.format_friendly_answer(context[:400])
    
    def format_friendly_answer(self, content: str) -> str:
        """Format technical content into friendly conversation"""
        # Remove code blocks for smoother reading
        content = re.sub(r'```[\s\S]*?```', '', content)
        # Remove excessive newlines
        content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)
        # Take first few sentences
        sentences = content.split('.')
        return '. '.join(sentences[:2]) + '.' if len(sentences) > 2 else content

