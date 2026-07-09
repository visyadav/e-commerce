using ECommerce.Api.Common;
using ECommerce.Api.Modules.Catalog.Brands.DTOs;
using ECommerce.Api.Modules.Catalog.Brands.Interfaces;
using ECommerce.Api.Modules.Catalog.Categories.DTOs;
using ECommerce.Api.Modules.Catalog.Categories.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.Catalog.Common.Controllers;

public class LookupController : BaseApiController
{
    private readonly IBrandService _brandService;
    private readonly ICategoryService _categoryService;

    public LookupController(IBrandService brandService, ICategoryService categoryService)
    {
        _brandService = brandService;
        _categoryService = categoryService;
    }

    [HttpGet("brands")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<List<BrandDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBrands(CancellationToken cancellationToken)
    {
        var response = await _brandService.GetLookupAsync(cancellationToken);
        return Ok(response);
    }

    [HttpGet("categories")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<List<CategoryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories(CancellationToken cancellationToken)
    {
        var response = await _categoryService.GetLookupAsync(cancellationToken);
        return Ok(response);
    }
}
