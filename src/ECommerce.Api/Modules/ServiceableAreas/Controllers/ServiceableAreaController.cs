using ECommerce.Shared.Responses;
using ECommerce.Api.Modules.ServiceableAreas.DTOs;
using ECommerce.Api.Modules.ServiceableAreas.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.ServiceableAreas.Controllers;

[ApiController]
[Route("api/v1")]
public class ServiceableAreaController(IServiceableAreaService service) : ControllerBase
{
    // --- Admin Endpoints ---

    [HttpGet("admin/serviceable-areas")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ServiceableAreaDto>>>> GetAllAdminAreas()
    {
        var areas = await service.GetAllAreasAsync();
        return Ok(ApiResponse<IEnumerable<ServiceableAreaDto>>.SuccessResponse(areas, "Serviceable areas fetched successfully"));
    }

    [HttpGet("admin/serviceable-areas/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<ServiceableAreaDto>>> GetAreaById(Guid id)
    {
        var area = await service.GetAreaByIdAsync(id);
        if (area == null)
            return NotFound(ApiResponse<ServiceableAreaDto>.FailureResponse("Serviceable area not found"));

        return Ok(ApiResponse<ServiceableAreaDto>.SuccessResponse(area));
    }

    [HttpPost("admin/serviceable-areas")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<ServiceableAreaDto>>> CreateArea([FromBody] CreateServiceableAreaRequest request)
    {
        var area = await service.CreateAreaAsync(request);
        return CreatedAtAction(nameof(GetAreaById), new { id = area.Id }, ApiResponse<ServiceableAreaDto>.SuccessResponse(area, "Serviceable area created successfully"));
    }

    [HttpPut("admin/serviceable-areas/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<ServiceableAreaDto>>> UpdateArea(Guid id, [FromBody] UpdateServiceableAreaRequest request)
    {
        var area = await service.UpdateAreaAsync(id, request);
        if (area == null)
            return NotFound(ApiResponse<ServiceableAreaDto>.FailureResponse("Serviceable area not found"));

        return Ok(ApiResponse<ServiceableAreaDto>.SuccessResponse(area, "Serviceable area updated successfully"));
    }

    [HttpDelete("admin/serviceable-areas/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteArea(Guid id)
    {
        var success = await service.DeleteAreaAsync(id);
        if (!success)
            return NotFound(ApiResponse<bool>.FailureResponse("Serviceable area not found"));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Serviceable area deleted successfully"));
    }

    // --- Client / Mobile App Endpoints ---

    [HttpGet("client/serviceable-areas")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ServiceableAreaDto>>>> GetClientAreas()
    {
        var areas = await service.GetAllAreasAsync();
        var activeAreas = areas.Where(a => a.IsActive);
        return Ok(ApiResponse<IEnumerable<ServiceableAreaDto>>.SuccessResponse(activeAreas));
    }

    [HttpPost("client/serviceable-areas/check")]
    public async Task<ActionResult<ApiResponse<ServiceabilityResultDto>>> CheckServiceability([FromBody] CheckServiceabilityRequest request)
    {
        var result = await service.CheckServiceabilityAsync(request);
        return Ok(ApiResponse<ServiceabilityResultDto>.SuccessResponse(result));
    }
}
