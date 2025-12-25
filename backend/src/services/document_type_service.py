"""Document type service."""
from src.db.repositories.document_type_repo import DocumentTypeRepository
from src.schemas.document_type import DocumentType, DocumentTypeListResponse


class DocumentTypeService:
    """Service for document type operations."""

    @staticmethod
    def list_active() -> DocumentTypeListResponse:
        """List all active document types."""
        types_data = DocumentTypeRepository.list_active()
        document_types = [DocumentType(**dt) for dt in types_data]
        return DocumentTypeListResponse(document_types=document_types)

    @staticmethod
    def get_by_name(name: str) -> DocumentType | None:
        """Get document type by name."""
        type_data = DocumentTypeRepository.get_by_name(name)
        if type_data:
            return DocumentType(**type_data)
        return None

    @staticmethod
    def create(data: dict) -> DocumentType:
        """Create a new document type."""
        type_data = DocumentTypeRepository.create(data)
        return DocumentType(**type_data)

