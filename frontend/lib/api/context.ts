import { apiClient } from "./client";
import type {
  ContextItem,
  ContextItemCreate,
  ContextItemResponse,
  ContextListResponse,
} from "../types/models";

export async function getContextItems(
  params?: {
    scope?: string;
    project_id?: string;
    chat_id?: string;
    limit?: number;
    offset?: number;
  }
): Promise<ContextListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.scope) searchParams.append("scope", params.scope);
  if (params?.project_id) searchParams.append("project_id", params.project_id);
  if (params?.chat_id) searchParams.append("chat_id", params.chat_id);
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.offset) searchParams.append("offset", params.offset.toString());

  const query = searchParams.toString();
  return apiClient.get<ContextListResponse>(
    `/context${query ? `?${query}` : ""}`
  );
}

export async function createContextItem(
  data: ContextItemCreate
): Promise<ContextItemResponse> {
  if (data.file) {
    // Upload with file
    const formData = new FormData();
    formData.append("scope", data.scope);
    if (data.project_id) formData.append("project_id", data.project_id);
    if (data.chat_id) formData.append("chat_id", data.chat_id);
    formData.append("title", data.title);
    if (data.content) formData.append("content", data.content);
    formData.append("file", data.file);

    return apiClient.postFormData<ContextItemResponse>("/context", formData);
  } else {
    // Text-only context
    return apiClient.post<ContextItemResponse>("/context", {
      scope: data.scope,
      project_id: data.project_id,
      chat_id: data.chat_id,
      title: data.title,
      content: data.content,
    });
  }
}

export async function deleteContextItem(contextId: string): Promise<void> {
  return apiClient.delete<void>(`/context/${contextId}`);
}

