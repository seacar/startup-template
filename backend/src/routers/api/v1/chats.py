"""Chat management API routes."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from src.dependencies.auth import CurrentUser
from src.schemas.chat import ChatCreate, ChatCreateResponse, ChatDetail, ChatListResponse
from src.services.chat_service import ChatService

router = APIRouter(prefix="/projects/{project_id}/chats", tags=["Chats"])


@router.get("", response_model=ChatListResponse)
async def list_chats(
    project_id: UUID,
    current_user: CurrentUser,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """List all chats in a project."""
    try:
        return ChatService.list_by_project(project_id, UUID(current_user["id"]), limit, offset)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("", response_model=ChatCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_chat(
    project_id: UUID,
    chat_data: ChatCreate,
    current_user: CurrentUser,
):
    """Create a new chat."""
    try:
        return ChatService.create(project_id, UUID(current_user["id"]), chat_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


# Additional route for getting chat by ID (not nested under project)
router_by_id = APIRouter(prefix="/chats", tags=["Chats"])


@router_by_id.get("/{chat_id}", response_model=ChatDetail)
async def get_chat(
    chat_id: UUID,
    current_user: CurrentUser,
):
    """Get chat details with message history."""
    chat = ChatService.get_by_id(chat_id, UUID(current_user["id"]))
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    return chat


@router_by_id.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat(
    chat_id: UUID,
    current_user: CurrentUser,
):
    """Delete a chat and all associated messages and documents."""
    success = ChatService.delete(chat_id, UUID(current_user["id"]))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )

