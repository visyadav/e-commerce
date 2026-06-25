using AutoMapper;
using ECommerce.Api.Modules.Navigation.DTOs;
using ECommerce.Api.Modules.Navigation.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Shared.Responses;
using ECommerce.Shared.Constants;
using Microsoft.EntityFrameworkCore;


namespace ECommerce.Api.Modules.Navigation.Services;

public class NavigationService : INavigationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public NavigationService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<List<MenuItemDto>>> GetSideMenuForRolesAsync(IEnumerable<string> roles, CancellationToken cancellationToken = default)
    {
        // 1. Fetch all active menu items from database
        var allItems = await _unitOfWork.Repository<MenuItem>().Query()
            .Where(m => m.IsActive)
            .ToListAsync(cancellationToken);

        var rolesList = roles?.ToList() ?? [];
        var userId = _currentUserService.UserId;

        // 2. SuperAdmin Bypass: SuperAdmin always sees all active menu items
        if (_currentUserService.IsInRole(AppConstants.Roles.SuperAdmin))
        {
            var fullTree = BuildTree(allItems, _ => true);
            return ApiResponse<List<MenuItemDto>>.SuccessResponse(fullTree, "Side menu loaded successfully.");
        }

        // 3. Fetch User-specific overrides (Grants and Denies)
        List<Guid> userGrants = [];
        List<Guid> userDenies = [];

        if (!string.IsNullOrEmpty(userId))
        {
            var userPerms = await _unitOfWork.Repository<UserMenuPermission>().Query()
                .Where(up => up.UserId == userId)
                .ToListAsync(cancellationToken);

            userGrants = userPerms.Where(up => up.CanRead).Select(up => up.MenuItemId).ToList();
            userDenies = userPerms.Where(up => !up.CanRead).Select(up => up.MenuItemId).ToList();
        }

        // 4. Fetch Role-specific grants
        var rolePerms = await _unitOfWork.Repository<RoleMenuPermission>().Query()
            .Include(rp => rp.Role)
            .Where(rp => rolesList.Contains(rp.Role.Name!) && rp.CanRead)
            .Select(rp => rp.MenuItemId)
            .ToListAsync(cancellationToken);

        // 5. Define dynamic access filter
        Func<MenuItem, bool> hasAccess = item =>
        {
            // User Deny takes absolute precedence
            if (userDenies.Contains(item.Id))
                return false;

            // User Grant
            if (userGrants.Contains(item.Id))
                return true;

            // Role Grant
            if (rolePerms.Contains(item.Id))
                return true;

            // Fallback for seeded data: if no permissions are configured in the DB yet,
            // fall back to the AllowedRoles metadata from the seeder.
            if (string.IsNullOrWhiteSpace(item.AllowedRoles))
                return true; // Public item

            var allowed = item.GetRolesList();
            return rolesList.Any(r => allowed.Contains(r, StringComparer.OrdinalIgnoreCase));
        };

        var menuTree = BuildTree(allItems, hasAccess);

        return ApiResponse<List<MenuItemDto>>.SuccessResponse(menuTree, "Side menu loaded successfully.");
    }

    private List<MenuItemDto> BuildTree(List<MenuItem> allItems, Func<MenuItem, bool> hasAccess)
    {
        var rootItems = allItems
            .Where(m => m.ParentId == null && hasAccess(m))
            .OrderBy(m => m.SortOrder)
            .ToList();

        var dtos = new List<MenuItemDto>();

        foreach (var item in rootItems)
        {
            var dto = _mapper.Map<MenuItemDto>(item);
            dto.Children = GetChildren(item, allItems, hasAccess);
            dtos.Add(dto);
        }

        return dtos;
    }

    private List<MenuItemDto> GetChildren(MenuItem parent, List<MenuItem> allItems, Func<MenuItem, bool> hasAccess)
    {
        var children = allItems
            .Where(m => m.ParentId == parent.Id && hasAccess(m))
            .OrderBy(m => m.SortOrder)
            .ToList();

        var dtos = new List<MenuItemDto>();

        foreach (var child in children)
        {
            var dto = _mapper.Map<MenuItemDto>(child);
            dto.Children = GetChildren(child, allItems, hasAccess);
            dtos.Add(dto);
        }

        return dtos;
    }
}
