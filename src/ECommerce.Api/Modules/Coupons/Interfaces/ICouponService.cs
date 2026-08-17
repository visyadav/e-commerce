using ECommerce.Api.Modules.Coupons.DTOs;
using ECommerce.Shared.Responses;

namespace ECommerce.Api.Modules.Coupons.Interfaces;

public interface ICouponService
{
    Task<ApiResponse<IEnumerable<CouponDto>>> GetAllCouponsAsync(CancellationToken cancellationToken = default);
    Task<ApiResponse<CouponDto>> GetCouponByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ApiResponse<CouponDto>> CreateCouponAsync(CreateCouponRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<CouponDto>> UpdateCouponAsync(Guid id, UpdateCouponRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse> DeleteCouponAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ApiResponse<CouponDto>> ToggleCouponStatusAsync(Guid id, CancellationToken cancellationToken = default);

    // Usage Logs Tracking
    Task<ApiResponse<IEnumerable<CouponUsageLogDto>>> GetCouponUsageLogsAsync(Guid couponId, CancellationToken cancellationToken = default);
    Task<ApiResponse<IEnumerable<CouponUsageLogDto>>> GetAllUsageLogsAsync(CancellationToken cancellationToken = default);
    Task<ApiResponse> RecordCouponUsageAsync(Guid couponId, string userId, decimal discountAmount, Guid? orderId = null, CancellationToken cancellationToken = default);

    // Client Mobile App Operations
    Task<ApiResponse<IEnumerable<CouponDto>>> GetActiveClientCouponsAsync(CancellationToken cancellationToken = default);
    Task<ApiResponse<CouponValidationResultDto>> ValidateAndApplyCouponAsync(ApplyCouponRequest request, CancellationToken cancellationToken = default);
}
