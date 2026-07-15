using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Tag : AuditableEntity
{
    public required string Name { get; set; }
    public required string Slug { get; set; }

    // Navigation Properties
    public ICollection<Product> Products { get; set; } = [];
}
