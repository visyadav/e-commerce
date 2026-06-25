using ECommerce.Api.Modules.Navigation.Interfaces;
using ECommerce.Api.Modules.Navigation.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Navigation;

public static class DependencyInjection
{
    public static IServiceCollection AddNavigationModule(this IServiceCollection services)
    {
        services.AddScoped<INavigationService, NavigationService>();
        return services;
    }
}
