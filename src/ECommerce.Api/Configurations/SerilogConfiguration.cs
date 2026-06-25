using Microsoft.Extensions.Hosting;
using Serilog;

namespace ECommerce.Api.Configurations;

public static class SerilogConfiguration
{
    public static void ConfigureSerilog(HostBuilderContext context, LoggerConfiguration loggerConfiguration)
    {
        loggerConfiguration
            .ReadFrom.Configuration(context.Configuration)
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .WriteTo.File(
                path: "logs/ecommerce-.txt",
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 30,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}");
    }
}
