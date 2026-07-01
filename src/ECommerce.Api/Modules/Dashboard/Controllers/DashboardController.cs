using ECommerce.Api.Common;
using ECommerce.Api.Filters;
using ECommerce.Api.Modules.Dashboard.DTOs;
using ECommerce.Api.Modules.Dashboard.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.Dashboard.Controllers;

public class DashboardController : BaseApiController
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    [HasPermission("Dashboard", "Read")]
    [ProducesResponseType(typeof(ApiResponse<DashboardSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetSummary(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        CancellationToken cancellationToken)
    {
        var response = await _dashboardService.GetSummaryAsync(startDate, endDate, cancellationToken);
        return Ok(response);
    }

    [HttpGet("trends")]
    [HasPermission("Dashboard", "Read")]
    [ProducesResponseType(typeof(ApiResponse<List<SalesTrendItemDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetSalesTrend(
        [FromQuery] string period = "daily",
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var response = await _dashboardService.GetSalesTrendAsync(period, startDate, endDate, cancellationToken);
        return Ok(response);
    }

    [HttpGet("low-stock-alerts")]
    [HasPermission("Dashboard", "Read")]
    [ProducesResponseType(typeof(ApiResponse<List<LowStockAlertDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetLowStockAlerts(CancellationToken cancellationToken)
    {
        var response = await _dashboardService.GetLowStockAlertsAsync(cancellationToken);
        return Ok(response);
    }
}
