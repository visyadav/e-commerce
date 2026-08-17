using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class CouponUsageLog : AuditableEntity
{
    public Guid CouponId { get; set; }
    public Coupon Coupon { get; set; } = null!;

    public required string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public Guid? OrderId { get; set; }
    public decimal DiscountAmount { get; set; }
    public DateTime UsedAt { get; set; } = DateTime.UtcNow;
}
