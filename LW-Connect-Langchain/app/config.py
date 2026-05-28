from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # AWS Bedrock
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "us-west-2"
    bedrock_model: str = "anthropic.claude-v2"
    bedrock_embedding_model: str = "amazon.titan-embed-text"
    bedrock_api_timeout: int = 60

    # OpenAI fallback (optional)
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4-turbo-preview"
    embedding_model: str = "text-embedding-3-small"

    # Database
    database_url: str
    vector_dimension: int = 1536

    # Redis
    redis_url: str
    cache_ttl: int = 3600

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    environment: str = "development"

    # AI Config
    max_tokens: int = 500
    temperature: float = 0.7
    top_k_results: int = 5
    chunk_size: int = 500
    chunk_overlap: int = 50

    # Local Ollama + LLM routing
    llm_provider: str = "ollama"
    ollama_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "llama2"

    # Safety
    enable_moderation: bool = True
    log_prompts: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
