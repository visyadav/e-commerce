using ECommerce.Api.Modules.ClientApp.Interfaces;
using ECommerce.Api.Modules.ClientApp.Services;
using ECommerce.Shared.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.ClientApp;

public static class DependencyInjection
{
    public static IServiceCollection AddClientApp(this IServiceCollection services)
    {
        services.AddScopedWithLogging<IClientAddressService, ClientAddressService>();
        services.AddScopedWithLogging<IClientProductService, ClientProductService>();
        return services;
    }
}