"""Google GenAI LLM integration."""
from langchain_google_genai import ChatGoogleGenerativeAI

from src.config import settings


def get_llm(model_name: str = "gemini-pro", temperature: float = 0.7) -> ChatGoogleGenerativeAI:
    """Get Google GenAI LLM instance."""
    return ChatGoogleGenerativeAI(
        model=model_name,
        temperature=temperature,
        google_api_key=settings.GOOGLE_API_KEY,
    )

