using ECommerce.Api.Modules.Cart.DTOs;
using ECommerce.Shared.Responses;

namespace ECommerce.Api.Modules.Cart.Interfaces;

public interface ICartService
{
    Task<ApiResponse<CartDto>> GetCartAsync(string userId, CancellationToken cancellationToken = default);
    Task<ApiResponse<CartDto>> AddToCartAsync(string userId, AddToCartRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<CartDto>> UpdateQuantityAsync(string userId, Guid cartItemId, int quantity, CancellationToken cancellationToken = default);
    Task<ApiResponse<CartDto>> RemoveFromCartAsync(string userId, Guid cartItemId, CancellationToken cancellationToken = default);
    Task<ApiResponse> ClearCartAsync(string userId, CancellationToken cancellationToken = default);
}
