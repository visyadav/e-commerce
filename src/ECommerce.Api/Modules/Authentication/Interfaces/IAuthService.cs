using ECommerce.Api.Modules.Authentication.DTOs;
using ECommerce.Shared.Responses;

namespace ECommerce.Api.Modules.Authentication.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<AuthResponse>> RefreshTokenAsync(string accessToken, string refreshToken, CancellationToken cancellationToken = default);

    // Customer User Specific Operations
    Task<ApiResponse<AuthResponse>> RegisterCustomerAsync(CustomerRegisterRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<AuthResponse>> LoginCustomerAsync(CustomerLoginRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<AuthResponse>> LoginWithMobileOtpAsync(MobileOtpLoginRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<AuthResponse>> ExternalLoginAsync(ExternalLoginRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<AuthResponse>> GetMeAsync(string userId, CancellationToken cancellationToken = default);
    Task<ApiResponse<AuthResponse>> UpdateCustomerNameAsync(string userId, UpdateCustomerNameRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse> ChangePasswordAsync(string userId, ChangePasswordRequest request, CancellationToken cancellationToken = default);
}
