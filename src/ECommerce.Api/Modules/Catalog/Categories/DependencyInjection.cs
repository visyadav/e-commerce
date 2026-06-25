using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Catalog.Categories;

public static class DependencyInjection
{
    public static IServiceCollection AddCategoriesModule(this IServiceCollection services)
    {
        return services;
    }
}
