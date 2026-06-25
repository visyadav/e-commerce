using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Configurations;

public static class RedisConfiguration
{
    public static IServiceCollection AddCustomCaching(this IServiceCollection services, IConfiguration configuration)
    {
        var redisEnabled = configuration.GetValue<bool>("Redis:Enabled");

        if (redisEnabled)
        {
            var connectionString = configuration.GetValue<string>("Redis:ConnectionString");
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = connectionString;
                options.InstanceName = "ECommerce_";
            });
        }
        else
        {
            services.AddDistributedMemoryCache();
        }

        return services;
    }
}
