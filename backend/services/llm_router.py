import os
from typing import Any, Dict, Optional

import httpx


class LLMRouter:
    """
    Simple LLM Router with provider-specific branches and tokenization helpers.
    Providers: openai, anthropic, grok, custom
    """

    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        self.grok_api_key = os.getenv("GROK_API_KEY")  # xAI
        self.custom_llm_endpoint = os.getenv("CUSTOM_LLM_ENDPOINT")
        self.custom_llm_api_key = os.getenv("CUSTOM_LLM_API_KEY")

        # Default models (can be overridden per call)
        self.default_models = {
            "openai": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            "anthropic": os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-latest"),
            "grok": os.getenv("GROK_MODEL", "grok-beta"),
            "custom": os.getenv("CUSTOM_LLM_MODEL", "default")
        }

    async def call(self, provider: str, prompt: str, max_output_tokens: int = 256, model: Optional[str] = None) -> Dict[str, Any]:
        provider = (provider or "").lower()
        if provider == "openai":
            return await self._call_openai(prompt, max_output_tokens, model or self.default_models["openai"])
        if provider == "anthropic":
            return await self._call_anthropic(prompt, max_output_tokens, model or self.default_models["anthropic"])
        if provider == "grok":
            return await self._call_grok(prompt, max_output_tokens, model or self.default_models["grok"])
        if provider == "custom":
            return await self._call_custom(prompt, max_output_tokens, model or self.default_models["custom"])
        raise ValueError(f"Unsupported provider: {provider}")

    # --- Provider branches ---

    async def _call_openai(self, prompt: str, max_output_tokens: int, model: str) -> Dict[str, Any]:
        if not self.openai_api_key:
            return {"error": "OPENAI_API_KEY not configured"}
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": max_output_tokens,
            "temperature": 0.3
        }
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(url, headers=headers, json=payload)
            data = resp.json()
        text = (data.get("choices") or [{}])[0].get("message", {}).get("content", "")
        return {"text": text, "raw": data}

    async def _call_anthropic(self, prompt: str, max_output_tokens: int, model: str) -> Dict[str, Any]:
        if not self.anthropic_api_key:
            return {"error": "ANTHROPIC_API_KEY not configured"}
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.anthropic_api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": model,
            "max_tokens": max_output_tokens,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(url, headers=headers, json=payload)
            data = resp.json()
        content = data.get("content") or []
        text = "".join([c.get("text", "") for c in content if c.get("type") == "text"]) if isinstance(content, list) else ""
        return {"text": text, "raw": data}

    async def _call_grok(self, prompt: str, max_output_tokens: int, model: str) -> Dict[str, Any]:
        if not self.grok_api_key:
            return {"error": "GROK_API_KEY not configured"}
        # xAI Grok (OpenAI-compatible in some SDKs); fallback to placeholder endpoint
        url = os.getenv("GROK_API_BASE", "https://api.x.ai/v1/chat/completions")
        headers = {
            "Authorization": f"Bearer {self.grok_api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": max_output_tokens,
            "temperature": 0.3
        }
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(url, headers=headers, json=payload)
            data = resp.json()
        text = (data.get("choices") or [{}])[0].get("message", {}).get("content", "")
        return {"text": text, "raw": data}

    async def _call_custom(self, prompt: str, max_output_tokens: int, model: str) -> Dict[str, Any]:
        if not self.custom_llm_endpoint:
            return {"error": "CUSTOM_LLM_ENDPOINT not configured"}
        headers = {"Content-Type": "application/json"}
        if self.custom_llm_api_key:
            headers["Authorization"] = f"Bearer {self.custom_llm_api_key}"
        payload = {
            "model": model,
            "prompt": prompt,
            "max_tokens": max_output_tokens
        }
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(self.custom_llm_endpoint, headers=headers, json=payload)
            data = resp.json()
        text = data.get("text") or data.get("output") or ""
        return {"text": text, "raw": data}

    # --- Tokenization helpers (approximate) ---

    def estimate_tokens(self, provider: str, text: str) -> int:
        provider = (provider or "").lower()
        if provider == "openai":
            try:
                import tiktoken
                enc = tiktoken.get_encoding("cl100k_base")
                return len(enc.encode(text))
            except Exception:
                return max(1, len(text) // 4)
        if provider == "anthropic":
            # Claude tokens ~ characters/4 as a rough estimate
            return max(1, len(text) // 4)
        if provider == "grok":
            # Approximate similar to GPT-3.5/4
            return max(1, len(text) // 4)
        # Custom unknown model
        return max(1, len(text) // 4)


