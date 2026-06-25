using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Inventory;

public static class DependencyInjection
{
    public static IServiceCollection AddInventoryModule(this IServiceCollection services)
    {
        return services;
    }
}
