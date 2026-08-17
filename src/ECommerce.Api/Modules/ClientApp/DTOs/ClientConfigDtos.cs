namespace ECommerce.Api.Modules.ClientApp.DTOs;

public class ClientAppConfigDto
{
    public string PrimaryColor { get; set; } = "#059669";
    public string PrimaryDarkColor { get; set; } = "#047857";
    public string AccentColor { get; set; } = "#F59E0B";
    public string PromoBannerText { get; set; } = "Fresh Organic Milk Delivered Daily by 7 AM 🥛";
    public bool IsGeofencingEnabled { get; set; } = true;
    public double MaxServiceRadiusKm { get; set; } = 5.0;
    public bool IsMaintenanceMode { get; set; } = false;
    public string MaintenanceMessage { get; set; } = string.Empty;
    public string LatestAppVersion { get; set; } = "1.0.0";
    public bool ForceUpdateRequired { get; set; } = false;
}
