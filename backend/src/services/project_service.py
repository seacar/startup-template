"""Project service."""
from typing import Optional
from uuid import UUID

from src.db.repositories.project_repo import ProjectRepository
from src.schemas.project import Project, ProjectCreate, ProjectUpdate, ProjectDetail, ProjectListResponse, ProjectListItem


class ProjectService:
    """Service for project operations."""

    @staticmethod
    def create(user_id: UUID, project_data: ProjectCreate) -> Project:
        """Create a new project."""
        project_dict = ProjectRepository.create(
            user_id=user_id,
            name=project_data.name,
            description=project_data.description
        )
        return Project(**project_dict)

    @staticmethod
    def get_by_id(project_id: UUID, user_id: UUID) -> Optional[ProjectDetail]:
        """Get project by ID (with user validation)."""
        project_dict = ProjectRepository.get_with_counts(project_id)
        if not project_dict:
            return None
        
        # Validate ownership
        if project_dict["user_id"] != str(user_id):
            return None
        
        return ProjectDetail(**project_dict)

    @staticmethod
    def list_by_user(user_id: UUID, limit: int = 50, offset: int = 0) -> ProjectListResponse:
        """List projects for a user."""
        projects_data, total = ProjectRepository.list_by_user(user_id, limit, offset)
        projects = [ProjectListItem(**project) for project in projects_data]
        return ProjectListResponse(
            projects=projects,
            total=total,
            limit=limit,
            offset=offset
        )

    @staticmethod
    def update(project_id: UUID, user_id: UUID, update_data: ProjectUpdate) -> Optional[Project]:
        """Update project (with user validation)."""
        # Validate ownership
        project = ProjectRepository.get_by_id(project_id)
        if not project or project["user_id"] != str(user_id):
            return None
        
        project_dict = ProjectRepository.update(
            project_id=project_id,
            name=update_data.name,
            description=update_data.description
        )
        return Project(**project_dict)

    @staticmethod
    def delete(project_id: UUID, user_id: UUID) -> bool:
        """Delete project (with user validation)."""
        # Validate ownership
        project = ProjectRepository.get_by_id(project_id)
        if not project or project["user_id"] != str(user_id):
            return False
        
        ProjectRepository.delete(project_id)
        return True

