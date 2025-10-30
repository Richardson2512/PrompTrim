from __future__ import annotations

from functools import lru_cache
from typing import Dict, List

import tiktoken


class OpenAITokenCounter:
    """
    OpenAI-specific token counter utility.
    - Exact token counts using model encodings
    - Caches encodings for speed
    - Supports message counting and batch encoding
    """

    @staticmethod
    @lru_cache(maxsize=128)
    def get_encoding(model: str) -> tiktoken.Encoding:
        """Cached encoding lookup."""
        try:
            return tiktoken.encoding_for_model(model)
        except KeyError:
            # Fallback commonly used by modern GPT models
            return tiktoken.get_encoding("cl100k_base")

    @staticmethod
    def count(text: str, model: str = "gpt-4o-mini") -> int:
        if not text:
            return 0
        enc = OpenAITokenCounter.get_encoding(model)
        return len(enc.encode(str(text), disallowed_special=()))

    @staticmethod
    def count_batch(texts: List[str], model: str = "gpt-4o-mini") -> List[int]:
        if not texts:
            return []
        enc = OpenAITokenCounter.get_encoding(model)
        # encode_batch returns a list of token ID lists
        return [len(tokens) for tokens in enc.encode_batch([str(t or "") for t in texts], disallowed_special=())]

    @staticmethod
    def count_messages(messages: List[Dict[str, str]], model: str = "gpt-4o-mini") -> int:
        """
        Count tokens for a list of ChatCompletion-style messages.
        Adds 3 tokens per message and 3 for final assistant message (OpenAI rule of thumb).
        """
        tokens = 0
        for msg in messages or []:
            tokens += 3  # every message has +3 tokens
            for _, value in (msg or {}).items():
                if isinstance(value, str):
                    tokens += OpenAITokenCounter.count(value, model=model)
        tokens += 3  # final assistant message
        return tokens


# Common model instances mapping (optional convenience)
token_counters = {
    "gpt-4o": "gpt-4o",
    "gpt-4o-mini": "gpt-4o-mini",
    "gpt-3.5-turbo": "gpt-3.5-turbo",
}


