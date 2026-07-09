using ECommerce.Shared.Logging;
using ECommerce.Api.Modules.Inventory.Interfaces;
using ECommerce.Api.Modules.Inventory.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Inventory;

public static class DependencyInjection
{
    public static IServiceCollection AddInventoryModule(this IServiceCollection services)
    {
        services.AddScopedWithLogging<IInventoryService, InventoryService>();
        return services;
    }
}
