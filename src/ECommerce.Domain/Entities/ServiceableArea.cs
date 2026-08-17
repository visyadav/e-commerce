using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class ServiceableArea : BaseEntity
{
    public required string Name { get; set; } // e.g. "Sector 62 Hub - Noida"
    public required string City { get; set; } // "Noida"
    public required string State { get; set; } // "Uttar Pradesh"
    public required string Pincode { get; set; } // "201309"
    
    public double Latitude { get; set; } // Center Latitude e.g. 28.6280
    public double Longitude { get; set; } // Center Longitude e.g. 77.3649
    public double RadiusInKm { get; set; } = 5.0; // Delivery Radius in KM

    public bool IsActive { get; set; } = true;
    public TimeSpan CutoffTime { get; set; } = new TimeSpan(23, 59, 0); // 11:59 PM cutoff for morning delivery
}
