using Microsoft.AspNetCore.Authorization;

namespace ECommerce.Infrastructure.Identity;

public class PermissionRequirement : IAuthorizationRequirement
{
    public string Module { get; }
    public string Action { get; }

    public PermissionRequirement(string module, string action)
    {
        Module = module;
        Action = action;
    }
}
