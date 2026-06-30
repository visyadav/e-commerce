using AutoMapper;
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
    private readonly IPermissionAuditLogger _auditLogger;
    private readonly IMapper _mapper;

    public PermissionController(
        RoleManager<IdentityRole> roleManager,
        UserManager<ApplicationUser> userManager,
        IUnitOfWork unitOfWork,
        IPermissionAuditLogger auditLogger,
        IMapper mapper)
    {
        _roleManager = roleManager;
        _userManager = userManager;
        _unitOfWork = unitOfWork;
        _auditLogger = auditLogger;
        _mapper = mapper;
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

        _auditLogger.LogRolePermissionsChange(CurrentUserEmail ?? "System Admin", role.Name ?? string.Empty, "Rewrote role permissions");

        return Ok(ApiResponse.SuccessResponse("Role permissions updated successfully."));
    }

    [HttpGet("users")]
    [ProducesResponseType(typeof(ApiResponse<List<UserListItemDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers()
    {
        var userList = new List<UserListItemDto>();

        var rawUsers = await _userManager.Users.ToListAsync();
        foreach (var user in rawUsers)
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

        _auditLogger.LogUserPermissionsChange(CurrentUserEmail ?? "System Admin", user.Email ?? string.Empty, "Rewrote user-specific overrides");

        return Ok(ApiResponse.SuccessResponse("User-specific permission overrides updated successfully."));
    }

    [HttpGet("modules")]
    [ProducesResponseType(typeof(ApiResponse<List<ModuleDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetModules(CancellationToken cancellationToken)
    {
        // Fetch all top-level modules
        var topLevelMenuItems = await _unitOfWork.Repository<MenuItem>().Query()
            .Include(m => m.Children)
            .Where(m => m.ParentId == null)
            .OrderBy(m => m.SortOrder)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<ModuleDto>>(topLevelMenuItems);
        return Ok(ApiResponse<List<ModuleDto>>.SuccessResponse(dtos, "Modules retrieved successfully."));
    }

    [HttpPost("modules")]
    [ProducesResponseType(typeof(ApiResponse<ModuleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateModule([FromBody] CreateModuleRequest request, CancellationToken cancellationToken)
    {
        if (request.ParentId.HasValue)
        {
            var parentExists = await _unitOfWork.Repository<MenuItem>().ExistsAsync(m => m.Id == request.ParentId.Value, cancellationToken);
            if (!parentExists)
            {
                return NotFound(ApiResponse.FailureResponse("Parent module not found."));
            }
        }

        var menuItem = _mapper.Map<MenuItem>(request);
        menuItem.IsActive = true;

        await _unitOfWork.Repository<MenuItem>().AddAsync(menuItem, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _auditLogger.LogModuleChange(CurrentUserEmail ?? "System Admin", request.Module, "CREATE", $"Created dynamic module: {request.Title}");

        var dto = _mapper.Map<ModuleDto>(menuItem);
        return Ok(ApiResponse<ModuleDto>.SuccessResponse(dto, "Module created successfully."));
    }

    [HttpPut("modules/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ModuleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateModule(Guid id, [FromBody] UpdateModuleRequest request, CancellationToken cancellationToken)
    {
        var menuItem = await _unitOfWork.Repository<MenuItem>().GetByIdAsync(id, cancellationToken);
        if (menuItem == null)
        {
            return NotFound(ApiResponse.FailureResponse("Module not found."));
        }

        if (request.ParentId.HasValue && request.ParentId.Value == id)
        {
            return BadRequest(ApiResponse.FailureResponse("A module cannot be its own parent."));
        }

        if (request.ParentId.HasValue)
        {
            var parentExists = await _unitOfWork.Repository<MenuItem>().ExistsAsync(m => m.Id == request.ParentId.Value, cancellationToken);
            if (!parentExists)
            {
                return NotFound(ApiResponse.FailureResponse("Parent module not found."));
            }
        }

        _mapper.Map(request, menuItem);

        _unitOfWork.Repository<MenuItem>().Update(menuItem);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _auditLogger.LogModuleChange(CurrentUserEmail ?? "System Admin", request.Module, "UPDATE", $"Updated dynamic module: {request.Title}");

        var dto = _mapper.Map<ModuleDto>(menuItem);
        return Ok(ApiResponse<ModuleDto>.SuccessResponse(dto, "Module updated successfully."));
    }

    [HttpDelete("modules/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteModule(Guid id, CancellationToken cancellationToken)
    {
        var menuItem = await _unitOfWork.Repository<MenuItem>().GetByIdAsync(id, cancellationToken);
        if (menuItem == null)
        {
            return NotFound(ApiResponse.FailureResponse("Module not found."));
        }

        var hasChildren = await _unitOfWork.Repository<MenuItem>().ExistsAsync(m => m.ParentId == id, cancellationToken);
        if (hasChildren)
        {
            return BadRequest(ApiResponse.FailureResponse("Cannot delete a module that has sub-modules."));
        }

        _unitOfWork.Repository<MenuItem>().Remove(menuItem);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _auditLogger.LogModuleChange(CurrentUserEmail ?? "System Admin", menuItem.Module ?? string.Empty, "DELETE", $"Deleted dynamic module: {menuItem.Title}");

        return Ok(ApiResponse.SuccessResponse("Module deleted successfully."));
    }

    [HttpPut("modules/{id:guid}/toggle")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleModule(Guid id, CancellationToken cancellationToken)
    {
        var menuItem = await _unitOfWork.Repository<MenuItem>().GetByIdAsync(id, cancellationToken);
        if (menuItem == null)
        {
            return NotFound(ApiResponse.FailureResponse("Module not found."));
        }

        menuItem.IsActive = !menuItem.IsActive;

        _unitOfWork.Repository<MenuItem>().Update(menuItem);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var actionText = menuItem.IsActive ? "ACTIVATED" : "DEACTIVATED";
        _auditLogger.LogModuleChange(CurrentUserEmail ?? "System Admin", menuItem.Module ?? string.Empty, actionText, $"Toggled module status to: {menuItem.IsActive}");

        return Ok(ApiResponse.SuccessResponse($"Module status toggled to: {menuItem.IsActive}"));
    }

    [HttpPut("modules/{moduleId:guid}/roles")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetModuleRolesAccess(Guid moduleId, [FromBody] List<ModuleRolePermissionInput> request, CancellationToken cancellationToken)
    {
        var menuItem = await _unitOfWork.Repository<MenuItem>().GetByIdAsync(moduleId, cancellationToken);
        if (menuItem == null)
        {
            return NotFound(ApiResponse.FailureResponse("Module not found."));
        }

        // 1. Validate Roles exist
        foreach (var r in request)
        {
            var roleExists = await _roleManager.FindByIdAsync(r.RoleId);
            if (roleExists == null)
            {
                return BadRequest(ApiResponse.FailureResponse($"Role with ID '{r.RoleId}' does not exist."));
            }
        }

        // 2. Rewrite Role permissions for this specific module
        var roleRepo = _unitOfWork.Repository<RoleMenuPermission>();
        var existingRolePerms = await roleRepo.FindAsync(rp => rp.MenuItemId == moduleId);
        roleRepo.RemoveRange(existingRolePerms);

        foreach (var r in request)
        {
            if (r.CanRead || r.CanCreate || r.CanUpdate || r.CanDelete)
            {
                var role = await _roleManager.FindByIdAsync(r.RoleId);
                var newRolePerm = new RoleMenuPermission
                {
                    RoleId = r.RoleId,
                    MenuItemId = moduleId,
                    CanRead = r.CanRead,
                    CanCreate = r.CanCreate,
                    CanUpdate = r.CanUpdate,
                    CanDelete = r.CanDelete,
                    Role = role!
                };
                await roleRepo.AddAsync(newRolePerm, cancellationToken);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _auditLogger.LogModuleChange(
            CurrentUserEmail ?? "System Admin", 
            menuItem.Module ?? string.Empty, 
            "ROLE_ACCESS_CONFIGURED", 
            $"Configured role access for {request.Count} roles on module {menuItem.Title}");

        return Ok(ApiResponse.SuccessResponse("Module role permissions updated successfully."));
    }

    [HttpPut("modules/{moduleId:guid}/users")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetModuleUsersAccess(Guid moduleId, [FromBody] List<ModuleUserPermissionInput> request, CancellationToken cancellationToken)
    {
        var menuItem = await _unitOfWork.Repository<MenuItem>().GetByIdAsync(moduleId, cancellationToken);
        if (menuItem == null)
        {
            return NotFound(ApiResponse.FailureResponse("Module not found."));
        }

        // 1. Validate Users exist
        foreach (var u in request)
        {
            var userExists = await _userManager.FindByIdAsync(u.UserId);
            if (userExists == null)
            {
                return BadRequest(ApiResponse.FailureResponse($"User with ID '{u.UserId}' does not exist."));
            }
        }

        // 2. Rewrite User overrides for this specific module
        var userRepo = _unitOfWork.Repository<UserMenuPermission>();
        var existingUserOverrides = await userRepo.FindAsync(up => up.MenuItemId == moduleId);
        userRepo.RemoveRange(existingUserOverrides);

        foreach (var u in request)
        {
            var user = await _userManager.FindByIdAsync(u.UserId);
            var newOverride = new UserMenuPermission
            {
                UserId = u.UserId,
                MenuItemId = moduleId,
                CanRead = u.CanRead,
                CanCreate = u.CanCreate,
                CanUpdate = u.CanUpdate,
                CanDelete = u.CanDelete,
                User = user!
            };
            await userRepo.AddAsync(newOverride, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _auditLogger.LogModuleChange(
            CurrentUserEmail ?? "System Admin", 
            menuItem.Module ?? string.Empty, 
            "USER_ACCESS_CONFIGURED", 
            $"Configured user overrides for {request.Count} users on module {menuItem.Title}");

        return Ok(ApiResponse.SuccessResponse("Module user permission overrides updated successfully."));
    }
}
