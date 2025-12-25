"""Document management API routes."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import StreamingResponse

from src.dependencies.auth import CurrentUser
from src.schemas.document import Document, DocumentListResponse
from src.services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.get("/{document_id}", response_model=Document)
async def get_document(
    document_id: UUID,
    current_user: CurrentUser,
):
    """Get a specific document version."""
    document = DocumentService.get_by_id(document_id, UUID(current_user["id"]))
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    return document


@router.get("/{document_id}/download")
async def download_document(
    document_id: UUID,
    current_user: CurrentUser,
):
    """Download document as markdown file."""
    document = DocumentService.get_by_id(document_id, UUID(current_user["id"]))
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return Response(
        content=document.content,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f'attachment; filename="document-v{document.version}.md"'
        }
    )


# Route for listing documents by chat
router_by_chat = APIRouter(prefix="/chats/{chat_id}/documents", tags=["Documents"])


@router_by_chat.get("", response_model=DocumentListResponse)
async def list_documents(
    chat_id: UUID,
    current_user: CurrentUser,
):
    """Get all document versions for a chat."""
    try:
        return DocumentService.list_by_chat(chat_id, UUID(current_user["id"]))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

