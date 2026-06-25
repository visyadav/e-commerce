using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class UserMenuPermission : BaseEntity
{
    public required string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public Guid MenuItemId { get; set; }
    public MenuItem MenuItem { get; set; } = null!;

    public bool CanRead { get; set; }
    public bool CanCreate { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanDelete { get; set; }
}
