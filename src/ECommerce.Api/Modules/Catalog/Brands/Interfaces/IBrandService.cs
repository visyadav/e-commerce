using ECommerce.Api.Modules.Catalog.Brands.DTOs;
using ECommerce.Shared.Responses;

namespace ECommerce.Api.Modules.Catalog.Brands.Interfaces;

public interface IBrandService
{
    Task<ApiResponse<List<BrandDto>>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ApiResponse<BrandDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ApiResponse<BrandDto>> CreateAsync(CreateBrandRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<BrandDto>> UpdateAsync(Guid id, UpdateBrandRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
