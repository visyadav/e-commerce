import { apiClient } from './api-client';
import { ApiResponse } from '@/types/api';

export interface ClientCouponDto {
  id: string;
  code: string;
  description?: string;
  discountPercentage: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  maxUsageCount: number;
  currentUsageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productId?: string;
  productName?: string;
  categoryId?: string;
  categoryName?: string;
}

export interface CartItemValidationDto {
  productId: string;
  categoryId?: string;
  unitPrice: number;
  originalPrice?: number;
  quantity: number;
}

export interface ApplyCouponRequest {
  code: string;
  userId?: string;
  items: CartItemValidationDto[];
}

export interface CouponValidationResultDto {
  isValid: boolean;
  code: string;
  discountAmount: number;
  eligibleSubtotal: number;
  excludedSubtotal: number;
  finalAmount: number;
  message: string;
}

export const clientCouponService = {
  getActiveCoupons: (): Promise<ApiResponse<ClientCouponDto[]>> => {
    return apiClient.get<ClientCouponDto[]>('/client/coupons');
  },

  applyCoupon: (request: ApplyCouponRequest): Promise<ApiResponse<CouponValidationResultDto>> => {
    return apiClient.post<CouponValidationResultDto>('/client/coupons/apply', request);
  },
};
