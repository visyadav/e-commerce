using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class MenuItem : BaseEntity
{
    public required string Title { get; set; }
    public string? Icon { get; set; }
    public string? Url { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Module { get; set; }

    /// <summary>
    /// Comma-separated list of roles that can see this menu item.
    /// Example: "SuperAdmin,Admin" or "Customer"
    /// </summary>
    public string AllowedRoles { get; set; } = string.Empty;

    // Self-referencing hierarchy
    public Guid? ParentId { get; set; }
    public MenuItem? Parent { get; set; }
    public ICollection<MenuItem> Children { get; set; } = [];

    public List<string> GetRolesList()
    {
        return string.IsNullOrWhiteSpace(AllowedRoles)
            ? []
            : [.. AllowedRoles.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)];
    }
}
