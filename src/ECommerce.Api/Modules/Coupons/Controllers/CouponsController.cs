using ECommerce.Api.Common;
using ECommerce.Api.Modules.Coupons.DTOs;
using ECommerce.Api.Modules.Coupons.Interfaces;
using ECommerce.Shared.Constants;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.Coupons.Controllers;

[Authorize(Roles = AppConstants.Roles.Admin)]
public class CouponsController(ICouponService couponService) : BaseApiController
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<CouponDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllCoupons(CancellationToken cancellationToken)
    {
        var response = await couponService.GetAllCouponsAsync(cancellationToken);
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<CouponDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCouponById(Guid id, CancellationToken cancellationToken)
    {
        var response = await couponService.GetCouponByIdAsync(id, cancellationToken);
        return Ok(response);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<CouponDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponRequest request, CancellationToken cancellationToken)
    {
        var response = await couponService.CreateCouponAsync(request, cancellationToken);
        if (!response.Success) return BadRequest(response);
        return CreatedAtAction(nameof(GetCouponById), new { id = response.Data?.Id }, response);
    }

    [HttpPost("{id:guid}/update")]
    [HttpPost("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<CouponDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCoupon(Guid id, [FromBody] UpdateCouponRequest request, CancellationToken cancellationToken)
    {
        var response = await couponService.UpdateCouponAsync(id, request, cancellationToken);
        if (!response.Success) return BadRequest(response);
        return Ok(response);
    }

    [HttpPost("{id:guid}/delete")]
    [HttpPost("delete/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCoupon(Guid id, CancellationToken cancellationToken)
    {
        var response = await couponService.DeleteCouponAsync(id, cancellationToken);
        return Ok(response);
    }

    [HttpPost("{id:guid}/toggle-status")]
    [ProducesResponseType(typeof(ApiResponse<CouponDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ToggleCouponStatus(Guid id, CancellationToken cancellationToken)
    {
        var response = await couponService.ToggleCouponStatusAsync(id, cancellationToken);
        return Ok(response);
    }

    [HttpGet("usage-logs")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<CouponUsageLogDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUsageLogs(CancellationToken cancellationToken)
    {
        var response = await couponService.GetAllUsageLogsAsync(cancellationToken);
        return Ok(response);
    }

    [HttpGet("{id:guid}/usage-logs")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<CouponUsageLogDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCouponUsageLogs(Guid id, CancellationToken cancellationToken)
    {
        var response = await couponService.GetCouponUsageLogsAsync(id, cancellationToken);
        return Ok(response);
    }
}
