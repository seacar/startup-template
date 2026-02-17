"""Google GenAI LLM integration (google-genai SDK via LangChain)."""
from langchain_google_genai import ChatGoogleGenerativeAI

from src.config import settings


def get_llm(
    model_name: str = "gemini-2.0-flash",
    temperature: float = 0.7,
) -> ChatGoogleGenerativeAI:
    """Get Google GenAI LLM instance using the new google-genai SDK.

    Uses langchain-google-genai >= 4.x, which is built on the unified
    google-genai package (replacing the legacy google-generativeai SDK).
    """
    return ChatGoogleGenerativeAI(
        model=model_name,
        temperature=temperature,
        api_key=settings.GOOGLE_API_KEY or None,
    )
