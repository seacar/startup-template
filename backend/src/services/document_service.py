"""Document service."""
from typing import Optional
from uuid import UUID

from src.db.repositories.document_repo import DocumentRepository
from src.db.repositories.chat_repo import ChatRepository
from src.db.repositories.project_repo import ProjectRepository
from src.schemas.document import Document, DocumentCreate, DocumentListResponse, DocumentListItem


class DocumentService:
    """Service for document operations."""

    @staticmethod
    def create(chat_id: UUID, user_id: UUID, document_data: DocumentCreate) -> Document:
        """Create a new document version (with user validation)."""
        # Validate chat ownership
        chat = ChatRepository.get_by_id(chat_id)
        if not chat:
            raise ValueError("Chat not found")
        
        project = ProjectRepository.get_by_id(UUID(chat["project_id"]))
        if not project or project["user_id"] != str(user_id):
            raise ValueError("Access denied")
        
        document_dict = DocumentRepository.create(
            chat_id=chat_id,
            content=document_data.content,
            token_input=document_data.token_input,
            token_output=document_data.token_output,
            diff_from_previous=document_data.diff_from_previous,
            generation_time_ms=document_data.generation_time_ms
        )
        return Document(**document_dict)

    @staticmethod
    def get_by_id(document_id: UUID, user_id: UUID) -> Optional[Document]:
        """Get document by ID (with user validation)."""
        document_dict = DocumentRepository.get_by_id(document_id)
        if not document_dict:
            return None
        
        # Validate chat ownership
        chat = ChatRepository.get_by_id(UUID(document_dict["chat_id"]))
        if not chat:
            return None
        
        project = ProjectRepository.get_by_id(UUID(chat["project_id"]))
        if not project or project["user_id"] != str(user_id):
            return None
        
        return Document(**document_dict)

    @staticmethod
    def get_latest(chat_id: UUID, user_id: UUID) -> Optional[Document]:
        """Get latest document version (with user validation)."""
        # Validate chat ownership
        chat = ChatRepository.get_by_id(chat_id)
        if not chat:
            return None
        
        project = ProjectRepository.get_by_id(UUID(chat["project_id"]))
        if not project or project["user_id"] != str(user_id):
            return None
        
        document_dict = DocumentRepository.get_latest(chat_id)
        if document_dict:
            return Document(**document_dict)
        return None

    @staticmethod
    def list_by_chat(chat_id: UUID, user_id: UUID) -> DocumentListResponse:
        """List all document versions for a chat (with user validation)."""
        # Validate chat ownership
        chat = ChatRepository.get_by_id(chat_id)
        if not chat:
            raise ValueError("Chat not found")
        
        project = ProjectRepository.get_by_id(UUID(chat["project_id"]))
        if not project or project["user_id"] != str(user_id):
            raise ValueError("Access denied")
        
        documents_data = DocumentRepository.list_by_chat(chat_id)
        documents = [DocumentListItem(**doc) for doc in documents_data]
        return DocumentListResponse(
            documents=documents,
            total_versions=len(documents)
        )

