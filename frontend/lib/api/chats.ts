import { apiClient } from "./client";
import type {
  ChatCreate,
  ChatCreateResponse,
  ChatDetail,
  ChatListResponse,
} from "../types/models";

export async function getChats(
  projectId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ChatListResponse> {
  return apiClient.get<ChatListResponse>(
    `/projects/${projectId}/chats?limit=${limit}&offset=${offset}`
  );
}

export async function getChat(chatId: string): Promise<ChatDetail> {
  return apiClient.get<ChatDetail>(`/chats/${chatId}`);
}

export async function createChat(
  projectId: string,
  data: ChatCreate
): Promise<ChatCreateResponse> {
  return apiClient.post<ChatCreateResponse>(
    `/projects/${projectId}/chats`,
    data
  );
}

export async function deleteChat(chatId: string): Promise<void> {
  return apiClient.delete<void>(`/chats/${chatId}`);
}

