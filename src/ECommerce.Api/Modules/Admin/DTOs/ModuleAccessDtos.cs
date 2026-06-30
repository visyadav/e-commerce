using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.Modules.Admin.DTOs;

public class ModuleAccessRequest
{
    public List<ModuleRolePermissionInput> RolePermissions { get; set; } = [];
    public List<ModuleUserPermissionInput> UserPermissions { get; set; } = [];
}

public class ModuleRolePermissionInput
{
    [Required]
    public string RoleId { get; set; } = string.Empty;

    public bool CanRead { get; set; }
    public bool CanCreate { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanDelete { get; set; }
}

public class ModuleUserPermissionInput
{
    [Required]
    public string UserId { get; set; } = string.Empty;

    public bool CanRead { get; set; }
    public bool CanCreate { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanDelete { get; set; }
}
