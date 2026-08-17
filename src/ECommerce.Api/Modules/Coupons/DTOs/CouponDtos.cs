namespace ECommerce.Api.Modules.Coupons.DTOs;

public class CouponDto
{
    public Guid Id { get; set; }
    public required string Code { get; set; }
    public string? Description { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal MinOrderAmount { get; set; }
    public int MaxUsageCount { get; set; }
    public int CurrentUsageCount { get; set; }
    public int MaxUsagePerUser { get; set; } = 1;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public Guid? ProductId { get; set; }
    public string? ProductName { get; set; }
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
}

public class CreateCouponRequest
{
    public required string Code { get; set; }
    public string? Description { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal MinOrderAmount { get; set; } = 0;
    public int MaxUsageCount { get; set; } = 1000;
    public int MaxUsagePerUser { get; set; } = 1;
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime EndDate { get; set; } = DateTime.UtcNow.AddMonths(3);
    public bool IsActive { get; set; } = true;
    public Guid? ProductId { get; set; }
    public Guid? CategoryId { get; set; }
}

public class UpdateCouponRequest
{
    public required string Code { get; set; }
    public string? Description { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal MinOrderAmount { get; set; }
    public int MaxUsageCount { get; set; }
    public int MaxUsagePerUser { get; set; } = 1;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public Guid? ProductId { get; set; }
    public Guid? CategoryId { get; set; }
}

public class CartItemValidationDto
{
    public Guid ProductId { get; set; }
    public Guid? CategoryId { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int Quantity { get; set; }
}

public class ApplyCouponRequest
{
    public required string Code { get; set; }
    public string? UserId { get; set; }
    public List<CartItemValidationDto> Items { get; set; } = new();
}

public class CouponValidationResultDto
{
    public bool IsValid { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal DiscountAmount { get; set; }
    public decimal EligibleSubtotal { get; set; }
    public decimal ExcludedSubtotal { get; set; }
    public decimal FinalAmount { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class CouponUsageLogDto
{
    public Guid Id { get; set; }
    public Guid CouponId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserFullName { get; set; } = string.Empty;
    public string UserPhone { get; set; } = string.Empty;
    public Guid? OrderId { get; set; }
    public decimal DiscountAmount { get; set; }
    public DateTime UsedAt { get; set; }
}
