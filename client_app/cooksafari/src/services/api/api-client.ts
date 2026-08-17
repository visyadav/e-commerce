import { ENV } from '@/config/env';
import { ApiResponse } from '@/types/api';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || ENV.API_BASE_URL;
  }

  private getEffectiveBaseUrl(): string {
    return ENV.API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.getEffectiveBaseUrl()}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ENV.TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = await response.json();
      return json as ApiResponse<T>;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.warn(`[ApiClient Warning] Request failed for ${url}:`, error?.message || error);
      return {
        success: false,
        message: error?.message || 'Network request failed',
      };
    }
  }

  public async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public async post<T>(
    endpoint: string,
    body: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  }
}

export const apiClient = new ApiClient();
