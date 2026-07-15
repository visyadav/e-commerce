export interface InventoryStatusDto {
  productId: string;
  productName: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
}

export interface InventoryRecordDto {
  id: string;
  quantityChange: number;
  reason: string;
  referenceNumber?: string;
  createdAt: string;
}

export interface RestockRequest {
  productId: string;
  quantity: number;
  reason?: string;
}

export interface AdjustStockRequest {
  productId: string;
  quantityChange: number;
  reason: string;
}
