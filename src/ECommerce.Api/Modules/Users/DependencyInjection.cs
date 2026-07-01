using ECommerce.Api.Modules.Users.Interfaces;
using ECommerce.Api.Modules.Users.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Users;

public static class DependencyInjection
{
    public static IServiceCollection AddUsersModule(this IServiceCollection services)
    {
        services.AddScoped<IProfileService, ProfileService>();
        return services;
    }
}
