import { apiClient } from "./client";
import type { DocumentType, DocumentTypeListResponse } from "../types/models";

export async function getDocumentTypes(): Promise<DocumentTypeListResponse> {
  return apiClient.get<DocumentTypeListResponse>("/document-types");
}

export interface CreateDocumentTypeData {
  name: string;
  description?: string;
  template_prompt?: string;
  example_output_text?: string;
  example_output_file?: File;
}

export async function createDocumentType(
  data: CreateDocumentTypeData
): Promise<DocumentType> {
  if (data.example_output_file) {
    // Upload with file
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.template_prompt) formData.append("template_prompt", data.template_prompt);
    formData.append("example_output_file", data.example_output_file);

    return apiClient.postFormData<DocumentType>("/document-types", formData);
  } else {
    // Text-only
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.template_prompt) formData.append("template_prompt", data.template_prompt);
    if (data.example_output_text) formData.append("example_output_text", data.example_output_text);

    return apiClient.postFormData<DocumentType>("/document-types", formData);
  }
}

