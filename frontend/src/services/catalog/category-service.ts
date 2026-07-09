import { apiClient } from "../api-client";
import type { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from "@/src/types/catalog";

export const categoryService = {
  getAll: (pageNumber = 1, pageSize = 10, searchTerm?: string) => {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber.toString());
    params.append("pageSize", pageSize.toString());
    if (searchTerm) params.append("searchTerm", searchTerm);
    
    return apiClient.getPaginated<CategoryDto>(`/Category?${params.toString()}`);
  },

  getLookup: () => {
    return apiClient.get<CategoryDto[]>("/Lookup/categories");
  },

  getById: (id: string) => {
    return apiClient.get<CategoryDto>(`/Category/${id}`);
  },

  create: (data: CreateCategoryRequest) => {
    return apiClient.post<CategoryDto>("/Category", data);
  },

  update: (id: string, data: UpdateCategoryRequest) => {
    return apiClient.put<CategoryDto>(`/Category/${id}`, data);
  },

  delete: (id: string) => {
    return apiClient.delete<void>(`/Category/${id}`);
  }
};
