namespace ECommerce.Infrastructure.Payment;

public class PaymentGatewaySettings
{
    public string Provider { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
    public bool SandboxMode { get; set; } = true;
}
