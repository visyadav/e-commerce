using ECommerce.Domain.Common;
using Microsoft.AspNetCore.Identity;

namespace ECommerce.Domain.Entities;

public class RoleMenuPermission : BaseEntity
{
    public required string RoleId { get; set; }
    public IdentityRole Role { get; set; } = null!;

    public Guid MenuItemId { get; set; }
    public MenuItem MenuItem { get; set; } = null!;

    public bool CanRead { get; set; }
    public bool CanCreate { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanDelete { get; set; }
}
