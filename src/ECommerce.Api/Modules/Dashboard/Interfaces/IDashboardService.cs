using ECommerce.Api.Modules.Dashboard.DTOs;
using ECommerce.Shared.Responses;

namespace ECommerce.Api.Modules.Dashboard.Interfaces;

public interface IDashboardService
{
    Task<ApiResponse<DashboardSummaryDto>> GetSummaryAsync(DateTime? startDate, DateTime? endDate, CancellationToken cancellationToken = default);
    Task<ApiResponse<List<SalesTrendItemDto>>> GetSalesTrendAsync(string periodType, DateTime? startDate, DateTime? endDate, CancellationToken cancellationToken = default);
    Task<ApiResponse<List<LowStockAlertDto>>> GetLowStockAlertsAsync(CancellationToken cancellationToken = default);
}
