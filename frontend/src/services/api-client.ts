import { API_BASE_URL } from "@/src/constants/app";
import type { ApiResponse, ApiError } from "@/src/types/api";
import Cookies from "js-cookie";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    if (body instanceof FormData) {
      config.body = body;
      if (config.headers && "Content-Type" in config.headers) {
          delete (config.headers as Record<string, string>)["Content-Type"];
      }
    } else {
      config.body = JSON.stringify(body);
    }
  }

  // Attach auth token if available
  if (typeof window !== "undefined") {
    const token = Cookies.get("token");
    if (token) {
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      Cookies.remove("token");
      Cookies.remove("user");
      window.location.href = "/login";
      return new Promise<never>(() => {});
    }

    const errorData = await res.json().catch(() => ({}));
    const apiError: ApiError = {
      status: res.status,
      message: errorData.message || `Request failed with status ${res.status}`,
      errors: errorData.errors || [],
    };
    throw apiError;
  }

  const json = (await res.json()) as ApiResponse<T>;
  
  if (!json.success) {
    const apiError: ApiError = {
      status: res.status,
      message: json.message || "API returned failure status",
      errors: json.errors || [],
    };
    throw apiError;
  }

  return json.data;
}

async function requestPaginated<T>(endpoint: string, options: RequestOptions = {}): Promise<{ data: T[]; pagination: import("@/src/types/api").PaginationMeta }> {
  const { method = "GET", body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    if (body instanceof FormData) {
      config.body = body;
      if (config.headers && "Content-Type" in config.headers) {
          delete (config.headers as Record<string, string>)["Content-Type"];
      }
    } else {
      config.body = JSON.stringify(body);
    }
  }

  // Attach auth token if available
  if (typeof window !== "undefined") {
    const token = Cookies.get("token");
    if (token) {
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      Cookies.remove("token");
      Cookies.remove("user");
      window.location.href = "/login";
      return new Promise<never>(() => {});
    }

    const errorData = await res.json().catch(() => ({}));
    const apiError: ApiError = {
      status: res.status,
      message: errorData.message || `Request failed with status ${res.status}`,
      errors: errorData.errors || [],
    };
    throw apiError;
  }

  const json = (await res.json()) as import("@/src/types/api").PagedResponse<T>;
  
  if (!json.success) {
    const apiError: ApiError = {
      status: res.status,
      message: json.message || "API returned failure status",
      errors: json.errors || [],
    };
    throw apiError;
  }

  return { data: json.data, pagination: json.pagination };
}

export const apiClient = {
  get: <T>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: "GET", headers }),

  getPaginated: <T>(endpoint: string, headers?: Record<string, string>) =>
    requestPaginated<T>(endpoint, { method: "GET", headers }),

  post: <T>(endpoint: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: "POST", body, headers }),

  put: <T>(endpoint: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: "PUT", body, headers }),

  delete: <T>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: "DELETE", headers }),
};
