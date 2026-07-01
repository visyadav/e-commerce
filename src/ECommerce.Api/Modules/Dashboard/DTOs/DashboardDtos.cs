namespace ECommerce.Api.Modules.Dashboard.DTOs;

public class DashboardSummaryDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public decimal AverageOrderValue { get; set; }
    public int NewCustomersCount { get; set; }
    public decimal RevenueGrowthPercentage { get; set; }
    public decimal OrdersGrowthPercentage { get; set; }
}

public class SalesTrendItemDto
{
    public string PeriodLabel { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int OrdersCount { get; set; }
}

public class LowStockAlertDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSku { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; }
}
