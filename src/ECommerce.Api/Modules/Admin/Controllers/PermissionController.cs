using ECommerce.Api.Common;
using ECommerce.Api.Modules.Admin.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Shared.Constants;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Modules.Admin.Controllers;

[Authorize(Roles = AppConstants.Roles.SuperAdmin)]
public class PermissionController : BaseApiController
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUnitOfWork _unitOfWork;

    public PermissionController(
        RoleManager<IdentityRole> roleManager,
        UserManager<ApplicationUser> userManager,
        IUnitOfWork unitOfWork)
    {
        _roleManager = roleManager;
        _userManager = userManager;
        _unitOfWork = unitOfWork;
    }

    [HttpGet("roles")]
    [ProducesResponseType(typeof(ApiResponse<List<IdentityRole>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _roleManager.Roles.ToListAsync();
        return Ok(ApiResponse<List<IdentityRole>>.SuccessResponse(roles, "Roles retrieved successfully."));
    }

    [HttpGet("role/{roleId}")]
    [ProducesResponseType(typeof(ApiResponse<RolePermissionResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRolePermissions(string roleId)
    {
        var role = await _roleManager.FindByIdAsync(roleId);
        if (role == null)
        {
            return NotFound(ApiResponse.FailureResponse("Role not found."));
        }

        // Fetch all active menu items
        var menuItems = await _unitOfWork.Repository<MenuItem>().Query()
            .Where(m => m.IsActive)
            .OrderBy(m => m.SortOrder)
            .ToListAsync();

        // Fetch permissions configured for this role
        var rolePermissions = await _unitOfWork.Repository<RoleMenuPermission>().Query()
            .Where(rp => rp.RoleId == roleId)
            .ToListAsync();

        var permissionsList = menuItems.Select(item =>
        {
            var perm = rolePermissions.FirstOrDefault(rp => rp.MenuItemId == item.Id);
            return new RoleMenuItemPermissionDto
            {
                MenuItemId = item.Id,
                MenuItemTitle = item.Title,
                MenuItemModule = item.Module,
                CanRead = perm?.CanRead ?? false,
                CanCreate = perm?.CanCreate ?? false,
                CanUpdate = perm?.CanUpdate ?? false,
                CanDelete = perm?.CanDelete ?? false
            };
        }).ToList();

        var response = new RolePermissionResponse
        {
            RoleId = role.Id,
            RoleName = role.Name ?? string.Empty,
            Permissions = permissionsList
        };

        return Ok(ApiResponse<RolePermissionResponse>.SuccessResponse(response, "Role permissions retrieved successfully."));
    }

    [HttpPut("role/{roleId}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateRolePermissions(string roleId, [FromBody] UpdateRolePermissionsRequest request)
    {
        var role = await _roleManager.FindByIdAsync(roleId);
        if (role == null)
        {
            return NotFound(ApiResponse.FailureResponse("Role not found."));
        }

        var repo = _unitOfWork.Repository<RoleMenuPermission>();

        // Fetch existing permissions for this role
        var existingPerms = await repo.FindAsync(rp => rp.RoleId == roleId);

        // Delete all existing permissions for this role to perform a clean rewrite
        repo.RemoveRange(existingPerms);

        // Add new permissions
        foreach (var p in request.Permissions)
        {
            // Only save a record if at least one CRUD operation is permitted (keeps database slim)
            if (p.CanRead || p.CanCreate || p.CanUpdate || p.CanDelete)
            {
                var newPerm = new RoleMenuPermission
                {
                    RoleId = roleId,
                    MenuItemId = p.MenuItemId,
                    CanRead = p.CanRead,
                    CanCreate = p.CanCreate,
                    CanUpdate = p.CanUpdate,
                    CanDelete = p.CanDelete,
                    Role = role
                };
                await repo.AddAsync(newPerm);
            }
        }

        await _unitOfWork.SaveChangesAsync();
        return Ok(ApiResponse.SuccessResponse("Role permissions updated successfully."));
    }

    [HttpGet("users")]
    [ProducesResponseType(typeof(ApiResponse<List<UserListItemDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userManager.Users.ToListAsync();
        var userList = new List<UserListItemDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            userList.Add(new UserListItemDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FullName = user.FullName,
                Roles = [.. roles],
                IsActive = user.IsActive
            });
        }

        return Ok(ApiResponse<List<UserListItemDto>>.SuccessResponse(userList, "Users retrieved successfully."));
    }

    [HttpGet("user/{userId}")]
    [ProducesResponseType(typeof(ApiResponse<UserPermissionResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserPermissions(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound(ApiResponse.FailureResponse("User not found."));
        }

        var userRoles = await _userManager.GetRolesAsync(user);

        // Fetch all active menu items
        var menuItems = await _unitOfWork.Repository<MenuItem>().Query()
            .Where(m => m.IsActive)
            .OrderBy(m => m.SortOrder)
            .ToListAsync();

        // Fetch role permissions for all roles this user belongs to
        var rolePermissions = await _unitOfWork.Repository<RoleMenuPermission>().Query()
            .Include(rp => rp.Role)
            .Where(rp => userRoles.Contains(rp.Role.Name!))
            .ToListAsync();

        // Fetch user-specific overrides
        var userOverrides = await _unitOfWork.Repository<UserMenuPermission>().Query()
            .Where(up => up.UserId == userId)
            .ToListAsync();

        var permissionsList = menuItems.Select(item =>
        {
            // Check for user-specific override first
            var userOverride = userOverrides.FirstOrDefault(up => up.MenuItemId == item.Id);
            if (userOverride != null)
            {
                return new UserMenuItemPermissionDto
                {
                    MenuItemId = item.Id,
                    MenuItemTitle = item.Title,
                    MenuItemModule = item.Module,
                    CanRead = userOverride.CanRead,
                    CanCreate = userOverride.CanCreate,
                    CanUpdate = userOverride.CanUpdate,
                    CanDelete = userOverride.CanDelete,
                    IsOverride = true // Flag indicating this is an explicit user override
                };
            }

            // Otherwise, aggregate permissions across all their active roles (Union/Grant model)
            var associatedRolePerms = rolePermissions.Where(rp => rp.MenuItemId == item.Id).ToList();
            return new UserMenuItemPermissionDto
            {
                MenuItemId = item.Id,
                MenuItemTitle = item.Title,
                MenuItemModule = item.Module,
                CanRead = associatedRolePerms.Any(rp => rp.CanRead),
                CanCreate = associatedRolePerms.Any(rp => rp.CanCreate),
                CanUpdate = associatedRolePerms.Any(rp => rp.CanUpdate),
                CanDelete = associatedRolePerms.Any(rp => rp.CanDelete),
                IsOverride = false // Inherited from roles
            };
        }).ToList();

        var response = new UserPermissionResponse
        {
            UserId = user.Id,
            UserEmail = user.Email ?? string.Empty,
            FullName = user.FullName,
            Permissions = permissionsList
        };

        return Ok(ApiResponse<UserPermissionResponse>.SuccessResponse(response, "User permissions retrieved successfully."));
    }

    [HttpPut("user/{userId}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserPermissions(string userId, [FromBody] UpdateUserPermissionsRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound(ApiResponse.FailureResponse("User not found."));
        }

        var repo = _unitOfWork.Repository<UserMenuPermission>();

        // Fetch existing user overrides
        var existingOverrides = await repo.FindAsync(up => up.UserId == userId);

        // Delete all existing overrides to perform a clean rewrite
        repo.RemoveRange(existingOverrides);

        // Save new overrides
        foreach (var p in request.Permissions)
        {
            // Note: We always save overrides even if all are false, because "all false" is an explicit deny override!
            var newOverride = new UserMenuPermission
            {
                UserId = userId,
                MenuItemId = p.MenuItemId,
                CanRead = p.CanRead,
                CanCreate = p.CanCreate,
                CanUpdate = p.CanUpdate,
                CanDelete = p.CanDelete,
                User = user
            };
            await repo.AddAsync(newOverride);
        }

        await _unitOfWork.SaveChangesAsync();
        return Ok(ApiResponse.SuccessResponse("User-specific permission overrides updated successfully."));
    }
}
