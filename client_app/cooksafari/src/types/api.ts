export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface ServiceableAreaDto {
  id: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
  excludedPincodes?: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  cutoffTime?: string;
  createdAt: string;
}

export interface ServiceabilityResultDto {
  isServiceable: boolean;
  matchedHubName?: string;
  message: string;
}

export interface CheckServiceabilityRequest {
  city?: string;
  latitude?: number;
  longitude?: number;
  sectorOrAddress?: string;
  pincode?: string;
}
