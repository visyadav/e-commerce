using ECommerce.Api.Modules.Catalog.Tags.DTOs;
using ECommerce.Api.Modules.Catalog.Tags.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.Catalog.Tags.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class TagController : ControllerBase
{
    private readonly ITagService _tagService;

    public TagController(ITagService tagService)
    {
        _tagService = tagService;
    }

    [HttpGet("lookup")]
    public async Task<ActionResult<ApiResponse<IEnumerable<TagDto>>>> GetLookup(CancellationToken cancellationToken)
    {
        var response = await _tagService.GetLookupAsync(cancellationToken);
        return Ok(response);
    }
}
