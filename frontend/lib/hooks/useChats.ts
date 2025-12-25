import useSWR from "swr";
import {
  getChats,
  getChat,
  createChat as createChatApi,
  deleteChat as deleteChatApi,
} from "../api/chats";
import type {
  ChatCreate,
  ChatCreateResponse,
  ChatDetail,
  ChatListResponse,
} from "../types/models";

export function useChats(
  projectId: string | null,
  limit: number = 50,
  offset: number = 0
) {
  const { data, error, isLoading, mutate } = useSWR<ChatListResponse>(
    projectId
      ? `/api/v1/projects/${projectId}/chats?limit=${limit}&offset=${offset}`
      : null,
    () => (projectId ? getChats(projectId, limit, offset) : null)
  );

  return {
    chats: data?.chats || [],
    total: data?.total || 0,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useChat(chatId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ChatDetail>(
    chatId ? `/api/v1/chats/${chatId}` : null,
    () => (chatId ? getChat(chatId) : null)
  );

  return {
    chat: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useChatActions(projectId: string | null) {
  const { mutate: mutateList } = useChats(projectId);

  const createChat = async (
    data: ChatCreate
  ): Promise<ChatCreateResponse> => {
    if (!projectId) {
      throw new Error("Project ID is required");
    }
    const chat = await createChatApi(projectId, data);
    await mutateList();
    return chat;
  };

  const deleteChat = async (chatId: string): Promise<void> => {
    await deleteChatApi(chatId);
    await mutateList();
  };

  return {
    createChat,
    deleteChat,
  };
}

