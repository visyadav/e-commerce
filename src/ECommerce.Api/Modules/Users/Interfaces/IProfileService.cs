using ECommerce.Api.Modules.Users.DTOs;
using ECommerce.Shared.Responses;

namespace ECommerce.Api.Modules.Users.Interfaces;

public interface IProfileService
{
    Task<ApiResponse<UserProfileDto>> GetProfileAsync(string userId);
    Task<ApiResponse<UserProfileDto>> UpdateProfileAsync(string userId, UpdateProfileRequest request);
    Task<ApiResponse<List<UserAddressDto>>> GetAddressesAsync(string userId);
    Task<ApiResponse<UserAddressDto>> AddAddressAsync(string userId, CreateUserAddressRequest request);
    Task<ApiResponse<UserAddressDto>> UpdateAddressAsync(string userId, Guid addressId, UpdateUserAddressRequest request);
    Task<ApiResponse> DeleteAddressAsync(string userId, Guid addressId);
    Task<ApiResponse> UpdateThemeColorAsync(string userId, string themeColor);
}
