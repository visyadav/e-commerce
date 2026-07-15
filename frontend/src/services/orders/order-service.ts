import { apiClient } from "../api-client";
import type { OrderDto, OrderStatus } from "@/src/types/orders";

export const orderService = {
  getAllOrders: (searchTerm?: string, status?: string, pageNumber = 1, pageSize = 10) => {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber.toString());
    params.append("pageSize", pageSize.toString());
    if (searchTerm) params.append("searchTerm", searchTerm);
    if (status) params.append("status", status);
    
    return apiClient.getPaginated<OrderDto>(`/AdminOrder?${params.toString()}`);
  },

  updateOrderStatus: (orderId: string, status: OrderStatus | string) => {
    return apiClient.put<void>(`/AdminOrder/${orderId}/status`, { status });
  }
};
