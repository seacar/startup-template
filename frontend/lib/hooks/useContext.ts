import useSWR from "swr";
import {
  getContextItems,
  createContextItem as createContextItemApi,
  deleteContextItem as deleteContextItemApi,
} from "../api/context";
import type {
  ContextItem,
  ContextItemCreate,
  ContextListResponse,
} from "../types/models";

interface UseContextItemsParams {
  scope?: string;
  project_id?: string;
  chat_id?: string;
  limit?: number;
  offset?: number;
}

export function useContextItems(params?: UseContextItemsParams) {
  const key = params
    ? `/api/v1/context?${new URLSearchParams(
        Object.entries(params).reduce(
          (acc, [k, v]) => {
            if (v !== undefined) acc[k] = String(v);
            return acc;
          },
          {} as Record<string, string>
        )
      ).toString()}`
    : "/api/v1/context";

  const { data, error, isLoading, mutate } = useSWR<ContextListResponse>(
    key,
    () => getContextItems(params)
  );

  return {
    contextItems: data?.context_items || [],
    total: data?.total || 0,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useContextActions() {
  const createContextItem = async (
    data: ContextItemCreate
  ): Promise<ContextItem> => {
    return createContextItemApi(data);
  };

  const deleteContextItem = async (contextId: string): Promise<void> => {
    await deleteContextItemApi(contextId);
  };

  return {
    createContextItem,
    deleteContextItem,
  };
}

