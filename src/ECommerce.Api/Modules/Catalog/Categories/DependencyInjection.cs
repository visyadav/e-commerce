using ECommerce.Shared.Logging;
using ECommerce.Api.Modules.Catalog.Categories.Interfaces;
using ECommerce.Api.Modules.Catalog.Categories.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Catalog.Categories;

public static class DependencyInjection
{
    public static IServiceCollection AddCategoriesModule(this IServiceCollection services)
    {
        services.AddScopedWithLogging<ICategoryService, CategoryService>();
        return services;
    }
}
