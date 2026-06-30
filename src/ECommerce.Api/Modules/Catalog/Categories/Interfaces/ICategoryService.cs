using ECommerce.Api.Modules.Catalog.Categories.DTOs;
using ECommerce.Shared.Responses;

namespace ECommerce.Api.Modules.Catalog.Categories.Interfaces;

public interface ICategoryService
{
    Task<ApiResponse<List<CategoryDto>>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ApiResponse<CategoryDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ApiResponse<CategoryDto>> CreateAsync(CreateCategoryRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<CategoryDto>> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
