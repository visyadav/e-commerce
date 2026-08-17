namespace ECommerce.Api.Modules.Authentication.DTOs;

public class MobileOtpLoginRequest
{
    public required string PhoneNumber { get; set; }
    public string? Otp { get; set; }
    public string? FullName { get; set; }
}
