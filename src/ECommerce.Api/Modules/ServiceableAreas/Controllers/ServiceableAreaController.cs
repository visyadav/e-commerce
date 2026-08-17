using ECommerce.Shared.Responses;
using ECommerce.Api.Modules.ServiceableAreas.DTOs;
using ECommerce.Api.Modules.ServiceableAreas.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.ServiceableAreas.Controllers;

[ApiController]
[Route("api/v1")]
public class ServiceableAreaController : ControllerBase
{
    private readonly IServiceableAreaService _service;

    public ServiceableAreaController(IServiceableAreaService service)
    {
        _service = service;
    }

    // --- Admin Endpoints (GET and POST Only) ---

    [HttpGet("admin/serviceable-areas")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ServiceableAreaDto>>>> GetAllAdminAreas()
    {
        var areas = await _service.GetAllAreasAsync();
        return Ok(ApiResponse<IEnumerable<ServiceableAreaDto>>.SuccessResponse(areas, "Serviceable areas fetched successfully"));
    }

    [HttpGet("admin/serviceable-areas/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<ServiceableAreaDto>>> GetAreaById(Guid id)
    {
        var area = await _service.GetAreaByIdAsync(id);
        if (area == null)
            return NotFound(ApiResponse<ServiceableAreaDto>.FailureResponse("Serviceable area not found"));

        return Ok(ApiResponse<ServiceableAreaDto>.SuccessResponse(area));
    }

    [HttpPost("admin/serviceable-areas")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<ServiceableAreaDto>>> SaveArea([FromBody] CreateServiceableAreaRequest request, [FromQuery] Guid? id = null)
    {
        var area = await _service.SaveAreaAsync(request, id);
        return Ok(ApiResponse<ServiceableAreaDto>.SuccessResponse(area, "Serviceable area saved successfully"));
    }

    // --- Client / Mobile App Endpoints (GET and POST Only) ---

    [HttpGet("client/serviceable-areas")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ServiceableAreaDto>>>> GetClientAreas()
    {
        var areas = await _service.GetAllAreasAsync();
        var activeAreas = areas.Where(a => a.IsActive);
        return Ok(ApiResponse<IEnumerable<ServiceableAreaDto>>.SuccessResponse(activeAreas));
    }

    [HttpPost("client/serviceable-areas/check")]
    public async Task<ActionResult<ApiResponse<ServiceabilityResultDto>>> CheckServiceability([FromBody] CheckServiceabilityRequest request)
    {
        var result = await _service.CheckServiceabilityAsync(request);
        return Ok(ApiResponse<ServiceabilityResultDto>.SuccessResponse(result));
    }
}
