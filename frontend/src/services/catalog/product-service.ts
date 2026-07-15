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
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'imageFiles' && Array.isArray(value)) {
          value.forEach((file: File) => formData.append('ImageFiles', file));
        } else if (key === 'tags' && Array.isArray(value)) {
          value.forEach((tag: string) => formData.append('Tags', tag));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    return apiClient.post<ProductDto>("/Product", formData);
  },

  update: (id: string, data: UpdateProductRequest) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'imageFiles' && Array.isArray(value)) {
          value.forEach((file: File) => formData.append('ImageFiles', file));
        } else if (key === 'tags' && Array.isArray(value)) {
          value.forEach((tag: string) => formData.append('Tags', tag));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    return apiClient.put<ProductDto>(`/Product/${id}`, formData);
  },

  delete: (id: string) => {
    return apiClient.delete<void>(`/Product/${id}`);
  }
};
