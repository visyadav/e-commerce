namespace ECommerce.Domain.ValueObjects;

public class Address
{
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string? Phone { get; set; }

    public override string ToString()
    {
        return $"{Street}, {City}, {State} {ZipCode}, {Country}";
    }
}
