"""PostHog client for server-side analytics and observability."""
from typing import Any

from src.config import settings

_posthog_client: Any = None


def get_posthog():
    """Return the PostHog client if configured, else None."""
    global _posthog_client
    if _posthog_client is not None:
        return _posthog_client
    if not settings.POSTHOG_API_KEY or not settings.POSTHOG_API_KEY.strip():
        return None
    try:
        from posthog import Posthog

        _posthog_client = Posthog(
            api_key=settings.POSTHOG_API_KEY,
            host=settings.POSTHOG_HOST or "https://us.i.posthog.com",
        )
        return _posthog_client
    except Exception:
        return None


def capture(
    distinct_id: str,
    event: str,
    properties: dict[str, Any] | None = None,
) -> None:
    """Capture a server-side event to PostHog. No-op if PostHog is not configured."""
    client = get_posthog()
    if client is None:
        return
    try:
        props = dict(properties or {})
        props.setdefault("$lib", "backend")
        client.capture(
            distinct_id=distinct_id,
            event=event,
            properties=props,
        )
    except Exception:
        pass
