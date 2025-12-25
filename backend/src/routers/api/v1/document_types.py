"""Document type API routes."""
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from src.dependencies.auth import CurrentUser
from src.schemas.document_type import DocumentType, DocumentTypeListResponse
from src.services.document_type_service import DocumentTypeService

router = APIRouter(prefix="/document-types", tags=["Document Types"])


@router.get("", response_model=DocumentTypeListResponse)
async def list_document_types():
    """List available document types."""
    return DocumentTypeService.list_active()


@router.post("", response_model=DocumentType, status_code=status.HTTP_201_CREATED)
async def create_document_type(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    template_prompt: Optional[str] = Form(None),
    example_output_text: Optional[str] = Form(None),
    example_output_file: Optional[UploadFile] = File(None),
    current_user: CurrentUser = Depends(),
):
    """
    Create a new document type.
    
    Can provide example_output either as:
    - Text (markdown) via example_output_text form field
    - File upload via example_output_file form field
    
    Accepts multipart/form-data with the following fields:
    - name (required): Document type name
    - description (optional): Description of the document type
    - template_prompt (optional): Base prompt template
    - example_output_text (optional): Example output as markdown text
    - example_output_file (optional): Example output as file upload (.md, .txt, .markdown)
    """
    # Handle file upload if provided
    example_output = example_output_text
    
    if example_output_file:
        # Read file content
        file_content = await example_output_file.read()
        
        # Check file extension
        filename = example_output_file.filename or ""
        is_text_file = (
            filename.endswith((".md", ".txt", ".markdown")) or
            (example_output_file.content_type and "text" in example_output_file.content_type)
        )
        
        if is_text_file:
            try:
                example_output = file_content.decode("utf-8")
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File must be a valid text file (UTF-8 encoded)"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only text/markdown files (.md, .txt, .markdown) are supported for example_output"
            )
    
    # Validate name is provided
    if not name or not name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name is required"
        )
    
    # Create document type data
    create_data = {
        "name": name.strip(),
        "description": description.strip() if description else None,
        "template_prompt": template_prompt.strip() if template_prompt else None,
        "example_output": example_output.strip() if example_output else None,
        "is_active": True,
    }
    
    try:
        return DocumentTypeService.create(create_data)
    except Exception as e:
        # Check if it's a unique constraint violation (duplicate name)
        error_msg = str(e).lower()
        if "unique" in error_msg or "duplicate" in error_msg or "already exists" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Document type with name '{name}' already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create document type: {str(e)}"
        )

