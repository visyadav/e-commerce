namespace ECommerce.Domain.Events;

public class OrderPlacedEvent
{
    public Guid OrderId { get; }
    public string UserId { get; }
    public string OrderNumber { get; }
    public decimal TotalAmount { get; }
    public DateTime OccurredAt { get; }

    public OrderPlacedEvent(Guid orderId, string userId, string orderNumber, decimal totalAmount)
    {
        OrderId = orderId;
        UserId = userId;
        OrderNumber = orderNumber;
        TotalAmount = totalAmount;
        OccurredAt = DateTime.UtcNow;
    }
}
