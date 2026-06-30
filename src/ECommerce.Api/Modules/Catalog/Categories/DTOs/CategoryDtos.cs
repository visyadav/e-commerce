using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.Modules.Catalog.Categories.DTOs;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public Guid? ParentCategoryId { get; set; }
    public string? ParentCategoryName { get; set; }
}

public class CreateCategoryRequest
{
    [Required]
    [MaxLength(256)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public int SortOrder { get; set; }

    public Guid? ParentCategoryId { get; set; }
}

public class UpdateCategoryRequest
{
    [Required]
    [MaxLength(256)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public int SortOrder { get; set; }

    public Guid? ParentCategoryId { get; set; }
}
