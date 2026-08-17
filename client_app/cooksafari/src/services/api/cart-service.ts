import { apiClient } from './api-client';
import { ApiResponse } from '@/types/api';

export interface CartItemDto {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImageUrl: string;
  quantity: number;
  totalPrice: number;
}

export interface CartDto {
  items: CartItemDto[];
  subTotal: number;
  totalItems: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export const cartService = {
  getCart: (): Promise<ApiResponse<CartDto>> => {
    return apiClient.get<CartDto>('/cart');
  },

  addToCart: (request: AddToCartRequest): Promise<ApiResponse<CartDto>> => {
    return apiClient.post<CartDto>('/cart', request);
  },

  updateQuantity: (cartItemId: string, request: UpdateCartItemRequest): Promise<ApiResponse<CartDto>> => {
    return apiClient.put<CartDto>(`/cart/${cartItemId}`, request);
  },

  removeFromCart: (cartItemId: string): Promise<ApiResponse<CartDto>> => {
    return apiClient.delete<CartDto>(`/cart/${cartItemId}`);
  },

  clearCart: (): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>('/cart');
  },
};
