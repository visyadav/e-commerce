import { apiClient } from './api-client';
import {
  ApiResponse,
  CheckServiceabilityRequest,
  ServiceabilityResultDto,
  ServiceableAreaDto,
} from '@/types/api';

export const locationService = {
  getClientAreas: (): Promise<ApiResponse<ServiceableAreaDto[]>> => {
    return apiClient.get<ServiceableAreaDto[]>('/client/serviceable-areas');
  },

  checkServiceability: (
    request: CheckServiceabilityRequest
  ): Promise<ApiResponse<ServiceabilityResultDto>> => {
    return apiClient.post<ServiceabilityResultDto>(
      '/client/serviceable-areas/check',
      request
    );
  },
};
