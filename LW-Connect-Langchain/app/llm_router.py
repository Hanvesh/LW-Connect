import logging
from typing import Dict, Optional, Any

import httpx

from app.bedrock import OpenAITextGenerator, bedrock_text_generator
from app.config import settings

logger = logging.getLogger(__name__)


class OllamaTextGenerator:
    def __init__(
        self,
        base_url: str,
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 500,
        timeout: int = 60,
    ):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.timeout = timeout

    async def generate(self, prompt: str) -> str:
        url = f"{self.base_url}/api/models/{self.model}"
        payload = {
            "prompt": prompt,
            "temperature": self.temperature,
            "max_length": self.max_tokens,
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            return self._extract_text(response.json())

    def _extract_text(self, response: Any) -> str:
        if response is None:
            return ""
        if isinstance(response, str):
            return response.strip()
        if isinstance(response, dict):
            for key in ("output", "result", "text", "response", "content", "message"):
                value = response.get(key)
                if isinstance(value, str) and value.strip():
                    return value.strip()
                if isinstance(value, dict):
                    nested = self._extract_text(value)
                    if nested:
                        return nested

            if "choices" in response and isinstance(response["choices"], list) and response["choices"]:
                choice = response["choices"][0]
                if isinstance(choice, dict):
                    if "text" in choice and isinstance(choice["text"], str):
                        return choice["text"].strip()
                    if "message" in choice and isinstance(choice["message"], dict):
                        return self._extract_text(choice["message"])

            if "results" in response and isinstance(response["results"], list) and response["results"]:
                return self._extract_text(response["results"][0])

        if isinstance(response, list) and response:
            return self._extract_text(response[0])

        return ""


class LLMRouter:
    def __init__(self):
        self.providers: Dict[str, Any] = {
            "ollama": OllamaTextGenerator(
                base_url=settings.ollama_url,
                model=settings.ollama_model,
                temperature=settings.temperature,
                max_tokens=settings.max_tokens,
                timeout=settings.bedrock_api_timeout,
            ),
            "bedrock": bedrock_text_generator,
        }

        if settings.openai_api_key:
            self.providers["openai"] = OpenAITextGenerator(
                api_key=settings.openai_api_key,
                model=settings.openai_model,
                temperature=settings.temperature,
                max_tokens=settings.max_tokens,
            )

        self.default_provider = settings.llm_provider.lower().strip()
        if self.default_provider not in self.providers:
            logger.warning(
                "Default LLM provider '%s' is not configured. Falling back to available provider.",
                self.default_provider,
            )
            self.default_provider = next(iter(self.providers))

        self.fallback_order = [self.default_provider] + [
            name for name in self.providers
            if name != self.default_provider
        ]

    def get_provider(self, provider: Optional[str] = None) -> Any:
        provider_name = (provider or self.default_provider).lower().strip()
        if provider_name not in self.providers:
            raise ValueError(
                f"Unsupported LLM provider '{provider_name}'. "
                f"Available providers: {', '.join(self.providers.keys())}"
            )
        return self.providers[provider_name]

    async def generate(self, prompt: str, provider: Optional[str] = None) -> str:
        if provider:
            llm = self.get_provider(provider)
            return await llm.generate(prompt)

        last_error: Optional[Exception] = None
        for provider_name in self.fallback_order:
            llm = self.providers[provider_name]
            try:
                return await llm.generate(prompt)
            except Exception as exc:
                logger.warning(
                    "LLM provider '%s' failed: %s. Trying next provider.",
                    provider_name,
                    exc,
                )
                last_error = exc

        raise RuntimeError(
            "All configured LLM providers failed."
        ) from last_error


llm_router = LLMRouter()
