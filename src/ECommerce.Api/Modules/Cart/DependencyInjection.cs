using ECommerce.Shared.Logging;
using ECommerce.Api.Modules.Cart.Interfaces;
using ECommerce.Api.Modules.Cart.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Cart;

public static class DependencyInjection
{
    public static IServiceCollection AddCartModule(this IServiceCollection services)
    {
        services.AddScopedWithLogging<ICartService, CartService>();
        return services;
    }
}
