"""Project management API routes."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from src.dependencies.auth import CurrentUser
from src.schemas.project import Project, ProjectCreate, ProjectDetail, ProjectListResponse, ProjectUpdate
from src.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    current_user: CurrentUser,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """List all projects for current user."""
    return ProjectService.list_by_user(UUID(current_user["id"]), limit, offset)


@router.post("", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: CurrentUser,
):
    """Create a new project."""
    return ProjectService.create(UUID(current_user["id"]), project_data)


@router.get("/{project_id}", response_model=ProjectDetail)
async def get_project(
    project_id: UUID,
    current_user: CurrentUser,
):
    """Get project details."""
    project = ProjectService.get_by_id(project_id, UUID(current_user["id"]))
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


@router.patch("/{project_id}", response_model=Project)
async def update_project(
    project_id: UUID,
    update_data: ProjectUpdate,
    current_user: CurrentUser,
):
    """Update project details."""
    project = ProjectService.update(project_id, UUID(current_user["id"]), update_data)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    current_user: CurrentUser,
):
    """Delete a project and all associated chats."""
    success = ProjectService.delete(project_id, UUID(current_user["id"]))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

