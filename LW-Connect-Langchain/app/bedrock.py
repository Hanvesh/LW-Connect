import asyncio
import json
import logging
from typing import Any, Dict, List, Optional

import boto3
try:
    import openai
except ImportError:
    openai = None

from botocore.config import Config
from botocore.exceptions import UnknownServiceError

from app.config import settings

logger = logging.getLogger(__name__)


class BedrockUnavailableError(RuntimeError):
    pass


class BedrockClient:
    def __init__(self):
        self.client = None
        self.client_kwargs: Dict[str, Any] = {}
        if settings.aws_access_key_id:
            self.client_kwargs["aws_access_key_id"] = settings.aws_access_key_id
        if settings.aws_secret_access_key:
            self.client_kwargs["aws_secret_access_key"] = settings.aws_secret_access_key

        self.config = Config(
            read_timeout=settings.bedrock_api_timeout,
            connect_timeout=settings.bedrock_api_timeout,
        )

    def _ensure_client(self):
        if self.client is not None:
            return

        try:
            self.client = boto3.client(
                "bedrock-runtime",
                region_name=settings.aws_region,
                config=self.config,
                **self.client_kwargs,
            )
        except UnknownServiceError as exc:
            raise BedrockUnavailableError(
                "AWS Bedrock client is unavailable in this environment. "
                "Upgrade boto3/botocore to a version that supports Bedrock, "
                "or ensure the AWS SDK includes the Bedrock service model."
            ) from exc

    def _invoke(self, model_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        self._ensure_client()
        body = json.dumps(payload).encode("utf-8")
        response = self.client.invoke_model(
            modelId=model_id,
            contentType="application/json",
            accept="application/json",
            body=body,
        )
        raw_body = response["body"].read().decode("utf-8")
        try:
            return json.loads(raw_body)
        except json.JSONDecodeError:
            return {"output": raw_body}

    async def invoke(self, model_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self._invoke, model_id, payload)


def _extract_text(response: Any) -> str:
    if response is None:
        return ""
    if isinstance(response, str):
        return response
    if isinstance(response, dict):
        for key in ("outputText", "output", "content", "text", "message", "result"):
            value = response.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
            if isinstance(value, dict):
                nested = _extract_text(value)
                if nested:
                    return nested

        if "results" in response and isinstance(response["results"], list) and response["results"]:
            return _extract_text(response["results"][0])

        if "body" in response:
            return _extract_text(response["body"])

    return str(response)


def _extract_embedding(response: Any) -> List[float]:
    if response is None:
        raise ValueError("No embedding returned from Bedrock")
    if isinstance(response, dict):
        if "embedding" in response and isinstance(response["embedding"], list):
            return response["embedding"]
        if "embeddings" in response and isinstance(response["embeddings"], list):
            if response["embeddings"] and isinstance(response["embeddings"][0], list):
                return response["embeddings"][0]
            return response["embeddings"]
        if "results" in response and isinstance(response["results"], list) and response["results"]:
            return _extract_embedding(response["results"][0])
        if "output" in response:
            return _extract_embedding(response["output"])

    raise ValueError(f"Unable to parse embedding from Bedrock response: {response}")


class BedrockTextGenerator:
    def __init__(self, client: BedrockClient, model_id: str, temperature: float = 0.7, max_tokens: int = 500):
        self.client = client
        self.model_id = model_id
        self.temperature = temperature
        self.max_tokens = max_tokens

    async def generate(self, prompt: str) -> str:
        payload = {
            "inputText": prompt,
            "temperature": self.temperature,
            "maxOutputTokens": self.max_tokens,
        }
        response = await self.client.invoke(self.model_id, payload)
        text = _extract_text(response)
        return text.strip()


class BedrockEmbeddingClient:
    def __init__(self, client: BedrockClient, model_id: str):
        self.client = client
        self.model_id = model_id

    async def aembed_documents(self, texts: List[str]) -> List[List[float]]:
        embeddings: List[List[float]] = []
        for text in texts:
            response = await self.client.invoke(self.model_id, {"input": text})
            embeddings.append(_extract_embedding(response))
        return embeddings

    async def aembed_query(self, query: str) -> List[float]:
        response = await self.client.invoke(self.model_id, {"input": query})
        return _extract_embedding(response)


class OpenAITextGenerator:
    def __init__(self, api_key: Optional[str], model: str, temperature: float = 0.7, max_tokens: int = 500):
        self.api_key = api_key
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens

    async def generate(self, prompt: str) -> str:
        if openai is None:
            raise RuntimeError("OpenAI fallback is not installed.")
        if not self.api_key:
            raise RuntimeError("OpenAI API key is not configured for fallback.")

        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self._call_openai, prompt)

    def _call_openai(self, prompt: str) -> str:
        openai.api_key = self.api_key
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )
        return response["choices"][0]["message"]["content"].strip()


