"""Application configuration."""
import json
from typing import Any

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "Backend API"
    APP_VERSION: str = "0.1.0"
    APP_DESCRIPTION: str = "FastAPI backend application"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 18000

    # CORS - use Any type to prevent automatic JSON parsing, then validate
    CORS_ORIGINS: Any = Field(
        default=["http://localhost:13000", "http://localhost:13001"]
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Any) -> list[str]:
        """Parse CORS_ORIGINS from env var - supports JSON array or comma-separated string."""
        # If already a list, return it
        if isinstance(v, list):
            return [str(item) for item in v]
        
        # If it's a string, parse it
        if isinstance(v, str):
            # Handle empty string
            if not v.strip():
                return ["http://localhost:13000", "http://localhost:13001"]
            
            # Try parsing as JSON first
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return [str(item) for item in parsed]
            except (json.JSONDecodeError, TypeError, ValueError):
                # Not JSON, treat as comma-separated string
                pass
            
            # Parse as comma-separated string
            origins = [origin.strip() for origin in v.split(",") if origin.strip()]
            if origins:
                return origins
        
        # Default fallback
        return ["http://localhost:13000", "http://localhost:13001"]

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_PUBLISHABLE_KEY: str = ""
    SUPABASE_SECRET_KEY: str = ""

    # Redis (Upstash)
    REDIS_URL: str = ""
    REDIS_REST_URL: str = ""
    REDIS_REST_TOKEN: str = ""

    # Sentry
    SENTRY_DSN: str = ""
    SENTRY_TRACES_SAMPLE_RATE: float = 0.1
    SENTRY_PROFILES_SAMPLE_RATE: float = 0.1

    # LangSmith (for AI observability)
    LANGCHAIN_API_KEY: str = ""
    LANGCHAIN_TRACING_V2: bool = False
    LANGCHAIN_PROJECT: str = "default"

    # Google GenAI
    GOOGLE_API_KEY: str = ""

    # ETL - Supabase PostgreSQL
    SUPABASE_DB_HOST: str = ""
    SUPABASE_DB_PORT: int = 58422
    SUPABASE_DB_NAME: str = ""
    SUPABASE_DB_USER: str = ""
    SUPABASE_DB_PASSWORD: str = ""

    # Spark Configuration
    SPARK_MASTER: str = "local[*]"
    SPARK_DRIVER_MEMORY: str = "2g"
    SPARK_EXECUTOR_MEMORY: str = "2g"

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60


settings = Settings()

