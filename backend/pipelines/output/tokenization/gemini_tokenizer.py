def estimate_tokens(text: str) -> int:
    # Rough estimate similar to GPT for MVP
    return max(1, len(text or "") // 4)


