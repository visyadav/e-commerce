using ECommerce.Api.Common;
using ECommerce.Api.Filters;
using ECommerce.Api.Modules.Catalog.Products.DTOs;
using ECommerce.Api.Modules.Catalog.Products.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.Catalog.Products.Controllers;

public class ProductController : BaseApiController
{
    private readonly IProductService _productService;

    public ProductController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    [HasPermission("Catalog", "Read")]
    [ProducesResponseType(typeof(PagedResponse<ProductDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProducts(
        [FromQuery] Guid? categoryId,
        [FromQuery] Guid? brandId,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? searchTerm,
        [FromQuery] string? sortBy,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var response = await _productService.GetPaginatedAsync(
            categoryId, brandId, minPrice, maxPrice, searchTerm, sortBy, pageNumber, pageSize, cancellationToken);
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    [HasPermission("Catalog", "Read")]
    [ProducesResponseType(typeof(ApiResponse<ProductDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProductById(Guid id, CancellationToken cancellationToken)
    {
        var response = await _productService.GetByIdAsync(id, cancellationToken);
        return Ok(response);
    }

    [HttpPost]
    [HasPermission("Catalog", "Create")]
    [ProducesResponseType(typeof(ApiResponse<ProductDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateProduct([FromForm] CreateProductRequest request, CancellationToken cancellationToken)
    {
        var response = await _productService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetProductById), new { id = response.Data!.Id }, response);
    }

    [HttpPut("{id:guid}")]
    [HasPermission("Catalog", "Update")]
    [ProducesResponseType(typeof(ApiResponse<ProductDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromForm] UpdateProductRequest request, CancellationToken cancellationToken)
    {
        var response = await _productService.UpdateAsync(id, request, cancellationToken);
        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [HasPermission("Catalog", "Delete")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProduct(Guid id, CancellationToken cancellationToken)
    {
        var response = await _productService.DeleteAsync(id, cancellationToken);
        return Ok(response);
    }
}
