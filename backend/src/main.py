"""FastAPI application entry point."""
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import APIRouter, FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sentry_sdk.integrations.fastapi import FastApiIntegration
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from scalar_fastapi import get_scalar_api_reference

from src.config import settings
from src.middleware.rate_limit import limiter
from src.routers import health
from src.routers.api.v1 import (
    chats,
    context,
    document_types,
    documents,
    metrics,
    messages,
    projects,
    users,
)
from src.utils.langsmith import init_langsmith


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

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=settings.APP_DESCRIPTION,
        lifespan=lifespan,
        docs_url=None,
        redoc_url=None,
    )

    # Sentry integration
    # Only initialize if we have a real DSN (not empty or placeholder)
    if (
        settings.SENTRY_DSN 
        and settings.SENTRY_DSN.strip() 
        and not settings.SENTRY_DSN.startswith("your_")
        and settings.SENTRY_DSN.startswith("https://")
    ):
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            integrations=[FastApiIntegration()],
            traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
            profiles_sample_rate=settings.SENTRY_PROFILES_SAMPLE_RATE,
            environment=settings.ENVIRONMENT,
        )

    # Rate limiting (add first so it runs last - middleware runs in reverse order)
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # CORS middleware - added last so it runs first
    # CORSMiddleware automatically handles OPTIONS preflight requests
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    # API documentation with Scalar
    @app.get("/docs", include_in_schema=False)
    async def scalar_html():
        return get_scalar_api_reference(
            openapi_url=app.openapi_url,
            title=app.title,
        )

    # Explicit OPTIONS handler for all API routes - must be registered before routers
    # This ensures OPTIONS requests are handled before route matching
    @app.options("/api/v1/{full_path:path}", include_in_schema=False)
    async def api_options_handler(request: Request, full_path: str = ""):
        """Handle CORS preflight OPTIONS requests for API routes."""
        origin = request.headers.get("origin")
        # Check if origin is in allowed origins
        if origin and origin in settings.CORS_ORIGINS:
            allowed_origin = origin
        elif settings.CORS_ORIGINS and len(settings.CORS_ORIGINS) > 0:
            allowed_origin = origin if origin in settings.CORS_ORIGINS else settings.CORS_ORIGINS[0]
        else:
            allowed_origin = "*"
        
        return Response(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": allowed_origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                "Access-Control-Allow-Headers": request.headers.get("access-control-request-headers", "*"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            },
        )

    # Routers
    app.include_router(health.router, tags=["Health"])
    
    # API v1 routers
    api_v1_router = APIRouter(prefix="/api/v1")
    api_v1_router.include_router(users.router)
    api_v1_router.include_router(projects.router)
    api_v1_router.include_router(chats.router)
    api_v1_router.include_router(chats.router_by_id)  # Chat routes not nested under project
    api_v1_router.include_router(documents.router)
    api_v1_router.include_router(documents.router_by_chat)  # Documents by chat
    api_v1_router.include_router(context.router)
    api_v1_router.include_router(document_types.router)
    api_v1_router.include_router(metrics.router)
    api_v1_router.include_router(messages.router)  # WebSocket endpoint
    
    app.include_router(api_v1_router)

    return app


app = create_app()

