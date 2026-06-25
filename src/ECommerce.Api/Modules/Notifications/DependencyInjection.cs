using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Notifications;

public static class DependencyInjection
{
    public static IServiceCollection AddNotificationsModule(this IServiceCollection services)
    {
        return services;
    }
}
