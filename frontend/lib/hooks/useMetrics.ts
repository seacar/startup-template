import useSWR from "swr";
import { getChatMetrics } from "../api/metrics";
import type { ChatMetricsResponse } from "../types/models";

export function useChatMetrics(chatId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ChatMetricsResponse>(
    chatId ? `/api/v1/chats/${chatId}/metrics` : null,
    () => (chatId ? getChatMetrics(chatId) : null)
  );

  return {
    metrics: data,
    isLoading,
    isError: error,
    mutate,
  };
}

