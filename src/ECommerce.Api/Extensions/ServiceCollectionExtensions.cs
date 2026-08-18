using System.Reflection;
using ECommerce.Api.Configurations;
using ECommerce.Api.Filters;
using FluentValidation;
using ECommerce.Api.Modules.Admin;
using ECommerce.Api.Modules.Authentication;
using ECommerce.Api.Modules.Cart;
using ECommerce.Api.Modules.Catalog.Brands;
using ECommerce.Api.Modules.Catalog.Categories;
using ECommerce.Api.Modules.Catalog.Products;
using ECommerce.Api.Modules.Catalog.Tags;
using ECommerce.Api.Modules.ClientApp;
using ECommerce.Api.Modules.Coupons;
using ECommerce.Api.Modules.Dashboard;
using ECommerce.Api.Modules.Inventory;
using ECommerce.Api.Modules.Navigation;
using ECommerce.Api.Modules.Notifications;
using ECommerce.Api.Modules.Orders;
using ECommerce.Api.Modules.Payments;
using ECommerce.Api.Modules.Reviews;
using ECommerce.Api.Modules.Users;
using ECommerce.Api.Modules.Wishlist;
using ECommerce.Api.Modules.ServiceableAreas;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Add CORS
        services.AddCustomCors();

        // 2. Add Caching (Redis or In-Memory)
        services.AddCustomCaching(configuration);

        // 3. Add Custom Authorization Policies
        services.AddCustomAuthorization();

        // 4. Add AutoMapper for all profiles in the solution
        services.AddAutoMapper(cfg => cfg.AddMaps(AppDomain.CurrentDomain.GetAssemblies()));

        // 5. Add FluentValidation and register all validators in the Api assembly
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        
        // 6. Configure Swagger with JWT support
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options => options.ConfigureSwagger());

        // 7. Configure Controllers with Global Validation, Logging Filters, and Enum String Converter
        services.AddControllers(options =>
        {
            options.Filters.Add<ValidationFilter>();
            options.Filters.Add<LoggingActionFilter>();
        })
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        });

        // 8. HttpContextAccessor for CurrentUserService
        services.AddHttpContextAccessor();

        // 9. Register Application Feature Modules
        services.AddAuthenticationModule();
        services.AddUsersModule();
        services.AddProductsModule();
        services.AddCategoriesModule();
        services.AddBrandsModule();
        services.AddTagsModule();
        services.AddCartModule();
        services.AddOrdersModule();
        services.AddPaymentsModule();
        services.AddInventoryModule();
        services.AddCouponsModule();
        services.AddWishlistModule();
        services.AddReviewsModule();
        services.AddNotificationsModule();
        services.AddDashboardModule();
        services.AddAdminModule();
        services.AddNavigationModule();
        services.AddClientApp();
        services.AddServiceableAreasModule();

        return services;
    }
}
