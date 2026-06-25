using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Configurations;

public static class AuthenticationConfiguration
{
    public static IServiceCollection AddCustomAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminOnly", policy => policy.RequireRole("SuperAdmin", "Admin"));
            options.AddPolicy("SuperAdminOnly", policy => policy.RequireRole("SuperAdmin"));
            options.AddPolicy("CustomerOnly", policy => policy.RequireRole("Customer"));
        });

        return services;
    }
}
