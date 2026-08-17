using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class UserAddress : BaseEntity
{
    public required string UserId { get; set; }
    public required string Label { get; set; } // Home, Office, Work, etc.
    public string? HouseNo { get; set; } // House / Flat / Building No.
    public required string Street { get; set; } // Street address or Area
    public string? Landmark { get; set; }
    public required string City { get; set; }
    public required string State { get; set; }
    public required string Country { get; set; }
    public required string ZipCode { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? Phone { get; set; }
    public bool IsDefaultShipping { get; set; }
    public bool IsDefaultBilling { get; set; }

    // Navigation
    public ApplicationUser User { get; set; } = null!;
}
