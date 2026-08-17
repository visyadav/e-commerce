using ECommerce.Api.Modules.Coupons.DTOs;
using ECommerce.Api.Modules.Coupons.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Shared.Exceptions;
using ECommerce.Shared.Responses;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Modules.Coupons.Services;

public class CouponService : ICouponService
{
    private readonly IUnitOfWork _unitOfWork;

    public CouponService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<IEnumerable<CouponDto>>> GetAllCouponsAsync(CancellationToken cancellationToken = default)
    {
        var coupons = await _unitOfWork.Repository<Coupon>().Query()
            .Include(c => c.Product)
            .Include(c => c.Category)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        var dtos = coupons.Select(MapToDto);
        return ApiResponse<IEnumerable<CouponDto>>.SuccessResponse(dtos, "Coupons retrieved successfully.");
    }

    public async Task<ApiResponse<CouponDto>> GetCouponByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var coupon = await _unitOfWork.Repository<Coupon>().Query()
            .Include(c => c.Product)
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (coupon == null) throw new NotFoundException(nameof(Coupon), id);

        return ApiResponse<CouponDto>.SuccessResponse(MapToDto(coupon), "Coupon retrieved successfully.");
    }

    public async Task<ApiResponse<CouponDto>> CreateCouponAsync(CreateCouponRequest request, CancellationToken cancellationToken = default)
    {
        var cleanCode = request.Code.Trim().ToUpper();
        var existing = await _unitOfWork.Repository<Coupon>().Query()
            .FirstOrDefaultAsync(c => c.Code == cleanCode, cancellationToken);

        if (existing != null)
        {
            return ApiResponse<CouponDto>.FailureResponse($"Coupon code '{cleanCode}' already exists.");
        }

        var coupon = new Coupon
        {
            Code = cleanCode,
            Description = request.Description,
            DiscountPercentage = request.DiscountPercentage,
            MaxDiscountAmount = request.MaxDiscountAmount,
            MinOrderAmount = request.MinOrderAmount,
            MaxUsageCount = request.MaxUsageCount,
            MaxUsagePerUser = request.MaxUsagePerUser > 0 ? request.MaxUsagePerUser : 1,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsActive = request.IsActive,
            ProductId = request.ProductId,
            CategoryId = request.CategoryId,
        };

        await _unitOfWork.Repository<Coupon>().AddAsync(coupon, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetCouponByIdAsync(coupon.Id, cancellationToken);
    }

    public async Task<ApiResponse<CouponDto>> UpdateCouponAsync(Guid id, UpdateCouponRequest request, CancellationToken cancellationToken = default)
    {
        var coupon = await _unitOfWork.Repository<Coupon>().GetByIdAsync(id, cancellationToken);
        if (coupon == null) throw new NotFoundException(nameof(Coupon), id);

        var cleanCode = request.Code.Trim().ToUpper();
        var existing = await _unitOfWork.Repository<Coupon>().Query()
            .FirstOrDefaultAsync(c => c.Code == cleanCode && c.Id != id, cancellationToken);

        if (existing != null)
        {
            return ApiResponse<CouponDto>.FailureResponse($"Coupon code '{cleanCode}' is already in use by another coupon.");
        }

        coupon.Code = cleanCode;
        coupon.Description = request.Description;
        coupon.DiscountPercentage = request.DiscountPercentage;
        coupon.MaxDiscountAmount = request.MaxDiscountAmount;
        coupon.MinOrderAmount = request.MinOrderAmount;
        coupon.MaxUsageCount = request.MaxUsageCount;
        coupon.MaxUsagePerUser = request.MaxUsagePerUser > 0 ? request.MaxUsagePerUser : 1;
        coupon.StartDate = request.StartDate;
        coupon.EndDate = request.EndDate;
        coupon.IsActive = request.IsActive;
        coupon.ProductId = request.ProductId;
        coupon.CategoryId = request.CategoryId;

        _unitOfWork.Repository<Coupon>().Update(coupon);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetCouponByIdAsync(id, cancellationToken);
    }

    public async Task<ApiResponse> DeleteCouponAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var coupon = await _unitOfWork.Repository<Coupon>().GetByIdAsync(id, cancellationToken);
        if (coupon == null) throw new NotFoundException(nameof(Coupon), id);

        _unitOfWork.Repository<Coupon>().Remove(coupon);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse.SuccessResponse("Coupon deleted successfully.");
    }

    public async Task<ApiResponse<CouponDto>> ToggleCouponStatusAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var coupon = await _unitOfWork.Repository<Coupon>().GetByIdAsync(id, cancellationToken);
        if (coupon == null) throw new NotFoundException(nameof(Coupon), id);

        coupon.IsActive = !coupon.IsActive;
        _unitOfWork.Repository<Coupon>().Update(coupon);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetCouponByIdAsync(id, cancellationToken);
    }

    public async Task<ApiResponse<IEnumerable<CouponUsageLogDto>>> GetCouponUsageLogsAsync(Guid couponId, CancellationToken cancellationToken = default)
    {
        var logs = await _unitOfWork.Repository<CouponUsageLog>().Query()
            .Include(u => u.Coupon)
            .Include(u => u.User)
            .Where(u => u.CouponId == couponId)
            .OrderByDescending(u => u.UsedAt)
            .ToListAsync(cancellationToken);

        var dtos = logs.Select(MapUsageLogToDto);
        return ApiResponse<IEnumerable<CouponUsageLogDto>>.SuccessResponse(dtos, "Coupon usage logs retrieved.");
    }

    public async Task<ApiResponse<IEnumerable<CouponUsageLogDto>>> GetAllUsageLogsAsync(CancellationToken cancellationToken = default)
    {
        var logs = await _unitOfWork.Repository<CouponUsageLog>().Query()
            .Include(u => u.Coupon)
            .Include(u => u.User)
            .OrderByDescending(u => u.UsedAt)
            .Take(500)
            .ToListAsync(cancellationToken);

        var dtos = logs.Select(MapUsageLogToDto);
        return ApiResponse<IEnumerable<CouponUsageLogDto>>.SuccessResponse(dtos, "All coupon usage logs retrieved.");
    }

    public async Task<ApiResponse> RecordCouponUsageAsync(Guid couponId, string userId, decimal discountAmount, Guid? orderId = null, CancellationToken cancellationToken = default)
    {
        var coupon = await _unitOfWork.Repository<Coupon>().GetByIdAsync(couponId, cancellationToken);
        if (coupon == null) throw new NotFoundException(nameof(Coupon), couponId);

        // Increment global usage counter
        coupon.CurrentUsageCount++;
        _unitOfWork.Repository<Coupon>().Update(coupon);

        // Record usage log
        var log = new CouponUsageLog
        {
            CouponId = couponId,
            UserId = userId,
            OrderId = orderId,
            DiscountAmount = discountAmount,
            UsedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<CouponUsageLog>().AddAsync(log, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse.SuccessResponse("Coupon usage recorded successfully.");
    }

    public async Task<ApiResponse<IEnumerable<CouponDto>>> GetActiveClientCouponsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var coupons = await _unitOfWork.Repository<Coupon>().Query()
            .Include(c => c.Product)
            .Include(c => c.Category)
            .Where(c => c.IsActive && now >= c.StartDate && now <= c.EndDate && c.CurrentUsageCount < c.MaxUsageCount)
            .OrderByDescending(c => c.DiscountPercentage)
            .ToListAsync(cancellationToken);

        var dtos = coupons.Select(MapToDto);
        return ApiResponse<IEnumerable<CouponDto>>.SuccessResponse(dtos, "Active client coupons retrieved.");
    }

    public async Task<ApiResponse<CouponValidationResultDto>> ValidateAndApplyCouponAsync(ApplyCouponRequest request, CancellationToken cancellationToken = default)
    {
        var cleanCode = request.Code.Trim().ToUpper();
        var coupon = await _unitOfWork.Repository<Coupon>().Query()
            .Include(c => c.Product)
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Code == cleanCode, cancellationToken);

        if (coupon == null)
        {
            return ApiResponse<CouponValidationResultDto>.SuccessResponse(new CouponValidationResultDto
            {
                IsValid = false,
                Code = cleanCode,
                Message = $"Coupon '{cleanCode}' not found. Please enter a valid coupon code."
            });
        }

        if (!coupon.IsActive)
        {
            return ApiResponse<CouponValidationResultDto>.SuccessResponse(new CouponValidationResultDto
            {
                IsValid = false,
                Code = cleanCode,
                Message = $"Coupon '{cleanCode}' is currently inactive."
            });
        }

        var now = DateTime.UtcNow;
        if (now < coupon.StartDate || now > coupon.EndDate)
        {
            return ApiResponse<CouponValidationResultDto>.SuccessResponse(new CouponValidationResultDto
            {
                IsValid = false,
                Code = cleanCode,
                Message = $"Coupon '{cleanCode}' has expired or is not active yet."
            });
        }

        if (coupon.CurrentUsageCount >= coupon.MaxUsageCount)
        {
            return ApiResponse<CouponValidationResultDto>.SuccessResponse(new CouponValidationResultDto
            {
                IsValid = false,
                Code = cleanCode,
                Message = $"Coupon '{cleanCode}' has reached its global maximum usage limit."
            });
        }

        // Per-User Usage Limit Check
        if (!string.IsNullOrWhiteSpace(request.UserId))
        {
            var userUsageCount = await _unitOfWork.Repository<CouponUsageLog>().Query()
                .CountAsync(u => u.CouponId == coupon.Id && u.UserId == request.UserId, cancellationToken);

            if (userUsageCount >= coupon.MaxUsagePerUser)
            {
                return ApiResponse<CouponValidationResultDto>.SuccessResponse(new CouponValidationResultDto
                {
                    IsValid = false,
                    Code = cleanCode,
                    Message = $"You have already used coupon '{cleanCode}' (limit: {coupon.MaxUsagePerUser} use per customer)."
                });
            }
        }

        // Exclude products that already have individual product-level discounts (OriginalPrice > UnitPrice)
        var excludedItems = request.Items.Where(i => i.OriginalPrice.HasValue && i.OriginalPrice.Value > i.UnitPrice).ToList();
        var nonDiscountedItems = request.Items.Where(i => !i.OriginalPrice.HasValue || i.OriginalPrice.Value <= i.UnitPrice).ToList();

        decimal excludedSubtotal = excludedItems.Sum(i => i.UnitPrice * i.Quantity);
        decimal eligibleSubtotal = 0;

        // Filter items based on coupon target (Product-Specific, Category-Specific, or General)
        List<CartItemValidationDto> eligibleItems;
        if (coupon.ProductId.HasValue)
        {
            eligibleItems = nonDiscountedItems.Where(i => i.ProductId == coupon.ProductId.Value).ToList();
        }
        else if (coupon.CategoryId.HasValue)
        {
            eligibleItems = nonDiscountedItems.Where(i => i.CategoryId == coupon.CategoryId.Value).ToList();
        }
        else
        {
            eligibleItems = nonDiscountedItems;
        }

        eligibleSubtotal = eligibleItems.Sum(i => i.UnitPrice * i.Quantity);

        if (eligibleSubtotal <= 0)
        {
            return ApiResponse<CouponValidationResultDto>.SuccessResponse(new CouponValidationResultDto
            {
                IsValid = false,
                Code = cleanCode,
                EligibleSubtotal = 0,
                ExcludedSubtotal = excludedSubtotal,
                Message = excludedSubtotal > 0
                    ? $"Coupon '{cleanCode}' cannot be applied. The items in your cart already have product discounts, and general coupons only apply to full-price products."
                    : $"No eligible items found in cart for coupon '{cleanCode}'."
            });
        }

        if (eligibleSubtotal < coupon.MinOrderAmount)
        {
            return ApiResponse<CouponValidationResultDto>.SuccessResponse(new CouponValidationResultDto
            {
                IsValid = false,
                Code = cleanCode,
                EligibleSubtotal = eligibleSubtotal,
                ExcludedSubtotal = excludedSubtotal,
                Message = $"Coupon '{cleanCode}' requires a minimum order amount of ₹{coupon.MinOrderAmount} on eligible non-discounted items (current eligible: ₹{eligibleSubtotal})."
            });
        }

        // Calculate discount amount
        decimal calculatedDiscount = Math.Round((eligibleSubtotal * coupon.DiscountPercentage) / 100m, 2);
        if (coupon.MaxDiscountAmount.HasValue && calculatedDiscount > coupon.MaxDiscountAmount.Value)
        {
            calculatedDiscount = coupon.MaxDiscountAmount.Value;
        }

        decimal totalCartAmount = request.Items.Sum(i => i.UnitPrice * i.Quantity);
        decimal finalAmount = Math.Max(0, totalCartAmount - calculatedDiscount);

        string message = $"Coupon '{cleanCode}' applied! Saved ₹{calculatedDiscount}";
        if (excludedSubtotal > 0)
        {
            message += $" (applied to ₹{eligibleSubtotal} full-price items; ₹{excludedSubtotal} in discounted items excluded).";
        }

        return ApiResponse<CouponValidationResultDto>.SuccessResponse(new CouponValidationResultDto
        {
            IsValid = true,
            Code = cleanCode,
            DiscountAmount = calculatedDiscount,
            EligibleSubtotal = eligibleSubtotal,
            ExcludedSubtotal = excludedSubtotal,
            FinalAmount = finalAmount,
            Message = message
        });
    }

    private static CouponDto MapToDto(Coupon c)
    {
        return new CouponDto
        {
            Id = c.Id,
            Code = c.Code,
            Description = c.Description,
            DiscountPercentage = c.DiscountPercentage,
            MaxDiscountAmount = c.MaxDiscountAmount,
            MinOrderAmount = c.MinOrderAmount,
            MaxUsageCount = c.MaxUsageCount,
            CurrentUsageCount = c.CurrentUsageCount,
            MaxUsagePerUser = c.MaxUsagePerUser,
            StartDate = c.StartDate,
            EndDate = c.EndDate,
            IsActive = c.IsActive,
            ProductId = c.ProductId,
            ProductName = c.Product?.Name,
            CategoryId = c.CategoryId,
            CategoryName = c.Category?.Name
        };
    }

    private static CouponUsageLogDto MapUsageLogToDto(CouponUsageLog u)
    {
        return new CouponUsageLogDto
        {
            Id = u.Id,
            CouponId = u.CouponId,
            Code = u.Coupon?.Code ?? string.Empty,
            UserId = u.UserId,
            UserFullName = u.User?.FullName ?? "Customer",
            UserPhone = u.User?.PhoneNumber ?? string.Empty,
            OrderId = u.OrderId,
            DiscountAmount = u.DiscountAmount,
            UsedAt = u.UsedAt
        };
    }
}
