import { apiClient } from "../api-client";
import type { 
  InventoryStatusDto, 
  InventoryRecordDto, 
  RestockRequest, 
  AdjustStockRequest 
} from "@/src/types/inventory";

export const inventoryService = {
  getStockLevels: (searchTerm?: string, onlyLowStock?: boolean, pageNumber = 1, pageSize = 10) => {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber.toString());
    params.append("pageSize", pageSize.toString());
    if (searchTerm) params.append("searchTerm", searchTerm);
    if (onlyLowStock !== undefined) params.append("onlyLowStock", onlyLowStock.toString());
    
    return apiClient.getPaginated<InventoryStatusDto>(`/Inventory?${params.toString()}`);
  },

  getProductHistory: (productId: string) => {
    return apiClient.get<InventoryRecordDto[]>(`/Inventory/${productId}/history`);
  },

  restock: (request: RestockRequest) => {
    return apiClient.post<void>("/Inventory/restock", request);
  },

  adjustStock: (request: AdjustStockRequest) => {
    return apiClient.post<void>("/Inventory/adjust", request);
  }
};
