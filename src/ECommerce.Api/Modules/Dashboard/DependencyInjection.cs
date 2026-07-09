using ECommerce.Shared.Logging;
using ECommerce.Api.Modules.Dashboard.Interfaces;
using ECommerce.Api.Modules.Dashboard.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Dashboard;

public static class DependencyInjection
{
    public static IServiceCollection AddDashboardModule(this IServiceCollection services)
    {
        services.AddScopedWithLogging<IDashboardService, DashboardService>();
        return services;
    }
}
