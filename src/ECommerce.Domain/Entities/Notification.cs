using ECommerce.Domain.Common;
using ECommerce.Domain.Enums;

namespace ECommerce.Domain.Entities;

public class Notification : BaseEntity
{
    public required string Title { get; set; }
    public required string Message { get; set; }
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public string? ActionUrl { get; set; }

    // Foreign Key
    public required string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
}
