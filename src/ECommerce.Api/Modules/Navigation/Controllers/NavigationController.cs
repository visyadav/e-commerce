using ECommerce.Api.Common;
using ECommerce.Api.Modules.Navigation.DTOs;
using ECommerce.Api.Modules.Navigation.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.Navigation.Controllers;

[Authorize]
public class NavigationController : BaseApiController
{
    private readonly INavigationService _navigationService;

    public NavigationController(INavigationService navigationService)
    {
        _navigationService = navigationService;
    }

    [HttpGet("side-menu")]
    [ProducesResponseType(typeof(ApiResponse<List<MenuItemDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSideMenu(CancellationToken cancellationToken)
    {
        var roles = CurrentUserRoles;
        var response = await _navigationService.GetSideMenuForRolesAsync(roles, cancellationToken);
        return Ok(response);
    }
}
