import { apiClient } from './api-client';

export interface ServiceableArea {
  id: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  radiusInKm: number;
  isActive: boolean;
  cutoffTime?: string;
  createdAt: string;
}

export interface CreateServiceableAreaPayload {
  name: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  radiusInKm: number;
  isActive: boolean;
}

export const serviceableAreaService = {
  getAll: () => apiClient.get<ServiceableArea[]>('/admin/serviceable-areas'),
  create: (payload: CreateServiceableAreaPayload) =>
    apiClient.post<ServiceableArea>('/admin/serviceable-areas', payload),
  update: (id: string, payload: CreateServiceableAreaPayload) =>
    apiClient.put<ServiceableArea>(`/admin/serviceable-areas/${id}`, payload),
  delete: (id: string) => apiClient.delete<boolean>(`/admin/serviceable-areas/${id}`),
};
