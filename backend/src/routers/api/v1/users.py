"""User management API routes."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import JSONResponse

from src.dependencies.auth import CurrentUser, get_current_user
from src.schemas.user import User, UserListResponse, UserSwitchRequest, UserSwitchResponse, UserUpdate
from src.services.user_service import UserService
from src.utils.cookies import set_user_cookie

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=User)
async def get_current_user_endpoint(
    current_user: CurrentUser,
):
    """Get or create current user based on cookie."""
    return User(**current_user)


@router.get("", response_model=UserListResponse)
async def list_users(
    current_user: CurrentUser,
):
    """List all users for user selection dropdown."""
    return UserService.list_all()


@router.post("/switch", response_model=UserSwitchResponse)
async def switch_user(
    request: UserSwitchRequest,
    response: Response,
    current_user: CurrentUser,
):
    """Switch to a different user by setting cookie."""
    user = UserService.switch_user(request.user_id, current_user["cookie_id"])
    
    # Set cookie with new user's cookie_id
    # Note: We need to get the cookie_id from the target user
    target_user = UserService.get_by_id(request.user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    set_user_cookie(response, target_user.cookie_id)
    
    return UserSwitchResponse(
        id=target_user.id,
        cookie_id=target_user.cookie_id,
        name=target_user.name,
        message="Switched to user successfully"
    )


@router.patch("/me", response_model=User)
async def update_current_user(
    update_data: UserUpdate,
    current_user: CurrentUser,
):
    """Update current user's display name."""
    user = UserService.update(UUID(current_user["id"]), update_data)
    return user

