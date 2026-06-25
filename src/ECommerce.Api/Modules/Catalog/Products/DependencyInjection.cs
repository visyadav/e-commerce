using ECommerce.Api.Modules.Catalog.Products.Interfaces;
using ECommerce.Api.Modules.Catalog.Products.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Catalog.Products;

public static class DependencyInjection
{
    public static IServiceCollection AddProductsModule(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        return services;
    }
}
