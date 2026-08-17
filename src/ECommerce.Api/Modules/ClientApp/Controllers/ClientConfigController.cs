using ECommerce.Api.Modules.ClientApp.DTOs;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Modules.ClientApp.Controllers;

[ApiController]
[Route("api/v1/client/config")]
public class ClientConfigController : ControllerBase
{
    [HttpGet]
    public ActionResult<ApiResponse<ClientAppConfigDto>> GetAppConfig()
    {
        var config = new ClientAppConfigDto
        {
            PrimaryColor = "#059669",
            PrimaryDarkColor = "#047857",
            AccentColor = "#F59E0B",
            PromoBannerText = "Fresh Organic Milk Delivered Daily by 7 AM 🥛",
            IsGeofencingEnabled = true,
            MaxServiceRadiusKm = 5.0,
            IsMaintenanceMode = false,
            LatestAppVersion = "1.0.0",
            ForceUpdateRequired = false
        };

        return Ok(ApiResponse<ClientAppConfigDto>.SuccessResponse(config));
    }
}
