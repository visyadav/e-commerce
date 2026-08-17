namespace ECommerce.Api.Modules.ServiceableAreas.DTOs;

public class ServiceableAreaDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string City { get; set; }
    public required string State { get; set; }
    public required string Pincode { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double RadiusInKm { get; set; }
    public bool IsActive { get; set; }
    public TimeSpan CutoffTime { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateServiceableAreaRequest
{
    public required string Name { get; set; }
    public required string City { get; set; }
    public required string State { get; set; }
    public required string Pincode { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double RadiusInKm { get; set; } = 5.0;
    public bool IsActive { get; set; } = true;
    public TimeSpan CutoffTime { get; set; } = new TimeSpan(23, 59, 0);
}

public class UpdateServiceableAreaRequest
{
    public required string Name { get; set; }
    public required string City { get; set; }
    public required string State { get; set; }
    public required string Pincode { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double RadiusInKm { get; set; }
    public bool IsActive { get; set; }
    public TimeSpan CutoffTime { get; set; }
}

public class CheckServiceabilityRequest
{
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? Pincode { get; set; }
    public string? SectorOrAddress { get; set; }
}

public class ServiceabilityResultDto
{
    public bool IsServiceable { get; set; }
    public string? MatchedHubName { get; set; }
    public double DistanceInKm { get; set; }
    public double AllowedRadiusKm { get; set; }
    public required string Message { get; set; }
}
