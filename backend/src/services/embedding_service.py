"""Embedding service for text chunking and embedding generation."""
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from src.config import settings


class EmbeddingService:
    """Service for generating embeddings."""

    _embeddings_model: GoogleGenerativeAIEmbeddings | None = None

    @classmethod
    def _get_embeddings_model(cls) -> GoogleGenerativeAIEmbeddings:
        """Get or create embeddings model."""
        if cls._embeddings_model is None:
            cls._embeddings_model = GoogleGenerativeAIEmbeddings(
                model=settings.GEMINI_EMBEDDING_MODEL,
                google_api_key=settings.GOOGLE_API_KEY,
            )
        return cls._embeddings_model

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
        """
        Chunk text into smaller pieces for embedding.
        
        Args:
            text: Text to chunk
            chunk_size: Maximum size of each chunk (characters)
            chunk_overlap: Overlap between chunks (characters)
        
        Returns:
            List of text chunks
        """
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            
            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence endings
                for punct in [". ", ".\n", "! ", "!\n", "? ", "?\n"]:
                    last_punct = chunk.rfind(punct)
                    if last_punct > chunk_size // 2:
                        chunk = chunk[:last_punct + len(punct)]
                        end = start + len(chunk)
                        break
            
            chunks.append(chunk.strip())
            start = end - chunk_overlap
        
        return chunks

    @staticmethod
    def generate_embedding(text: str) -> list[float]:
        """
        Generate embedding for text using Gemini Embedding model.
        
        Args:
            text: Text to embed
        
        Returns:
            Embedding vector (768 dimensions for gemini-embedding-001)
        """
        model = EmbeddingService._get_embeddings_model()
        embedding = model.embed_query(text)
        return embedding

    @staticmethod
    def generate_embeddings_batch(texts: list[str]) -> list[list[float]]:
        """
        Generate embeddings for multiple texts in batch.
        
        Args:
            texts: List of texts to embed
        
        Returns:
            List of embedding vectors
        """
        model = EmbeddingService._get_embeddings_model()
        embeddings = model.embed_documents(texts)
        return embeddings

