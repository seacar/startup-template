import useSWR from "swr";
import { getDocumentTypes } from "../api/documentTypes";
import type { DocumentTypeListResponse } from "../types/models";

export function useDocumentTypes() {
  const { data, error, isLoading, mutate } = useSWR<DocumentTypeListResponse>(
    "/api/v1/document-types",
    getDocumentTypes,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    documentTypes: data?.document_types || [],
    isLoading,
    isError: error,
    mutate,
  };
}

