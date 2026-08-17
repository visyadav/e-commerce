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
  getById: (id: string) => apiClient.get<ServiceableArea>(`/admin/serviceable-areas/${id}`),
  save: (payload: CreateServiceableAreaPayload, id?: string) =>
    apiClient.post<ServiceableArea>(
      id ? `/admin/serviceable-areas?id=${id}` : '/admin/serviceable-areas',
      payload
    ),
};
