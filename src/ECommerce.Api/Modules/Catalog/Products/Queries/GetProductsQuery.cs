namespace ECommerce.Api.Modules.Catalog.Products.Queries;

public record GetProductsQuery(
    Guid? CategoryId = null,
    Guid? BrandId = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    string? SearchTerm = null,
    string? SortBy = null,
    int PageNumber = 1,
    int PageSize = 10);
