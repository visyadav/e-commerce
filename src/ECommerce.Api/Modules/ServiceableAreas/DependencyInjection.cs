using ECommerce.Api.Modules.ServiceableAreas.Interfaces;
using ECommerce.Api.Modules.ServiceableAreas.Services;
using ECommerce.Shared.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.ServiceableAreas;

public static class DependencyInjection
{
    public static IServiceCollection AddServiceableAreasModule(this IServiceCollection services)
    {
        services.AddScopedWithLogging<IServiceableAreaService, ServiceableAreaService>();
        return services;
    }
}
