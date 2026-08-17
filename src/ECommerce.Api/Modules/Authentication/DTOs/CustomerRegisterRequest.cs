namespace ECommerce.Api.Modules.Authentication.DTOs;

public class CustomerRegisterRequest
{
    public required string PhoneNumber { get; set; }
    public required string Password { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? Email { get; set; }
}
