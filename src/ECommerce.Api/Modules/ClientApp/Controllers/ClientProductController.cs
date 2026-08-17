using ECommerce.Api.Modules.ClientApp.DTOs;
using ECommerce.Api.Modules.ClientApp.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.ClientApp.Controllers;

[ApiController]
[Route("api/v1/client/products")]
public class ClientProductController : ControllerBase
{
    private readonly IClientProductService _productService;

    public ClientProductController(IClientProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<ClientProductDto>>>> GetProducts([FromQuery] ClientProductQueryParameters query)
    {
        var products = await _productService.GetProductsAsync(query);
        return Ok(ApiResponse<IEnumerable<ClientProductDto>>.SuccessResponse(products));
    }

    [HttpGet("popular")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ClientProductDto>>>> GetPopularProducts([FromQuery] int limit = 10)
    {
        var products = await _productService.GetPopularProductsAsync(limit);
        return Ok(ApiResponse<IEnumerable<ClientProductDto>>.SuccessResponse(products));
    }

    [HttpGet("categories")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ClientCategoryDto>>>> GetCategories()
    {
        var categories = await _productService.GetCategoriesAsync();
        return Ok(ApiResponse<IEnumerable<ClientCategoryDto>>.SuccessResponse(categories));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ClientProductDto>>> GetProductById(Guid id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        if (product == null)
        {
            return NotFound(ApiResponse<ClientProductDto>.FailureResponse("Product not found."));
        }
        return Ok(ApiResponse<ClientProductDto>.SuccessResponse(product));
    }
}
