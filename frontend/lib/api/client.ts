import type { ApiError } from "../types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:18005";
const API_PREFIX = "/api/v1";

class ApiClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/**
 * Base API client with cookie handling and error management
 */
class ApiClient {
  public baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${API_PREFIX}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: "include", // Important for cookie handling
    };

    try {
      const response = await fetch(url, config);

      // Handle empty responses (e.g., 204 No Content)
      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error: ApiError = data;
        throw new ApiClientError(
          error.detail || error.message || error.error || "API request failed",
          response.status,
          data
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      // Network or other errors
      throw new ApiClientError(
        error instanceof Error ? error.message : "Network error",
        undefined,
        error
      );
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }

  /**
   * Upload a file with multipart/form-data
   */
  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${API_PREFIX}${endpoint}`;

    const config: RequestInit = {
      ...options,
      method: "POST",
      headers: {
        // Don't set Content-Type for FormData - browser will set it with boundary
        ...options?.headers,
      },
      credentials: "include",
      body: formData,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error: ApiError = data;
        throw new ApiClientError(
          error.detail || error.message || error.error || "API request failed",
          response.status,
          data
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      throw new ApiClientError(
        error instanceof Error ? error.message : "Network error",
        undefined,
        error
      );
    }
  }

  /**
   * Create WebSocket connection URL
   */
  getWebSocketUrl(endpoint: string): string {
    const protocol = this.baseUrl.startsWith("https") ? "wss" : "ws";
    const host = this.baseUrl.replace(/^https?:\/\//, "");
    return `${protocol}://${host}${API_PREFIX}${endpoint}`;
  }
}

export const apiClient = new ApiClient();
export { ApiClientError };

