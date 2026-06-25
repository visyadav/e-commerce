using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Dashboard;

public static class DependencyInjection
{
    public static IServiceCollection AddDashboardModule(this IServiceCollection services)
    {
        return services;
    }
}
