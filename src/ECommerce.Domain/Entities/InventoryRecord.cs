using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class InventoryRecord : AuditableEntity
{
    public int QuantityChange { get; set; }
    public required string Reason { get; set; }
    public string? ReferenceNumber { get; set; }

    // Foreign Key
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
}
