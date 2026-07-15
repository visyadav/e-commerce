using Microsoft.AspNetCore.Http;

namespace ECommerce.Api.Modules.Catalog.Products.DTOs;

public class CreateProductRequest
{
    public required string Name { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public required string Sku { get; set; }
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public decimal? CostPrice { get; set; }
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; } = 10;
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }
    public List<IFormFile>? ImageFiles { get; set; }
    public List<string>? Tags { get; set; }
    public double Weight { get; set; }
    public string? Dimensions { get; set; }
    public Guid CategoryId { get; set; }
    public Guid? BrandId { get; set; }
}
