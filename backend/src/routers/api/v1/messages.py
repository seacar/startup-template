"""WebSocket endpoint for real-time message streaming and document generation."""
import json
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from fastapi.exceptions import WebSocketException

from src.dependencies.auth import get_current_user
from src.schemas.websocket import WebSocketMessageRequest, WebSocketErrorEvent
from src.services.chat_service import ChatService
from src.utils.cookies import get_user_cookie

router = APIRouter(prefix="/chats/{chat_id}/messages", tags=["Messages"])


@router.websocket("")
async def websocket_endpoint(
    websocket: WebSocket,
    chat_id: UUID,
):
    """WebSocket endpoint for real-time message streaming."""
    await websocket.accept()
    
    # Get user from cookie (simplified - in production, use proper cookie extraction)
    cookie_id = None
    try:
        # Extract cookie from headers
        cookie_header = websocket.headers.get("cookie", "")
        for cookie in cookie_header.split(";"):
            if "user_cookie" in cookie:
                cookie_id = cookie.split("=")[1].strip()
                break
    except Exception:
        pass
    
    if not cookie_id:
        await websocket.send_json(WebSocketErrorEvent(error="Authentication required").model_dump())
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    # Validate chat access (simplified - would need user_id from cookie)
    # For now, proceed with connection
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            if data.get("type") == "message":
                message_request = WebSocketMessageRequest(**data)
                
                # TODO: Integrate with LangGraph agent for document generation
                # For now, send a placeholder response
                await websocket.send_json({
                    "type": "token",
                    "token": "# Document\n\n",
                    "content_type": "content"
                })
                
                await websocket.send_json({
                    "type": "complete",
                    "document_id": "00000000-0000-0000-0000-000000000000",
                    "version": 1,
                    "message_id": "00000000-0000-0000-0000-000000000000"
                })
                
    except WebSocketDisconnect:
        # Client disconnected
        pass
    except Exception as e:
        # Send error and close connection
        try:
            await websocket.send_json(WebSocketErrorEvent(error=str(e)).model_dump())
        except Exception:
            pass
        await websocket.close()

