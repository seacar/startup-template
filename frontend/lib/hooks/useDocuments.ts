import useSWR from "swr";
import { getDocuments } from "../api/documents";
import type { DocumentListResponse } from "../types/models";

export function useDocuments(chatId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<DocumentListResponse>(
    chatId ? `/api/v1/chats/${chatId}/documents` : null,
    () => (chatId ? getDocuments(chatId) : null)
  );

  return {
    documents: data?.documents || [],
    totalVersions: data?.total_versions || 0,
    isLoading,
    isError: error,
    mutate,
  };
}

