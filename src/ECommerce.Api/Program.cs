using ECommerce.Api.Extensions;
using ECommerce.Infrastructure;
using ECommerce.Api.Configurations;
using Serilog;

// Import all module DI namespaces
using ECommerce.Api.Modules.Authentication;
using ECommerce.Api.Modules.Navigation;
using ECommerce.Api.Modules.Catalog.Products;
using ECommerce.Api.Modules.Catalog.Categories;
using ECommerce.Api.Modules.Catalog.Brands;
using ECommerce.Api.Modules.Users;
using ECommerce.Api.Modules.Inventory;
using ECommerce.Api.Modules.Cart;
using ECommerce.Api.Modules.Wishlist;
using ECommerce.Api.Modules.Orders;
using ECommerce.Api.Modules.Payments;
using ECommerce.Api.Modules.Coupons;
using ECommerce.Api.Modules.Reviews;
using ECommerce.Api.Modules.Notifications;
using ECommerce.Api.Modules.Dashboard;
using ECommerce.Api.Modules.Admin;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure Serilog
builder.Host.UseSerilog(SerilogConfiguration.ConfigureSerilog);

// 2. Add Infrastructure Layer Services (Identity, EF Core DB, JWT, Repositories, etc.)
builder.Services.AddInfrastructure(builder.Configuration);

// 3. Add Presentation/API Core Services (CORS, Caching, AutoMapper, FluentValidation, Swagger, etc.)
builder.Services.AddApiServices(builder.Configuration);

// 4. Add Monolith Modules Services
builder.Services.AddAuthenticationModule();
builder.Services.AddNavigationModule();
builder.Services.AddProductsModule();

// Stubs for future modules to preserve compilation & structural integrity
builder.Services.AddUsersModule();
builder.Services.AddCategoriesModule();
builder.Services.AddBrandsModule();
builder.Services.AddInventoryModule();
builder.Services.AddCartModule();
builder.Services.AddWishlistModule();
builder.Services.AddOrdersModule();
builder.Services.AddPaymentsModule();
builder.Services.AddCouponsModule();
builder.Services.AddReviewsModule();
builder.Services.AddNotificationsModule();
builder.Services.AddDashboardModule();
builder.Services.AddAdminModule();

var app = builder.Build();

// 5. Configure HTTP Request Pipeline
app.UseApiPipeline(app.Environment);

app.MapControllers();

// 6. Seed Database (Roles, Admin, Categories, Brands, MenuItems)
if (args.Contains("--seed") || app.Environment.IsDevelopment())
{
    await app.SeedDatabaseAsync();
}

try
{
    Log.Information("Starting web host...");
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Host terminated unexpectedly");
}
finally
{
    await Log.CloseAndFlushAsync();
}

public partial class Program { }
