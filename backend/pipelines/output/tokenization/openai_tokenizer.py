from __future__ import annotations

from ....services.token_counter import OpenAITokenCounter


def count_text(text: str, model: str = "gpt-4o-mini") -> int:
    return OpenAITokenCounter.count(text, model=model)

def count_batch(texts, model: str = "gpt-4o-mini"):
    return OpenAITokenCounter.count_batch(texts, model=model)


