from __future__ import annotations

from typing import Dict, Any

from ...services.tinyllama_service import TinyLlamaService


class InputCompressor:
    """
    Thin wrapper around TinyLlamaService for input token usage reduction.
    Keeps pipeline code organized under pipelines/input.
    """

    def __init__(self):
        self._svc = TinyLlamaService()

    def compress(self, prompt: str, compression_ratio: float) -> Dict[str, Any]:
        return self._svc.compress_prompt(prompt=prompt, compression_ratio=compression_ratio)


