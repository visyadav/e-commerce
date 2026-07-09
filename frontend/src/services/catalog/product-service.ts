import { apiClient } from "../api-client";
import type { ProductDto, CreateProductRequest, UpdateProductRequest } from "@/src/types/catalog";

export const productService = {
  getAll: (pageNumber = 1, pageSize = 10, searchTerm?: string, categoryId?: string, brandId?: string) => {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber.toString());
    params.append("pageSize", pageSize.toString());
    if (searchTerm) params.append("searchTerm", searchTerm);
    if (categoryId) params.append("categoryId", categoryId);
    if (brandId) params.append("brandId", brandId);
    
    return apiClient.getPaginated<ProductDto>(`/Product?${params.toString()}`);
  },

  getById: (id: string) => {
    return apiClient.get<ProductDto>(`/Product/${id}`);
  },

  create: (data: CreateProductRequest) => {
    return apiClient.post<ProductDto>("/Product", data);
  },

  update: (id: string, data: UpdateProductRequest) => {
    return apiClient.put<ProductDto>(`/Product/${id}`, data);
  },

  delete: (id: string) => {
    return apiClient.delete<void>(`/Product/${id}`);
  }
};
