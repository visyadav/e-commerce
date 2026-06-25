using ECommerce.Domain.Common;
using ECommerce.Domain.Enums;
using ECommerce.Domain.ValueObjects;

namespace ECommerce.Domain.Entities;

public class Order : AuditableEntity
{
    public required string OrderNumber { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal ShippingAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }

    // Addresses stored as value objects serialized to JSON
    public Address? ShippingAddress { get; set; }
    public Address? BillingAddress { get; set; }

    // Coupon
    public string? CouponCode { get; set; }
    public Guid? CouponId { get; set; }

    // Foreign Key
    public required string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    // Navigation
    public ICollection<OrderItem> Items { get; set; } = [];
    public Payment? Payment { get; set; }
}
