using System.Reflection;
using ECommerce.Api.Configurations;
using ECommerce.Api.Filters;
using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Add CORS
        services.AddCustomCors();

        // 2. Add Caching (Redis or In-Memory)
        services.AddCustomCaching(configuration);

        // 3. Add Custom Authorization Policies
        services.AddCustomAuthorization();

        // 4. Add AutoMapper for all profiles in the solution
        services.AddAutoMapper(cfg => cfg.AddMaps(AppDomain.CurrentDomain.GetAssemblies()));

        // 5. Add FluentValidation and register all validators in the Api assembly
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        
        // 6. Configure Swagger with JWT support
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options => options.ConfigureSwagger());

        // 7. Configure Controllers with Global Validation and Logging Filters
        services.AddControllers(options =>
        {
            options.Filters.Add<ValidationFilter>();
            options.Filters.Add<LoggingActionFilter>();
        });

        // 8. HttpContextAccessor for CurrentUserService
        services.AddHttpContextAccessor();

        return services;
    }
}
