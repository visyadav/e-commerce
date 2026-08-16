using ECommerce.Api.Common;
using ECommerce.Api.Modules.Authentication.DTOs;
using ECommerce.Api.Modules.Authentication.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.ClientApp.Controllers;

[Route("api/v1/client/auth")]
public class ClientAuthController : BaseApiController
{
    private readonly IAuthService _authService;

    public ClientAuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Authenticate client mobile application user (Customer)
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var response = await _authService.LoginAsync(request, cancellationToken);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    /// <summary>
    /// Register new client mobile application user (Customer)
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var response = await _authService.RegisterAsync(request, cancellationToken);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }
}
