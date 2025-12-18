"""Vector store integration with Supabase pgvector."""
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from supabase import create_client

from src.config import settings


def get_vector_store(table_name: str = "documents") -> SupabaseVectorStore:
    """Get Supabase vector store instance."""
    supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=settings.GOOGLE_API_KEY,
    )

    return SupabaseVectorStore(
        client=supabase_client,
        embedding=embeddings,
        table_name=table_name,
        query_name="match_documents",
    )

