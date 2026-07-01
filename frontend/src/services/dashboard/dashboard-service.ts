import { apiClient } from "../api-client";
import type { DashboardSummaryResponse, SalesTrendItemResponse, LowStockAlertResponse } from "@/src/types";

export const dashboardService = {
  getSummary: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return apiClient.get<DashboardSummaryResponse>(`/dashboard/summary?${params.toString()}`);
  },

  getTrends: (period = "daily", startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    params.append("period", period);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return apiClient.get<SalesTrendItemResponse[]>(`/dashboard/trends?${params.toString()}`);
  },

  getLowStockAlerts: () =>
    apiClient.get<LowStockAlertResponse[]>("/dashboard/low-stock-alerts"),
};
