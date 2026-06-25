using ECommerce.Domain.Common;
using ECommerce.Domain.Enums;

namespace ECommerce.Domain.Entities;

public class Payment : AuditableEntity
{
    public required string TransactionId { get; set; }
    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public PaymentMethod Method { get; set; }
    public string? GatewayResponse { get; set; }
    public DateTime? PaidAt { get; set; }

    // Foreign Key
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
}
