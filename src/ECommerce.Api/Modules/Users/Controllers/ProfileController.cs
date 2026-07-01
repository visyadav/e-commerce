using ECommerce.Api.Common;
using ECommerce.Api.Modules.Users.DTOs;
using ECommerce.Api.Modules.Users.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.Users.Controllers;

[Authorize]
public class ProfileController : BaseApiController
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<UserProfileDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetProfile()
    {
        var userId = CurrentUserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse.FailureResponse("User ID is missing from claims."));
        }

        var response = await _profileService.GetProfileAsync(userId);
        return Ok(response);
    }

    [HttpPut]
    [ProducesResponseType(typeof(ApiResponse<UserProfileDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = CurrentUserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse.FailureResponse("User ID is missing from claims."));
        }

        var response = await _profileService.UpdateProfileAsync(userId, request);
        return Ok(response);
    }

    [HttpGet("addresses")]
    [ProducesResponseType(typeof(ApiResponse<List<UserAddressDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAddresses()
    {
        var userId = CurrentUserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse.FailureResponse("User ID is missing from claims."));
        }

        var response = await _profileService.GetAddressesAsync(userId);
        return Ok(response);
    }

    [HttpPost("addresses")]
    [ProducesResponseType(typeof(ApiResponse<UserAddressDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> AddAddress([FromBody] CreateUserAddressRequest request)
    {
        var userId = CurrentUserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse.FailureResponse("User ID is missing from claims."));
        }

        var response = await _profileService.AddAddressAsync(userId, request);
        return Ok(response);
    }

    [HttpPut("addresses/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<UserAddressDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAddress(Guid id, [FromBody] UpdateUserAddressRequest request)
    {
        var userId = CurrentUserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse.FailureResponse("User ID is missing from claims."));
        }

        var response = await _profileService.UpdateAddressAsync(userId, id, request);
        return Ok(response);
    }

    [HttpDelete("addresses/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAddress(Guid id)
    {
        var userId = CurrentUserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse.FailureResponse("User ID is missing from claims."));
        }

        var response = await _profileService.DeleteAddressAsync(userId, id);
        return Ok(response);
    }

    [HttpPut("theme")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateThemeColor([FromBody] UpdateThemeColorRequest request)
    {
        var userId = CurrentUserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse.FailureResponse("User ID is missing from claims."));
        }

        var roles = CurrentUserRoles;
        if (!roles.Contains(ECommerce.Shared.Constants.AppConstants.Roles.Admin) && 
            !roles.Contains(ECommerce.Shared.Constants.AppConstants.Roles.SuperAdmin))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse.FailureResponse("Only admin users can customize theme colors.", ["Access Denied."]));
        }

        var response = await _profileService.UpdateThemeColorAsync(userId, request.ThemeColor);
        return Ok(response);
    }
}
