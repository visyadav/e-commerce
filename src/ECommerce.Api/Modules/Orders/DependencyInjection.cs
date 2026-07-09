using ECommerce.Shared.Logging;
using ECommerce.Api.Modules.Orders.Interfaces;
using ECommerce.Api.Modules.Orders.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Orders;

public static class DependencyInjection
{
    public static IServiceCollection AddOrdersModule(this IServiceCollection services)
    {
        services.AddScopedWithLogging<IOrderService, OrderService>();
        return services;
    }
}
