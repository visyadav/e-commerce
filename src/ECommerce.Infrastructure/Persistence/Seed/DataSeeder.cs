using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence.Context;
using ECommerce.Shared.Constants;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ECommerce.Infrastructure.Persistence.Seed;

public class DataSeeder(
    ApplicationDbContext context,
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    ILogger<DataSeeder> logger)
{
    public async Task SeedAsync()
    {
        try
        {
            try
            {
                await context.Database.ExecuteSqlRawAsync(@"
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[ecom].[UserAddresses]') AND name = 'HouseNo')
                    BEGIN
                        ALTER TABLE [ecom].[UserAddresses] ADD [HouseNo] nvarchar(max) NULL;
                        ALTER TABLE [ecom].[UserAddresses] ADD [Landmark] nvarchar(max) NULL;
                        ALTER TABLE [ecom].[UserAddresses] ADD [Latitude] float NOT NULL DEFAULT 0.0;
                        ALTER TABLE [ecom].[UserAddresses] ADD [Longitude] float NOT NULL DEFAULT 0.0;
                    END
                ");
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Column addition for UserAddresses bypassed or already exists.");
            }

            try
            {
                await context.Database.MigrateAsync();
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "MigrateAsync warning bypassed.");
            }
            await SeedRolesAsync();
            await SeedAdminUserAsync();
            await SeedCategoriesAsync();
            await SeedBrandsAsync();
            await SeedMenuItemsAsync();
            await context.SaveChangesAsync();

            logger.LogInformation("Database seeding completed successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database");
            throw;
        }
    }

    private async Task SeedRolesAsync()
    {
        string[] roles = [AppConstants.Roles.SuperAdmin, AppConstants.Roles.Admin, AppConstants.Roles.Customer];

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
                logger.LogInformation("Created role: {Role}", role);
            }
        }
    }

    private async Task SeedAdminUserAsync()
    {
        const string adminEmail = "admin@ecommerce.com";

        if (await userManager.FindByEmailAsync(adminEmail) is null)
        {
            var admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "System",
                LastName = "Admin",
                EmailConfirmed = true,
                IsActive = true
            };

            var result = await userManager.CreateAsync(admin, "Admin@123456");
            if (result.Succeeded)
            {
                await userManager.AddToRolesAsync(admin, [AppConstants.Roles.SuperAdmin, AppConstants.Roles.Admin]);
                logger.LogInformation("Seeded admin user: {Email}", adminEmail);
            }
        }
    }

    private async Task SeedCategoriesAsync()
    {
        if (await context.Categories.AnyAsync())
            return;

        var categories = new List<Category>
        {
            new() { Name = "Electronics", Slug = "electronics", SortOrder = 1 },
            new() { Name = "Clothing", Slug = "clothing", SortOrder = 2 },
            new() { Name = "Home & Garden", Slug = "home-garden", SortOrder = 3 },
            new() { Name = "Sports & Outdoors", Slug = "sports-outdoors", SortOrder = 4 },
            new() { Name = "Books", Slug = "books", SortOrder = 5 }
        };

        await context.Categories.AddRangeAsync(categories);
        logger.LogInformation("Seeded {Count} categories", categories.Count);
    }

    private async Task SeedBrandsAsync()
    {
        if (await context.Brands.AnyAsync())
            return;

        var brands = new List<Brand>
        {
            new() { Name = "TechNova", Slug = "technova" },
            new() { Name = "UrbanStyle", Slug = "urbanstyle" },
            new() { Name = "HomeComfort", Slug = "homecomfort" }
        };

        await context.Brands.AddRangeAsync(brands);
        logger.LogInformation("Seeded {Count} brands", brands.Count);
    }

    private async Task SeedMenuItemsAsync()
    {
        if (await context.MenuItems.AnyAsync())
        {
            var hasUserManagement = await context.MenuItems.AnyAsync(m => m.Title == "User Management");
            if (!hasUserManagement)
            {
                var userManagementMenu = new MenuItem
                {
                    Title = "User Management",
                    Icon = "manage_accounts",
                    Url = "/admin/permissions",
                    SortOrder = 11,
                    Module = "Admin",
                    AllowedRoles = $"{AppConstants.Roles.SuperAdmin}"
                };
                await context.MenuItems.AddAsync(userManagementMenu);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded missing 'User Management' menu item");
            }

            var hasServiceableAreas = await context.MenuItems.AnyAsync(m => m.Title == "Serviceable Areas");
            if (!hasServiceableAreas)
            {
                var serviceableAreasMenu = new MenuItem
                {
                    Title = "Serviceable Areas",
                    Icon = "MapPin",
                    Url = "/admin/serviceable-areas",
                    SortOrder = 12,
                    Module = "ServiceableArea",
                    AllowedRoles = $"{AppConstants.Roles.SuperAdmin},{AppConstants.Roles.Admin}"
                };
                await context.MenuItems.AddAsync(serviceableAreasMenu);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded missing 'Serviceable Areas' menu item");
            }

            return;
        }

        var adminRoles = $"{AppConstants.Roles.SuperAdmin},{AppConstants.Roles.Admin}";
        var customerRole = AppConstants.Roles.Customer;
        var allRoles = $"{AppConstants.Roles.SuperAdmin},{AppConstants.Roles.Admin},{AppConstants.Roles.Customer}";

        // ===================== ADMIN MENU ITEMS =====================
        var dashboard = new MenuItem
        {
            Title = "Dashboard",
            Icon = "LayoutDashboard",
            Url = "/admin/dashboard",
            SortOrder = 1,
            Module = "Dashboard",
            AllowedRoles = adminRoles
        };

        var catalog = new MenuItem
        {
            Title = "Catalog",
            Icon = "ShelvingUnit",
            SortOrder = 2,
            Module = "Catalog",
            AllowedRoles = adminRoles,
            Children =
            [
                new MenuItem { Title = "Products", Icon = "category", Url = "/admin/catalog/products", SortOrder = 1, Module = "Catalog", AllowedRoles = adminRoles },
                new MenuItem { Title = "Categories", Icon = "account_tree", Url = "/admin/catalog/categories", SortOrder = 2, Module = "Catalog", AllowedRoles = adminRoles },
                new MenuItem { Title = "Brands", Icon = "branding_watermark", Url = "/admin/catalog/brands", SortOrder = 3, Module = "Catalog", AllowedRoles = adminRoles }
            ]
        };
        var serviceableArea = new MenuItem()
        {
            Title = "Serviceable Areas",
            Icon = "ServiceableAreas",
            Url = "/admin/ServiceableArea",
            SortOrder = 1,
            Module = "ServiceableArea",
            AllowedRoles = adminRoles
        };
        var inventory = new MenuItem
        {
            Title = "Inventory",
            Icon = "Warehouse",
            Url = "/admin/inventory",
            SortOrder = 3,
            Module = "Inventory",
            AllowedRoles = adminRoles
        };

        var orders = new MenuItem
        {
            Title = "Orders",
            Icon = "Package",
            Url = "/admin/orders",
            SortOrder = 4,
            Module = "Orders",
            AllowedRoles = adminRoles
        };

        var customers = new MenuItem
        {
            Title = "Customers",
            Icon = "Users",
            Url = "/admin/customers",
            SortOrder = 5,
            Module = "Users",
            AllowedRoles = adminRoles
        };

        var payments = new MenuItem
        {
            Title = "Payments",
            Icon = "IndianRupee",
            Url = "/admin/payments",
            SortOrder = 6,
            Module = "Payments",
            AllowedRoles = adminRoles
        };

        var coupons = new MenuItem
        {
            Title = "Coupons",
            Icon = "TicketPercent",
            Url = "/admin/coupons",
            SortOrder = 7,
            Module = "Coupons",
            AllowedRoles = adminRoles
        };

        var adminReviews = new MenuItem
        {
            Title = "Reviews",
            Icon = "StarPlus",
            Url = "/admin/reviews",
            SortOrder = 8,
            Module = "Reviews",
            AllowedRoles = adminRoles
        };

        var adminNotifications = new MenuItem
        {
            Title = "Notifications",
            Icon = "BellCheck",
            Url = "/admin/notifications",
            SortOrder = 9,
            Module = "Notifications",
            AllowedRoles = adminRoles
        };

        var settings = new MenuItem
        {
            Title = "Settings",
            Icon = "Settings",
            Url = "/admin/settings",
            SortOrder = 10,
            Module = "Admin",
            AllowedRoles = $"{AppConstants.Roles.SuperAdmin}"
        };

        var userManagement = new MenuItem
        {
            Title = "User Management",
            Icon = "UserRoundPen",
            Url = "/admin/permissions",
            SortOrder = 11,
            Module = "Admin",
            AllowedRoles = $"{AppConstants.Roles.SuperAdmin}"
        };

        // ===================== CUSTOMER MENU ITEMS =====================
        var myAccount = new MenuItem
        {
            Title = "My Account",
            Icon = "person",
            Url = "/account",
            SortOrder = 1,
            Module = "Users",
            AllowedRoles = customerRole
        };

        var myOrders = new MenuItem
        {
            Title = "My Orders",
            Icon = "receipt_long",
            Url = "/orders",
            SortOrder = 2,
            Module = "Orders",
            AllowedRoles = customerRole
        };

        var myWishlist = new MenuItem
        {
            Title = "Wishlist",
            Icon = "favorite",
            Url = "/wishlist",
            SortOrder = 3,
            Module = "Wishlist",
            AllowedRoles = customerRole
        };

        var myCart = new MenuItem
        {
            Title = "Cart",
            Icon = "shopping_cart",
            Url = "/cart",
            SortOrder = 4,
            Module = "Cart",
            AllowedRoles = customerRole
        };

        var myReviews = new MenuItem
        {
            Title = "My Reviews",
            Icon = "rate_review",
            Url = "/reviews",
            SortOrder = 5,
            Module = "Reviews",
            AllowedRoles = customerRole
        };

        var customerNotifications = new MenuItem
        {
            Title = "Notifications",
            Icon = "notifications",
            Url = "/notifications",
            SortOrder = 6,
            Module = "Notifications",
            AllowedRoles = customerRole
        };

        var adminMenuItems = new List<MenuItem>
        {
            dashboard, catalog, inventory, orders, customers,
            payments, coupons, adminReviews, adminNotifications, settings, userManagement
        };

        var customerMenuItems = new List<MenuItem>
        {
            myAccount, myOrders, myWishlist, myCart, myReviews, customerNotifications
        };

        await context.MenuItems.AddRangeAsync(adminMenuItems);
        await context.MenuItems.AddRangeAsync(customerMenuItems);

        logger.LogInformation("Seeded menu items for Admin and Customer roles");
    }
}
