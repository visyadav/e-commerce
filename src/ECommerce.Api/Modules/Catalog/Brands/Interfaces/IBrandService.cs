using ECommerce.Api.Modules.Catalog.Brands.DTOs;
using ECommerce.Shared.Responses;

namespace ECommerce.Api.Modules.Catalog.Brands.Interfaces;

public interface IBrandService
{
    Task<ApiResponse<List<BrandDto>>> GetLookupAsync(CancellationToken cancellationToken = default);
    Task<PagedResponse<BrandDto>> GetPaginatedAsync(int pageNumber = 1, int pageSize = 10, string? searchTerm = null, CancellationToken cancellationToken = default);
    Task<ApiResponse<BrandDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ApiResponse<BrandDto>> CreateAsync(CreateBrandRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<BrandDto>> UpdateAsync(Guid id, UpdateBrandRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
