using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Reflection;

namespace ECommerce.Shared.Logging;

public static class LoggingExtensions
{
    public static IServiceCollection AddScopedWithLogging<TInterface, TImplementation>(this IServiceCollection services)
        where TInterface : class
        where TImplementation : class, TInterface
    {
        services.AddScoped<TImplementation>();
        services.AddScoped<TInterface>(provider =>
        {
            var target = provider.GetRequiredService<TImplementation>();
            var loggerFactory = provider.GetRequiredService<ILoggerFactory>();
            var logger = loggerFactory.CreateLogger<TImplementation>();
            return LoggingDispatchProxy.Create<TInterface>(target, logger);
        });

        return services;
    }
}
