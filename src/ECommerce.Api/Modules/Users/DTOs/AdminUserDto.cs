using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.Modules.Users.DTOs;

public class AdminUserDto
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; }
    public IList<string> Roles { get; set; } = new List<string>();
    public string? CreatedBy { get; set; }
    public string? CreatedByName { get; set; }
}

public class AdminUserDetailsDto : AdminUserDto
{
    public string? ProfileImageUrl { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? ZipCode { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string ThemeColor { get; set; } = "default";
}

public class ToggleUserStatusRequest
{
    [Required]
    public bool IsActive { get; set; }
}

public class UpdateAdminUserRequest
{
    [Required]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    public string LastName { get; set; } = string.Empty;
    
    public string? PhoneNumber { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? ZipCode { get; set; }
    public string ThemeColor { get; set; } = "default";
}
