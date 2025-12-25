"""Message service."""
from typing import Any, Optional
from uuid import UUID

from src.db.repositories.message_repo import MessageRepository
from src.db.repositories.chat_repo import ChatRepository
from src.db.repositories.project_repo import ProjectRepository
from src.schemas.message import Message, MessageCreate


class MessageService:
    """Service for message operations."""

    @staticmethod
    def create(chat_id: UUID, user_id: UUID, message_data: MessageCreate) -> Message:
        """Create a new message (with user validation)."""
        # Validate chat ownership
        chat = ChatRepository.get_by_id(chat_id)
        if not chat:
            raise ValueError("Chat not found")
        
        project = ProjectRepository.get_by_id(UUID(chat["project_id"]))
        if not project or project["user_id"] != str(user_id):
            raise ValueError("Access denied")
        
        message_dict = MessageRepository.create(
            chat_id=chat_id,
            role=message_data.role,
            content=message_data.content,
            metadata=message_data.metadata
        )
        return Message(**message_dict)

    @staticmethod
    def get_by_id(message_id: UUID) -> Optional[Message]:
        """Get message by ID."""
        message_dict = MessageRepository.get_by_id(message_id)
        if message_dict:
            return Message(**message_dict)
        return None

    @staticmethod
    def list_by_chat(chat_id: UUID, limit: Optional[int] = None) -> list[Message]:
        """List messages for a chat."""
        messages_data = MessageRepository.list_by_chat(chat_id, limit)
        return [Message(**msg) for msg in messages_data]

