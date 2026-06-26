using ECommerce.Api.Configurations;
using ECommerce.Api.Middleware;
using ECommerce.Infrastructure.Persistence.Seed;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ECommerce.Api.Extensions;

public static class ApplicationBuilderExtensions
{
    public static IApplicationBuilder UseApiPipeline(this IApplicationBuilder app, IHostEnvironment env)
    {
        // 1. Global Exception Handling
        app.UseMiddleware<ExceptionHandlingMiddleware>();

        // 2. Request Logging
        app.UseMiddleware<RequestLoggingMiddleware>();

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "E-Commerce API v1");
                c.RoutePrefix = "swagger"; // Expose Swagger at /swagger
            });
        }

        if (!env.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }

        // Serve uploaded files (from local storage)
        app.UseStaticFiles();

        app.UseRouting();

        // CORS
        app.UseCors(CorsConfiguration.CorsPolicyName);

        // Auth
        app.UseAuthentication();
        app.UseAuthorization();

        return app;
    }

    public static async Task SeedDatabaseAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<DataSeeder>>();

        try
        {
            logger.LogInformation("Checking database migration and seeding...");
            var seeder = services.GetRequiredService<DataSeeder>();
            await seeder.SeedAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while migrating or seeding the database.");
        }
    }
}
