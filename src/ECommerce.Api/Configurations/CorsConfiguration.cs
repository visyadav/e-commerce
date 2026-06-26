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
                builder.WithOrigins(
                            "http://localhost:3000", 
                            "https://localhost:3000",
                            "http://127.0.0.1:3000",
                            "http://localhost:5173",
                            "http://127.0.0.1:5173",
                            "http://localhost:4200"
                        )
                       .AllowAnyMethod()
                       .AllowAnyHeader()
                       .AllowCredentials();
            });
        });

        return services;
    }
}
