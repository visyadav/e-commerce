import { apiClient } from './api-client';
import { ApiResponse } from '@/types/api';

export interface AddressDto {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone?: string;
}

export interface CreateOrderRequest {
  shippingAddressId?: string;
  billingAddressId?: string;
  shippingAddress?: AddressDto;
  billingAddress?: AddressDto;
  couponCode?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: string;
  subTotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  notes?: string;
  shippingAddress?: AddressDto;
  billingAddress?: AddressDto;
  createdAt: string;
  items: OrderItemDto[];
}

export const clientOrderService = {
  createOrder: (request: CreateOrderRequest): Promise<ApiResponse<OrderDto>> => {
    return apiClient.post<OrderDto>('/orders', request);
  },

  getMyOrders: (pageNumber = 1, pageSize = 20): Promise<ApiResponse<OrderDto[]>> => {
    return apiClient.get<OrderDto[]>(`/orders?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  },

  getOrderById: (id: string): Promise<ApiResponse<OrderDto>> => {
    return apiClient.get<OrderDto>(`/orders/${id}`);
  },
};
