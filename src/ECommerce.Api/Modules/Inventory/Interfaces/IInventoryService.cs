using ECommerce.Api.Modules.Inventory.DTOs;
using ECommerce.Shared.Responses;

namespace ECommerce.Api.Modules.Inventory.Interfaces;

public interface IInventoryService
{
    Task<PagedResponse<InventoryStatusDto>> GetStockLevelsAsync(
        string? searchTerm, 
        bool? onlyLowStock, 
        int pageNumber, 
        int pageSize, 
        CancellationToken cancellationToken = default);

    Task<ApiResponse<List<InventoryRecordDto>>> GetProductHistoryAsync(
        Guid productId, 
        CancellationToken cancellationToken = default);

    Task<ApiResponse> RestockAsync(
        RestockRequest request, 
        string adminUserId, 
        CancellationToken cancellationToken = default);

    Task<ApiResponse> AdjustStockAsync(
        AdjustStockRequest request, 
        string adminUserId, 
        CancellationToken cancellationToken = default);

    Task DeductStockInternalAsync(
        Guid productId, 
        int quantity, 
        string referenceNumber, 
        CancellationToken cancellationToken = default);
}
