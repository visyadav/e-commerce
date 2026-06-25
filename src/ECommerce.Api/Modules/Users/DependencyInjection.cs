using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Users;

public static class DependencyInjection
{
    public static IServiceCollection AddUsersModule(this IServiceCollection services)
    {
        return services;
    }
}
