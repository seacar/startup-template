import { apiClient } from "./client";
import type { WebSocketMessageRequest } from "../types/models";

/**
 * Helper to create WebSocket URL for chat messages
 */
export function getWebSocketUrl(chatId: string): string {
  return apiClient.getWebSocketUrl(`/chats/${chatId}/messages`);
}

/**
 * Create a WebSocket message request object
 */
export function createMessageRequest(
  content: string,
  selectedResponseId?: string,
  regenerate: boolean = false
): WebSocketMessageRequest {
  return {
    type: "message",
    content,
    selected_response_id: selectedResponseId,
    regenerate,
  };
}

