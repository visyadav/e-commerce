using ECommerce.Api.Modules.Catalog.Tags.DTOs;

namespace ECommerce.Api.Modules.Catalog.Products.DTOs;

public class ProductDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required string Slug { get; set; }
    public required string Sku { get; set; }
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public decimal? CostPrice { get; set; }
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; }
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public List<string> ImageUrls { get; set; } = [];
    public List<TagDto> Tags { get; set; } = [];
    public double Weight { get; set; }
    public string? Dimensions { get; set; }
    
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    
    public Guid? BrandId { get; set; }
    public string? BrandName { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
