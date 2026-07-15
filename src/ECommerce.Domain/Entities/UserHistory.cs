using System;
using System.ComponentModel.DataAnnotations;

namespace ECommerce.Domain.Entities;

public class UserHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;

    [Required]
    public string Action { get; set; } = string.Empty;

    public string? ChangedByUserId { get; set; }

    public string? Changes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
