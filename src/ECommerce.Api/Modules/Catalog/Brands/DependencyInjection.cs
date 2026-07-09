using ECommerce.Shared.Logging;
using ECommerce.Api.Modules.Catalog.Brands.Interfaces;
using ECommerce.Api.Modules.Catalog.Brands.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Catalog.Brands;

public static class DependencyInjection
{
    public static IServiceCollection AddBrandsModule(this IServiceCollection services)
    {
        services.AddScopedWithLogging<IBrandService, BrandService>();
        return services;
    }
}
