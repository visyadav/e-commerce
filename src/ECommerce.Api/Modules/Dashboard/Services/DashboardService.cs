using ECommerce.Api.Modules.Dashboard.DTOs;
using ECommerce.Api.Modules.Dashboard.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Modules.Dashboard.Services;

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;

    public DashboardService(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    public async Task<ApiResponse<DashboardSummaryDto>> GetSummaryAsync(DateTime? startDate, DateTime? endDate, CancellationToken cancellationToken = default)
    {
        var end = endDate ?? DateTime.UtcNow;
        var start = startDate ?? end.AddDays(-30);

        var duration = end - start;
        var prevEnd = start;
        var prevStart = prevEnd - duration;

        // Current period orders
        var currentOrders = await _unitOfWork.Repository<Order>().Query()
            .Where(o => o.CreatedAt >= start && o.CreatedAt <= end && o.Status != OrderStatus.Cancelled)
            .ToListAsync(cancellationToken);

        // Previous period orders
        var previousOrders = await _unitOfWork.Repository<Order>().Query()
            .Where(o => o.CreatedAt >= prevStart && o.CreatedAt <= prevEnd && o.Status != OrderStatus.Cancelled)
            .ToListAsync(cancellationToken);

        // Metrics calculation
        var totalRevenue = currentOrders.Sum(o => o.TotalAmount);
        var totalOrders = currentOrders.Count;
        var averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0m;

        var prevRevenue = previousOrders.Sum(o => o.TotalAmount);
        var prevOrders = previousOrders.Count;

        // Growth calculations
        var revenueGrowth = prevRevenue > 0 
            ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 
            : (totalRevenue > 0 ? 100m : 0m);

        var ordersGrowth = prevOrders > 0 
            ? ((decimal)(totalOrders - prevOrders) / prevOrders) * 100 
            : (totalOrders > 0 ? 100m : 0m);

        // New customers count (overall user sign-ups in current period)
        var newCustomersCount = await _userManager.Users
            .Where(u => u.CreatedAt >= start && u.CreatedAt <= end)
            .CountAsync(cancellationToken);

        var summary = new DashboardSummaryDto
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            AverageOrderValue = averageOrderValue,
            NewCustomersCount = newCustomersCount,
            RevenueGrowthPercentage = Math.Round(revenueGrowth, 2),
            OrdersGrowthPercentage = Math.Round(ordersGrowth, 2)
        };

        return ApiResponse<DashboardSummaryDto>.SuccessResponse(summary, "Dashboard summary retrieved successfully.");
    }

    public async Task<ApiResponse<List<SalesTrendItemDto>>> GetSalesTrendAsync(string periodType, DateTime? startDate, DateTime? endDate, CancellationToken cancellationToken = default)
    {
        var end = endDate ?? DateTime.UtcNow;
        var start = startDate ?? end.AddDays(-30);

        var orders = await _unitOfWork.Repository<Order>().Query()
            .Where(o => o.CreatedAt >= start && o.CreatedAt <= end && o.Status != OrderStatus.Cancelled)
            .ToListAsync(cancellationToken);

        IEnumerable<SalesTrendItemDto> trendData;

        if (string.Equals(periodType, "monthly", StringComparison.OrdinalIgnoreCase))
        {
            trendData = orders
                .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
                .Select(g => new SalesTrendItemDto
                {
                    PeriodLabel = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Revenue = g.Sum(o => o.TotalAmount),
                    OrdersCount = g.Count()
                })
                .OrderBy(t => t.PeriodLabel);
        }
        else if (string.Equals(periodType, "weekly", StringComparison.OrdinalIgnoreCase))
        {
            trendData = orders
                .GroupBy(o => {
                    int diff = (7 + (o.CreatedAt.Date.DayOfWeek - DayOfWeek.Monday)) % 7;
                    return o.CreatedAt.Date.AddDays(-1 * diff);
                })
                .Select(g => new SalesTrendItemDto
                {
                    PeriodLabel = g.Key.ToString("yyyy-MM-dd"),
                    Revenue = g.Sum(o => o.TotalAmount),
                    OrdersCount = g.Count()
                })
                .OrderBy(t => t.PeriodLabel);
        }
        else // default: daily
        {
            trendData = orders
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new SalesTrendItemDto
                {
                    PeriodLabel = g.Key.ToString("yyyy-MM-dd"),
                    Revenue = g.Sum(o => o.TotalAmount),
                    OrdersCount = g.Count()
                })
                .OrderBy(t => t.PeriodLabel);
        }

        return ApiResponse<List<SalesTrendItemDto>>.SuccessResponse(trendData.ToList(), "Sales trend data retrieved successfully.");
    }

    public async Task<ApiResponse<List<LowStockAlertDto>>> GetLowStockAlertsAsync(CancellationToken cancellationToken = default)
    {
        var lowStockProducts = await _unitOfWork.Repository<Product>().Query()
            .Where(p => p.StockQuantity <= p.LowStockThreshold)
            .ToListAsync(cancellationToken);

        var alerts = lowStockProducts.Select(p => new LowStockAlertDto
        {
            ProductId = p.Id,
            ProductName = p.Name,
            ProductSku = p.Sku,
            StockQuantity = p.StockQuantity,
            LowStockThreshold = p.LowStockThreshold
        }).ToList();

        return ApiResponse<List<LowStockAlertDto>>.SuccessResponse(alerts, "Low stock board alerts retrieved successfully.");
    }
}
