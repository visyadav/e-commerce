using ECommerce.Api.Modules.Users.DTOs;
using ECommerce.Shared.Responses;

namespace ECommerce.Api.Modules.Users.Interfaces;

public interface IAdminUserService
{
    Task<PagedResponse<AdminUserDto>> GetAllUsersAsync(string? searchTerm, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<ApiResponse<AdminUserDetailsDto>> GetUserByIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<ApiResponse> ToggleUserStatusAsync(string userId, bool isActive, string currentUserId, CancellationToken cancellationToken = default);
    Task<ApiResponse> UpdateUserAsync(string userId, UpdateAdminUserRequest request, string currentUserId, CancellationToken cancellationToken = default);
}
