import { apiClient } from './api-client';
import { ApiResponse } from '@/types/api';

export interface CreateClientAddressRequest {
  label: string;
  houseNo?: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  country?: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  phone?: string;
  isDefaultShipping?: boolean;
}

export interface ClientAddressDto {
  id: string;
  label: string;
  houseNo?: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  phone?: string;
  isDefaultShipping: boolean;
}

export const addressService = {
  getAddresses: (): Promise<ApiResponse<ClientAddressDto[]>> => {
    return apiClient.get<ClientAddressDto[]>('/client/addresses');
  },

  createAddress: (
    request: CreateClientAddressRequest
  ): Promise<ApiResponse<ClientAddressDto>> => {
    return apiClient.post<ClientAddressDto>('/client/addresses', request);
  },
};
