def estimate_tokens(text: str) -> int:
    return max(1, len(text or "") // 4)


