using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Admin;

public static class DependencyInjection
{
    public static IServiceCollection AddAdminModule(this IServiceCollection services)
    {
        return services;
    }
}
