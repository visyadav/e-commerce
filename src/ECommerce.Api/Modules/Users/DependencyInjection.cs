using ECommerce.Shared.Logging;
using ECommerce.Api.Modules.Users.Interfaces;
using ECommerce.Api.Modules.Users.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Users;

public static class DependencyInjection
{
    public static IServiceCollection AddUsersModule(this IServiceCollection services)
    {
        services.AddScopedWithLogging<IProfileService, ProfileService>();
        services.AddScopedWithLogging<IAdminUserService, AdminUserService>();
        return services;
    }
}
