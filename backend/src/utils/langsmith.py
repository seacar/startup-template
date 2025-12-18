"""LangSmith initialization for AI observability."""
import os

from src.config import settings


def init_langsmith():
    """Initialize LangSmith tracing if API key is configured."""
    if settings.LANGCHAIN_API_KEY:
        os.environ["LANGCHAIN_API_KEY"] = settings.LANGCHAIN_API_KEY
        os.environ["LANGCHAIN_TRACING_V2"] = str(settings.LANGCHAIN_TRACING_V2).lower()
        os.environ["LANGCHAIN_PROJECT"] = settings.LANGCHAIN_PROJECT

