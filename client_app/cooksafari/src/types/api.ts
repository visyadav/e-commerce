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
  latitude: number;
  longitude: number;
  radiusInKm: number;
  isActive: boolean;
  cutoffTime?: string;
  createdAt: string;
}

export interface ServiceabilityResultDto {
  isServiceable: boolean;
  matchedHubName?: string;
  distanceInKm?: number;
  allowedRadiusKm?: number;
  message: string;
}

export interface CheckServiceabilityRequest {
  latitude?: number;
  longitude?: number;
  sectorOrAddress?: string;
  pincode?: string;
}
