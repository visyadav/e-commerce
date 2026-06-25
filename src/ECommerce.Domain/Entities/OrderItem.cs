using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class OrderItem : BaseEntity
{
    public required string ProductName { get; set; }
    public required string ProductSku { get; set; }
    public string? ProductImageUrl { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }

    // Foreign Keys
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }

    // Navigation
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
