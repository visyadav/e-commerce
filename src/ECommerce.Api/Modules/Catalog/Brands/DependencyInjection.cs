using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Catalog.Brands;

public static class DependencyInjection
{
    public static IServiceCollection AddBrandsModule(this IServiceCollection services)
    {
        return services;
    }
}
