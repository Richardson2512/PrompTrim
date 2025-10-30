from __future__ import annotations

from typing import Dict, Any, Optional

from ....services.llm_router import LLMRouter


class OpenAIBranch:
    def __init__(self, router: Optional[LLMRouter] = None):
        self.router = router or LLMRouter()

    async def call(self, prompt: str, max_output_tokens: int, model: Optional[str] = None) -> Dict[str, Any]:
        return await self.router.call("openai", prompt, max_output_tokens, model)


