using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence.Context;
using ECommerce.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ECommerce.Infrastructure.Identity;

public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly ApplicationDbContext _dbContext;

    public PermissionAuthorizationHandler(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        if (context.User == null!)
            return;

        // Load the MenuItem to check dynamic status
        var menuItem = await _dbContext.MenuItems
            .FirstOrDefaultAsync(m => m.Module == requirement.Module);

        if (menuItem != null)
        {
            // 1. Globally Inactive Check: If the module is deactivated, deny access
            if (!menuItem.IsActive)
            {
                return;
            }

            // 2. Allowed Roles Limit: If module specifies allowed roles, check intersection
            if (!string.IsNullOrWhiteSpace(menuItem.AllowedRoles))
            {
                var allowedRolesList = menuItem.AllowedRoles.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                var userRolesList = context.User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
                
                if (!context.User.IsInRole(AppConstants.Roles.SuperAdmin) && !userRolesList.Any(r => allowedRolesList.Contains(r)))
                {
                    return;
                }
            }
        }

        // 3. SuperAdmin Bypass: SuperAdmin has unrestricted access to everything
        if (context.User.IsInRole(AppConstants.Roles.SuperAdmin))
        {
            context.Succeed(requirement);
            return;
        }

        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return;

        // 2. User-Specific Override: Check if there is a direct user-level permission override
        var userPermission = await _dbContext.UserMenuPermissions
            .Include(up => up.MenuItem)
            .FirstOrDefaultAsync(up => up.UserId == userId && up.MenuItem.Module == requirement.Module);

        if (userPermission != null)
        {
            // If a user-specific override exists, it takes absolute precedence (Grant or Deny)
            var isGranted = requirement.Action.ToUpperInvariant() switch
            {
                "READ" => userPermission.CanRead,
                "CREATE" => userPermission.CanCreate,
                "UPDATE" => userPermission.CanUpdate,
                "DELETE" => userPermission.CanDelete,
                _ => false
            };

            if (isGranted)
            {
                context.Succeed(requirement);
            }
            return; // Terminate early: role permissions are ignored if a user override exists
        }

        // 3. Role-Based Permissions: Check if any of the user's active roles grant this permission
        var userRoles = context.User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
        if (userRoles.Count == 0)
            return;

        var isRoleGranted = await _dbContext.RoleMenuPermissions
            .Include(rp => rp.Role)
            .Include(rp => rp.MenuItem)
            .AnyAsync(rp => 
                userRoles.Contains(rp.Role.Name!) && 
                rp.MenuItem.Module == requirement.Module &&
                (requirement.Action.ToUpperInvariant() == "READ" && rp.CanRead ||
                 requirement.Action.ToUpperInvariant() == "CREATE" && rp.CanCreate ||
                 requirement.Action.ToUpperInvariant() == "UPDATE" && rp.CanUpdate ||
                 requirement.Action.ToUpperInvariant() == "DELETE" && rp.CanDelete));

        if (isRoleGranted)
        {
            context.Succeed(requirement);
        }
    }
}
