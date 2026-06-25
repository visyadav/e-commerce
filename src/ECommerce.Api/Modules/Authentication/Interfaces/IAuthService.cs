using ECommerce.Api.Modules.Authentication.DTOs;
using ECommerce.Shared.Responses;

namespace ECommerce.Api.Modules.Authentication.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<AuthResponse>> RefreshTokenAsync(string accessToken, string refreshToken, CancellationToken cancellationToken = default);
}
