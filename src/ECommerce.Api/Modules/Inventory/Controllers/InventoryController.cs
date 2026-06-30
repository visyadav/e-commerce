using ECommerce.Api.Common;
using ECommerce.Api.Filters;
using ECommerce.Api.Modules.Inventory.DTOs;
using ECommerce.Api.Modules.Inventory.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.Inventory.Controllers;

public class InventoryController : BaseApiController
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    [HasPermission("Inventory", "Read")]
    [ProducesResponseType(typeof(PagedResponse<InventoryStatusDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStockLevels(
        [FromQuery] string? searchTerm,
        [FromQuery] bool? onlyLowStock,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var response = await _inventoryService.GetStockLevelsAsync(
            searchTerm, onlyLowStock, pageNumber, pageSize, cancellationToken);
        return Ok(response);
    }

    [HttpGet("{productId:guid}/history")]
    [HasPermission("Inventory", "Read")]
    [ProducesResponseType(typeof(ApiResponse<List<InventoryRecordDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProductHistory(Guid productId, CancellationToken cancellationToken)
    {
        var response = await _inventoryService.GetProductHistoryAsync(productId, cancellationToken);
        return Ok(response);
    }

    [HttpPost("restock")]
    [HasPermission("Inventory", "Update")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Restock([FromBody] RestockRequest request, CancellationToken cancellationToken)
    {
        var adminUserId = CurrentUserEmail ?? CurrentUserId ?? "System Admin";
        var response = await _inventoryService.RestockAsync(request, adminUserId, cancellationToken);
        return Ok(response);
    }

    [HttpPost("adjust")]
    [HasPermission("Inventory", "Update")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AdjustStock([FromBody] AdjustStockRequest request, CancellationToken cancellationToken)
    {
        var adminUserId = CurrentUserEmail ?? CurrentUserId ?? "System Admin";
        var response = await _inventoryService.AdjustStockAsync(request, adminUserId, cancellationToken);
        return Ok(response);
    }
}
