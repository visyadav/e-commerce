namespace ECommerce.Api.Modules.Authentication.DTOs;

public class ExternalLoginRequest
{
    public required string Provider { get; set; }
    public required string IdToken { get; set; }
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}
