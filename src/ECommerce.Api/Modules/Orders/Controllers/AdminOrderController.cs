using ECommerce.Api.Common;
using ECommerce.Api.Filters;
using ECommerce.Api.Modules.Orders.DTOs;
using ECommerce.Api.Modules.Orders.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.Orders.Controllers;

public class AdminOrderController : BaseApiController
{
    private readonly IOrderService _orderService;

    public AdminOrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    [HasPermission("Orders", "Read")]
    [ProducesResponseType(typeof(PagedResponse<OrderDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllOrders(
        [FromQuery] string? searchTerm,
        [FromQuery] string? status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var response = await _orderService.GetAllOrdersAsync(searchTerm, status, pageNumber, pageSize, cancellationToken);
        return Ok(response);
    }

    [HttpPost("{id:guid}/status")]
    [HasPermission("Orders", "Update")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusRequest request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<ECommerce.Domain.Enums.OrderStatus>(request.Status, true, out var parsedStatus))
        {
            return BadRequest(ApiResponse.FailureResponse($"Invalid status '{request.Status}'. Valid status values are: Pending, Processing, OutForDelivery, Delivered, Cancelled."));
        }

        var response = await _orderService.UpdateOrderStatusAsync(id, parsedStatus, cancellationToken);
        return Ok(response);
    }
}
