using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ECommerce.Api.Configurations;

public static class SwaggerConfiguration
{
    public static void ConfigureSwagger(this SwaggerGenOptions options)
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "E-Commerce Modular Monolith API",
            Version = "v1",
            Description = "API endpoints for the B2C E-Commerce Modular Monolith Platform."
        });

        // Configure JWT Authentication in Swagger
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Paste your JWT token directly."
        });

        options.AddSecurityRequirement(doc => new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecuritySchemeReference("Bearer", doc),
                new List<string>()
            }
        });
    }
}
