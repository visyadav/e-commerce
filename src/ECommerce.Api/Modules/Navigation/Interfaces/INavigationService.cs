using ECommerce.Api.Modules.Navigation.DTOs;
using ECommerce.Shared.Responses;

namespace ECommerce.Api.Modules.Navigation.Interfaces;

public interface INavigationService
{
    Task<ApiResponse<List<MenuItemDto>>> GetSideMenuForRolesAsync(IEnumerable<string> roles, CancellationToken cancellationToken = default);
}
