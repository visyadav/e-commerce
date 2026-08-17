namespace ECommerce.Api.Modules.ClientApp.DTOs;

public class ClientCategoryDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
}

public class ClientProductDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string Slug { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public string Unit { get; set; } = "500 ml";
    public string ImageUrl { get; set; } = string.Empty;
    public string? Badge { get; set; }
    public string? DiscountPercentage { get; set; }
    public double Rating { get; set; } = 4.8;
    public bool IsVeg { get; set; } = true;
    public bool IsDailyEssential { get; set; } = true;
    public int StockQuantity { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;
}

public class ClientProductQueryParameters
{
    public string? CategorySlug { get; set; }
    public Guid? CategoryId { get; set; }
    public string? Search { get; set; }
    public bool? IsDailyEssential { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}
