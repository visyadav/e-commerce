using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Category : AuditableEntity
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required string Slug { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Self-referencing for sub-categories
    public Guid? ParentCategoryId { get; set; }
    public Category? ParentCategory { get; set; }
    public ICollection<Category> SubCategories { get; set; } = [];

    // Navigation
    public ICollection<Product> Products { get; set; } = [];
}
