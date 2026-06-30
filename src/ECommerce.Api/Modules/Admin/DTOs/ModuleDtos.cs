using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.Modules.Admin.DTOs;

public class ModuleDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Url { get; set; }
    public int SortOrder { get; set; }
    public string Module { get; set; } = string.Empty;
    public string? AllowedRoles { get; set; }
    public bool IsActive { get; set; }
    public Guid? ParentId { get; set; }
    public List<ModuleDto> Children { get; set; } = [];
}

public class CreateModuleRequest
{
    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Icon { get; set; }

    [MaxLength(256)]
    public string? Url { get; set; }

    public int SortOrder { get; set; }

    [Required]
    [MaxLength(100)]
    public string Module { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? AllowedRoles { get; set; }

    public Guid? ParentId { get; set; }
}

public class UpdateModuleRequest
{
    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Icon { get; set; }

    [MaxLength(256)]
    public string? Url { get; set; }

    public int SortOrder { get; set; }

    [Required]
    [MaxLength(100)]
    public string Module { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? AllowedRoles { get; set; }

    public Guid? ParentId { get; set; }
}
