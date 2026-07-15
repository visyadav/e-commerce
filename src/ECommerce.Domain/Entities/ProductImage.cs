using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class ProductImage : AuditableEntity
{
    public Guid ProductId { get; set; }
    public required string ImageUrl { get; set; }
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }

    // Navigation
    public Product Product { get; set; } = null!;
}
