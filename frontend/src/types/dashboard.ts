export interface DashboardSummaryResponse {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  newCustomersCount: number;
  revenueGrowthPercentage: number;
  ordersGrowthPercentage: number;
}

export interface SalesTrendItemResponse {
  periodLabel: string;
  revenue: number;
  ordersCount: number;
}

export interface LowStockAlertResponse {
  productId: string;
  productName: string;
  productSku: string;
  stockQuantity: number;
  lowStockThreshold: number;
}
