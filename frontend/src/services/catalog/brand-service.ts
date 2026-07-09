import { apiClient } from "../api-client";
import type { BrandDto, CreateBrandRequest, UpdateBrandRequest } from "@/src/types/catalog";

export const brandService = {
  getAll: (pageNumber = 1, pageSize = 10, searchTerm?: string) => {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber.toString());
    params.append("pageSize", pageSize.toString());
    if (searchTerm) params.append("searchTerm", searchTerm);
    
    return apiClient.getPaginated<BrandDto>(`/Brand?${params.toString()}`);
  },

  getLookup: () => {
    return apiClient.get<BrandDto[]>("/Lookup/brands");
  },

  getById: (id: string) => {
    return apiClient.get<BrandDto>(`/Brand/${id}`);
  },

  create: (data: CreateBrandRequest) => {
    return apiClient.post<BrandDto>("/Brand", data);
  },

  update: (id: string, data: UpdateBrandRequest) => {
    return apiClient.put<BrandDto>(`/Brand/${id}`, data);
  },

  delete: (id: string) => {
    return apiClient.delete<void>(`/Brand/${id}`);
  }
};
