from __future__ import annotations

import json
import re
import time
from enum import Enum
from typing import Any, Dict, List, Optional

import httpx

from .token_counter import OpenAITokenCounter


class OutputFormat(str, Enum):
    JSON = "json"
    BULLET = "bullet"
    PROSE = "prose"


class RetryPolicy:
    def __init__(self, max_retries: int = 3, backoff_factor: float = 0.5):
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor

    async def execute(self, func, *args, **kwargs):
        last_exc = None
        for attempt in range(self.max_retries + 1):
            try:
                return await func(*args, **kwargs)
            except (httpx.HTTPError, Exception) as e:  # broadened for now
                last_exc = e
                if attempt == self.max_retries:
                    raise
                wait = self.backoff_factor * (2 ** attempt)
                time.sleep(wait)
        raise last_exc


class BaseRulesEngine:
    def __init__(self, format: OutputFormat, max_tokens: int, safety: bool = True):
        self.format = format
        self.max_tokens = max_tokens
        self.safety = safety
        self.retry = RetryPolicy()

    async def enforce(self, raw: str, model: str, provider: str = "openai") -> str:
        output = raw or ""

        if self.safety:
            output = self._filter_pii(output)

        if self.format == OutputFormat.JSON:
            output = self._force_json(output)
        elif self.format == OutputFormat.BULLET:
            output = self._force_bullet(output)

        output = self._truncate(output, model=model, provider=provider)
        return output

    def _filter_pii(self, text: str) -> str:
        patterns = {
            r"\b\d{3}-\d{2}-\d{4}\b": "[SSN]",
            r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b": "[CARD]",
            r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b": "[EMAIL]",
        }
        for pattern, repl in patterns.items():
            text = re.sub(pattern, repl, text)
        return text

    def _force_json(self, text: str) -> str:
        try:
            json.loads(text)
            return text
        except Exception:
            # Fallback: try to extract JSON block
            match = re.search(r"\{[\s\S]*\}", text)
            if match:
                candidate = match.group(0)
                try:
                    json.loads(candidate)
                    return candidate
                except Exception:
                    return candidate  # best effort
            return text

    def _force_bullet(self, text: str) -> str:
        lines = [ln.strip() for ln in (text or "").split("\n") if ln.strip()]
        if not lines:
            return text
        if not lines[0].startswith("- "):
            return "\n\n".join(f"- {ln}" for ln in lines)
        return text

    def _truncate(self, text: str, model: str, provider: str) -> str:
        # Only exact truncation for OpenAI models using tiktoken; others use char-length fallback
        if provider.lower() == "openai":
            try:
                if OpenAITokenCounter.count(text, model) > self.max_tokens:
                    enc = OpenAITokenCounter.get_encoding(model)
                    token_ids = enc.encode(text, disallowed_special=())
                    truncated = enc.decode(token_ids[: self.max_tokens])
                    return truncated + "\n\n[TRUNCATED]"
            except Exception:
                pass
        # Fallback: character-based truncation
        if len(text) > self.max_tokens * 4:
            return text[: self.max_tokens * 4] + "\n\n[TRUNCATED]"
        return text


class OpenAIRules(BaseRulesEngine):
    pass


class AnthropicRules(BaseRulesEngine):
    pass


