namespace ECommerce.Infrastructure.Identity;

public class JwtSettings
{
    public string Secret { get; set; } = "SuperSecretKey_MustBeAtLeast32BytesLong_ECommerce2026!";
    public string Issuer { get; set; } = "ECommerceApi";
    public string Audience { get; set; } = "ECommerceClient";
    public int AccessTokenExpirationMinutes { get; set; } = 30;
    public int RefreshTokenExpirationDays { get; set; } = 7;
}
