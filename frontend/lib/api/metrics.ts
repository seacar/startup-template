import { apiClient } from "./client";
import type { ChatMetricsResponse } from "../types/models";

export async function getChatMetrics(
  chatId: string
): Promise<ChatMetricsResponse> {
  return apiClient.get<ChatMetricsResponse>(`/chats/${chatId}/metrics`);
}

