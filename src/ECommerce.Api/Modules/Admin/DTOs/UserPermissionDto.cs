namespace ECommerce.Api.Modules.Admin.DTOs;

public class UserPermissionResponse
{
    public required string UserId { get; set; }
    public required string UserEmail { get; set; }
    public required string FullName { get; set; }
    public List<UserMenuItemPermissionDto> Permissions { get; set; } = [];
}

public class UserMenuItemPermissionDto
{
    public Guid MenuItemId { get; set; }
    public required string MenuItemTitle { get; set; }
    public string? MenuItemModule { get; set; }
    public bool CanRead { get; set; }
    public bool CanCreate { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanDelete { get; set; }
    public bool IsOverride { get; set; }
}

public class UpdateUserPermissionsRequest
{
    public List<MenuPermissionInput> Permissions { get; set; } = [];
}

public class UserListItemDto
{
    public required string Id { get; set; }
    public required string Email { get; set; }
    public required string FullName { get; set; }
    public List<string> Roles { get; set; } = [];
    public bool IsActive { get; set; }
}
