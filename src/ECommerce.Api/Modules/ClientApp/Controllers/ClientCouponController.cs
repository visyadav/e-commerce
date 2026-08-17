using ECommerce.Api.Common;
using ECommerce.Api.Modules.Coupons.DTOs;
using ECommerce.Api.Modules.Coupons.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.ClientApp.Controllers;

[Route("api/v1/client/coupons")]
public class ClientCouponController(ICouponService couponService) : BaseApiController
{
    /// <summary>
    /// Get active coupons available for customer application
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<CouponDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveCoupons(CancellationToken cancellationToken)
    {
        var response = await couponService.GetActiveClientCouponsAsync(cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// Validate and calculate coupon discount for cart items
    /// </summary>
    [HttpPost("apply")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<CouponValidationResultDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ApplyCoupon([FromBody] ApplyCouponRequest request, CancellationToken cancellationToken)
    {
        var response = await couponService.ValidateAndApplyCouponAsync(request, cancellationToken);
        return Ok(response);
    }
}
