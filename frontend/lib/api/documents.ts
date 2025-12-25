import { apiClient } from "./client";
import type { Document, DocumentListResponse } from "../types/models";

export async function getDocument(documentId: string): Promise<Document> {
  return apiClient.get<Document>(`/documents/${documentId}`);
}

export async function getDocuments(
  chatId: string
): Promise<DocumentListResponse> {
  return apiClient.get<DocumentListResponse>(`/chats/${chatId}/documents`);
}

export async function downloadDocument(documentId: string): Promise<Blob> {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:18005";
  const url = `${API_BASE_URL}/api/v1/documents/${documentId}/download`;
  const response = await fetch(url, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to download document");
  }

  return response.blob();
}

