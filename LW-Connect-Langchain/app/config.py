from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # OpenAI
    openai_api_key: str
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
    
    # Safety
    enable_moderation: bool = True
    log_prompts: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
