namespace ECommerce.Api.Modules.Authentication.DTOs;

public class ChangePasswordRequest
{
    public required string CurrentPassword { get; set; }
    public required string NewPassword { get; set; }
}
