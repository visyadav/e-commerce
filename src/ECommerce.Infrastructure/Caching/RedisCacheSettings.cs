namespace ECommerce.Infrastructure.Caching;

public class RedisCacheSettings
{
    public string ConnectionString { get; set; } = "localhost:6379";
    public string InstanceName { get; set; } = "ECommerce_";
    public int DefaultExpirationMinutes { get; set; } = 30;
    public bool Enabled { get; set; }
}
