using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Modules.Wishlist;

public static class DependencyInjection
{
    public static IServiceCollection AddWishlistModule(this IServiceCollection services)
    {
        return services;
    }
}
