import { apiClient } from './api-client';
import { ApiResponse } from '@/types/api';
import { ENV } from '@/config/env';

export interface ClientCategoryDto {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  sortOrder: number;
}

export interface ClientProductDto {
  id: string;
  name: string;
  description?: string;
  slug: string;
  price: number;
  originalPrice?: number;
  unit: string;
  imageUrl: string;
  badge?: string;
  discountPercentage?: string;
  rating?: number;
  isVeg?: boolean;
  isDailyEssential?: boolean;
  stockQuantity: number;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
}

export interface ClientProductQueryParameters {
  categorySlug?: string;
  categoryId?: string;
  search?: string;
  isDailyEssential?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export function formatImageUrl(url?: string): string {
  if (!url) {
    return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80';
  }

  // If already full http(s) URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('localhost:5185') || url.includes('127.0.0.1:5185')) {
      const serverOrigin = ENV.API_BASE_URL.replace('/api/v1', '');
      return url.replace(/http:\/\/(localhost|127\.0\.0\.1):5185/, serverOrigin);
    }
    return url;
  }

  // If relative URL
  const serverOrigin = ENV.API_BASE_URL.replace('/api/v1', '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${serverOrigin}${cleanPath}`;
}

export const productService = {
  getProducts: async (params?: ClientProductQueryParameters): Promise<ApiResponse<ClientProductDto[]>> => {
    const queryParams: Record<string, string> = {};
    if (params?.categorySlug) queryParams.categorySlug = params.categorySlug;
    if (params?.categoryId) queryParams.categoryId = params.categoryId;
    if (params?.search) queryParams.search = params.search;
    if (params?.isDailyEssential !== undefined) queryParams.isDailyEssential = String(params.isDailyEssential);
    if (params?.pageNumber) queryParams.pageNumber = String(params.pageNumber);
    if (params?.pageSize) queryParams.pageSize = String(params.pageSize);

    const queryString = new URLSearchParams(queryParams).toString();
    const endpoint = `/client/products${queryString ? `?${queryString}` : ''}`;
    const res = await apiClient.get<ClientProductDto[]>(endpoint);

    if (res.success && res.data) {
      res.data = res.data.map((p) => ({
        ...p,
        imageUrl: formatImageUrl(p.imageUrl),
      }));
    }

    return res;
  },

  getPopularProducts: async (limit: number = 10): Promise<ApiResponse<ClientProductDto[]>> => {
    const res = await apiClient.get<ClientProductDto[]>(`/client/products/popular?limit=${limit}`);
    if (res.success && res.data) {
      res.data = res.data.map((p) => ({
        ...p,
        imageUrl: formatImageUrl(p.imageUrl),
      }));
    }
    return res;
  },

  getCategories: async (): Promise<ApiResponse<ClientCategoryDto[]>> => {
    const res = await apiClient.get<ClientCategoryDto[]>('/client/products/categories');
    if (res.success && res.data) {
      res.data = res.data.map((c) => ({
        ...c,
        imageUrl: formatImageUrl(c.imageUrl),
      }));
    }
    return res;
  },

  getProductById: async (id: string): Promise<ApiResponse<ClientProductDto>> => {
    const res = await apiClient.get<ClientProductDto>(`/client/products/${id}`);
    if (res.success && res.data) {
      res.data.imageUrl = formatImageUrl(res.data.imageUrl);
    }
    return res;
  },
};
