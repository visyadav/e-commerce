using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Configurations;

public static class CorsConfiguration
{
    public const string CorsPolicyName = "ECommerceCorsPolicy";

    public static IServiceCollection AddCustomCors(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(CorsPolicyName, builder =>
            {
                builder.AllowAnyOrigin() // In production, replace with specific origins
                       .AllowAnyMethod()
                       .AllowAnyHeader();
            });
        });

        return services;
    }
}
