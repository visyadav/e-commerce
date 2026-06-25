using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public required string Token { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? ReplacedByToken { get; set; }

    // Foreign Key
    public required string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => !IsRevoked && !IsExpired;
}
