using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Payments;

public static class DependencyInjection
{
    public static IServiceCollection AddPaymentsModule(this IServiceCollection services)
    {
        return services;
    }
}
