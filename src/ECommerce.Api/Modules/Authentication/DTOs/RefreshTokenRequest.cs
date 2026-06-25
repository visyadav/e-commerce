namespace ECommerce.Api.Modules.Authentication.DTOs;

public class RefreshTokenRequest
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
}
