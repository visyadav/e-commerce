using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.Modules.Inventory.DTOs;

public class InventoryStatusDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; }
    public bool IsLowStock => StockQuantity <= LowStockThreshold;
}

public class InventoryRecordDto
{
    public Guid Id { get; set; }
    public int QuantityChange { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? ReferenceNumber { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class RestockRequest
{
    [Required]
    public Guid ProductId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Restock quantity must be greater than 0.")]
    public int Quantity { get; set; }

    [MaxLength(256)]
    public string? Reason { get; set; }
}

public class AdjustStockRequest
{
    [Required]
    public Guid ProductId { get; set; }

    [Required]
    public int QuantityChange { get; set; }

    [Required]
    [MaxLength(256)]
    public string Reason { get; set; } = string.Empty;
}
