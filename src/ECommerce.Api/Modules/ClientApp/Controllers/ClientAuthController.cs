using ECommerce.Api.Common;
using ECommerce.Api.Modules.Authentication.DTOs;
using ECommerce.Api.Modules.Authentication.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.ClientApp.Controllers;

[Route("api/v1/client/auth")]
public class ClientAuthController(IAuthService authService) : BaseApiController
{
    /// <summary>
    /// Authenticate client application user (Customer) by phone number or email
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] CustomerLoginRequest request, CancellationToken cancellationToken)
    {
        var response = await authService.LoginCustomerAsync(request, cancellationToken);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    /// <summary>
    /// Authenticate or register customer by mobile number (OTP verification flow)
    /// </summary>
    [HttpPost("mobile-login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MobileLogin([FromBody] MobileOtpLoginRequest request, CancellationToken cancellationToken)
    {
        var response = await authService.LoginWithMobileOtpAsync(request, cancellationToken);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    /// <summary>
    /// Register new client application user (Customer) by phone number (email optional)
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] CustomerRegisterRequest request, CancellationToken cancellationToken)
    {
        var response = await authService.RegisterCustomerAsync(request, cancellationToken);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    /// <summary>
    /// External/Social Login endpoint for customer users (Google, Apple, etc.)
    /// </summary>
    [HttpPost("external-login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ExternalLogin([FromBody] ExternalLoginRequest request, CancellationToken cancellationToken)
    {
        var response = await authService.ExternalLoginAsync(request, cancellationToken);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    /// <summary>
    /// Refresh access token for customer session
    /// </summary>
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        var response = await authService.RefreshTokenAsync(request.AccessToken, request.RefreshToken, cancellationToken);
        if (!response.Success)
        {
            return Unauthorized(response);
        }
        return Ok(response);
    }

    /// <summary>
    /// Get current logged-in customer profile details
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMe(CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse.FailureResponse("User ID is missing from authorization claims."));
        }

        var response = await authService.GetMeAsync(userId, cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// Update customer full name (POST method)
    /// </summary>
    [HttpPost("update-name")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateName([FromBody] UpdateCustomerNameRequest request, CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse.FailureResponse("User ID is missing from authorization claims."));
        }

        var response = await authService.UpdateCustomerNameAsync(userId, request, cancellationToken);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    /// <summary>
    /// Change customer password
    /// </summary>
    [HttpPost("change-password")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse.FailureResponse("User ID is missing from authorization claims."));
        }

        var response = await authService.ChangePasswordAsync(userId, request, cancellationToken);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }
}
