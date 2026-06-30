using ECommerce.Api.Modules.Catalog.Categories.Interfaces;
using ECommerce.Api.Modules.Catalog.Categories.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Catalog.Categories;

public static class DependencyInjection
{
    public static IServiceCollection AddCategoriesModule(this IServiceCollection services)
    {
        services.AddScoped<ICategoryService, CategoryService>();
        return services;
    }
}
