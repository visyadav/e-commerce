import { apiClient } from "@/src/services/api-client";

export interface CouponUsageLogDto {
  id: string;
  couponId: string;
  code: string;
  userId: string;
  userFullName: string;
  userPhone: string;
  orderId?: string;
  discountAmount: number;
  usedAt: string;
}

export interface CouponDto {
  id: string;
  code: string;
  description?: string;
  discountPercentage: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  maxUsageCount: number;
  currentUsageCount: number;
  maxUsagePerUser: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productId?: string;
  productName?: string;
  categoryId?: string;
  categoryName?: string;
}

export interface CreateCouponRequest {
  code: string;
  description?: string;
  discountPercentage: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  maxUsageCount: number;
  maxUsagePerUser: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productId?: string;
  categoryId?: string;
}

export const couponAdminService = {
  getAllCoupons: (): Promise<CouponDto[]> => {
    return apiClient.get<CouponDto[]>("/coupons");
  },

  getCouponById: (id: string): Promise<CouponDto> => {
    return apiClient.get<CouponDto>(`/coupons/${id}`);
  },

  createCoupon: (data: CreateCouponRequest): Promise<CouponDto> => {
    return apiClient.post<CouponDto>("/coupons", data);
  },

  updateCoupon: (id: string, data: CreateCouponRequest): Promise<CouponDto> => {
    return apiClient.post<CouponDto>(`/coupons/${id}/update`, data);
  },

  deleteCoupon: (id: string): Promise<void> => {
    return apiClient.post<void>(`/coupons/${id}/delete`, {});
  },

  toggleStatus: (id: string): Promise<CouponDto> => {
    return apiClient.post<CouponDto>(`/coupons/${id}/toggle-status`, {});
  },

  getAllUsageLogs: (): Promise<CouponUsageLogDto[]> => {
    return apiClient.get<CouponUsageLogDto[]>("/coupons/usage-logs");
  },

  getCouponUsageLogs: (couponId: string): Promise<CouponUsageLogDto[]> => {
    return apiClient.get<CouponUsageLogDto[]>(`/coupons/${couponId}/usage-logs`);
  },
};
