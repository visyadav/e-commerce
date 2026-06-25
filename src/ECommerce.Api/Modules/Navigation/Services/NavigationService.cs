using AutoMapper;
using ECommerce.Api.Modules.Navigation.DTOs;
using ECommerce.Api.Modules.Navigation.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Modules.Navigation.Services;

public class NavigationService : INavigationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public NavigationService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<List<MenuItemDto>>> GetSideMenuForRolesAsync(IEnumerable<string> roles, CancellationToken cancellationToken = default)
    {
        // 1. Fetch all active menu items from database
        var allItems = await _unitOfWork.Repository<MenuItem>().Query()
            .Where(m => m.IsActive)
            .ToListAsync(cancellationToken);

        var rolesList = roles?.ToList() ?? [];
        var menuTree = BuildFilteredTree(allItems, rolesList);

        return ApiResponse<List<MenuItemDto>>.SuccessResponse(menuTree, "Side menu loaded successfully.");
    }

    private List<MenuItemDto> BuildFilteredTree(List<MenuItem> allItems, List<string> userRoles)
    {
        // Filter out root items that the user cannot access
        var rootItems = allItems
            .Where(m => m.ParentId == null && HasAccess(m, userRoles))
            .OrderBy(m => m.SortOrder)
            .ToList();

        var dtos = new List<MenuItemDto>();

        foreach (var item in rootItems)
        {
            var dto = _mapper.Map<MenuItemDto>(item);
            dto.Children = GetFilteredChildren(item, allItems, userRoles);
            dtos.Add(dto);
        }

        return dtos;
    }

    private List<MenuItemDto> GetFilteredChildren(MenuItem parent, List<MenuItem> allItems, List<string> userRoles)
    {
        var children = allItems
            .Where(m => m.ParentId == parent.Id && HasAccess(m, userRoles))
            .OrderBy(m => m.SortOrder)
            .ToList();

        var dtos = new List<MenuItemDto>();

        foreach (var child in children)
        {
            var dto = _mapper.Map<MenuItemDto>(child);
            dto.Children = GetFilteredChildren(child, allItems, userRoles);
            dtos.Add(dto);
        }

        return dtos;
    }

    private bool HasAccess(MenuItem item, List<string> userRoles)
    {
        if (string.IsNullOrWhiteSpace(item.AllowedRoles))
            return true; // Public item accessible by everyone

        var allowed = item.GetRolesList();
        return userRoles.Any(r => allowed.Contains(r, StringComparer.OrdinalIgnoreCase));
    }
}
