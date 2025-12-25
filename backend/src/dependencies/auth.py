"""Cookie-based authentication dependencies."""
from fastapi import Depends, Request, Response
from typing import Annotated

from src.services.supabase import get_supabase_admin_client
from src.utils.cookies import get_user_cookie, set_user_cookie, generate_cookie_id


async def get_current_user(
    request: Request,
    response: Response,
) -> dict:
    """
    Get or create current user based on cookie.
    
    If no cookie exists, generates a new UUID cookie and creates a new user.
    Sets the cookie in the response headers only when a new cookie is created.
    """
    cookie_id = get_user_cookie(request)
    is_new_cookie = False
    
    if not cookie_id:
        # Generate new cookie ID
        cookie_id = generate_cookie_id()
        is_new_cookie = True
    
    # Get Supabase admin client for direct database access
    supabase = get_supabase_admin_client()
    
    # Try to get existing user
    result = supabase.table("users").select("*").eq("cookie_id", cookie_id).execute()
    
    if result.data and len(result.data) > 0:
        user = result.data[0]
    else:
        # Create new user
        new_user = supabase.table("users").insert({
            "cookie_id": cookie_id
        }).execute()
        
        if new_user.data and len(new_user.data) > 0:
            user = new_user.data[0]
        else:
            raise Exception("Failed to create user")
    
    # Only set cookie in response if it's a new cookie
    # This prevents overwriting existing cookies unnecessarily
    if is_new_cookie:
        set_user_cookie(response, cookie_id)
    
    return user


# Dependency type alias for cleaner route definitions
CurrentUser = Annotated[dict, Depends(get_current_user)]
