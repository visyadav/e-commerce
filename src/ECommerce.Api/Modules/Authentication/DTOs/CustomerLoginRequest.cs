namespace ECommerce.Api.Modules.Authentication.DTOs;

public class CustomerLoginRequest
{
    /// <summary>
    /// Mobile phone number or Email address
    /// </summary>
    public required string Identifier { get; set; }
    public required string Password { get; set; }
}
