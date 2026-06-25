using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Reviews;

public static class DependencyInjection
{
    public static IServiceCollection AddReviewsModule(this IServiceCollection services)
    {
        return services;
    }
}
