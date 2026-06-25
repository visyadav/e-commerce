namespace ECommerce.Api.Modules.Admin.DTOs;

public class RolePermissionResponse
{
    public required string RoleId { get; set; }
    public required string RoleName { get; set; }
    public List<RoleMenuItemPermissionDto> Permissions { get; set; } = [];
}

public class RoleMenuItemPermissionDto
{
    public Guid MenuItemId { get; set; }
    public required string MenuItemTitle { get; set; }
    public string? MenuItemModule { get; set; }
    public bool CanRead { get; set; }
    public bool CanCreate { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanDelete { get; set; }
}

public class UpdateRolePermissionsRequest
{
    public List<MenuPermissionInput> Permissions { get; set; } = [];
}

public class MenuPermissionInput
{
    public Guid MenuItemId { get; set; }
    public bool CanRead { get; set; }
    public bool CanCreate { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanDelete { get; set; }
}
