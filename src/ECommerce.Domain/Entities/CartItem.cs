using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class CartItem : BaseEntity
{
    public int Quantity { get; set; }

    // Foreign Keys
    public required string UserId { get; set; }
    public Guid ProductId { get; set; }

    // Navigation
    public ApplicationUser User { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
