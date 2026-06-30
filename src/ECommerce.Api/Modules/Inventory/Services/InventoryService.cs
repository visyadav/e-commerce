using AutoMapper;
using ECommerce.Api.Modules.Inventory.DTOs;
using ECommerce.Api.Modules.Inventory.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Shared.Exceptions;
using ECommerce.Shared.Responses;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ECommerce.Api.Modules.Inventory.Services;

public class InventoryService : IInventoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IEmailService _emailService;
    private readonly ILogger<InventoryService> _logger;

    public InventoryService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IEmailService emailService,
        ILogger<InventoryService> _logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _emailService = emailService;
        this._logger = _logger;
    }

    public async Task<PagedResponse<InventoryStatusDto>> GetStockLevelsAsync(
        string? searchTerm,
        bool? onlyLowStock,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Repository<Product>().Query();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(p => p.Name.Contains(searchTerm) || p.Sku.Contains(searchTerm));
        }

        if (onlyLowStock == true)
        {
            query = query.Where(p => p.StockQuantity <= p.LowStockThreshold);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(p => p.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<InventoryStatusDto>>(items);

        return PagedResponse<InventoryStatusDto>.Create(
            dtos, pageNumber, pageSize, totalCount, "Stock levels retrieved successfully.");
    }

    public async Task<ApiResponse<List<InventoryRecordDto>>> GetProductHistoryAsync(
        Guid productId,
        CancellationToken cancellationToken = default)
    {
        var productExists = await _unitOfWork.Repository<Product>().ExistsAsync(p => p.Id == productId, cancellationToken);
        if (!productExists)
        {
            throw new NotFoundException(nameof(Product), productId);
        }

        var records = await _unitOfWork.Repository<InventoryRecord>()
            .FindAsync(r => r.ProductId == productId, cancellationToken);

        var orderedRecords = records.OrderByDescending(r => r.CreatedAt).ToList();
        var dtos = _mapper.Map<List<InventoryRecordDto>>(orderedRecords);

        return ApiResponse<List<InventoryRecordDto>>.SuccessResponse(dtos, "Inventory history retrieved successfully.");
    }

    public async Task<ApiResponse> RestockAsync(
        RestockRequest request,
        string adminUserId,
        CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Repository<Product>().GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
        {
            throw new NotFoundException(nameof(Product), request.ProductId);
        }

        product.StockQuantity += request.Quantity;
        _unitOfWork.Repository<Product>().Update(product);

        var record = new InventoryRecord
        {
            ProductId = request.ProductId,
            QuantityChange = request.Quantity,
            Reason = request.Reason ?? "Restock",
            ReferenceNumber = null,
            CreatedBy = adminUserId
        };
        await _unitOfWork.Repository<InventoryRecord>().AddAsync(record, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse.SuccessResponse($"Product restocked successfully. New quantity: {product.StockQuantity}");
    }

    public async Task<ApiResponse> AdjustStockAsync(
        AdjustStockRequest request,
        string adminUserId,
        CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Repository<Product>().GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
        {
            throw new NotFoundException(nameof(Product), request.ProductId);
        }

        int newQty = product.StockQuantity + request.QuantityChange;
        if (newQty < 0)
        {
            throw new BadRequestException($"Invalid adjustment. Product stock cannot be negative. Current stock: {product.StockQuantity}, Adjustment: {request.QuantityChange}");
        }

        product.StockQuantity = newQty;
        _unitOfWork.Repository<Product>().Update(product);

        var record = new InventoryRecord
        {
            ProductId = request.ProductId,
            QuantityChange = request.QuantityChange,
            Reason = request.Reason,
            ReferenceNumber = null,
            CreatedBy = adminUserId
        };
        await _unitOfWork.Repository<InventoryRecord>().AddAsync(record, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Check for low stock alert
        if (product.StockQuantity <= product.LowStockThreshold)
        {
            _logger.LogWarning("⚠️ Low stock warning for product {Name} (SKU: {Sku}) after adjustment. Current stock: {Stock}", product.Name, product.Sku, product.StockQuantity);
            try
            {
                await _emailService.SendEmailAsync(
                    "admin@ecommerce.com",
                    $"⚠️ Low Stock Alert: {product.Name}",
                    $"The product '{product.Name}' (SKU: {product.Sku}) has low stock after adjustment. Current quantity: {product.StockQuantity} (Threshold: {product.LowStockThreshold}). Please restock soon.",
                    cancellationToken);
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "Failed to send low stock alert email");
            }
        }

        return ApiResponse.SuccessResponse($"Product stock adjusted successfully. New quantity: {product.StockQuantity}");
    }

    public async Task DeductStockInternalAsync(
        Guid productId,
        int quantity,
        string referenceNumber,
        CancellationToken cancellationToken = default)
    {
        const int maxRetries = 3;

        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                var product = await _unitOfWork.Repository<Product>().GetByIdAsync(productId, cancellationToken);
                if (product == null)
                {
                    throw new NotFoundException(nameof(Product), productId);
                }

                if (product.StockQuantity < quantity)
                {
                    throw new BadRequestException($"Insufficient stock for product {product.Name}. Current stock: {product.StockQuantity}, Requested: {quantity}");
                }

                product.StockQuantity -= quantity;
                _unitOfWork.Repository<Product>().Update(product);

                var record = new InventoryRecord
                {
                    ProductId = productId,
                    QuantityChange = -quantity,
                    Reason = $"Sale (Ref: {referenceNumber})",
                    ReferenceNumber = referenceNumber,
                    CreatedBy = "System"
                };
                await _unitOfWork.Repository<InventoryRecord>().AddAsync(record, cancellationToken);

                await _unitOfWork.SaveChangesAsync(cancellationToken);

                // Check for low stock alert
                if (product.StockQuantity <= product.LowStockThreshold)
                {
                    _logger.LogWarning("⚠️ Low stock warning for product {Name} (SKU: {Sku}). Current stock: {Stock}", product.Name, product.Sku, product.StockQuantity);
                    try
                    {
                        await _emailService.SendEmailAsync(
                            "admin@ecommerce.com",
                            $"⚠️ Low Stock Alert: {product.Name}",
                            $"The product '{product.Name}' (SKU: {product.Sku}) has low stock. Current quantity: {product.StockQuantity} (Threshold: {product.LowStockThreshold}). Please restock soon.",
                            cancellationToken);
                    }
                    catch (Exception emailEx)
                    {
                        _logger.LogError(emailEx, "Failed to send low stock alert email");
                    }
                }

                return; // Success, break retry loop and return
            }
            catch (DbUpdateConcurrencyException)
            {
                if (attempt == maxRetries)
                {
                    throw; // Re-throw concurrency exception if all retries are exhausted
                }

                _logger.LogWarning("Concurrency conflict detected while deducting stock for product {ProductId}. Retry attempt {Attempt} of {Max}", productId, attempt, maxRetries);
                await Task.Delay(100, cancellationToken);
            }
        }
    }
}
