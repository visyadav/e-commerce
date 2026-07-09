using ECommerce.Api.Modules.Catalog.Categories.DTOs;
using ECommerce.Shared.Responses;

namespace ECommerce.Api.Modules.Catalog.Categories.Interfaces;

public interface ICategoryService
{
    Task<ApiResponse<List<CategoryDto>>> GetLookupAsync(CancellationToken cancellationToken = default);
    Task<PagedResponse<CategoryDto>> GetPaginatedAsync(int pageNumber = 1, int pageSize = 10, string? searchTerm = null, CancellationToken cancellationToken = default);
    Task<ApiResponse<CategoryDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ApiResponse<CategoryDto>> CreateAsync(CreateCategoryRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<CategoryDto>> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
