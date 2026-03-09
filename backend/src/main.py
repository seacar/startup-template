"""FastAPI application entry point."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from scalar_fastapi import get_scalar_api_reference

from src.config import settings
from src.middleware.rate_limit import limiter
from src.routers import health
from src.utils.langsmith import init_langsmith
from src.utils.posthog import get_posthog


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    yield
    # Shutdown


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    # Initialize LangSmith for AI observability
    init_langsmith()

    # Initialize PostHog for product analytics (server-side)
    if settings.POSTHOG_API_KEY and settings.POSTHOG_API_KEY.strip():
        get_posthog()

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=settings.APP_DESCRIPTION,
        lifespan=lifespan,
        docs_url=None,
        redoc_url=None,
    )

    # Rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # API documentation with Scalar
    @app.get("/docs", include_in_schema=False)
    async def scalar_html():
        return get_scalar_api_reference(
            openapi_url=app.openapi_url,
            title=app.title,
        )

    # Routers
    app.include_router(health.router, tags=["Health"])

    return app


app = create_app()

