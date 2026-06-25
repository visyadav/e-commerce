using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Coupon : AuditableEntity
{
    public required string Code { get; set; }
    public string? Description { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal MinOrderAmount { get; set; }
    public int MaxUsageCount { get; set; }
    public int CurrentUsageCount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;

    public bool IsValid => IsActive
        && DateTime.UtcNow >= StartDate
        && DateTime.UtcNow <= EndDate
        && CurrentUsageCount < MaxUsageCount;
}
