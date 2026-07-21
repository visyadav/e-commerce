import { apiClient } from "../api-client";
import type { AdminUserDto, AdminUserDetailsDto, UpdateAdminUserRequest, CreateAdminUserRequest } from "@/src/types/users";

export const userService = {
  getAllUsers: (searchTerm?: string, pageNumber = 1, pageSize = 10) => {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber.toString());
    params.append("pageSize", pageSize.toString());
    if (searchTerm) params.append("searchTerm", searchTerm);
    
    return apiClient.getPaginated<AdminUserDto>(`/AdminUser?${params.toString()}`);
  },

  getUserById: (userId: string) => {
    return apiClient.get<AdminUserDetailsDto>(`/AdminUser/${userId}`);
  },

  createUser: (data: CreateAdminUserRequest) => {
    return apiClient.post<void>("/AdminUser", data);
  },

  toggleUserStatus: (userId: string, isActive: boolean) => {
    return apiClient.put<void>(`/AdminUser/${userId}/status`, { isActive });
  },

  updateUser: (userId: string, data: UpdateAdminUserRequest) => {
    return apiClient.put<void>(`/AdminUser/${userId}`, data);
  }
};
