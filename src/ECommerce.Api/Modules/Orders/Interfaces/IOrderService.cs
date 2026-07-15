using ECommerce.Api.Modules.Orders.DTOs;
using ECommerce.Shared.Responses;

namespace ECommerce.Api.Modules.Orders.Interfaces;

public interface IOrderService
{
    Task<ApiResponse<OrderDto>> CheckoutAsync(string userId, CreateOrderRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<OrderDto>> GetOrderByIdAsync(Guid orderId, string userId, CancellationToken cancellationToken = default);
    Task<PagedResponse<OrderDto>> GetMyOrdersAsync(string userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<PagedResponse<OrderDto>> GetAllOrdersAsync(string? searchTerm, string? status, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<ApiResponse> UpdateOrderStatusAsync(Guid orderId, ECommerce.Domain.Enums.OrderStatus status, CancellationToken cancellationToken = default);
}