class OpenAIEmbeddingClient:
    def __init__(self, api_key: Optional[str], model_id: str):
        self.api_key = api_key
        self.model_id = model_id

    async def aembed_documents(self, texts: List[str]) -> List[List[float]]:
        if openai is None:
            raise RuntimeError("OpenAI fallback is not installed.")
        if not self.api_key:
            raise RuntimeError("OpenAI API key is not configured for fallback.")

        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self._call_openai, texts)

    def _call_openai(self, texts: List[str]) -> List[List[float]]:
        openai.api_key = self.api_key
        response = openai.Embedding.create(model=self.model_id, input=texts)
        return [item["embedding"] for item in response["data"]]

    async def aembed_query(self, query: str) -> List[float]:
        if openai is None:
            raise RuntimeError("OpenAI fallback is not installed.")
        if not self.api_key:
            raise RuntimeError("OpenAI API key is not configured for fallback.")

        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self._call_openai_query, query)

    def _call_openai_query(self, query: str) -> List[float]:
        openai.api_key = self.api_key
        response = openai.Embedding.create(model=self.model_id, input=query)
        return response["data"][0]["embedding"]


class AdaptiveTextGenerator:
    def __init__(self, bedrock: BedrockTextGenerator, openai: Optional[OpenAITextGenerator] = None):
        self.bedrock = bedrock
        self.openai = openai

    async def generate(self, prompt: str) -> str:
        try:
            return await self.bedrock.generate(prompt)
        except BedrockUnavailableError as exc:
            if self.openai is not None:
                logger.warning("Bedrock unavailable, falling back to OpenAI: %s", exc)
                return await self.openai.generate(prompt)
            raise


class AdaptiveEmbeddingClient:
    def __init__(self, bedrock: BedrockEmbeddingClient, openai: Optional[OpenAIEmbeddingClient] = None):
        self.bedrock = bedrock
        self.openai = openai

    async def aembed_documents(self, texts: List[str]) -> List[List[float]]:
        try:
            return await self.bedrock.aembed_documents(texts)
        except BedrockUnavailableError as exc:
            if self.openai is not None:
                logger.warning("Bedrock unavailable for embeddings, falling back to OpenAI: %s", exc)
                return await self.openai.aembed_documents(texts)
            raise

    async def aembed_query(self, query: str) -> List[float]:
        try:
            return await self.bedrock.aembed_query(query)
        except BedrockUnavailableError as exc:
            if self.openai is not None:
                logger.warning("Bedrock unavailable for embeddings, falling back to OpenAI: %s", exc)
                return await self.openai.aembed_query(query)
            raise


bedrock_client = BedrockClient()
bedrock_text_generator = AdaptiveTextGenerator(
    bedrock=BedrockTextGenerator(
        client=bedrock_client,
        model_id=settings.bedrock_model,
        temperature=settings.temperature,
        max_tokens=settings.max_tokens,
    ),
    openai=OpenAITextGenerator(
        api_key=settings.openai_api_key,
        model=settings.openai_model,
        temperature=settings.temperature,
        max_tokens=settings.max_tokens,
    ) if settings.openai_api_key else None,
)
bedrock_embedding_client = AdaptiveEmbeddingClient(
    bedrock=BedrockEmbeddingClient(
        client=bedrock_client,
        model_id=settings.bedrock_embedding_model,
    ),
    openai=OpenAIEmbeddingClient(
        api_key=settings.openai_api_key,
        model_id=settings.embedding_model,
    ) if settings.openai_api_key else None,
)
