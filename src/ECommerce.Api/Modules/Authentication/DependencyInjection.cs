using ECommerce.Shared.Logging;
using ECommerce.Api.Modules.Authentication.Interfaces;
using ECommerce.Api.Modules.Authentication.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Authentication;

public static class DependencyInjection
{
    public static IServiceCollection AddAuthenticationModule(this IServiceCollection services)
    {
        services.AddScopedWithLogging<IAuthService, AuthService>();
        return services;
    }
}
