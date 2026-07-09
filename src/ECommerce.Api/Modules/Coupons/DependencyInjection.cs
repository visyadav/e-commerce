using ECommerce.Shared.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Coupons;

public static class DependencyInjection
{
    public static IServiceCollection AddCouponsModule(this IServiceCollection services)
    {
        return services;
    }
}
