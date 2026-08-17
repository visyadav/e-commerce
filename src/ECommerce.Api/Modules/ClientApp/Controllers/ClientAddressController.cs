using ECommerce.Api.Modules.ClientApp.DTOs;
using ECommerce.Api.Modules.ClientApp.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.ClientApp.Controllers;

[ApiController]
[Route("api/v1/client/addresses")]
public class ClientAddressController(IClientAddressService addressService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<ClientUserAddressDto>>>> GetAddresses([FromQuery] string? userId = null)
    {
        var effectiveUserId = string.IsNullOrWhiteSpace(userId) ? "guest-user" : userId;
        var addresses = await addressService.GetUserAddressesAsync(effectiveUserId);
        return Ok(ApiResponse<IEnumerable<ClientUserAddressDto>>.SuccessResponse(addresses));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ClientUserAddressDto>>> CreateAddress([FromBody] CreateClientUserAddressRequest request, [FromQuery] string? userId = null)
    {
        var effectiveUserId = string.IsNullOrWhiteSpace(userId) ? "guest-user" : userId;
        var address = await addressService.CreateUserAddressAsync(effectiveUserId, request);
        return Ok(ApiResponse<ClientUserAddressDto>.SuccessResponse(address, "Address saved successfully"));
    }
}
