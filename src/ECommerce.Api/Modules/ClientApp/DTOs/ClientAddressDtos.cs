namespace ECommerce.Api.Modules.ClientApp.DTOs;

public class ClientUserAddressDto
{
    public Guid Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string? HouseNo { get; set; }
    public string Street { get; set; } = string.Empty;
    public string? Landmark { get; set; }
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? Phone { get; set; }
    public bool IsDefaultShipping { get; set; }
}

public class CreateClientUserAddressRequest
{
    public string Label { get; set; } = "Home";
    public string? HouseNo { get; set; }
    public required string Street { get; set; }
    public string? Landmark { get; set; }
    public string City { get; set; } = "Noida";
    public string State { get; set; } = "Uttar Pradesh";
    public string Country { get; set; } = "India";
    public required string ZipCode { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? Phone { get; set; }
    public bool IsDefaultShipping { get; set; } = true;
}
