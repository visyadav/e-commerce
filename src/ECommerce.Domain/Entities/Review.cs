using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Review : AuditableEntity
{
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Comment { get; set; }
    public bool IsApproved { get; set; }

    // Foreign Keys
    public required string UserId { get; set; }
    public Guid ProductId { get; set; }

    // Navigation
    public ApplicationUser User { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
