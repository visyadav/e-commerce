using ECommerce.Api.Extensions;
using ECommerce.Api.Modules.Catalog.Tags.Interfaces;
using ECommerce.Api.Modules.Catalog.Tags.Services;
using ECommerce.Shared.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Catalog.Tags;

public static class DependencyInjection
{
    public static IServiceCollection AddTagsModule(this IServiceCollection services)
    {
        services.AddScopedWithLogging<ITagService, TagService>();
        return services;
    }
}
