"""Chat service."""
from typing import Optional
from uuid import UUID

from src.db.repositories.chat_repo import ChatRepository
from src.db.repositories.project_repo import ProjectRepository
from src.schemas.chat import Chat, ChatCreate, ChatDetail, ChatListResponse, ChatListItem, ChatCreateResponse


class ChatService:
    """Service for chat operations."""

    @staticmethod
    def create(project_id: UUID, user_id: UUID, chat_data: ChatCreate) -> ChatCreateResponse:
        """Create a new chat."""
        # Validate project ownership
        project = ProjectRepository.get_by_id(project_id)
        if not project or project["user_id"] != str(user_id):
            raise ValueError("Project not found or access denied")
        
        # Generate title: "YYYY-MM-DD - Document Type"
        from datetime import datetime
        today = datetime.utcnow().strftime("%Y-%m-%d")
        title = f"{today} - {chat_data.document_type}"
        
        chat_dict = ChatRepository.create(
            project_id=project_id,
            title=title,
            document_type=chat_data.document_type
        )
        
        # Generate suggested questions (simplified - can be enhanced with AI)
        suggested_questions = ChatService._generate_suggested_questions(chat_data.document_type)
        
        chat = Chat(**chat_dict)
        return ChatCreateResponse(**chat.model_dump(), suggested_questions=suggested_questions)

    @staticmethod
    def _generate_suggested_questions(document_type: str) -> list[str]:
        """Generate suggested questions based on document type."""
        # Simplified implementation - can be enhanced with AI
        base_questions = [
            "What is the main purpose of this project?",
            "Who is the target audience?",
            "What are the key requirements?",
        ]
        
        type_specific = {
            "Technical Specification": [
                "What technology stack will be used?",
                "What are the scalability requirements?",
                "What security considerations are needed?",
            ],
            "Business Plan": [
                "What is the market opportunity?",
                "What is the revenue model?",
                "What are the key milestones?",
            ],
            "Product Requirements": [
                "What are the core features?",
                "What is the MVP scope?",
                "What are the success metrics?",
            ],
        }
        
        questions = base_questions + type_specific.get(document_type, [])
        return questions[:5]  # Return top 5

    @staticmethod
    def get_by_id(chat_id: UUID, user_id: UUID) -> Optional[ChatDetail]:
        """Get chat by ID (with user validation)."""
        chat_dict = ChatRepository.get_with_messages_and_document(chat_id)
        if not chat_dict:
            return None
        
        # Validate project ownership
        project = ProjectRepository.get_by_id(UUID(chat_dict["project_id"]))
        if not project or project["user_id"] != str(user_id):
            return None
        
        return ChatDetail(**chat_dict)

    @staticmethod
    def list_by_project(project_id: UUID, user_id: UUID, limit: int = 50, offset: int = 0) -> ChatListResponse:
        """List chats for a project (with user validation)."""
        # Validate project ownership
        project = ProjectRepository.get_by_id(project_id)
        if not project or project["user_id"] != str(user_id):
            raise ValueError("Project not found or access denied")
        
        chats_data, total = ChatRepository.list_by_project(project_id, limit, offset)
        chats = [ChatListItem(**chat) for chat in chats_data]
        return ChatListResponse(
            chats=chats,
            total=total,
            limit=limit,
            offset=offset
        )

    @staticmethod
    def delete(chat_id: UUID, user_id: UUID) -> bool:
        """Delete chat (with user validation)."""
        chat = ChatRepository.get_by_id(chat_id)
        if not chat:
            return False
        
        # Validate project ownership
        project = ProjectRepository.get_by_id(UUID(chat["project_id"]))
        if not project or project["user_id"] != str(user_id):
            return False
        
        ChatRepository.delete(chat_id)
        return True

