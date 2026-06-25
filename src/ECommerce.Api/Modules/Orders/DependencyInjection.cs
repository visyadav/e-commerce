using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Orders;

public static class DependencyInjection
{
    public static IServiceCollection AddOrdersModule(this IServiceCollection services)
    {
        return services;
    }
}
