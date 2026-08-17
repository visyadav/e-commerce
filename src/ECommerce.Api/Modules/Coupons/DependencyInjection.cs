using ECommerce.Api.Modules.Coupons.Interfaces;
using ECommerce.Api.Modules.Coupons.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Coupons;

public static class DependencyInjection
{
    public static IServiceCollection AddCouponsModule(this IServiceCollection services)
    {
        services.AddScoped<ICouponService, CouponService>();
        return services;
    }
}
