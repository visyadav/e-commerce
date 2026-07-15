using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Product : AuditableEntity
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required string Slug { get; set; }
    public required string Sku { get; set; }
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public decimal? CostPrice { get; set; }
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; } = 10;
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }
    public ICollection<ProductImage> Images { get; set; } = [];
    public ICollection<Tag> Tags { get; set; } = [];
    public double Weight { get; set; }
    public string? Dimensions { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Foreign Keys
    public Guid CategoryId { get; set; }
    public Guid? BrandId { get; set; }

    // Navigation Properties
    public Category Category { get; set; } = null!;
    public Brand? Brand { get; set; }
    public ICollection<Review> Reviews { get; set; } = [];
    public ICollection<OrderItem> OrderItems { get; set; } = [];
}
