using ECommerce.Api.Common;
using ECommerce.Api.Filters;
using ECommerce.Api.Modules.Users.DTOs;
using ECommerce.Api.Modules.Users.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.Users.Controllers;

public class AdminUserController : BaseApiController
{
    private readonly IAdminUserService _adminUserService;

    public AdminUserController(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    [HttpGet]
    [HasPermission("Users", "Read")]
    [ProducesResponseType(typeof(PagedResponse<AdminUserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] string? searchTerm,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var response = await _adminUserService.GetAllUsersAsync(searchTerm, pageNumber, pageSize, cancellationToken);
        return Ok(response);
    }

    [HttpPut("{id}/status")]
    [HasPermission("Users", "Update")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleUserStatus(string id, [FromBody] ToggleUserStatusRequest request, CancellationToken cancellationToken)
    {
        var response = await _adminUserService.ToggleUserStatusAsync(id, request.IsActive, CurrentUserId ?? "System", cancellationToken);
        return Ok(response);
    }

    [HttpPut("{id}")]
    [HasPermission("Users", "Update")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateAdminUserRequest request, CancellationToken cancellationToken)
    {
        var response = await _adminUserService.UpdateUserAsync(id, request, CurrentUserId ?? "System", cancellationToken);
        return Ok(response);
    }

    [HttpGet("{id}")]
    [HasPermission("Users", "Read")]
    [ProducesResponseType(typeof(ApiResponse<AdminUserDetailsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserById(string id, CancellationToken cancellationToken)
    {
        var response = await _adminUserService.GetUserByIdAsync(id, cancellationToken);
        return Ok(response);
    }

    [HttpPost]
    [HasPermission("Users", "Create")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateUser([FromBody] CreateAdminUserRequest request, CancellationToken cancellationToken)
    {
        var response = await _adminUserService.CreateUserAsync(request, CurrentUserId ?? "System", cancellationToken);
        return Ok(response);
    }
}
