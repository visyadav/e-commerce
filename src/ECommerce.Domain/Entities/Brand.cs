using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Brand : AuditableEntity
{
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Website { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;

    // Navigation
    public ICollection<Product> Products { get; set; } = [];
}
