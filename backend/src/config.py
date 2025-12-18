"""Application configuration."""
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
    PORT: int = 8000

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

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
    SUPABASE_DB_PORT: int = 5432
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

