"""Context management API routes."""
from typing import Literal, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import JSONResponse

from src.dependencies.auth import CurrentUser
from src.schemas.context import ContextItem, ContextItemCreate, ContextItemCreateResponse, ContextItemListResponse
from src.services.context_service import ContextService
from src.services.supabase import get_supabase_admin_client

router = APIRouter(prefix="/context", tags=["Context"])


@router.post("", response_model=ContextItemCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_context_item(
    current_user: CurrentUser,
    context_data: ContextItemCreate,
    file: Optional[UploadFile] = File(None),
):
    """Add context item (global, user, project, or chat scope)."""
    # Handle file upload if provided
    file_url = None
    file_type = None
    
    if file:
        # Upload to Supabase Storage
        supabase = get_supabase_admin_client()
        file_content = await file.read()
        file_path = f"{current_user['id']}/{file.filename}"
        
        # Upload file
        storage_response = supabase.storage.from_("context-files").upload(
            path=file_path,
            file=file_content,
            file_options={"content-type": file.content_type or "application/octet-stream"}
        )
        
        if storage_response:
            # Get public URL (or signed URL for private buckets)
            file_url = supabase.storage.from_("context-files").get_public_url(file_path)
            file_type = file.filename.split(".")[-1] if "." in file.filename else None
        
        # If content not provided, read from file (for text files)
        if not context_data.content and file_type in ["txt", "md"]:
            context_data.content = file_content.decode("utf-8")
    
    if not context_data.content and not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either content or file must be provided"
        )
    
    try:
        return ContextService.create(
            user_id=UUID(current_user["id"]),
            context_data=ContextItemCreate(
                **context_data.model_dump(),
                file_url=file_url,
                file_type=file_type
            )
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("", response_model=ContextItemListResponse)
async def list_context_items(
    current_user: CurrentUser,
    scope: Optional[Literal["global", "user", "project", "chat"]] = Query(None),
    project_id: Optional[UUID] = Query(None),
    chat_id: Optional[UUID] = Query(None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """List context items."""
    return ContextService.list(
        user_id=UUID(current_user["id"]),
        scope=scope,
        project_id=project_id,
        chat_id=chat_id,
        limit=limit,
        offset=offset
    )


@router.delete("/{context_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_context_item(
    context_id: UUID,
    current_user: CurrentUser,
):
    """Delete a context item."""
    success = ContextService.delete(context_id, UUID(current_user["id"]))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Context item not found"
        )

