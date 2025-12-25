"""Context service."""
from __future__ import annotations

from typing import Literal, Optional
from uuid import UUID

from src.db.repositories.context_repo import ContextRepository
from src.db.repositories.context_embedding_repo import ContextEmbeddingRepository
from src.db.repositories.project_repo import ProjectRepository
from src.db.repositories.chat_repo import ChatRepository
from src.services.embedding_service import EmbeddingService
from src.schemas.context import ContextItem, ContextItemCreate, ContextItemListResponse, ContextItemListItem, ContextItemCreateResponse


class ContextService:
    """Service for context operations."""

    @staticmethod
    def create(user_id: UUID, context_data: ContextItemCreate) -> ContextItemCreateResponse:
        """Create a new context item with embeddings."""
        # Validate scoping
        if context_data.scope == "project" and not context_data.project_id:
            raise ValueError("project_id required for project scope")
        if context_data.scope == "chat" and (not context_data.project_id or not context_data.chat_id):
            raise ValueError("project_id and chat_id required for chat scope")
        
        # Validate project/chat ownership if applicable
        if context_data.project_id:
            project = ProjectRepository.get_by_id(context_data.project_id)
            if not project or project["user_id"] != str(user_id):
                raise ValueError("Project not found or access denied")
        
        if context_data.chat_id:
            chat = ChatRepository.get_by_id(context_data.chat_id)
            if not chat:
                raise ValueError("Chat not found")
            project = ProjectRepository.get_by_id(UUID(chat["project_id"]))
            if not project or project["user_id"] != str(user_id):
                raise ValueError("Access denied")
        
        # Determine user_id for context item
        context_user_id = user_id if context_data.scope in ("user", "project", "chat") else None
        
        # Create context item
        context_dict = ContextRepository.create(
            scope=context_data.scope,
            title=context_data.title,
            content=context_data.content or "",
            user_id=context_user_id,
            project_id=context_data.project_id,
            chat_id=context_data.chat_id,
            file_url=context_data.file_url,
            file_type=context_data.file_type
        )
        
        # Generate embeddings
        chunks_created, embeddings_created = ContextService._generate_embeddings(
            UUID(context_dict["id"]),
            context_dict["content"]
        )
        
        return ContextItemCreateResponse(
            **context_dict,
            chunks_created=chunks_created,
            embeddings_created=embeddings_created
        )

    @staticmethod
    def _generate_embeddings(context_item_id: UUID, content: str) -> tuple[int, int]:
        """Generate embeddings for context item content."""
        # Chunk the content
        chunks = EmbeddingService.chunk_text(content)
        
        if not chunks:
            return 0, 0
        
        # Generate embeddings for each chunk
        embeddings_data = []
        for idx, chunk in enumerate(chunks):
            embedding = EmbeddingService.generate_embedding(chunk)
            embeddings_data.append({
                "context_item_id": str(context_item_id),
                "chunk_index": idx,
                "content": chunk,
                "embedding": embedding
            })
        
        # Batch insert embeddings
        if embeddings_data:
            ContextEmbeddingRepository.create_batch(embeddings_data)
        
        return len(chunks), len(embeddings_data)

    @staticmethod
    def list(
        user_id: UUID,
        scope: Optional[Literal["global", "user", "project", "chat"]] = None,
        project_id: Optional[UUID] = None,
        chat_id: Optional[UUID] = None,
        limit: int = 50,
        offset: int = 0
    ) -> ContextItemListResponse:
        """List context items with filters."""
        # Apply user_id filter for user/project/chat scopes
        filter_user_id = user_id if scope in ("user", "project", "chat") else None
        
        items_data, total = ContextRepository.list(
            scope=scope,
            user_id=filter_user_id,
            project_id=project_id,
            chat_id=chat_id,
            limit=limit,
            offset=offset
        )
        
        items = [ContextItemListItem(**item) for item in items_data]
        return ContextItemListResponse(
            context_items=items,
            total=total,
            limit=limit,
            offset=offset
        )

    @staticmethod
    def delete(context_id: UUID, user_id: UUID) -> bool:
        """Delete context item (with user validation)."""
        context_item = ContextRepository.get_by_id(context_id)
        if not context_item:
            return False
        
        # Validate ownership (user can only delete their own context items)
        if context_item.get("user_id") and UUID(context_item["user_id"]) != user_id:
            return False
        
        # For project/chat scoped items, validate project ownership
        if context_item.get("project_id"):
            project = ProjectRepository.get_by_id(UUID(context_item["project_id"]))
            if not project or project["user_id"] != str(user_id):
                return False
        
        ContextRepository.delete(context_id)
        return True

    @staticmethod
    def retrieve_relevant_context(
        chat_id: UUID,
        user_id: UUID,
        query: str,
        max_tokens: int = 50000
    ) -> dict[str, list[str]]:
        """
        Retrieve relevant context using hierarchical scoping and vector search.
        
        Returns context organized by scope.
        """
        # Get chat and project
        chat = ChatRepository.get_by_id(chat_id)
        if not chat:
            raise ValueError("Chat not found")
        
        project = ProjectRepository.get_by_id(UUID(chat["project_id"]))
        if not project or project["user_id"] != str(user_id):
            raise ValueError("Access denied")
        
        # Calculate token budgets
        global_budget = int(max_tokens * 0.1)
        user_budget = int(max_tokens * 0.2)
        project_budget = int(max_tokens * 0.35)
        chat_budget = int(max_tokens * 0.35)
        
        # Generate query embedding
        query_embedding = EmbeddingService.generate_embedding(query)
        
        # Retrieve global context (vector search)
        global_items = ContextEmbeddingRepository.vector_search(
            embedding=query_embedding,
            scope="global",
            limit=10
        )
        # Extract content from vector search results
        global_contents = [
            item.get("context_items", {}).get("content", item.get("content", ""))
            for item in global_items
        ]
        global_context = ContextService._truncate_to_tokens(global_contents, global_budget)
        
        # Retrieve user context (vector search)
        user_items = ContextEmbeddingRepository.vector_search(
            embedding=query_embedding,
            scope="user",
            user_id=user_id,
            limit=10
        )
        # Extract content from vector search results
        user_contents = [
            item.get("context_items", {}).get("content", item.get("content", ""))
            for item in user_items
        ]
        user_context = ContextService._truncate_to_tokens(user_contents, user_budget)
        
        # Retrieve project context (get all)
        project_items = ContextRepository.get_all_by_scope(
            scope="project",
            user_id=user_id,
            project_id=UUID(chat["project_id"])
        )
        project_context = ContextService._truncate_to_tokens(
            [item["content"] for item in project_items],
            project_budget
        )
        
        # Retrieve chat context (get all)
        chat_items = ContextRepository.get_all_by_scope(
            scope="chat",
            user_id=user_id,
            project_id=UUID(chat["project_id"]),
            chat_id=chat_id
        )
        chat_context = ContextService._truncate_to_tokens(
            [item["content"] for item in chat_items],
            chat_budget
        )
        
        return {
            "global": global_context,
            "user": user_context,
            "project": project_context,
            "chat": chat_context
        }

    @staticmethod
    def _truncate_to_tokens(items: list[str], max_tokens: int) -> list[str]:
        """Truncate items to fit within token budget."""
        # Simplified token counting (using character approximation)
        # In production, use proper tokenizer
        result = []
        total_chars = 0
        chars_per_token = 4  # Rough approximation
        
        for item in items:
            item_chars = len(item)
            if total_chars + item_chars <= max_tokens * chars_per_token:
                result.append(item)
                total_chars += item_chars
            else:
                remaining = (max_tokens * chars_per_token) - total_chars
                if remaining > 100:  # Only include if meaningful
                    result.append(item[:remaining])
                break
        
        return result

