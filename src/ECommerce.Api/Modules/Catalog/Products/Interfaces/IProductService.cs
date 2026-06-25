using ECommerce.Api.Modules.Catalog.Products.DTOs;
using ECommerce.Shared.Responses;

namespace ECommerce.Api.Modules.Catalog.Products.Interfaces;

public interface IProductService
{
    Task<ApiResponse<ProductDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PagedResponse<ProductDto>> GetPaginatedAsync(
        Guid? categoryId = null,
        Guid? brandId = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        string? searchTerm = null,
        string? sortBy = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default);
    Task<ApiResponse<ProductDto>> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<ProductDto>> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
