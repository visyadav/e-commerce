using ECommerce.Api.Common;
using ECommerce.Api.Filters;
using ECommerce.Api.Modules.Catalog.Brands.DTOs;
using ECommerce.Api.Modules.Catalog.Brands.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.Catalog.Brands.Controllers;

public class BrandController : BaseApiController
{
    private readonly IBrandService _brandService;

    public BrandController(IBrandService brandService)
    {
        _brandService = brandService;
    }

    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<List<BrandDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBrands(CancellationToken cancellationToken)
    {
        var response = await _brandService.GetAllAsync(cancellationToken);
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<BrandDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBrandById(Guid id, CancellationToken cancellationToken)
    {
        var response = await _brandService.GetByIdAsync(id, cancellationToken);
        return Ok(response);
    }

    [HttpPost]
    [HasPermission("Catalog", "Create")]
    [ProducesResponseType(typeof(ApiResponse<BrandDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateBrand([FromBody] CreateBrandRequest request, CancellationToken cancellationToken)
    {
        var response = await _brandService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetBrandById), new { id = response.Data!.Id }, response);
    }

    [HttpPut("{id:guid}")]
    [HasPermission("Catalog", "Update")]
    [ProducesResponseType(typeof(ApiResponse<BrandDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBrand(Guid id, [FromBody] UpdateBrandRequest request, CancellationToken cancellationToken)
    {
        var response = await _brandService.UpdateAsync(id, request, cancellationToken);
        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [HasPermission("Catalog", "Delete")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteBrand(Guid id, CancellationToken cancellationToken)
    {
        var response = await _brandService.DeleteAsync(id, cancellationToken);
        return Ok(response);
    }
}
