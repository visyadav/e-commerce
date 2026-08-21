import { apiClient } from './api-client';
import { ApiResponse } from '@/types/api';

export interface MobileLoginRequest {
  phoneNumber: string;
  otp?: string;
  fullName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiration: string;
  email: string;
  fullName: string;
  roles: string[];
}

export const clientAuthService = {
  mobileLogin: (request: MobileLoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>('/client/auth/mobile-login', request);
  },

  getMe: (): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.get<AuthResponse>('/client/auth/me');
  },

  updateName: (fullName: string): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>('/client/auth/update-name', { fullName });
  },
};
